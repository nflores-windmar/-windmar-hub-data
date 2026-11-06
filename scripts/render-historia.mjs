/**
 * Una story lista para publicar: el overlay encima del vídeo, recortado y a diez segundos.
 *
 *     node scripts/render-historia.mjs --video ~/Downloads/yara.mp4 --tarjeta onboarding
 *     node scripts/render-historia.mjs --video … --tarjeta onboarding --desde 4
 *
 * ## Qué resuelve
 *
 * El Action ya dibuja los dos PNG de cada tarjeta. Pero el `-overlay.png` no se publica
 * solo: hay que ponerlo encima de un vídeo, recortarlo a vertical y dejarlo en diez
 * segundos. Eso se hacía a mano, en una herramienta de edición, una pieza cada vez.
 *
 * ## El recorte: centrado, y se DICE
 *
 * La persona va centrada en el encuadre —así se graban— así que un recorte por el centro
 * la conserva. Pero eso es una suposición sobre el material, no sobre el script, y el día
 * que alguien grabe a un lado el recorte se la come sin avisar.
 *
 * Por eso al terminar se imprime qué se recortó y cuánto. Si el vídeo venía en 16:9, se
 * dice que se tiraron dos tercios del ancho: quien lo lea decide si mirar la pieza antes
 * de publicarla.
 *
 * ## Sin audio, a propósito
 *
 * Estas stories salen mudas. Lo pidió Nicolle y tiene su razón: se ven en el móvil sin
 * sonido, y el overlay ya lleva el mensaje escrito.
 */

import { stat, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { spawn } from "node:child_process";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLICO = join(RAIZ, "public");
const ARTES = join(PUBLICO, "artes", "stories-v2");
const SALIDA = join(PUBLICO, "artes", "stories-v2");

const FFMPEG = process.env.FFMPEG_PATH || join(RAIZ, "node_modules", "ffmpeg-static", "ffmpeg");
const FFPROBE = process.env.FFPROBE_PATH || join(RAIZ, "node_modules", "ffprobe-static", "bin", "darwin", "x64", "ffprobe");

const DURACION = 10;   // segundos. Lo pidió así Nicolle.
const ANCHO = 1080, ALTO = 1920;

const correr = (cmd, args, capturar = false) =>
  new Promise((cumplir, fallar) => {
    const p = spawn(cmd, args, { stdio: ["ignore", capturar ? "pipe" : "ignore", "pipe"] });
    let out = "", err = "";
    if (capturar) p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => (c === 0 ? cumplir(out) : fallar(new Error(err.slice(-700)))));
  });

/* Las medidas del vídeo. Se leen con ffmpeg, no con ffprobe: ffprobe no siempre está
   instalado y ffmpeg las escribe en su stderr al abrirlo. */
async function medidas(ruta) {
  try {
    await correr(FFMPEG, ["-i", ruta]);
  } catch (e) {
    const m = /(\d{2,5})x(\d{2,5})/.exec(e.message);
    const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(e.message);
    if (!m) throw new Error(`No pude leer las medidas de ${basename(ruta)}.`);
    return {
      ancho: +m[1],
      alto: +m[2],
      dur: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : null,
    };
  }
  throw new Error("ffmpeg no devolvió las medidas.");
}

async function main() {
  const args = process.argv.slice(2);
  const dame = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };

  const video = dame("video");
  const tarjeta = dame("tarjeta");
  const desde = Number(dame("desde") ?? 0);

  if (!video || !tarjeta) {
    console.error("\n  Falta algo:\n    node scripts/render-historia.mjs --video <ruta> --tarjeta <id>\n");
    process.exit(1);
  }

  const overlay = join(ARTES, `windmar-story-v2-${tarjeta}-overlay.png`);
  try { await stat(overlay); } catch {
    throw new Error(
      `No existe el overlay de «${tarjeta}»: ${overlay.replace(RAIZ + "/", "")}\n` +
      `  La tarjeta tiene que estar escrita en el generador Y dibujada por el Action.\n` +
      `  Si la acabas de escribir, todavía no existe: el PNG sale después de empujarla.`,
    );
  }
  try { await stat(video); } catch { throw new Error(`No encuentro el vídeo: ${video}`); }

  const { ancho, alto, dur } = await medidas(video);
  if (dur != null && dur < desde + DURACION) {
    throw new Error(
      `El vídeo dura ${dur.toFixed(1)} s y desde el segundo ${desde} no quedan ${DURACION}.\n` +
      `  Baja --desde, o usa un vídeo más largo.`,
    );
  }

  /* Recorte 9:16 por el CENTRO. Si ya es vertical no se recorta nada. */
  const relacion = ancho / alto;
  const objetivo = ANCHO / ALTO;
  let recorte, dicho;
  if (Math.abs(relacion - objetivo) < 0.01) {
    recorte = `scale=${ANCHO}:${ALTO}`;
    dicho = "ya venía en 9:16, no se recortó nada";
  } else if (relacion > objetivo) {
    const nuevoAncho = Math.round(alto * objetivo / 2) * 2;
    const fuera = Math.round((1 - nuevoAncho / ancho) * 100);
    recorte = `crop=${nuevoAncho}:${alto}:(iw-${nuevoAncho})/2:0,scale=${ANCHO}:${ALTO}`;
    dicho = `era ${ancho}×${alto}; se recortó a lo ancho y se tiró el ${fuera}% — ${Math.round(fuera/2)}% por cada lado`;
  } else {
    const nuevoAlto = Math.round(ancho / objetivo / 2) * 2;
    const fuera = Math.round((1 - nuevoAlto / alto) * 100);
    recorte = `crop=${ancho}:${nuevoAlto}:0:(ih-${nuevoAlto})/2,scale=${ANCHO}:${ALTO}`;
    dicho = `era ${ancho}×${alto}; se recortó a lo alto y se tiró el ${fuera}%`;
  }

  await mkdir(SALIDA, { recursive: true });
  const salida = join(SALIDA, `windmar-story-v2-${tarjeta}.mp4`);

  await correr(FFMPEG, [
    "-y",
    "-ss", String(desde), "-t", String(DURACION), "-i", video,
    "-i", overlay,
    "-filter_complex", `[0:v]${recorte},setsar=1[v];[v][1:v]overlay=0:0:format=auto[out]`,
    "-map", "[out]",
    "-an",                                   // mudas, a propósito
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
    "-movflags", "+faststart",
    salida,
  ]);

  console.log(`\n  ✅ ${salida.replace(RAIZ + "/", "")}`);
  console.log(`     ${DURACION} s desde el segundo ${desde}, sin audio, ${ANCHO}×${ALTO}`);
  console.log(`     Recorte: ${dicho}.`);
  if (relacion > objetivo) {
    console.log(`     ⚠️  Mira la pieza antes de publicarla: el recorte es por el CENTRO, así que`);
    console.log(`         si la persona no iba centrada, se le fue parte.`);
  }
}

main().catch((e) => {
  console.error(`\n  ✖ ${e.message}\n`);
  process.exit(1);
});
