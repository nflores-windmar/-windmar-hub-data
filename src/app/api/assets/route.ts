import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const ASSETS_DIR = () => path.join(process.cwd(), "public", "assets");

// Keeps a filename safe: strip directories, allow a sane charset, cap length.
function safeName(raw: string) {
  const base = path.basename(raw).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base.replace(/^\.+/, "") || "image.png";
}

// Reads image files from one public/ subfolder, tagged with its url prefix.
async function listDir(sub: string) {
  const dir = path.join(process.cwd(), "public", sub);
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }
  return (
    await Promise.all(
      entries
        .filter((name) => IMG_EXT.has(path.extname(name).toLowerCase()))
        .map(async (name) => {
          const info = await stat(path.join(dir, name));
          return { name, src: `/${sub}/${name}`, mtime: info.mtimeMs, source: sub };
        })
    )
  );
}

// Lists generated/imported assets (public/assets) first, then the existing
// brand library (public/img), so any image can be dropped onto a slide.
export async function GET() {
  const [generated, brand] = await Promise.all([
    listDir("assets"),
    listDir("img"),
  ]);
  generated.sort((a, b) => b.mtime - a.mtime);
  brand.sort((a, b) => a.name.localeCompare(b.name));
  return Response.json({ assets: [...generated, ...brand] });
}

// Upload an image into public/assets so it joins the gallery.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Falta el archivo" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!IMG_EXT.has(ext)) {
    return Response.json({ error: "Formato no soportado" }, { status: 400 });
  }

  const dir = ASSETS_DIR();
  await mkdir(dir, { recursive: true });

  let name = safeName(file.name);
  // Avoid clobbering an existing file by suffixing a counter.
  let dest = path.join(dir, name);
  let n = 1;
  while (await stat(dest).then(() => true).catch(() => false)) {
    const stem = name.slice(0, name.length - ext.length);
    dest = path.join(dir, `${stem}_${n++}${ext}`);
  }
  name = path.basename(dest);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);
  return Response.json({ name, src: `/assets/${name}`, source: "assets" });
}

// Delete an image from public/assets only (brand library is protected).
export async function DELETE(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name) {
    return Response.json({ error: "Falta el nombre" }, { status: 400 });
  }
  const dir = ASSETS_DIR();
  const target = path.join(dir, safeName(name));
  if (path.dirname(target) !== dir) {
    return Response.json({ error: "Ruta no permitida" }, { status: 400 });
  }
  try {
    await unlink(target);
  } catch {
    return Response.json({ error: "No se encontró el archivo" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
