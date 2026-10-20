// Dibuja las tarjetas del generador de historias a PNG, sin que nadie abra el
// navegador.
//
// Por qué existe: el generador exporta el PNG con un clic en la página. Eso
// obliga a una persona a abrirla, buscar la tarjeta y bajarla una por una. Un
// agente que escribe tarjetas no puede hacer eso, así que entregaba código en
// vez de arte. Esto cierra ese hueco.
//
// Cómo lo hace: NO fotografía la tarjeta de la pantalla. Aprieta el mismo botón
// «PNG» que aprieta una persona y recoge la descarga. Esto importa: el botón
// clona la pieza a 1080×1920, le quita el marcador de foto y le pone fondo
// transparente cuando es overlay. Una foto de pantalla se saltaría todo eso y
// daría un PNG distinto al que se usa de verdad.
//
// Uso:
//   node scripts/render-stories.mjs                   → todas las tarjetas
//   node scripts/render-stories.mjs contenido-interno → solo esa
//
// Salen en public/artes/stories-v2/, con el nombre que les pone el generador.

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize } from "node:path";
import puppeteer from "puppeteer-core";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLICO = join(RAIZ, "public");
const PAGINA = join(PUBLICO, "windmar-pr-stories-v2-preview.html");
const SALIDA = join(PUBLICO, "artes", "stories-v2");

// La página tiene que servirse por HTTP, no abrirse del disco. Los logos se
// piden con crossorigin="anonymous" y desde file:// Chrome los bloquea por
// CORS; el exportador espera a que carguen y se queda colgado para siempre.
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

/** Servidor estático mínimo sobre public/. Devuelve [url, cerrar]. */
async function servirPublico() {
  const servidor = createServer(async (req, res) => {
    const limpia = normalize(decodeURIComponent(req.url.split("?")[0]));
    // normalize + el prefijo obligatorio evitan que un ../ se salga de public/.
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
        // El exportador lee las imágenes en un lienzo; sin esto se mancha y falla.
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

// Chrome del sistema. En GitHub Actions viene en CHROME_PATH.
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = process.argv.slice(2);
const iCambiadas = args.indexOf("--cambiadas");
const versionAnterior = iCambiadas >= 0 ? args[iCambiadas + 1] : null;
const soloEsta = iCambiadas >= 0 ? null : args[0] || null;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Ids del arreglo CARDS, en orden — el índice es el que usa cada botón. */
async function idsDelArchivo() {
  const txt = await readFile(PAGINA, "utf8");
  const cuerpo = txt.slice(txt.indexOf("const CARDS=["));
  return [...cuerpo.matchAll(/\bid:'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

/**
 * Parte el arreglo CARDS en bloques, uno por id, para poder comparar dos
 * versiones del archivo. Se compara el texto del bloque entero y no la línea
 * del id, porque un cambio en `desc:` no toca esa línea y aun así hay que
 * volver a dibujar la pieza.
 */
function bloquesPorId(texto) {
  const i = texto.indexOf("const CARDS=[");
  if (i < 0) return new Map();
  // Hay que cortar donde cierra el arreglo. Si se deja correr hasta el final
  // del archivo, el último bloque se lleva todo lo que viene después, y
  // entonces añadir una tarjeta al final hace que la anterior parezca
  // modificada — se redibujaría una pieza que nadie tocó.
  let cuerpo = texto.slice(i);
  const cierre = cuerpo.search(/\n\s*\];/);
  if (cierre > 0) cuerpo = cuerpo.slice(0, cierre);
  const bloques = new Map();
  const re = /\{\s*id:'([a-z0-9-]+)'/g;
  const marcas = [...cuerpo.matchAll(re)].map((m) => [m[1], m.index]);
  for (let k = 0; k < marcas.length; k++) {
    const [id, desde] = marcas[k];
    const hasta = k + 1 < marcas.length ? marcas[k + 1][1] : cuerpo.length;
    let bloque = cuerpo.slice(desde, hasta);
    // Cortar donde cierra la llave de la tarjeta. Entre una tarjeta y la
    // siguiente suele haber comentarios —Musa deja ahí lo que queda pendiente
    // de confirmar— y si se incluyen, escribir un comentario haría que la
    // tarjeta de arriba pareciera modificada y se redibujara sin motivo.
    const fin = bloque.lastIndexOf("}");
    if (fin > 0) bloque = bloque.slice(0, fin + 1);
    bloques.set(id, bloque.replace(/\s+/g, " ").trim());
  }
  return bloques;
}

/** Ids nuevos o modificados respecto a una versión anterior del archivo. */
async function idsCambiados(rutaAnterior) {
  const ahora = bloquesPorId(await readFile(PAGINA, "utf8"));
  let antes = new Map();
  try {
    antes = bloquesPorId(await readFile(rutaAnterior, "utf8"));
  } catch {
    // Rama nueva sin versión previa: se dibuja todo.
    return [...ahora.keys()];
  }
  return [...ahora.keys()].filter((id) => antes.get(id) !== ahora.get(id));
}

// Chrome sin ventana no entrega las descargas de blob por la vía normal, así
// que en vez de esperar un archivo le quitamos el enlace al vuelo: cuando el
// generador llama a .click() sobre su <a download>, nos quedamos con el blob y
// lo devolvemos en base64. La lógica de exportar sigue siendo la de la página.
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
  // El generador avisa de sus fallos con alert(); sin ventana eso se pierde.
  window.alert = (m) => {
    window.__falloExport = String(m);
  };
};

/** Espera a que el interceptor atrape el blob y lo devuelve en base64. */
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
        // En trozos, porque un PNG de 1080×1920 revienta el argumento de apply.
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

const main = async () => {
  const ids = await idsDelArchivo();
  const indice = new Map(ids.map((id, i) => [id, i]));

  let aDibujar = ids;
  if (soloEsta) {
    aDibujar = ids.filter((id) => id === soloEsta);
    if (!aDibujar.length) {
      console.error(
        `No hay ninguna tarjeta con id '${soloEsta}'.\nLas que existen: ${ids.join(", ")}`
      );
      process.exit(1);
    }
  } else if (versionAnterior) {
    aDibujar = await idsCambiados(versionAnterior);
    if (!aDibujar.length) {
      console.log("Ninguna tarjeta cambió. No hay nada que dibujar.");
      return;
    }
    console.log(`Cambiaron ${aDibujar.length}: ${aDibujar.join(", ")}\n`);
  }

  const objetivo = aDibujar.map((id) => [id, indice.get(id)]);

  await mkdir(SALIDA, { recursive: true });

  const [base, cerrarServidor] = await servirPublico();

  const navegador = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
  await pagina.evaluateOnNewDocument(INTERCEPTOR);

  await pagina.goto(`${base}/windmar-pr-stories-v2-preview.html`, {
    waitUntil: "networkidle0",
  });
  await pagina.waitForSelector(".dl", { timeout: 15000 });
  // El botón incrusta las fuentes de Google en el PNG; sin esto sale con la
  // tipografía del sistema y deja de ser la pieza de marca.
  await pagina.evaluate(() => document.fonts.ready);

  const hechas = [];
  const fallidas = [];

  for (const [id, i] of objetivo) {
    try {
      const existe = await pagina.$(`.dl[data-i="${i}"]`);
      if (!existe) {
        fallidas.push([id, `no hay botón para el índice ${i}`]);
        console.log(`  ✗ ${id} — no hay botón`);
        continue;
      }
      await pagina.evaluate(() => {
        window.__capturado = null;
        window.__falloExport = null;
      });
      await pagina.click(`.dl[data-i="${i}"]`);

      const r = await recogerBlob(pagina);
      if (r.fallo) {
        fallidas.push([id, r.fallo]);
        console.log(`  ✗ ${id} — ${r.fallo}`);
        continue;
      }

      const destino = join(SALIDA, r.nombre);
      await writeFile(destino, Buffer.from(r.base64, "base64"));
      hechas.push([id, r.nombre]);
      console.log(`  ✓ ${r.nombre}`);
    } catch (err) {
      fallidas.push([id, err.message]);
      console.log(`  ✗ ${id} — ${err.message}`);
    }
  }

  await navegador.close();
  await cerrarServidor();

  console.log(
    `\n${hechas.length} de ${objetivo.length} dibujadas → public/artes/stories-v2/`
  );
  if (fallidas.length) {
    console.log("\nNo salieron:");
    for (const [id, por] of fallidas) console.log(`  ${id}: ${por}`);
    process.exit(1);
  }
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
