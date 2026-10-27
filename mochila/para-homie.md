# En qué estamos

Léelo al empezar cualquier conversación sobre contenido. **No recuerdas la conversación
anterior** — nadie la recuerda. Esto es lo que había decidido hasta la última vez.

Actualizado: **27 de octubre de 2026**, por Musa.

> Si la fecha de arriba tiene más de dos semanas, dilo antes de usarlo. Un estado viejo
> leído como actual es peor que no tener ninguno.

---

## Lo que ya está decidido y no hay que volver a discutir

**Noviembre está planificado.** 17 piezas orgánicas de @windmarhome (PR), en
`mochila/noviembre-2026.json`. Ahí está cada una con fecha de publicación, formato,
producto, red, hora y talento. **Ese archivo es la fuente** — no reconstruyas el mes de
memoria ni a partir de lo que diga alguien en el chat.

**Dónde vive cada cosa:**

| | Dónde |
|---|---|
| Las piezas, el calendario, las firmas | **Studio**. Es el sistema de verdad |
| El plan del mes, los guiones, los números de Meta | **Este repo** |
| Asana | **Ya no se usa para esto.** Si encuentras algo ahí, está viejo |

**Los carruseles son artes, no reels.** No llevan talento, no necesitan fecha de
grabación, no pasan por edición de video. No les busques quién sale.

**El Media Tour y el contenido propio son dos cosas distintas.** Guiones de medios →
`guion-medios-plantilla`, y llevan el teléfono de atribución. Guiones de contenido →
`guion-entrevista-contenido-windmar`, y **nunca** llevan ese teléfono.

**Solar y WindMar Financial no tienen product manager.** No es un hueco: esas piezas
firman solo Manuel Pales y Pichu. No les inventes uno.

**Correos a nombre de Nicolle: `graph_create_draft`, nunca `graph_sendMail`.** Ella los
revisa y los manda.

---

## Lo que está esperando

**Juan Sebastian** (`j.baca@windmarhome.com`) edita tres videos de noviembre: Anker
(entrega 3 nov), Roofing (10 nov) y Solar (13 nov). Material bruto y brief están en la
pieza. **Juan no entra a Asana ni a Studio**: se le avisa por **Teams**, y la señal de
que terminó es que le manda el video a Nicolle.

**José Alicea** — entrevista que publica el 24 de noviembre, entrega el 17. Confirmado
que se graba, **sin tema acordado con él y sin fecha de grabación**. El guion está escrito
en `public/guion-alicea-ventas-entrevista.html`: cinco preguntas y cierre textual.

**Black Friday, 27 de noviembre** — sin promoción definida. Decisión antes del 20.

**Water Técnico con David Fonseca** — se canceló. Si se regraba, entra el 24 de noviembre
y Alicea se recoloca a diciembre.

**Siete de los ocho carruseles de noviembre no tienen slides escritos.** El único hecho es
«Antes de firmar, los 4 números», en `public/windmar-carruseles-pr.html`, arreglo `FIRMAR`.

---

## Lo que corre solo, para que no lo dupliques

**Los lunes a las 7:00 AM**, un GitHub Action saca los números de Meta y los deja en
`public/data/redes-snapshot.json`. No pidas esos datos a mano ni los reconstruyas: léelos
de ahí.

**Cuando cambia el generador de stories**, otro Action dibuja los PNG en
`public/artes/stories-v2/`. Cada tarjeta sale en dos versiones: `-overlay.png` es la buena,
transparente, va encima del video; `-vista.png` es solo para mirar y aprobar.

---

## Dos cosas que ya salieron mal

**No repitas avisos.** En octubre una tarea automática le escribió cuatro veces a una
persona que ya había confirmado, y dejó de leer los avisos. Antes de escribir, mira si ya
se avisó. Si dudas, no avises.

**No digas que hiciste algo sin decir cuánto.** En septiembre se marcaron ocho campos como
verificados de un cotejo que no se hizo, y no se detectó hasta que alguien fue a mirar. Al
terminar, da números: cuántas piezas, a quién, cuáles.
