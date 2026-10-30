# En qué estamos

Léelo al empezar cualquier conversación sobre contenido. **No recuerdas la conversación
anterior** — nadie la recuerda. Esto es lo que había decidido hasta la última vez.

Actualizado: **30 de octubre de 2026**.

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

**Juan Sebastian** (`j.baca@windmarhome.com`) edita **solo cuatro piezas**: la serie
«Técnico» que grabó Juan Sánchez — Anker, Solar, Roofing y **Water**. Los otros ocho
videos del mes los graba y entrega ya editados **Luis Matos**.

**Su entrega es 4 días antes de publicar**, no siete. Los siete días son de la pieza —
cuándo tiene que estar lista para revisión y firmas—; los cuatro son el hito de edición.
Son dos fechas distintas y no se pisan.

**Juan no entra a Asana ni a Studio**: se le avisa por **Teams**, y la señal de que
terminó es que le manda el video a Nicolle.

⚠️ **Water Técnico todavía no tiene tarea de edición.** Las otras tres se montaron el 27
de octubre, cuando Water estaba dado por cancelado. Se regrabó el 28 y publica el viernes
27, así que su entrega a Juan es el **23 de noviembre**. Falta el enlace del material
bruto.

**José Alicea** — entrevista que publica el 24 de noviembre, entrega el 17.
**Se grababa el 30 de octubre con Luis Matos.** Si lees esto después de ese día,
**no preguntes si se va a grabar: comprueba si llegó el material** y sigue desde ahí. El guion está en
`public/guion-alicea-ventas-entrevista.html`: cinco preguntas y cierre textual
«Nuestra misión es estar con el cliente paso a paso».

Lo que sigue cuando salga el material: va a edición como los otros tres — enlace del
bruto en la pieza, editor asignado, y aviso por Teams. Máximo 45 segundos, palabras de
apoyo en texto grande.

**Water Técnico se regrabó el 28 de octubre** y ocupa el viernes 27, el espacio que tenía
Black Friday. Con eso la serie «Técnico» queda completa —Anker, Solar, Roofing y Water, los
cuatro de Juan Sánchez— y el mes llega a **nueve videos**, que es el piso.

**Black Friday se queda sin pieza propia.** Nunca hubo promoción definida y se decidió que
inventar una oferta sería peor que dejarlo.

**Los 12 videos del mes salen de dos fuentes:** 4 de Juan Sánchez (la serie Técnico, ya
completa) y 8 de Luis Matos. **Luis Matos va retrasado** con los videos de instalaciones —
no faltan temas, faltan grabaciones.

**A finales de noviembre: borrar las stories v1 y ordenar lo que quede.** El 27 de
octubre se decidió consolidar todo en stories v2. Los tres archivos del v1 —
`windmar-pr-stories.html` (55 entradas), `windmar-fl-stories.html` (12) y
`windmar-pros-stories.html` (10)— llevan ya un aviso de retirado, pero siguen ahí porque
están enlazados desde 13 sitios: la guía del agente, la guía de estilo, los brand guides
de Pros y de Let Them Talk, el calendario de Florida y otros. Borrarlos exige arreglar
esos enlaces primero. Florida y Pros no tienen equivalente en v2, que es de Puerto Rico.

**Siete de los ocho carruseles de noviembre no tienen slides escritos.** El único hecho es
«Antes de firmar, los 4 números», en `public/windmar-carruseles-pr.html`, arreglo `FIRMAR`.

---

## Lo que cambió el 29 y 30 de octubre

**Los teléfonos de atribución del Media Tour son uno POR PROGRAMA.** Antes eran dos
—787-489-1154 para TV y 787-489-1155 para radio— y esos dos **ya no se usan**. Ahora son
doce DID, uno por programa, y están en el skill `guion-medios-plantilla`. Si un récord del
calendario trae uno de los dos viejos, es un récord sin actualizar: pones el del programa,
lo dices al entregar y reportas el récord. Eso está escrito en esa skill con su regla.

⚠️ **Las cortinillas todavía llevan el número viejo impreso dentro de la imagen.** Es una
decisión, no un descuido: se siguen usando las viejas mientras Diseño crea las nuevas. Así
que durante la transición el guión dice el número del programa y el arte dice el antiguo.
**No pares un envío por eso** — pero dilo cuando entregues.

**Studio avisa solo de las firmas que se acercan a su fecha.** Desde el 30 de octubre corre
un recordatorio de lunes a viernes a las 8:00 AM: mira las piezas en revisión que publican
dentro de tres días o menos y le manda una campana a quien le falte firmar. **No dupliques
eso.** Si alguien no ha firmado y la pieza publica pronto, ya se le avisó: no escribas tú
también.

Tres cosas que ese recordatorio NO hace, y que siguen siendo tuyas: no avisa de piezas sin
fecha de publicación, no avisa si alguien pidió cambios —ahí la pieza espera a Diseño— y no
avisa a quien ya firmó.

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
