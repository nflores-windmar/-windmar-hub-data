#!/bin/zsh
# Saca el snapshot de Meta y lo sube al repo, para que Musa lo pueda leer.
#
# Por qué existe: Homie no puede preguntarle a Meta — su bóveda de credenciales
# lee un token viejo y eso lo tiene que arreglar plataforma. Pero Musa sí sabe
# leer GitHub. Así que los números van al repo y ella los recoge de ahí.
#
# Corre los lunes a las 7:00 AM. El reporte semanal se escribe a las 9:00, así
# que llega con dos horas de margen.

set -u
PROYECTO="/Users/nicolleflores/Documents/Claude/Projects/Content Hub"
REGISTRO="$HOME/.windmar/snapshot.log"
mkdir -p "$(dirname "$REGISTRO")"

echo "" >> "$REGISTRO"
echo "=== $(date '+%Y-%m-%d %H:%M') ===" >> "$REGISTRO"

cd "$PROYECTO" || { echo "no encuentro el proyecto" >> "$REGISTRO"; exit 1; }

# 1. Sacar los números
if ! python3 scripts/meta-datos.py snapshot >> "$REGISTRO" 2>&1; then
  echo "FALLÓ al leer Meta — el snapshot no se actualizó" >> "$REGISTRO"
  exit 1
fi

# 2. Subirlo, solo si cambió
cd "$PROYECTO/studio" || exit 1
if git diff --quiet -- public/data/redes-snapshot.json; then
  echo "sin cambios, no hay nada que subir" >> "$REGISTRO"
  exit 0
fi

git add public/data/redes-snapshot.json
git commit -q -m "Snapshot de Meta — $(date '+%-d de %B de %Y')" >> "$REGISTRO" 2>&1

# El push puede fallar si alguien empujó mientras tanto. Se reintenta una vez
# trayendo lo de arriba primero; si vuelve a fallar, se deja anotado y ya.
if ! git push -q origin main >> "$REGISTRO" 2>&1; then
  echo "el push chocó, reintento tras traer lo del remoto" >> "$REGISTRO"
  git pull -q --rebase origin main >> "$REGISTRO" 2>&1
  git push -q origin main >> "$REGISTRO" 2>&1 \
    && echo "subido en el reintento" >> "$REGISTRO" \
    || echo "NO SE PUDO SUBIR — el snapshot está en local, hay que mirarlo" >> "$REGISTRO"
fi

echo "listo" >> "$REGISTRO"
