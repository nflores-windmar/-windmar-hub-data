// Dibuja el PNG de cada lámina de un generador de carruseles, igual que
// render-stories.mjs hace con las tarjetas de historias.
//
// Por qué un script aparte y no un parámetro del otro: el de stories descubre
// las tarjetas leyendo el arreglo CARDS y aprieta `.dl[data-i=N]`. Un archivo de
// carruseles tiene VARIOS arreglos (FIRMAR, PERMISOS, VAYAN…) y sus botones van
// por `data-name`. Mezclar las dos formas de descubrir en un script que acabamos
// de arreglar era arriesgar la cadena que hoy sí funciona.
//
// Lo que sí comparten —el servidor estático, el interceptor del blob y la espera—
// está copiado a propósito y marcado. Si aparece un tercer generador, toca
// extraerlo a un módulo: tres copias ya es una que se queda vieja.
//
// Uso:
//   node scripts/render-carruseles.mjs                      todos los generadores conocidos
//   node scripts/render-carruseles.mjs <archivo.html>       solo ese
//
// Las láminas de un carrusel son opacas —llevan foto de fondo—, así que aquí no
// hay el par overlay/vista que sí tienen las historias. Sale un PNG por lámina.

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, basename } from "node:path";
import puppeteer from "puppeteer-core";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLICO = join(RAIZ, "public");
const SALIDA = join(PUBLICO, "artes", "carruseles");

// Los generadores que entran por defecto. Para añadir uno, se añade aquí Y en
// el `paths:` del workflow, o se dibujará sin que nadie lo dispare.
const GENERADORES = ["windmar-carruseles-pr.html"];

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- servidor
// Copiado de render-stories.mjs. La página tiene que servirse por HTTP: los
// logos se piden con crossorigin="anonymous" y desde file:// Chrome los bloquea
// por CORS; el exportador espera a que carguen y se cuelga para siempre.
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
  ".mov": "video/quicktime",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

async function servirPublico() {
  const servidor = createServer(async (req, res) => {
    const limpia = normalize(decodeURIComponent(req.url.split("?")[0]));
    const ruta = join(PUBLICO, limpia);
    if (!ruta.startsWith(PUBLICO)) {
      res.writeHead(403).end();
      return;
    }
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

// ------------------------------------------------------------- interceptor
// También de render-stories.mjs. El generador llama a .click() sobre su
// <a download>; sin esto el PNG se iría a la carpeta de descargas de Chrome.
const INTERCEPTOR = () => {
  window.__capturado = null;
  window.__falloExport = null;
  const clickOriginal = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download && this.href && this.href.startsWith("blob:")) {
      window.__capturado = { nombre: this.download, url: this.href };
      return;
    }
    return clickOriginal.apply(this, arguments);
  };
  window.alert = (m) => {
    window.__falloExport = String(m);
  };
};

async function recogerBlob(pagina, limiteMs = 60000) {
  const hasta = Date.now() + limiteMs;
  while (Date.now() < hasta) {
    const estado = await pagina.evaluate(() => ({
      listo: !!window.__capturado,
      fallo: window.__falloExport,
    }));
    if (estado.fallo) return { fallo: estado.fallo };
    if (estado.listo) {
      return await pagina.evaluate(async () => {
        const { nombre, url } = window.__capturado;
        const b = await (await fetch(url)).arrayBuffer();
        // En trozos: un PNG de 1080×1350 revienta el argumento de apply.
        let s = "";
        const v = new Uint8Array(b);
        for (let i = 0; i < v.length; i += 8192)
          s += String.fromCharCode.apply(null, v.subarray(i, i + 8192));
        window.__capturado = null;
        return { nombre, base64: btoa(s) };
      });
    }
    await espera(300);
  }
  return { fallo: "el generador no produjo el PNG a tiempo" };
}

// ------------------------------------------------------------------ dibujo

async function dibujarGenerador(navegador, base, archivo) {
  const pagina = await navegador.newPage();
  await pagina.evaluateOnNewDocument(INTERCEPTOR);
  await pagina.setViewport({ width: 1400, height: 1200, deviceScaleFactor: 1 });
  await pagina.goto(`${base}/${archivo}`, { waitUntil: "networkidle0", timeout: 90000 });
  await pagina.evaluate(() => document.fonts.ready);

  // A diferencia de las historias, aquí no se lee el código fuente para saber
  // qué hay: se mira el DOM ya construido. Un archivo de carruseles puede tener
  // tres arreglos distintos y no hace falta saber cuál es cuál — cada lámina
  // dibujada tiene su botón, y eso es lo único que importa para exportarla.
  const nombres = await pagina.$$eval(".dl", (bs) =>
    bs.map((b) => b.dataset.name).filter(Boolean)
  );

  if (!nombres.length) {
    console.log(`  (${archivo}: no encontré botones .dl — ¿es un generador de carruseles?)`);
    await pagina.close();
    return { hechas: [], fallidas: [] };
  }

  console.log(`\n${archivo} — ${nombres.length} láminas`);
  const hechas = [];
  const fallidas = [];

  for (const nombre of nombres) {
    try {
      await pagina.evaluate(() => {
        window.__capturado = null;
        window.__falloExport = null;
      });
      await pagina.click(`.dl[data-name="${nombre}"]`);

      const r = await recogerBlob(pagina);
      if (r.fallo) {
        fallidas.push([nombre, r.fallo]);
        console.log(`  ✗ ${nombre} — ${r.fallo}`);
        continue;
      }

      await writeFile(join(SALIDA, r.nombre), Buffer.from(r.base64, "base64"));
      hechas.push(r.nombre);
      console.log(`  ✓ ${r.nombre}`);
    } catch (err) {
      fallidas.push([nombre, err.message]);
      console.log(`  ✗ ${nombre} — ${err.message}`);
    }
  }

  await pagina.close();
  return { hechas, fallidas };
}

const main = async () => {
  const pedido = process.argv[2];
  const archivos = pedido ? [basename(pedido)] : GENERADORES;

  await mkdir(SALIDA, { recursive: true });
  const [base, cerrarServidor] = await servirPublico();
  const navegador = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  let hechas = 0;
  const fallidas = [];
  for (const archivo of archivos) {
    const r = await dibujarGenerador(navegador, base, archivo);
    hechas += r.hechas.length;
    fallidas.push(...r.fallidas);
  }

  await navegador.close();
  await cerrarServidor();

  console.log(`\n${hechas} láminas dibujadas → public/artes/carruseles/`);
  if (fallidas.length) {
    console.log("\nNo salieron:");
    for (const [n, por] of fallidas) console.log(`  ${n}: ${por}`);
    process.exit(1);
  }
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
