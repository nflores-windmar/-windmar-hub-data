/* ══════════════════════════════════════════════════════════════════════════
   motion.js — movimiento con peso, como función pura del tiempo.

   Sale de la guía «Motion Design Studio» (paso 7): en vez de curvas fijas
   (easeOut, cubic-bezier) se usan RESORTES. Un resorte acelera, se pasa un
   pelito y se asienta: eso es lo que se siente «caro». Una curva se desliza
   de A a B y se siente barata.

   Todo es función de t: el mismo t siempre da el mismo valor, así el
   renderizador puede pintar cualquier cuadro sin repasar los anteriores.

   USO (script normal, sin módulos — así cargan las piezas de studio/public):
     <script src="lib/motion.js"></script>
     const { spring, track, rand } = Motion;

   CUÁNDO USAR CUÁL
     spring(t)            de 0 a 1, empezando en t=0. Para entradas.
     track(t, keys)       un valor que cambia de destino varias veces
                          (un cursor, una caja que crece y se encoge).
                          NO se reinicia el resorte: se suma uno por cambio.
     rand(seed)           «ruido» reproducible. Math.random está prohibido
                          en render: haría cada render distinto.

   RIGIDEZ (k) Y AMORTIGUACIÓN (d)
     UI / botones / chips ....... k 260, d 24   (seco, pasa un pelito)
     tipografía grande / logos .. k 120, d 22   (pesado, SIN rebote)
     Rebote en texto: nunca. Se lee como juguete.
   ══════════════════════════════════════════════════════════════════════════ */
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp  = (a, b, p) => a + (b - a) * p;

  /* Resorte amortiguado de 0 a 1, en forma cerrada (sin simular paso a paso). */
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }

  /* keys: [[tiempo, valor], ...]. Un resorte por cambio, sumados. */
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++)
      v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }

  /* Ruido con semilla (mulberry32). Mismo seed → mismo número, siempre. */
  function rand(seed) {
    let a = (seed * 2654435761) >>> 0;
    a = (a + 0x6D2B79F5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }

  /* Presets con nombre, para no andar repitiendo números mágicos. */
  const UI   = { k: 260, d: 24 };
  const TYPE = { k: 120, d: 22 };

  root.Motion = { clamp, lerp, spring, track, rand, UI, TYPE };
})(typeof window !== 'undefined' ? window : globalThis);
