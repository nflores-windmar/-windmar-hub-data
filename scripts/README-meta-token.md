# Conectar el token de Meta

El token reemplaza la extracción manual desde Business Suite. Con él, el
snapshot semanal se saca con un comando en vez de media hora de pantallas.

**El token no se pega nunca en un chat ni entra al repo.** Vive en
`~/.windmar/meta.env`, fuera del proyecto, con permisos `600` (solo lo lee
tu usuario). El `.gitignore` de la raíz ya bloquea cualquier `*.env`.

---

## 1. Generar el token

Hay dos formas. **La segunda es la buena.**

### Token de usuario (dura 60 días) — no recomendado

Se saca en el Explorador de la API Graph. Sirve para probar, pero caduca
cada dos meses y hay que volver a generarlo. Para un reporte semanal eso
es una tarea recurrente que se va a olvidar.

### Token de usuario de sistema (no caduca) — este

1. Entra a **business.facebook.com** → **Configuración del negocio**
2. Menú izquierdo → **Usuarios** → **Usuarios del sistema**
3. **Agregar** → nombre: `Reportes Mercadeo` → rol **Admin**
4. Con el usuario creado: **Agregar activos** → pestaña **Páginas** →
   marca **las nueve páginas** del portafolio → permiso **Acceso completo**
5. Repite en la pestaña **Cuentas de Instagram** con los perfiles que
   aparezcan
6. **Generar nuevo token** → elige la app del negocio → marca estos permisos:

   ```
   pages_show_list
   pages_read_engagement
   read_insights
   instagram_basic
   instagram_manage_insights
   business_management
   ```

7. Copia el token **en ese momento** — Meta no lo vuelve a mostrar

## 2. Guardarlo

Abre `~/.windmar/meta.env` y sustituye el marcador:

```
META_TOKEN=el_token_que_copiaste
```

Una sola línea. Sin comillas, sin espacios alrededor del `=`.

## 3. Probar

```bash
python3 scripts/meta-datos.py diagnostico
```

Te dice quién es el token, cuándo expira, qué permisos trae y —cuenta por
cuenta— si puede leer Facebook e Instagram. **Corre esto primero siempre.**

---

## Uso normal

```bash
# snapshot semanal: añade una captura a redes-snapshot.json
python3 scripts/meta-datos.py snapshot

# piezas una por una, con hora de publicación y alcance,
# más el resumen por franja horaria
python3 scripts/meta-datos.py posts windmar-home
python3 scripts/meta-datos.py posts windmar-home-fl --dias 60
```

Los `id` de cuenta válidos están en `studio/public/data/redes-snapshot.json`,
bajo `cuentas`: `windmar-home`, `windmar-home-fl`, `anker`, `anker-pr`,
`solar-water`, `windmar-en-accion`, `chinas`, `consultores-elite-fl`,
`careers`.

---

## Lo que el token NO arregla

Conviene saberlo antes de generarlo, para no esperar de más:

- **No recupera el histórico que no se capturó.** Las estadísticas de
  página de Facebook llegan ~2 años atrás, pero las de Instagram guardan
  unos 90 días y algunas métricas menos. Los meses que no están en
  `redes-snapshot.json` ya no se pueden reconstruir. El snapshot semanal
  sigue siendo lo que construye el histórico.

- **No conecta las cuentas que no están asignadas al portafolio.**
  `@windmarhomefl` aparece como *Propiedad de un individuo* y no figura
  como fuente de estadísticas de su página; `@anker.pr` está marcado
  *Inicio de sesión necesario*. Eso se arregla en Configuración del
  negocio → Cuentas, no generando otro token. El `diagnostico` las marca
  como **NO ALCANZABLE** para que se vea cuáles faltan.

- **No da datos de audiencia por hora.** Meta retiró esa sección. Las
  franjas horarias se derivan del rendimiento real de las piezas propias
  — eso es justamente lo que hace el comando `posts`.

- **No separa orgánico de pagado por sí solo.** Para eso hace falta además
  acceso a la cuenta publicitaria, que hoy no sabemos quién administra.

## Si algo falla

- `Invalid OAuth access token` → el token está mal copiado o caducó
- `NO ALCANZABLE` en una página → falta asignarla al usuario de sistema
  (paso 4), no es el token
- Una métrica suelta da error → Meta la retiró en esta versión de la API;
  el script sigue con las demás y la reporta al final. Se ajusta cambiando
  `METRICAS_PAGINA` / `METRICAS_IG_*` arriba en `meta-datos.py`
