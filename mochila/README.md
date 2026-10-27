# La mochila

El sitio donde Musa deja cosas y Homie las recoge.

Los dos agentes no se hablan: no existe ninguna puerta entre ellos. Comprobado el 27 de
octubre de 2026 — Homie no expone API ni MCP hacia fuera, y Musa no tiene cuenta en el
portal. Lo único que los dos alcanzan es este repo.

Así que ninguno le habla al otro. **Los dos le hablan a la mochila.**

---

## Cómo funciona

**Musa deja.** Escribe aquí el plan del mes, los guiones, los pendientes. Puede empujar al
repo porque tiene la llave SSH.

**Homie recoge.** Lee con `githubhub__get_file_contents`, que ya usa en
`skill-dashboard-windmar` y en `skill-creativo-windmar`.

**Va en una sola dirección.** Homie sabe leer el repo, no escribirlo. Si algún día tiene
una herramienta de escritura, esto funciona en los dos sentidos y hay que decirlo aquí.

---

## Lo que NO hace

**La mochila no avisa.** No le da golpecitos en el hombro a nadie. Si Musa deja algo
urgente, ahí se queda hasta que Homie vaya a mirar por su cuenta o alguien se lo pida.

Para lo urgente sigue haciendo falta una persona. Esto sirve para lo que **espera**: el
plan del mes, los guiones escritos, los números del lunes.

---

## Qué hay dentro

| Archivo | Qué es | Quién lo escribe |
|---|---|---|
| `<mes>-<año>.json` | El plan del mes: las piezas con fecha, formato, producto y red | Musa |
| `para-homie.md` | Lo que está esperando a que Homie lo haga, con su estado | Musa |
| `../public/data/redes-snapshot.json` | Los números de Meta, cada lunes | El workflow `dashboard-semanal` |

---

## Reglas

**El plan del mes va en JSON, no en una tabla de markdown.** Una tabla hay que
interpretarla; un JSON se lee. Si Homie tiene que adivinar una columna, el formato está mal.

**Nada aquí se da por hecho.** Que el plan esté en la mochila no significa que las piezas
existan en Studio. El archivo dice qué debería existir; Studio dice qué existe. Si no
cuadran, manda Studio.

**Cada archivo dice cuándo se escribió y contra qué.** Un plan sin fecha no se sabe si es
de este mes o del pasado.

**Lo que ya se hizo no se borra: se marca.** Borrarlo hace que la siguiente lectura parezca
que nunca pasó.
