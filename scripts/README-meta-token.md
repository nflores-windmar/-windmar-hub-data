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
6. **Generar nuevo token** → elige la app del negocio

7. ⚠️ **En «Caducidad del token» elige «Nunca».**

   Este es el paso que se olvida, y es el que importa. Un usuario de sistema
   *puede* dar tokens que no caducan, pero el desplegable viene con **60 días**
   por defecto: si no lo tocas, sales de ahí con un token que muere en dos meses
   creyendo que es permanente. Pasó — el token generado el 21 de octubre de 2026
   expiraba el 20 de diciembre, y el Action del dashboard semanal llevaba tres
   semanas fallando en silencio antes de que alguien lo notara.

8. Marca estos permisos:

   ```
   pages_show_list
   pages_read_engagement
   read_insights
   instagram_basic
   instagram_manage_insights
   business_management

   instagram_manage_comments     ← leer y contestar comentarios de Instagram
   pages_read_user_content       ← leer comentarios en la página de Facebook
   pages_manage_engagement       ← contestarlos ahí
   instagram_content_publish     ← publicar piezas aprobadas desde Studio
   instagram_manage_messages     ← mensajes directos
   ```

   Los seis primeros son para el snapshot semanal. Los cinco de abajo son para
   lo que se añadió después: el barrido de comentarios y el publicador. **Márcalos
   todos aunque hoy no uses alguno** — añadir un permiso más tarde obliga a generar
   otro token y a cambiarlo en los cuatro sitios de abajo.

9. Copia el token **en ese momento** — Meta no lo vuelve a mostrar

## 2. Guardarlo — en los CUATRO sitios

El token vive en cuatro lugares distintos y **cambiarlo en uno no lo cambia en
los otros**. Esto se descubrió el 23 de noviembre de 2026: se había rotado en dos
sitios y los otros dos seguían con el viejo, así que los Actions fallaban mientras
todo parecía arreglado.

| Dónde | Para qué | Cómo se cambia |
|---|---|---|
| `~/.windmar/meta.env` | los comandos que corres tú | abajo |
| Secret `META_TOKEN` del repo | los GitHub Actions | Settings › Secrets › Actions |
| Vercel del Studio | la app en producción | **entra con el próximo deploy, no al guardarlo** |
| Conexión de Meta en Homie | lo que hace Musa | dentro de Homie |

### El de tu Mac

En Terminal, para que el token no quede en el historial ni en pantalla:

```bash
printf 'Pega el token y dale Enter: '; read -rs T; echo
umask 077; printf 'META_TOKEN=%s\n' "$T" > ~/.windmar/meta.env; unset T
```

Una sola línea dentro del archivo. Sin comillas, sin espacios alrededor del `=`.

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
- **Un Action que falla en «Diagnóstico del token» semana tras semana** → el
  secret del repo tiene un token distinto al de tu Mac. Que el tuyo funcione no
  dice nada del suyo. Míralo en Settings › Secrets › Actions: la columna de
  fecha dice cuándo se actualizó por última vez
- `NO ALCANZABLE` en una página → falta asignarla al usuario de sistema
  (paso 4), no es el token
- Una métrica suelta da error → Meta la retiró en esta versión de la API;
  el script sigue con las demás y la reporta al final. Se ajusta cambiando
  `METRICAS_PAGINA` / `METRICAS_IG_*` arriba en `meta-datos.py`
