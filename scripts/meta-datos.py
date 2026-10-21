#!/usr/bin/env python3
"""
meta-datos.py — saca los números de Meta sin tener que abrir Business Suite.

Lee el token de ~/.windmar/meta.env (o de la variable META_TOKEN).
Ese archivo NO está dentro del proyecto y no se sube a ningún sitio.

Uso:
    python3 meta-datos.py diagnostico          # qué ve el token y qué le falta
    python3 meta-datos.py snapshot             # añade una semana a redes-snapshot.json
    python3 meta-datos.py snapshot --dias 28   # ventana distinta (por defecto 28)
    python3 meta-datos.py posts windmar-home   # piezas con hora y rendimiento
    python3 meta-datos.py posts windmar-home --dias 60

Corre el 'diagnostico' primero. Te dice exactamente qué cuentas puede leer
el token y cuáles no, y por qué — que es la mitad del trabajo pendiente.

Nota honesta sobre el histórico: el token NO recupera lo que no se capturó.
Las estadísticas de página de Facebook llegan hasta ~2 años atrás, pero las
de Instagram solo guardan unos 90 días, y algunas métricas menos. Lo que no
esté en redes-snapshot.json de meses pasados, ya no se puede reconstruir.
Por eso el snapshot semanal sigue importando.
"""

import sys
import os
import json
import time
import datetime
import urllib.request
import urllib.parse
import urllib.error

VERSION = "v23.0"
BASE = f"https://graph.facebook.com/{VERSION}"

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# El script vive en studio/scripts/, así que RAIZ ya es la del repo.
# Dentro del repo la ruta es public/data/..., sin el "studio/" delante.
SNAPSHOT = os.path.join(RAIZ, "public", "data", "redes-snapshot.json")
ENV = os.path.expanduser("~/.windmar/meta.env")

# Permisos que necesita el token para que todo esto funcione.
PERMISOS_NECESARIOS = [
    "pages_show_list",
    "pages_read_engagement",
    "read_insights",
    "instagram_basic",
    "instagram_manage_insights",
    "business_management",
]

# Métricas de página. Meta las va retirando por versión, así que si una
# falla el script la reporta y sigue con las demás en vez de morirse.
# Meta retiró `page_impressions` y `page_impressions_unique` de la API. Pedirlas
# devuelve «(#100) not a valid insights metric» y ensucia el reporte con un
# error que no se puede arreglar desde aquí.
#
# Eso significa que ALCANCE E IMPRESIONES NO SE PUEDEN SACAR por esta vía. Hay
# que seguir mirándolas a mano en Business Suite. Lo de abajo es lo que sí
# devuelve la API con un token de página.
METRICAS_PAGINA = [
    ("interacciones", "page_post_engagements"),
    ("seguidores_nuevos", "page_daily_follows_unique"),
    ("visitas", "page_views_total"),
    ("reproducciones_3s", "page_video_views"),
    ("acciones_totales", "page_total_actions"),
    ("reacciones", "page_actions_post_reactions_total"),
    ("seguidores_total", "page_follows"),   # OJO: no se suma, ver abajo
]

# Instagram: unas van por serie diaria y otras por valor total.
METRICAS_IG_DIA = [
    ("alcance", "reach"),
    ("visitas_perfil", "profile_views"),
    ("seguidores_nuevos", "follower_count"),
]
METRICAS_IG_TOTAL = [
    ("visualizaciones", "views"),
    ("me_gusta", "likes"),
    ("comentarios", "comments"),
    ("compartidos", "shares"),
    ("guardados", "saves"),
]


# ---------------------------------------------------------------- token

def token():
    """Busca el token en la variable de entorno o en ~/.windmar/meta.env."""
    t = os.environ.get("META_TOKEN", "").strip()
    if t:
        return t

    if not os.path.exists(ENV):
        sys.exit(
            f"No encuentro {ENV}.\n"
            "Créalo con esta línea dentro (sin comillas, sin espacios):\n"
            "    META_TOKEN=el_token_que_generaste\n"
            "Y después:  chmod 600 " + ENV
        )

    modo = oct(os.stat(ENV).st_mode)[-3:]
    if modo != "600":
        print(f"  Aviso: {ENV} tiene permisos {modo}. Ciérralo con:")
        print(f"     chmod 600 {ENV}\n")

    for linea in open(ENV):
        linea = linea.strip()
        if linea.startswith("META_TOKEN="):
            return linea.split("=", 1)[1].strip().strip('"').strip("'")

    sys.exit(f"{ENV} existe pero no tiene una línea META_TOKEN=...")


def pedir(ruta, params=None, tok=None):
    """Una llamada al Graph API. Devuelve (datos, error)."""
    params = dict(params or {})
    params["access_token"] = tok
    url = f"{BASE}/{ruta.lstrip('/')}?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=40) as r:
            return json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        try:
            cuerpo = json.loads(e.read().decode())
            msg = cuerpo.get("error", {}).get("message", str(e))
        except Exception:
            msg = f"HTTP {e.code}"
        return None, msg
    except Exception as e:
        return None, str(e)


def sin_token(txt):
    """Evita que un token acabe impreso en pantalla por accidente."""
    t = os.environ.get("META_TOKEN", "")
    return txt.replace(t, "«token»") if t else txt


# ---------------------------------------------------------------- utilidades

def cuentas():
    with open(SNAPSHOT) as fh:
        return json.load(fh)

def ventana(dias):
    """Devuelve (desde, hasta) de la ventana, y el `since` que hay que pedirle
    a Meta para que salgan `dias` puntos de verdad.

    Meta cierra el día anterior, así que la ventana termina ayer. Y NO incluye
    el día de `since`: pidiendo desde el 23 de septiembre, la serie empieza el
    24. Por eso una ventana de 28 días devolvía 27 puntos y la etiqueta mentía.
    Se pide un día antes para que los 28 que dice sean 28."""
    hasta = datetime.date.today() - datetime.timedelta(days=1)
    desde = hasta - datetime.timedelta(days=dias - 1)
    since = desde - datetime.timedelta(days=1)
    return desde, hasta, since


def tokens_de_paginas(tok):
    """Cada página tiene su propio token; /me/accounts los entrega todos."""
    mapa, pagina = {}, "me/accounts"
    params = {"fields": "id,name,access_token", "limit": 100}
    while pagina:
        datos, err = pedir(pagina, params, tok)
        if err:
            return mapa, err
        for p in datos.get("data", []):
            mapa[p["id"]] = {"nombre": p.get("name"), "token": p.get("access_token")}
        sig = datos.get("paging", {}).get("next")
        if not sig:
            break
        pagina, params = sig.split(f"{BASE}/")[-1].split("?")[0], \
            dict(urllib.parse.parse_qsl(sig.split("?", 1)[1]))
        params.pop("access_token", None)
    return mapa, None


# ---------------------------------------------------------------- diagnóstico

def diagnostico():
    tok = token()
    print("\n  DIAGNÓSTICO DEL TOKEN")
    print("  " + "─" * 58)

    quien, err = pedir("me", {"fields": "id,name"}, tok)
    if err:
        sys.exit(f"\n  El token no sirve: {sin_token(err)}\n")
    print(f"  Identidad .......... {quien.get('name', '(sistema)')}  ·  id {quien['id']}")

    # qué permisos trae
    perms, err = pedir("me/permissions", {}, tok)
    concedidos = set()
    if not err:
        concedidos = {p["permission"] for p in perms.get("data", [])
                      if p.get("status") == "granted"}
        faltan = [p for p in PERMISOS_NECESARIOS if p not in concedidos]
        print(f"  Permisos ........... {len(concedidos)} concedidos")
        if faltan:
            print("\n  FALTAN PERMISOS — sin estos, parte de esto no corre:")
            for p in faltan:
                print(f"     · {p}")
    else:
        print("  Permisos ........... no se pueden listar (token de usuario de sistema)")

    # cuándo expira
    info, err = pedir("debug_token", {"input_token": tok}, tok)
    if not err:
        d = info.get("data", {})
        exp = d.get("expires_at", 0)
        if exp == 0:
            print("  Expira ............. nunca (token de usuario de sistema)")
        else:
            cuando = datetime.datetime.fromtimestamp(exp)
            dias = (cuando - datetime.datetime.now()).days
            aviso = "  <-- hay que renovarlo pronto" if dias < 14 else ""
            print(f"  Expira ............. {cuando:%d %b %Y} ({dias} días){aviso}")

    # qué páginas alcanza
    paginas, err = tokens_de_paginas(tok)
    if err:
        print(f"\n  No puedo listar páginas: {sin_token(err)}")
        paginas = {}
    print(f"  Páginas visibles ... {len(paginas)}")

    print("\n  CUENTA POR CUENTA")
    print("  " + "─" * 58)
    cfg = cuentas()
    desde, hasta, since = ventana(7)
    ok_fb = ok_ig = 0

    for c in cfg["cuentas"]:
        print(f"\n  {c['nombre']}")
        pid = c.get("page_id")

        if not pid:
            print("     Facebook .... sin page_id en la configuración")
        elif pid not in paginas:
            print("     Facebook .... NO ALCANZABLE — el token no administra esta página")
        else:
            ptok = paginas[pid]["token"]
            # La prueba va con una métrica que Meta todavía sirve.
            # `page_impressions` la retiraron y daba un (#100) que parecía un
            # problema de permisos cuando en realidad la métrica ya no existe.
            _, e = pedir(f"{pid}/insights", {
                "metric": "page_post_engagements", "period": "day",
                "since": str(desde), "until": str(hasta)}, ptok)
            if e:
                print(f"     Facebook .... error: {sin_token(e)[:70]}")
            else:
                print("     Facebook .... OK")
                ok_fb += 1

        igid = c.get("ig_id")
        if not igid:
            print("     Instagram ... sin ig_id (no está enlazado o no es cuenta de empresa)")
        else:
            ptok = paginas.get(pid, {}).get("token") or tok
            _, e = pedir(f"{igid}/insights", {
                "metric": "reach", "period": "day",
                "since": str(desde), "until": str(hasta)}, ptok)
            if e:
                print(f"     Instagram ... error: {sin_token(e)[:70]}")
            else:
                print("     Instagram ... OK")
                ok_ig += 1

    print("\n  " + "─" * 58)
    print(f"  Listas para medir: {ok_fb} páginas de Facebook, {ok_ig} de Instagram.")
    print("  Si alguna sale NO ALCANZABLE, no es el token: es que esa cuenta")
    print("  no está asignada al portafolio comercial. Eso se arregla en")
    print("  Configuración del negocio > Cuentas, no generando otro token.\n")


# ---------------------------------------------------------------- snapshot

def semanas(diario):
    """Parte la serie diaria en los últimos 7 días y los 7 anteriores.

    El histórico trae `ultimos_7` y `previos_7` desde el principio, y sin ellos
    no se puede restar una semana de otra — que es para lo que existe el
    histórico. Se calculan aquí porque la serie diaria ya está guardada; no
    hace falta pedirle nada más a Meta."""
    if not diario or len(diario) < 14:
        return None, None
    # `serie()` devuelve una lista en orden cronológico: el último elemento es
    # el día más reciente de la ventana.
    return sum(diario[-7:]), sum(diario[-14:-7])


def serie(pid, ptok, metrica, desde, hasta, periodo="day", tipo=None):
    """Pide una métrica. Devuelve (total, lista_diaria) o (None, None)."""
    params = {"metric": metrica, "period": periodo,
              "since": str(desde), "until": str(hasta)}
    if tipo:
        params["metric_type"] = tipo
    datos, err = pedir(f"{pid}/insights", params, ptok)
    if err or not datos.get("data"):
        return None, None, err
    valores = datos["data"][0].get("values", [])
    if tipo == "total_value":
        v = datos["data"][0].get("total_value", {}).get("value")
        return v, None, None
    diario = [v.get("value", 0) or 0 for v in valores]
    diario = [v if isinstance(v, int) else 0 for v in diario]
    return sum(diario), diario, None


def snapshot(dias=28):
    tok = token()
    cfg = cuentas()
    desde, hasta, since = ventana(dias)
    print(f"\n  Capturando {desde} → {hasta} ({dias} días)\n")

    paginas, err = tokens_de_paginas(tok)
    if err:
        sys.exit(f"  No puedo listar páginas: {sin_token(err)}")

    datos, problemas = {}, []

    for c in cfg["cuentas"]:
        cid, pid, igid = c["id"], c.get("page_id"), c.get("ig_id")
        bloque = {}

        if pid and pid in paginas:
            ptok = paginas[pid]["token"]
            fb = {}
            for nombre, metrica in METRICAS_PAGINA:
                total, diario, e = serie(pid, ptok, metrica, since, hasta)
                if e:
                    problemas.append(f"{c['nombre']} · fb · {metrica}: {sin_token(e)[:60]}")
                    continue
                # `page_follows` es el TOTAL de seguidores de cada día, no
                # los nuevos. Sumar 28 días daba 1.918.030 para una cuenta de
                # unos 68.500 — 28 veces el total. Se toma el último día.
                if nombre == "seguidores_total":
                    fb[nombre] = diario[-1] if diario else None
                else:
                    fb[nombre] = total
                # La serie diaria se guarda de interacciones, que es lo que
                # sostiene el análisis semanal ahora que no hay impresiones.
                if nombre == "interacciones" and diario:
                    fb["diario_interacciones"] = diario
                    # ultimos_7 y previos_7 los trae el histórico desde el
                    # principio. Sin ellos no se puede restar una semana de
                    # otra y el salto de formato parte la serie en dos.
                    u7, p7 = semanas(diario)
                    if u7 is not None:
                        fb["ultimos_7"], fb["previos_7"] = u7, p7
                time.sleep(0.25)
            if fb:
                bloque["facebook"] = fb
                # Se enseña interacciones: alcance e impresiones ya no existen
                # en la API y la columna salía siempre vacía.
                print(f"  Facebook  {c['nombre']:<34} {fb.get('interacciones','?'):>9}")
        elif pid:
            problemas.append(f"{c['nombre']}: el token no administra la página {pid}")

        if igid:
            ptok = paginas.get(pid, {}).get("token") or tok
            ig = {}
            for nombre, metrica in METRICAS_IG_DIA:
                total, diario, e = serie(igid, ptok, metrica, since, hasta)
                if e:
                    problemas.append(f"{c['nombre']} · ig · {metrica}: {sin_token(e)[:60]}")
                    continue
                ig[nombre] = total
                if nombre == "alcance" and diario:
                    ig["diario_alcance"] = diario
                    u7, p7 = semanas(diario)
                    if u7 is not None:
                        ig["ultimos_7"], ig["previos_7"] = u7, p7
                time.sleep(0.25)
            for nombre, metrica in METRICAS_IG_TOTAL:
                total, _, e = serie(igid, ptok, metrica, since, hasta, tipo="total_value")
                if e:
                    problemas.append(f"{c['nombre']} · ig · {metrica}: {sin_token(e)[:60]}")
                    continue
                ig[nombre] = total
                time.sleep(0.25)
            if ig:
                inter = sum(ig.get(k) or 0 for k in
                            ("me_gusta", "comentarios", "compartidos", "guardados"))
                if inter:
                    ig["interacciones"] = inter
                bloque["instagram"] = ig
                print(f"  Instagram {c['nombre']:<34} {ig.get('alcance','?'):>9}")

        if bloque:
            datos[cid] = bloque

    if not datos:
        sys.exit("\n  No se pudo leer ni una cuenta. Corre el diagnóstico.\n")

    nuevo = {
        "capturado": str(datetime.date.today()),
        "ventana": {"desde": str(desde), "hasta": str(hasta), "dias": dias},
        "fuente": f"Meta Graph API {VERSION} · meta-datos.py",
        "datos": datos,
    }

    # no duplicar una captura del mismo día
    cfg["snapshots"] = [s for s in cfg["snapshots"]
                        if s.get("capturado") != nuevo["capturado"]]
    cfg["snapshots"].append(nuevo)
    cfg["snapshots"].sort(key=lambda s: s["capturado"])

    with open(SNAPSHOT, "w") as fh:
        json.dump(cfg, fh, ensure_ascii=False, indent=2)

    print(f"\n  Guardado en redes-snapshot.json "
          f"({len(cfg['snapshots'])} snapshots en el histórico)")

    if problemas:
        print(f"\n  {len(problemas)} cosa(s) no se pudieron leer:")
        for p in problemas[:15]:
            print(f"     · {p}")
        if len(problemas) > 15:
            print(f"     … y {len(problemas) - 15} más")
    print()


# ---------------------------------------------------------------- posts

def posts(cuenta_id, dias=28):
    """Las piezas una por una, con hora de publicación y rendimiento.

    Esto es lo que hacía falta sacar a mano para el análisis de horas.
    """
    tok = token()
    cfg = cuentas()
    c = next((x for x in cfg["cuentas"] if x["id"] == cuenta_id), None)
    if not c:
        ids = ", ".join(x["id"] for x in cfg["cuentas"])
        sys.exit(f"No conozco la cuenta '{cuenta_id}'. Son: {ids}")

    desde, hasta, since = ventana(dias)
    paginas, _ = tokens_de_paginas(tok)
    pid = c.get("page_id")
    ptok = paginas.get(pid, {}).get("token") or tok
    filas = []

    # --- Facebook
    if pid and pid in paginas:
        # Meta retiró las tres métricas de impresiones por publicación
        # (post_impressions, post_impressions_unique, post_engaged_users), así
        # que NO HAY ALCANCE POR PIEZA en Facebook. Lo que sí devuelve son
        # reacciones, clics y reproducciones — suficiente para comparar piezas
        # entre sí, pero no para decir a cuánta gente llegó cada una.
        datos, err = pedir(f"{pid}/posts", {
            "fields": "id,created_time,message,"
                      "insights.metric(post_reactions_by_type_total,"
                      "post_clicks,post_video_views)",
            "since": str(since), "until": str(hasta), "limit": 100}, ptok)
        if err:
            print(f"  Facebook: {sin_token(err)[:80]}")
        else:
            for p in datos.get("data", []):
                m = {i["name"]: i["values"][0]["value"]
                     for i in p.get("insights", {}).get("data", [])}
                reac = m.get("post_reactions_by_type_total") or {}
                if isinstance(reac, dict):
                    reac = sum(v for v in reac.values() if isinstance(v, int))
                inter = (reac or 0) + (m.get("post_clicks") or 0)
                t = datetime.datetime.strptime(
                    p["created_time"][:19], "%Y-%m-%dT%H:%M:%S")
                # El alcance va a None, no a 0: no es que llegara a nadie, es
                # que Meta ya no lo dice. Poner 0 sería inventar un dato.
                filas.append(("Facebook", t, None, inter,
                              (p.get("message") or "")[:48]))

    # --- Instagram
    igid = c.get("ig_id")
    if igid:
        datos, err = pedir(f"{igid}/media", {
            "fields": "id,timestamp,media_type,caption,"
                      "insights.metric(reach,likes,comments,shares)",
            "since": str(desde), "until": str(hasta), "limit": 100}, ptok)
        if err:
            print(f"  Instagram: {sin_token(err)[:80]}")
        else:
            for p in datos.get("data", []):
                m = {i["name"]: i["values"][0]["value"]
                     for i in p.get("insights", {}).get("data", [])}
                t = datetime.datetime.strptime(
                    p["timestamp"][:19], "%Y-%m-%dT%H:%M:%S")
                inter = sum(m.get(k, 0) for k in ("likes", "comments", "shares"))
                filas.append(("Instagram", t, m.get("reach", 0), inter,
                              (p.get("caption") or "")[:48]))

    if not filas:
        sys.exit("\n  No salió ninguna pieza. Corre el diagnóstico.\n")

    filas.sort(key=lambda f: f[1])
    print(f"\n  {c['nombre']} · {desde} → {hasta}\n")
    print(f"  {'Red':<10} {'Fecha':<11} {'Hora':<6} {'Alcance':>8} "
          f"{'Inter.':>7}  Pieza")
    print("  " + "─" * 86)
    for red, t, alc, inter, txt in filas:
        # Facebook ya no da alcance por pieza: se enseña "—", no un cero.
        a = "—" if alc is None else f"{alc}"
        print(f"  {red:<10} {t:%d %b}     {t:%H:%M}  {a:>8} {inter:>7}  {txt}")

    # el resumen que de verdad sirve: rendimiento por franja horaria
    # Guardar las piezas donde Musa las pueda leer. Sin esto, el análisis solo
    # tiene los totales de la cuenta y puede decir que una semana subió, pero
    # no QUÉ la hizo subir — que es lo único que sirve para decidir.
    destino = os.path.join(RAIZ, "public", "data", f"piezas-{cuenta_id}.json")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump({
            "cuenta": cuenta_id,
            "capturado": str(datetime.date.today()),
            "ventana": {"desde": str(desde), "hasta": str(hasta), "dias": dias},
            "nota_alcance": ("Facebook NO trae alcance por pieza: Meta retiró "
                             "post_impressions. Donde dice null es eso, no un cero."),
            "piezas": [
                {"red": r, "fecha": t.strftime("%Y-%m-%d"), "hora": t.strftime("%H:%M"),
                 "alcance": a, "interacciones": i, "texto": txt}
                for r, t, a, i, txt in sorted(filas, key=lambda f: f[1])
            ],
        }, fh, ensure_ascii=False, indent=2)
    print(f"\n  Guardado en public/data/piezas-{cuenta_id}.json "
          f"({len(filas)} piezas)")

    print("\n  POR FRANJA DE PUBLICACIÓN")
    print("  " + "─" * 86)
    for red in ("Facebook", "Instagram"):
        dela = [f for f in filas if f[0] == red]
        if not dela:
            continue
        print(f"\n  {red}")
        franjas = {}
        for _, t, alc, _, _ in dela:
            k = f"{t.hour // 2 * 2:02d}:00–{t.hour // 2 * 2 + 2:02d}:00"
            franjas.setdefault(k, []).append(alc)
        for k in sorted(franjas):
            v = franjas[k]
            print(f"     {k}   {sum(v) // len(v):>7} de alcance promedio   "
                  f"(n={len(v)})")
    print()


# ---------------------------------------------------------------- main

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]
    dias = 28
    if "--dias" in sys.argv:
        dias = int(sys.argv[sys.argv.index("--dias") + 1])

    if cmd == "diagnostico":
        diagnostico()
    elif cmd == "snapshot":
        snapshot(dias)
    elif cmd == "posts":
        if len(sys.argv) < 3:
            sys.exit("Dime qué cuenta:  python3 meta-datos.py posts windmar-home")
        posts(sys.argv[2], dias)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
