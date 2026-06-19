"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CarouselDoc,
  Slide,
  waterCarousel,
  defaultColors,
  defaultFonts,
  HEADING_FONTS,
  BODY_FONTS,
} from "@/data/carousel";
import CarouselSlide, { SLIDE_W, SLIDE_H } from "./CarouselSlide";
import {
  exportSlidesToZip,
  exportSingleSlide,
  nodeToPngBlob,
  blobToBase64,
} from "@/lib/exporter";

type Tab = "img" | "text" | "color" | "export" | "asana";
const PREVIEW_SCALE = 0.4;

export default function Studio() {
  const [doc, setDoc] = useState<CarouselDoc>(() =>
    structuredClone(waterCarousel)
  );
  const [cur, setCur] = useState(0);
  const [tab, setTab] = useState<Tab>("img");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [assets, setAssets] = useState<
    { name: string; src: string; source: string }[]
  >([]);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const slide = doc.slides[cur];

  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      setAssets(data.assets ?? []);
    } catch {
      setAssets([]);
    }
  }, []);

  useEffect(() => {
    if (tab === "img") loadAssets();
  }, [tab, loadAssets]);

  function applyAsset(src: string) {
    setDoc((d) => {
      const slides = d.slides.slice();
      const s = slides[cur];
      const base = s.image ?? { scale: 1, posX: 50, posY: 50, opacity: 1 };
      slides[cur] = { ...s, image: { ...base, src } };
      return { ...d, slides };
    });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy("Subiendo imagen…");
    try {
      let lastSrc = "";
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/assets", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falló la subida");
        lastSrc = data.src;
      }
      await loadAssets();
      if (lastSrc) applyAsset(lastSrc);
      flash("Imagen subida ✓");
    } catch (e) {
      flash("Error al subir: " + (e as Error).message);
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleDeleteAsset(name: string) {
    if (!confirm(`¿Borrar "${name}" del gallery?`)) return;
    try {
      const res = await fetch(`/api/assets?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo borrar");
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

  function patchImage(idx: number, patch: Partial<NonNullable<Slide["image"]>>) {
    setDoc((d) => {
      const slides = d.slides.slice();
      const s = slides[idx];
      if (s.image) slides[idx] = { ...s, image: { ...s.image, ...patch } };
      return { ...d, slides };
    });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleExportAll() {
    setBusy("Exportando los 6 slides…");
    try {
      const nodes = slideRefs.current.filter(Boolean) as HTMLElement[];
      await exportSlidesToZip(nodes, "windmar_water_carousel");
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
      if (node) await exportSingleSlide(node, `windmar_water_slide${cur + 1}.png`);
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
          fileName: `windmar_water_slide${cur + 1}.png`,
          fileBase64: base64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falló la petición");
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
      <header className="glass sticky top-0 z-30 border-b border-white/10 px-6 py-3 flex items-center justify-between">
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
            <div className="text-white font-bold text-sm tracking-tight">Windmar Studio</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest">{doc.brand}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/45 text-xs hidden xl:block truncate max-w-[18vw]">{doc.name}</span>
          <nav className="hidden md:flex items-center gap-1">
            <a href="/windmar_content_hub.html" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Content Hub</a>
            <a href="/Water_Carousel_v2.html" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Carrusel</a>
            <a href="/produccion.html" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Producción</a>
            <a href="/windmar_home_graphic_v2.html" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Gráfico</a>
          </nav>
          <Link
            href="/hub"
            className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            Hub
          </Link>
          <Link
            href="/lienzo"
            className="rounded-lg bg-[#1a52c7] px-4 py-2 text-sm text-white hover:bg-[#1a52c7]/80"
          >
            Lienzo →
          </Link>
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
              }}
            >
              <div ref={(el) => { slideRefs.current[i] = el; }}>
                <CarouselSlide
                  slide={s}
                  colors={doc.colors}
                  fonts={doc.fonts}
                  editing={editing && i === cur}
                  onEdit={(field, value) => patchSlide(i, { [field]: value })}
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
                <CarouselSlide slide={s} colors={doc.colors} fonts={doc.fonts} editing={false} onEdit={() => {}} />
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
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10" style={{ background: "linear-gradient(135deg,#1a52c7,#2b6ae0)" }}>
          <span className="text-white font-bold text-sm tracking-tight">Editor</span>
          <span className="text-white/70 text-[11px] font-semibold tabular-nums bg-black/20 px-2 py-0.5 rounded-full">Slide {cur + 1}/{doc.slides.length}</span>
        </div>

        <div className="flex bg-black/20 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider">
          {(["img", "text", "color", "export", "asana"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 transition relative ${
                tab === t ? "text-[#7eb8f7]" : "text-white/35 hover:text-white/60"
              }`}
            >
              {t === "img" ? "Imagen" : t === "text" ? "Texto" : t === "color" ? "Color" : t === "export" ? "Export" : "Asana"}
              {tab === t && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#7eb8f7]" />}
            </button>
          ))}
        </div>

        <div className="p-4 text-white">
          {tab === "img" && (
            <div className={slide.image ? "" : "opacity-40 pointer-events-none"}>
              <Range label="Zoom" min={0.5} max={3} step={0.05} value={slide.image?.scale ?? 1} display={(v) => v.toFixed(1) + "x"} onChange={(v) => patchImage(cur, { scale: v })} />
              <Range label="Posición X" min={0} max={100} step={1} value={slide.image?.posX ?? 50} display={(v) => v + "%"} onChange={(v) => patchImage(cur, { posX: v })} />
              <Range label="Posición Y" min={0} max={100} step={1} value={slide.image?.posY ?? 50} display={(v) => v + "%"} onChange={(v) => patchImage(cur, { posY: v })} />
              <Range label="Opacidad" min={0.05} max={1} step={0.05} value={slide.image?.opacity ?? 1} display={(v) => Math.round(v * 100) + "%"} onChange={(v) => patchImage(cur, { opacity: v })} />
              <p className="text-white/30 text-[10px] leading-relaxed mt-2">Ajusta la imagen del slide activo. Navega con las flechas para editar cada uno.</p>

              <div className="mt-4 pt-4 border-t border-white/10 pointer-events-auto">
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
                    Sube tus imágenes o pídele a Claude que genere una (Higgsfield · Adobe · Canva). Aparecerán aquí; haz click para aplicarlas al slide.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {assets.map((a) => {
                      const active = slide.image?.src === a.src;
                      const canDelete = a.source === "assets";
                      return (
                        <div
                          key={a.src}
                          className="relative aspect-square rounded-md overflow-hidden border transition group"
                          style={{ borderColor: active ? "#7eb8f7" : "rgba(255,255,255,0.1)" }}
                        >
                          <button onClick={() => applyAsset(a.src)} title={a.name} className="block w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.src} alt={a.name} className="w-full h-full object-cover" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteAsset(a.name)}
                              title="Borrar del gallery"
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-white/25 text-[9px] leading-relaxed mt-2">
                  La × borra solo imágenes subidas/generadas. Las imágenes de marca están protegidas.
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
