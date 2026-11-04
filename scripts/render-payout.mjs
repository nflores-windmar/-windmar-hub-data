/**
 * El vídeo del payout semanal, de la página al MP4.
 *
 *     node scripts/render-payout.mjs --datos '{"nombre":"Carlos Luengo","monto":16500}'
 *     node scripts/render-payout.mjs --sin-musica
 *
 * ## Por qué existe
 *
 * Los tres vídeos que hay —Miguel, Arianna, Carlos— se hicieron a mano. La página
 * reproduce la pieza; no la exporta. Así que cada semana había que grabar la pantalla,
 * y una pieza grabada a mano sale distinta cada vez: el momento de empezar, la tasa de
 * cuadros, lo que se cuele por encima de la ventana.
 *
 * ## Por qué se puede capturar cuadro a cuadro
 *
 * La página expone **`window.__seek(t)`** y no usa `@keyframes` ni temporizadores: todo
 * el estado se calcula desde `t`. La misma `t` da exactamente el mismo cuadro, siempre.
 * Eso permite dibujar los 491 cuadros uno por uno sin carreras: no se graba lo que pasa,
 * se pide cada instante.
 *
 * ## Qué sale de aquí: el OVERLAY, no el vídeo final
 *
 * En modo render la página esconde el fondo (`body.render #bgvid{display:none}`), así que
 * lo que se captura es el overlay transparente. El metraje real se compone después, con
 * ffmpeg. Son dos cosas a propósito: el overlay se puede volver a montar sobre otro fondo
 * sin redibujar los textos.
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize } from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLICO = join(RAIZ, "public");
const PAGINA = "windmar-pros-payout.html";
const SALIDA = join(PUBLICO, "artes", "payout");
const FONDO = join(PUBLICO, "wme", "hype-bg.mp4");
const MUSICA = join(PUBLICO, "wme", "hype-carlos-audio.m4a");

/* 16,38 s a 30 fps. La duración sale de la propia página —`DUR` suma 16380 ms— y se
   lee de ahí en vez de escribirla aquí: si alguien cambia una escena, esto la sigue. */
const FPS = 30;

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const FFMPEG =
  process.env.FFMPEG_PATH ||
  join(RAIZ, "node_modules", "ffmpeg-static", "ffmpeg");

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

/* Servir por HTTP y no por file://: los logos se piden con crossorigin y Chrome
   los bloquea por CORS desde file://. Copiado de render-carruseles.mjs. */
async function servirPublico() {
  const servidor = createServer(async (req, res) => {
    const limpia = normalize(decodeURIComponent(req.url.split("?")[0]));
    const ruta = join(PUBLICO, limpia);
    if (!ruta.startsWith(PUBLICO)) return void res.writeHead(403).end();
    try {
      const s = await stat(ruta);
      if (!s.isFile()) throw new Error("no es archivo");
      res.writeHead(200, {
        "Content-Type": TIPOS[extname(ruta).toLowerCase()] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      });
      createReadStream(ruta).pipe(res);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  const { port } = servidor.address();
  return [`http://127.0.0.1:${port}`, () => new Promise((r) => servidor.close(r))];
}

const correr = (cmd, args) =>
  new Promise((cumplir, fallar) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => (c === 0 ? cumplir() : fallar(new Error(err.slice(-600)))));
  });

async function main() {
  const args = process.argv.slice(2);
  const iDatos = args.indexOf("--datos");
  const datos = iDatos >= 0 ? JSON.parse(args[iDatos + 1]) : null;
  const conMusica = !args.includes("--sin-musica");

  await mkdir(SALIDA, { recursive: true });
  const cuadros = join(SALIDA, "_cuadros");
  await rm(cuadros, { recursive: true, force: true });
  await mkdir(cuadros, { recursive: true });

  const [base, cerrar] = await servirPublico();
  const navegador = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-device-scale-factor=1"],
  });

  try {
    const pagina = await navegador.newPage();
    await pagina.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await pagina.goto(`${base}/${PAGINA}?render=1`, { waitUntil: "networkidle0" });

    /* El modo render: fondo fuera, panel fuera, sin escalar. */
    await pagina.evaluate(() => document.body.classList.add("render"));

    /* Los datos de la semana, si vienen. Se escriben en los campos y se aplica,
       que es el mismo camino que usa una persona: así no hay dos formas de
       rellenar la pieza que puedan discrepar. */
    if (datos) {
      await pagina.evaluate((d) => {
        const poner = (id, v) => { const e = document.getElementById(id); if (e && v != null) e.value = String(v); };
        poner("i-mes", d.mes); poner("i-ciudad", d.ciudad); poner("i-nombre", d.nombre);
        poner("i-logro", d.logro); poner("i-monto", d.monto); poner("i-memo", d.memo);
        document.getElementById("aplicar").click();
      }, datos);
    }

    await pagina.evaluate(() => document.fonts.ready);

    /* La duración la dice la página, no este script. */
    const dur = await pagina.evaluate(() => (window.__duracion ?? 16.38));
    const total = Math.round(dur * FPS);

    const stage = await pagina.$(".stage");
    if (!stage) throw new Error("No encuentro .stage en la página.");

    for (let i = 0; i < total; i++) {
      const t = i / FPS;
      await pagina.evaluate((t) => window.__seek(t), t);
      await stage.screenshot({
        path: join(cuadros, String(i).padStart(4, "0") + ".png"),
        omitBackground: true,
      });
      if (i % 60 === 0) process.stdout.write(`  cuadro ${i}/${total}\r`);
    }
    console.log(`  ${total} cuadros dibujados          `);

    /* Componer: metraje real debajo, overlay encima, y la pista si se pide.
       `-shortest` corta por el overlay, que es el que marca la duración. */
    const salida = join(SALIDA, conMusica ? "payout-con-musica.mp4" : "payout-sin-musica.mp4");
    const ff = [
      "-y",
      "-i", FONDO,
      "-framerate", String(FPS), "-i", join(cuadros, "%04d.png"),
      ...(conMusica ? ["-i", MUSICA] : []),
      "-filter_complex", "[0:v]scale=1080:1920,trim=duration=" + dur + ",setpts=PTS-STARTPTS[bg];[bg][1:v]overlay=0:0:format=auto[v]",
      "-map", "[v]",
      ...(conMusica ? ["-map", "2:a", "-c:a", "aac", "-b:a", "160k"] : ["-an"]),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
      "-shortest",
      salida,
    ];
    await correr(FFMPEG, ff);
    await rm(cuadros, { recursive: true, force: true });
    console.log(`\n  ✅ ${salida.replace(RAIZ + "/", "")}`);
  } finally {
    await navegador.close();
    await cerrar();
  }
}

main().catch((e) => {
  console.error("\n  ✖", e.message);
  process.exit(1);
});
