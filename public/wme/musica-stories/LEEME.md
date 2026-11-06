# Las pistas de las stories

Deja aquí los `.mp3` o `.m4a` que puedan sonar en una story. `render-historia.mjs`
elige una sola, y la elige **por el id de la tarjeta**, no al azar.

Que no sea al azar importa por dos cosas:

- **La misma tarjeta suena siempre igual.** Si hay que rehacer la pieza porque
  cambió un texto, el vídeo sale idéntico salvo en lo que cambió. Con azar, cada
  render traería otra canción y nadie sabría si eso fue a propósito.
- **Tarjetas distintas suenan distinto**, que es lo que se pedía: que alternen.

Para forzar una concreta: `--musica public/wme/musica-stories/loquesea.mp3`.
Para que salga muda: `--sin-musica`.

**Cada pista tiene que durar diez segundos o más.** Si dura menos, el script lo
dice y no la usa: una story con el audio cortado a la mitad se nota.

Y lo obvio, que es lo que se olvida: **solo pistas con licencia para publicar.**
Una story es un anuncio, no un vídeo interno.
