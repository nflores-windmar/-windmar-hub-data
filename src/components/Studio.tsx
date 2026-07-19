"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CarouselDoc,
  Slide,
  ImageState,
  carousels,
  CAROUSEL_PRODUCTS,
  defaultColors,
  defaultFonts,
  HEADING_FONTS,
  BODY_FONTS,
} from "@/data/carousel";
import CarouselSlide, { SLIDE_W, SLIDE_H } from "./CarouselSlide";
import { addUpload, listUploads, deleteUpload, hideAsset, listHidden, saveDoc as idbSaveDoc, loadDoc as idbLoadDoc, deleteDoc as idbDeleteDoc } from "@/lib/assetStore";
import {
  exportSlidesToZip,
  exportSingleSlide,
  nodeToPngBlob,
  blobToBase64,
} from "@/lib/exporter";

type Tab = "img" | "text" | "color" | "export" | "asana";
const PREVIEW_SCALE = 0.4;

// Uploaded images live in IndexedDB, scoped per product (water/solar/anker/
// roofing), so each carousel has its own photo library. IndexedDB is used
// instead of localStorage (which capped at ~5MB and broke on large photos) and
// instead of the server FS (Vercel's runtime filesystem is read-only).
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type GalleryAsset = { id?: number; name: string; src: string; source: string };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("No se pudo leer el archivo"));
    r.readAsDataURL(file);
  });
}

// Make an image's background transparent, fully in-browser (no API/key, works
// offline). Samples the four corners as the background color and clears every
// pixel within `tolerance` (Euclidean RGB distance) of it. Best on solid/white
// backgrounds — logos and product shots. Returns a transparent PNG data URL.
function removeImageBackground(src: string, tolerance: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas no disponible"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      let data: ImageData;
      try {
        data = ctx.getImageData(0, 0, w, h);
      } catch {
        reject(new Error("La imagen no permite edición (CORS)"));
        return;
      }
      const px = data.data;
      const corners = [0, (w - 1) * 4, w * (h - 1) * 4, (w * h - 1) * 4];
      let r = 0, g = 0, b = 0;
      for (const c of corners) {
        r += px[c];
        g += px[c + 1];
        b += px[c + 2];
      }
      r /= 4; g /= 4; b /= 4;
      for (let i = 0; i < px.length; i += 4) {
        const dr = px[i] - r;
        const dg = px[i + 1] - g;
        const db = px[i + 2] - b;
        if (Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance) px[i + 3] = 0;
      }
      ctx.putImageData(data, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

// Shrink a data URL so it doesn't bloat the saved carousel doc (which lives in
// IndexedDB and is cloned whole on every autosave). Caps the longest side to
// `maxDim` and re-encodes; JPEG for opaque photos (much smaller), PNG when the
// image may have transparency (e.g. after background removal). A full 10MB photo
// embedded as base64 is what makes saving fail — this keeps each image ~100–300KB.
function compressDataUrl(
  src: string,
  maxDim = 1600,
  mime: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const tw = Math.max(1, Math.round(w * scale));
      const th = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, tw, th);
      try {
        resolve(canvas.toDataURL(mime, quality));
      } catch {
        resolve(src); // CORS-tainted canvas — keep original rather than fail
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

// Compress every image embedded in a carousel doc — used to rescue a save that
// failed because the doc (with full-res photos baked in) overflowed IndexedDB.
// PNGs keep transparency; everything else is re-encoded as smaller JPEG.
async function shrinkDocImages(d: CarouselDoc): Promise<CarouselDoc> {
  const shrink = async (im: ImageState): Promise<ImageState> => {
    const isPng = im.src.startsWith("data:image/png");
    const src = await compressDataUrl(im.src, 1280, isPng ? "image/png" : "image/jpeg", 0.8);
    const orig = im.orig ? await compressDataUrl(im.orig, 1100, "image/png", 0.8) : im.orig;
    return { ...im, src, orig };
  };
  const slides = await Promise.all(
    d.slides.map(async (s) => ({
      ...s,
      image: s.image ? await shrink(s.image) : s.image,
      overlays: s.overlays ? await Promise.all(s.overlays.map(shrink)) : s.overlays,
    }))
  );
  return { ...d, slides };
}

function readProductFromUrl(): string {
  if (typeof window === "undefined") return "aug_solar";
  const c = new URLSearchParams(window.location.search).get("c");
  return c && carousels[c] ? c : "aug_solar";
}

// Bump a product's suffix when its bundled template design changes, so an old
// autosave (e.g. Batería saved before it got the Anker design system) is
// bypassed and the new template loads fresh — without touching other products.
const STORAGE_VERSION: Record<string, string> = { anker: "ds6", roofing: "ds4", solar: "ds3", flsolar: "v4", flsolar_en: "v4", flhome: "v2", flhome_en: "v2", flroofing: "v2", flroofing_en: "v2", flbateria: "v4", flbateria_en: "v4" };
function carouselStorageKey(product: string): string {
  const v = STORAGE_VERSION[product];
  return v
    ? `wm_carousel_doc_v2__${product}__${v}`
    : `wm_carousel_doc_v2__${product}`;
}

// Load a product's saved design from IndexedDB, falling back to (and migrating
// off of) the old localStorage autosave, then to the bundled template. The
// doc embeds base64 photos, which overflowed localStorage's ~5MB quota — hence
// the move to IndexedDB.
// A saved doc from a browser that predates the blueprint theme won't carry it.
// Re-apply the bundled template's theme (if any) so the design stays current
// without discarding the user's edits.
function withTemplateTheme(p: string, saved: CarouselDoc): CarouselDoc {
  const tmpl = carousels[p];
  return saved.theme === undefined && tmpl?.theme
    ? { ...saved, theme: tmpl.theme }
    : saved;
}

async function loadDocFor(p: string): Promise<CarouselDoc> {
  const key = carouselStorageKey(p);
  try {
    const fromDb = await idbLoadDoc<CarouselDoc>(key);
    if (fromDb) return withTemplateTheme(p, fromDb);
  } catch {
    /* IndexedDB unavailable */
  }
  try {
    const legacy = localStorage.getItem(key);
    if (legacy) {
      const parsed = JSON.parse(legacy) as CarouselDoc;
      try {
        await idbSaveDoc(key, parsed);
        localStorage.removeItem(key); // free the old quota
      } catch {
        /* keep legacy copy if migration write fails */
      }
      return withTemplateTheme(p, parsed);
    }
  } catch {
    /* no legacy copy */
  }
  return structuredClone(carousels[p]);
}

export default function Studio() {
  const [product, setProduct] = useState<string>("aug_solar");
  const [doc, setDoc] = useState<CarouselDoc>(() =>
    structuredClone(carousels.aug_solar)
  );
  const [cur, setCur] = useState(0);
  const [tab, setTab] = useState<Tab>("img");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  // -1 = the base/background image; 0..n = an overlay layer of the active slide.
  const [selLayer, setSelLayer] = useState<number>(-1);
  const [bgTol, setBgTol] = useState(60);
  const bgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Global preference (tiny boolean → localStorage is fine): hide WindMar brand
  // chrome (the drop badge + the brand-name header) across every carousel at once.
  const [hideBrand, setHideBrand] = useState(true);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const slide = doc.slides[cur];
  const selImage: ImageState | null =
    selLayer === -1 ? slide.image : slide.overlays?.[selLayer] ?? null;

  // Gallery for the active product = its IndexedDB uploads first, then the brand
  // library served by /api/assets (GET works on Vercel), minus any images the
  // user hid for this product.
  const loadAssets = useCallback(async () => {
    let server: GalleryAsset[] = [];
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      server = data.assets ?? [];
    } catch {
      server = [];
    }
    let uploads: GalleryAsset[] = [];
    let hidden: string[] = [];
    try {
      const recs = await listUploads(product);
      uploads = recs.map((r) => ({ id: r.id, name: r.name, src: r.src, source: "upload" }));
      hidden = await listHidden(product);
    } catch {
      /* IndexedDB unavailable — fall back to brand library only */
    }
    const hiddenSet = new Set(hidden);
    setAssets([...uploads, ...server].filter((a) => !hiddenSet.has(a.src)));
  }, [product]);

  useEffect(() => {
    if (tab === "img") loadAssets();
  }, [tab, loadAssets]);

  useEffect(() => {
    try {
      setHideBrand(localStorage.getItem("wm_hide_brand") !== "0");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleHideBrand(hide: boolean) {
    setHideBrand(hide);
    try {
      localStorage.setItem("wm_hide_brand", hide ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  // Selecting a different slide resets the active layer back to the background.
  useEffect(() => {
    setSelLayer(-1);
  }, [cur]);

  // Place a gallery image: if the slide has no background yet it becomes the
  // base, otherwise it's added as a new overlay layer on top (so e.g. a logo
  // doesn't replace the doodle already there).
  async function applyAsset(rawSrc: string) {
    // Compress before embedding so the saved doc stays small enough for IndexedDB.
    const src = await compressDataUrl(rawSrc);
    const fresh: ImageState = { src, scale: 1, posX: 50, posY: 50, opacity: 1 };
    if (!slide.image) {
      patchSlide(cur, { image: fresh });
      setSelLayer(-1);
    } else {
      const overlays = [...(slide.overlays ?? []), fresh];
      patchSlide(cur, { overlays });
      setSelLayer(overlays.length - 1);
    }
  }

  function removeLayer() {
    if (selLayer === -1) {
      patchSlide(cur, { image: null });
    } else {
      const overlays = (slide.overlays ?? []).slice();
      overlays.splice(selLayer, 1);
      patchSlide(cur, { overlays });
      setSelLayer(-1);
    }
  }

  // Reorder an overlay in the stack (dir -1 = up/behind, +1 = down/in front).
  function moveLayer(i: number, dir: -1 | 1) {
    const overlays = (slide.overlays ?? []).slice();
    const j = i + dir;
    if (j < 0 || j >= overlays.length) return;
    [overlays[i], overlays[j]] = [overlays[j], overlays[i]];
    patchSlide(cur, { overlays });
    setSelLayer(j);
  }

  // Make the selected layer's background transparent. Keeps the pristine source
  // in `orig` so the tolerance slider re-derives from it (non-destructive).
  async function makeTransparent(tol: number) {
    if (!selImage) return;
    // Cap the pristine copy (PNG keeps any transparency) so storing both `orig`
    // and the cut-out `src` doesn't double the doc size past IndexedDB's limit.
    const orig = selImage.orig ?? (await compressDataUrl(selImage.src, 1400, "image/png"));
    setBusy("Quitando fondo…");
    try {
      const out = await removeImageBackground(orig, tol);
      patchLayer({ src: out, orig });
    } catch (e) {
      flash("No pude quitar el fondo: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function scheduleTransparent(tol: number) {
    setBgTol(tol);
    if (bgTimer.current) clearTimeout(bgTimer.current);
    bgTimer.current = setTimeout(() => makeTransparent(tol), 250);
  }

  function restorePhoto() {
    if (!selImage?.orig) return;
    patchLayer({ src: selImage.orig, orig: undefined });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy("Procesando imagen…");
    try {
      let added = 0;
      for (const file of Array.from(files)) {
        if (file.size > MAX_UPLOAD_BYTES) {
          flash(`"${file.name}" supera 10MB — usa una imagen más pequeña`);
          continue;
        }
        const dataUrl = await fileToDataUrl(file);
        await addUpload(product, file.name, dataUrl);
        added++;
      }
      if (added > 0) {
        await loadAssets();
        flash("Imagen añadida a la galería ✓");
      }
    } catch (e) {
      flash("Error al subir: " + (e as Error).message);
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleDeleteAsset(asset: GalleryAsset) {
    if (!confirm(`¿Borrar "${asset.name}" de la galería?`)) return;
    try {
      if (asset.source === "upload" && asset.id != null) {
        // A user upload — remove it from this product's IndexedDB gallery.
        await deleteUpload(asset.id);
      } else {
        // A bundled/brand image lives on the read-only server FS, so it can't
        // be deleted — hide it from this product's gallery instead.
        await hideAsset(product, asset.src);
      }
      await loadAssets();
      flash("Imagen borrada ✓");
    } catch (e) {
      flash("Error al borrar: " + (e as Error).message);
    }
  }

  function patchSlide(idx: number, patch: Partial<Slide>) {
    setDoc((d) => {
      const slides = d.slides.slice();
      slides[idx] = { ...slides[idx], ...patch };
      return { ...d, slides };
    });
  }

  // Color the text currently selected inside an editable slide field. Called
  // from swatch buttons that preventDefault on mousedown so the canvas keeps its
  // selection. Applies as inline CSS so the committed HTML carries the color.
  function applySelectionColor(color: string) {
    try {
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand("foreColor", false, color);
    } catch {
      flash("Selecciona el texto en el lienzo primero");
    }
  }

  // ── Per-field text color overrides for the active slide ──
  function setTextColor(field: string, value: string) {
    patchSlide(cur, { textColors: { ...(slide.textColors ?? {}), [field]: value } });
  }
  function clearTextColor(field: string) {
    const next = { ...(slide.textColors ?? {}) };
    delete next[field];
    patchSlide(cur, { textColors: next });
  }

  // Apply a patch to whichever layer is currently selected on the active slide
  // (the base image when selLayer === -1, otherwise the overlay at that index).
  function patchLayer(patch: Partial<ImageState>) {
    setDoc((d) => {
      const slides = d.slides.slice();
      const s = { ...slides[cur] };
      if (selLayer === -1) {
        if (s.image) s.image = { ...s.image, ...patch };
      } else {
        const overlays = (s.overlays ?? []).slice();
        if (overlays[selLayer]) overlays[selLayer] = { ...overlays[selLayer], ...patch };
        s.overlays = overlays;
      }
      slides[cur] = s;
      return { ...d, slides };
    });
  }

  // ── Bullet (puntos clave) editing for the active slide ──
  function updateBullet(i: number, text: string) {
    const bullets = (slide.bullets ?? []).slice();
    bullets[i] = { text };
    patchSlide(cur, { bullets });
  }
  function deleteBullet(i: number) {
    const bullets = (slide.bullets ?? []).slice();
    bullets.splice(i, 1);
    patchSlide(cur, { bullets });
  }
  function addBullet() {
    patchSlide(cur, { bullets: [...(slide.bullets ?? []), { text: "Nuevo punto" }] });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Persist each product's carousel locally so edits survive a refresh ──
  // Per-product key: Water keeps its saved photos/copy while Solar, Batería and
  // Roofing each get their own independent editable area.
  const storageKey = carouselStorageKey(product);
  const loadedRef = useRef(false);

  // On mount (and if the ?c= param changes) load the right product's design,
  // preferring the user's saved version over the bundled template.
  useEffect(() => {
    const p = readProductFromUrl();
    setProduct(p);
    setCur(0);
    loadedRef.current = false;
    let cancelled = false;
    loadDocFor(p).then((d) => {
      if (cancelled) return;
      setDoc(d);
      loadedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    const t = setTimeout(() => {
      idbSaveDoc(storageKey, doc).catch(() => {
        /* IndexedDB unavailable */
      });
    }, 500);
    return () => clearTimeout(t);
  }, [doc, storageKey]);

  function switchProduct(p: string) {
    if (p === product || !carousels[p]) return;
    loadedRef.current = false;
    setProduct(p);
    setCur(0);
    setSelLayer(-1);
    setEditing(false);
    loadDocFor(p).then((d) => {
      setDoc(d);
      loadedRef.current = true;
    });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("c", p);
      window.history.replaceState(null, "", url.toString());
    }
  }

  function saveDoc() {
    idbSaveDoc(storageKey, doc)
      .then(() => flash("Cambios guardados ✓"))
      .catch(async () => {
        // Most likely the doc is too big for IndexedDB (full-res photos baked in,
        // possibly from before compression existed). Shrink every image and retry.
        setBusy("Optimizando imágenes…");
        try {
          const small = await shrinkDocImages(doc);
          setDoc(small);
          await idbSaveDoc(storageKey, small);
          flash("Cambios guardados ✓ (imágenes optimizadas)");
        } catch (e2) {
          const err = e2 as { name?: string; message?: string };
          flash("No pude guardar: " + (err?.message || err?.name || "error desconocido"));
        } finally {
          setBusy(null);
        }
      });
  }

  function resetDoc() {
    if (!confirm("¿Descartar tus cambios y volver al diseño original?")) return;
    idbDeleteDoc(storageKey).catch(() => {});
    try {
      localStorage.removeItem(storageKey); // clear any leftover legacy copy
    } catch {
      /* ignore */
    }
    setDoc(structuredClone(carousels[product]));
    flash("Diseño restablecido");
  }

  // ── Drag the active slide's image to reposition it freely ──
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  function onImagePointerDown(e: React.PointerEvent) {
    if (editing || !selImage) return;
    e.preventDefault();
    const img = selImage;
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: img.posX ?? 50, py: img.posY ?? 50 };
    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dxPct = ((ev.clientX - d.sx) / PREVIEW_SCALE / SLIDE_W) * 100;
      const dyPct = ((ev.clientY - d.sy) / PREVIEW_SCALE / SLIDE_H) * 100;
      patchLayer({
        posX: Math.min(100, Math.max(0, d.px + dxPct)),
        posY: Math.min(100, Math.max(0, d.py + dyPct)),
      });
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  async function handleExportAll() {
    setBusy("Exportando los 6 slides…");
    try {
      const nodes = slideRefs.current.filter(Boolean) as HTMLElement[];
      await exportSlidesToZip(nodes, `windmar_${product}_carousel`);
      flash("ZIP descargado ✓");
    } catch (e) {
      flash("Error al exportar: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handleExportCurrent() {
    setBusy("Exportando slide actual…");
    try {
      const node = slideRefs.current[cur];
      if (node) await exportSingleSlide(node, `windmar_${product}_slide${cur + 1}.png`);
      flash("PNG descargado ✓");
    } catch (e) {
      flash("Error: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handleShareAsana() {
    setBusy("Enviando a Asana…");
    try {
      const node = slideRefs.current[cur];
      if (!node) throw new Error("Slide no disponible");
      const blob = await nodeToPngBlob(node);
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/asana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: `${doc.name} — Slide ${cur + 1}`,
          notes: `Diseño exportado desde Content Hub Studio.\nSlide ${cur + 1}/${doc.slides.length}.`,
          fileName: `windmar_${product}_slide${cur + 1}.png`,
          fileBase64: base64,
        }),
      });
      // The API may return an empty body (e.g. 500 when ASANA_TOKEN /
      // ASANA_PROJECT_ID aren't configured), so parse defensively instead of
      // letting res.json() throw the cryptic "Unexpected end of JSON input".
      const raw = await res.text();
      const data = raw ? (JSON.parse(raw) as { error?: string; message?: string }) : {};
      if (!res.ok) {
        throw new Error(
          data.error ||
            (res.status === 500
              ? "Asana no está configurado (falta ASANA_TOKEN / ASANA_PROJECT_ID en el servidor)."
              : `El servidor respondió ${res.status}.`)
        );
      }
      flash(data.message || "Tarea creada en Asana ✓");
    } catch (e) {
      flash("Asana: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* APP HEADER */}
      <header className="glass border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg,#1a52c7,#7eb8f7)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="font-unbounded text-white font-extrabold text-sm uppercase tracking-tight">WindMar Studio</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest">{doc.brand}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={product}
            onChange={(e) => switchProduct(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-2.5 py-2 text-sm text-white/85 outline-none focus:border-[#7eb8f7]/60 cursor-pointer"
            title="Cambiar de producto"
          >
            {CAROUSEL_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id} style={{ color: "#111" }}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            onClick={saveDoc}
            className="rounded-lg bg-[rgba(26,199,100,0.2)] border border-[rgba(26,199,100,0.45)] px-3 py-2 text-sm text-[#7ef7b8] hover:bg-[rgba(26,199,100,0.35)]"
            title="Guardar tus cambios en este navegador"
          >
            Guardar
          </button>
          <button
            onClick={resetDoc}
            className="rounded-lg px-3 py-2 text-sm text-white/45 hover:bg-white/10 hover:text-white/80"
            title="Descartar cambios y volver al diseño original"
          >
            Restablecer
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1">
      {/* CANVAS */}
      <div className="stage-bg flex-1 flex flex-col items-center justify-center gap-5 rounded-3xl">
        <div className="glass flex items-center gap-2 rounded-full px-2 py-1.5 border border-white/10">
          <button
            onClick={() => setCur((c) => Math.max(0, c - 1))}
            disabled={cur === 0}
            className="w-9 h-9 rounded-full bg-white/5 text-white disabled:opacity-20 hover:bg-white/15 transition"
          >
            ←
          </button>
          <span className="text-white/70 text-sm font-semibold tabular-nums px-1">
            {cur + 1} <span className="text-white/30">/</span> {doc.slides.length}
          </span>
          <button
            onClick={() => setCur((c) => Math.min(doc.slides.length - 1, c + 1))}
            disabled={cur === doc.slides.length - 1}
            className="w-9 h-9 rounded-full bg-white/5 text-white disabled:opacity-20 hover:bg-white/15 transition"
          >
            →
          </button>
        </div>

        {/* scaled stage */}
        <div
          style={{
            width: SLIDE_W * PREVIEW_SCALE,
            height: SLIDE_H * PREVIEW_SCALE,
            position: "relative",
            boxShadow: "0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {doc.slides.map((s, i) => (
            <div
              key={s.id}
              onPointerDown={i === cur ? onImagePointerDown : undefined}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: SLIDE_W,
                height: SLIDE_H,
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: "top left",
                opacity: i === cur ? 1 : 0,
                pointerEvents: i === cur ? "auto" : "none",
                cursor: i === cur && s.image && !editing ? "grab" : "default",
              }}
            >
              <div ref={(el) => { slideRefs.current[i] = el; }}>
                <CarouselSlide
                  slide={s}
                  colors={doc.colors}
                  fonts={doc.fonts}
                  brand={doc.brand}
                  theme={doc.theme}
                  editing={editing && i === cur}
                  onEdit={(field, value) => patchSlide(i, { [field]: value })}
                  showBadge={!hideBrand}
                />
              </div>
            </div>
          ))}
        </div>

        {/* thumbnail strip */}
        <div className="flex gap-2 flex-wrap justify-center max-w-full">
          {doc.slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCur(i)}
              title={`Slide ${i + 1}`}
              className="relative rounded-lg overflow-hidden transition shrink-0"
              style={{
                width: SLIDE_W * 0.06,
                height: SLIDE_H * 0.06,
                outline: i === cur ? `2px solid ${doc.colors.accent}` : "1px solid rgba(255,255,255,0.12)",
                outlineOffset: i === cur ? 1 : 0,
                opacity: i === cur ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: SLIDE_W,
                  height: SLIDE_H,
                  transform: `scale(0.06)`,
                  transformOrigin: "top left",
                  pointerEvents: "none",
                }}
              >
                <CarouselSlide slide={s} colors={doc.colors} fonts={doc.fonts} brand={doc.brand} theme={doc.theme} editing={false} onEdit={() => {}} showBadge={!hideBrand} />
              </div>
              <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 leading-tight rounded-tl">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* EDITOR PANEL */}
      <div className="w-full lg:w-[330px] glass rounded-2xl overflow-hidden border border-white/10 flex flex-col self-start shadow-2xl">
        <div className="px-4 py-3 flex items-center justify-between border-b-2 border-black" style={{ background: "#ffc145" }}>
          <span className="font-unbounded text-black font-extrabold text-sm uppercase tracking-tight">Editor</span>
          <span className="text-black/70 text-[11px] font-semibold tabular-nums bg-black/10 px-2 py-0.5">Slide {cur + 1}/{doc.slides.length}</span>
        </div>

        <div className="flex bg-black/20 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider">
          {(["img", "text", "color", "export", "asana"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 transition relative ${
                tab === t ? "text-[#ffc145]" : "text-white/35 hover:text-white/60"
              }`}
            >
              {t === "img" ? "Imagen" : t === "text" ? "Texto" : t === "color" ? "Color" : t === "export" ? "Export" : "Asana"}
              {tab === t && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#ffc145]" />}
            </button>
          ))}
        </div>

        <div className="p-4 text-white">
          {tab === "img" && (
            <div>
              {/* Layers of the active slide: background + stacked overlays */}
              <div className="mb-3">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Capas del slide</span>
                <div className="mt-1.5 flex flex-col gap-1">
                  <LayerRow
                    label="Fondo"
                    thumb={slide.image?.src}
                    selected={selLayer === -1}
                    empty={!slide.image}
                    onSelect={() => setSelLayer(-1)}
                  />
                  {(slide.overlays ?? []).map((ov, i, arr) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="flex-1">
                        <LayerRow
                          label={`Capa ${i + 1}`}
                          thumb={ov.src}
                          selected={selLayer === i}
                          onSelect={() => setSelLayer(i)}
                        />
                      </div>
                      <button
                        onClick={() => moveLayer(i, -1)}
                        disabled={i === 0}
                        title="Mover atrás"
                        className="px-1.5 py-1 text-white/50 hover:text-white disabled:opacity-20 disabled:hover:text-white/50 text-xs"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLayer(i, 1)}
                        disabled={i === arr.length - 1}
                        title="Mover al frente"
                        className="px-1.5 py-1 text-white/50 hover:text-white disabled:opacity-20 disabled:hover:text-white/50 text-xs"
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls act on the selected layer */}
              <div className={selImage ? "" : "opacity-40 pointer-events-none"}>
                <Range label="Zoom" min={selLayer === -1 ? 0.5 : 0.1} max={3} step={0.05} value={selImage?.scale ?? 1} display={(v) => v.toFixed(2) + "x"} onChange={(v) => patchLayer({ scale: v })} />
                <Range label="Posición X" min={0} max={100} step={1} value={selImage?.posX ?? 50} display={(v) => v + "%"} onChange={(v) => patchLayer({ posX: v })} />
                <Range label="Posición Y" min={0} max={100} step={1} value={selImage?.posY ?? 50} display={(v) => v + "%"} onChange={(v) => patchLayer({ posY: v })} />
                <Range label="Opacidad" min={0.05} max={1} step={0.05} value={selImage?.opacity ?? 1} display={(v) => Math.round(v * 100) + "%"} onChange={(v) => patchLayer({ opacity: v })} />
                {selImage && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Transparencia</span>
                    <button
                      onClick={() => makeTransparent(bgTol)}
                      className="w-full mt-1.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#7eb8f7] border border-[#7eb8f7]/40 hover:bg-[#7eb8f7]/15"
                    >
                      {selImage.orig ? "Reaplicar transparencia" : "Quitar fondo de la foto"}
                    </button>
                    {selImage.orig && (
                      <>
                        <div className="mt-3">
                          <Range label="Sensibilidad" min={5} max={180} step={5} value={bgTol} display={(v) => String(v)} onChange={scheduleTransparent} />
                        </div>
                        <button
                          onClick={restorePhoto}
                          className="w-full mt-1 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60 border border-white/20 hover:bg-white/10"
                        >
                          Restaurar foto original
                        </button>
                      </>
                    )}
                    <p className="text-white/30 text-[10px] leading-relaxed mt-2">Funciona mejor con fondos sólidos o blancos (logos, productos). Sube la sensibilidad para quitar más.</p>
                  </div>
                )}

                {selImage && (
                  <button
                    onClick={removeLayer}
                    className="w-full mt-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#d84727] border border-[#d84727]/40 hover:bg-[#d84727]/15"
                  >
                    {selLayer === -1 ? "Borrar imagen de fondo" : "Borrar capa"}
                  </button>
                )}
                <p className="text-white/30 text-[10px] leading-relaxed mt-2">Arrastra la imagen en el lienzo para moverla. Las capas se dibujan encima del fondo.</p>
              </div>

              {(slide.kind === "content" || slide.kind === "cta") && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Range label="Velo (legibilidad)" min={0} max={1} step={0.05} value={slide.veil ?? 1} display={(v) => Math.round(v * 100) + "%"} onChange={(v) => patchSlide(cur, { veil: v })} />
                  <p className="text-white/30 text-[10px] leading-relaxed mt-1">Capa que difumina el fondo para que el texto se lea. Bájala a 0% para ver la foto nítida.</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Galería de assets</span>
                  <button onClick={loadAssets} className="text-[#7eb8f7] text-[10px] hover:text-white" title="Recargar">↻</button>
                </div>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={!!busy}
                  className="w-full mb-2 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-[rgba(26,82,199,0.2)] border border-[rgba(26,82,199,0.4)] text-[#7eb8f7] hover:bg-[rgba(26,82,199,0.38)] disabled:opacity-40"
                >
                  ＋ Subir imagen
                </button>

                {assets.length === 0 ? (
                  <p className="text-white/25 text-[9px] leading-relaxed">
                    Sube tus imágenes o pídele a Claude que genere una (Higgsfield · Adobe · Canva). Aparecerán aquí; haz click para añadirlas: la primera será el fondo y las siguientes capas encima.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {assets.map((a) => {
                      const active =
                        slide.image?.src === a.src ||
                        (slide.overlays ?? []).some((o) => o.src === a.src);
                      return (
                        <div
                          key={a.id ?? a.src}
                          className="relative aspect-square rounded-md overflow-hidden border transition group"
                          style={{ borderColor: active ? "#7eb8f7" : "rgba(255,255,255,0.1)" }}
                        >
                          <button onClick={() => applyAsset(a.src)} title={`${a.name} — añadir`} className="block w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.src} alt={a.name} className="w-full h-full object-cover" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(a)}
                            title={a.source === "upload" ? "Borrar de la galería" : "Ocultar de este producto"}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-white/25 text-[9px] leading-relaxed mt-2">
                  Galería de este producto. Click en una imagen para añadirla como fondo o capa. La × borra tus imágenes subidas; en las de marca solo las oculta de este producto.
                </p>
              </div>
            </div>
          )}

          {tab === "text" && (
            <div>
              <p className="text-white/30 text-[10px] leading-relaxed mb-3">Activa la edición y haz click directamente sobre cualquier texto del slide para modificarlo.</p>
              <button
                onClick={() => setEditing((e) => !e)}
                className="w-full py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition"
                style={{
                  background: editing ? "rgba(26,199,100,0.25)" : "rgba(26,82,199,0.2)",
                  border: `1px solid ${editing ? "rgba(26,199,100,0.5)" : "rgba(26,82,199,0.4)"}`,
                  color: editing ? "#7ef7b8" : "#7eb8f7",
                }}
              >
                {editing ? "✓ Editando — click para salir" : "Activar edición de texto"}
              </button>

              {editing && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Color por palabra</span>
                  <p className="text-white/30 text-[10px] leading-relaxed mt-1 mb-2">Selecciona las palabras en el lienzo y haz click en un color para pintarlas. Así "UNA SOLA CASA" puede ir en naranja y el resto en azul.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      ["Header", doc.colors.headerBg],
                      ["Accent", doc.colors.accent],
                      ["Naranja", doc.colors.orange],
                      ["Bullet", doc.colors.bullet],
                      ["Texto", doc.colors.bodyText],
                      ["Blanco", "#ffffff"],
                      ["Negro", "#21274e"],
                    ] as const).map(([label, c]) => (
                      <button
                        key={label}
                        title={label}
                        onMouseDown={(e) => { e.preventDefault(); applySelectionColor(c); }}
                        className="w-7 h-7 rounded-md border border-white/20 shrink-0"
                        style={{ background: c }}
                      />
                    ))}
                    <label
                      title="Color personalizado"
                      onMouseDown={(e) => e.preventDefault()}
                      className="w-7 h-7 rounded-md border border-white/20 shrink-0 flex items-center justify-center text-white/60 text-[10px] cursor-pointer overflow-hidden relative"
                    >
                      +
                      <input
                        type="color"
                        onMouseDown={(e) => e.preventDefault()}
                        onChange={(e) => applySelectionColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Color de cada texto (este slide)</span>
                <div className="mt-2 flex flex-col gap-2">
                  {(() => {
                    const defs: Record<string, string> = {
                      eyebrow: doc.colors.headerBg,
                      title: slide.kind === "cta" ? "#ffffff" : doc.colors.headerBg,
                      subtitle: slide.kind === "cta" ? "#ffffff" : "#475569",
                      body: "#64748b",
                      tag: doc.colors.bullet,
                      cta: "#ffffff",
                      bullets: "#334155",
                      checks: slide.kind === "cta" ? "#ffffff" : "#334155",
                      highlight: doc.colors.headerBg,
                      url: "#ffffff",
                    };
                    const fields: [string, string][] = [];
                    if (slide.eyebrow) fields.push(["eyebrow", "Eyebrow"]);
                    fields.push(["title", "Título"]);
                    if (slide.subtitle) fields.push(["subtitle", "Subtítulo"]);
                    if (slide.body) fields.push(["body", "Texto"]);
                    if (slide.tag) fields.push(["tag", "Etiqueta"]);
                    if (slide.cta) fields.push(["cta", "Botón CTA"]);
                    if (slide.bullets) fields.push(["bullets", "Puntos"]);
                    if (slide.checks) fields.push(["checks", "Checks"]);
                    if (slide.highlight) fields.push(["highlight", "Destacado"]);
                    if (slide.url) fields.push(["url", "URL"]);
                    return fields.map(([key, label]) => {
                      const set = slide.textColors?.[key];
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-white/45 text-[10px] font-bold uppercase tracking-wide">{label}</span>
                          <div className="flex items-center gap-2">
                            <input type="color" value={set ?? defs[key]} onChange={(e) => setTextColor(key, e.target.value)} />
                            {set && (
                              <button onClick={() => clearTextColor(key)} title="Restablecer" className="text-white/40 hover:text-white text-xs">↺</button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <p className="text-white/30 text-[10px] leading-relaxed mt-2">Cada texto del slide tiene su propio color. El ↺ devuelve ese texto al color de marca.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hideBrand}
                    onChange={(e) => toggleHideBrand(!e.target.checked)}
                  />
                  <span className="text-white/60 text-[11px] font-bold uppercase tracking-wide">Mostrar marca WindMar (gota y nombre)</span>
                </label>
                <p className="text-white/30 text-[10px] leading-relaxed mt-1.5">Desactívalo para quitar la gota y el texto "WindMar Home" de todos los slides. Aplica a <b>todos los carruseles</b> a la vez.</p>
              </div>

              {slide.bullets && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Puntos clave</span>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {slide.bullets.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <input
                          value={b.text}
                          onChange={(e) => updateBullet(i, e.target.value)}
                          placeholder={`Punto ${i + 1}`}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/80 outline-none focus:border-[#7eb8f7]/50"
                        />
                        <button
                          onClick={() => deleteBullet(i)}
                          title="Eliminar punto"
                          className="w-7 h-7 shrink-0 rounded-lg text-[#d84727] border border-[#d84727]/40 hover:bg-[#d84727]/15 text-sm leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {slide.bullets.length === 0 && (
                      <p className="text-white/25 text-[9px] leading-relaxed">Sin puntos. El slide ya no mostrará lista.</p>
                    )}
                  </div>
                  <button
                    onClick={addBullet}
                    className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-[rgba(26,82,199,0.2)] border border-[rgba(26,82,199,0.4)] text-[#7eb8f7] hover:bg-[rgba(26,82,199,0.38)]"
                  >
                    ＋ Añadir punto
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "color" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 pb-3 mb-1 border-b border-white/10">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Tipografía</span>
                {([
                  ["Títulos", "heading", HEADING_FONTS],
                  ["Cuerpo", "body", BODY_FONTS],
                ] as const).map(([label, key, options]) => (
                  <label key={key} className="flex items-center justify-between gap-3">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide shrink-0">{label}</span>
                    <select
                      value={doc.fonts[key]}
                      onChange={(e) => setDoc((d) => ({ ...d, fonts: { ...d.fonts, [key]: e.target.value } }))}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/80 outline-none focus:border-[#7eb8f7]/50"
                      style={{ fontFamily: `'${doc.fonts[key]}', sans-serif` }}
                    >
                      {options.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: `'${font}', sans-serif`, color: "#111" }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <button
                  onClick={() => setDoc((d) => ({ ...d, fonts: { ...defaultFonts } }))}
                  className="self-end text-[9px] font-bold uppercase tracking-wide text-white/40 hover:text-white/70"
                >
                  Restaurar fuentes
                </button>
              </div>
              {([
                ["Header", "headerBg"],
                ["Accent azul", "accent"],
                ["Naranja", "orange"],
                ["Texto", "bodyText"],
                ["Bullets / íconos", "bullet"],
              ] as const).map(([label, key]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">{label}</span>
                  <input
                    type="color"
                    value={doc.colors[key]}
                    onChange={(e) => setDoc((d) => ({ ...d, colors: { ...d.colors, [key]: e.target.value } }))}
                  />
                </div>
              ))}
              <button
                onClick={() => setDoc((d) => ({ ...d, colors: { ...defaultColors } }))}
                className="mt-2 w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              >
                Restaurar colores
              </button>
            </div>
          )}

          {tab === "export" && (
            <div className="flex flex-col gap-2">
              <p className="text-white/30 text-[10px] leading-relaxed mb-1">Exporta a PNG en tamaño Instagram (1080×1350, formato 4:5).</p>
              <button onClick={handleExportCurrent} disabled={!!busy} className="w-full py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-[rgba(26,82,199,0.2)] border border-[rgba(26,82,199,0.4)] text-[#7eb8f7] hover:bg-[rgba(26,82,199,0.38)] disabled:opacity-40">
                ⬇ Descargar slide actual (PNG)
              </button>
              <button onClick={handleExportAll} disabled={!!busy} className="w-full py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-[rgba(245,124,10,0.2)] border border-[rgba(245,124,10,0.4)] text-[#f5a04a] hover:bg-[rgba(245,124,10,0.35)] disabled:opacity-40">
                ⬇ Descargar carousel completo (ZIP)
              </button>
            </div>
          )}

          {tab === "asana" && (
            <div className="flex flex-col gap-2">
              <p className="text-white/30 text-[10px] leading-relaxed mb-1">Crea una tarea en tu proyecto de Asana con el slide adjunto como PNG.</p>
              <button onClick={handleShareAsana} disabled={!!busy} className="w-full py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-[rgba(26,82,199,0.2)] border border-[rgba(26,82,199,0.4)] text-[#7eb8f7] hover:bg-[rgba(26,82,199,0.38)] disabled:opacity-40">
                📤 Compartir slide a Asana
              </button>
              <p className="text-white/25 text-[9px] leading-relaxed mt-1">Requiere ASANA_TOKEN y ASANA_PROJECT_ID en .env.local</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {(busy || toast) && (
        <div className="glass fixed bottom-6 left-1/2 -translate-x-1/2 border border-white/15 text-white text-sm px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          {busy && <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          {busy ?? toast}
        </div>
      )}
    </div>
  );
}

function LayerRow({
  label,
  thumb,
  selected,
  empty,
  onSelect,
}: {
  label: string;
  thumb?: string;
  selected: boolean;
  empty?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-2 px-2 py-1.5 border text-left transition"
      style={{
        borderColor: selected ? "#ffc145" : "rgba(255,255,255,0.1)",
        background: selected ? "rgba(255,193,69,0.12)" : "transparent",
      }}
    >
      <span className="w-6 h-6 shrink-0 border border-white/15 overflow-hidden bg-black/30 flex items-center justify-center">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/30 text-[10px]">∅</span>
        )}
      </span>
      <span className={`text-[11px] font-bold uppercase tracking-wide ${selected ? "text-[#ffc145]" : "text-white/60"}`}>
        {label}
      </span>
      {empty && <span className="text-white/25 text-[9px] ml-auto">vacío</span>}
    </button>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-white/45 text-[10px] font-bold uppercase tracking-wide">{label}</span>
        <span className="text-[#7eb8f7] text-xs font-bold">{display(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}
