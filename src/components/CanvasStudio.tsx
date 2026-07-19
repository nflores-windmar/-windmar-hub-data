"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Trash2,
  Download,
  Sparkles,
  LayoutGrid,
  Send,
  Share2,
} from "lucide-react";

// fabric is imported dynamically inside useEffect to avoid SSR window/document crashes.
type FabricNS = typeof import("fabric");
type FabricCanvas = import("fabric").Canvas;

interface Format {
  id: string;
  label: string;
  w: number;
  h: number;
}

const FORMATS: Format[] = [
  { id: "post", label: "IG Post 1:1", w: 1080, h: 1080 },
  { id: "vertical", label: "IG Vertical 4:5", w: 1080, h: 1350 },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { id: "ad", label: "Ad 1.91:1", w: 1200, h: 628 },
];

const MAXW = 600;
const MAXH = 620;

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

export default function CanvasStudio() {
  const elRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const fabricRef = useRef<FabricNS | null>(null);
  const idRef = useRef(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const [format, setFormat] = useState<Format>(FORMATS[1]);
  const [bg, setBg] = useState("#0a1628");
  const [ready, setReady] = useState(false);

  const [assets, setAssets] = useState<{ name: string; src: string }[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [sel, setSel] = useState<{ type: string; fill: string; fontSize: number } | null>(null);

  const [chat, setChat] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Soy tu asistente de diseño. Pídeme una revisión del lienzo o cambios concretos (reescribir un titular, acortar texto, cambiar un color) y los aplico.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const scale = Math.min(MAXW / format.w, MAXH / format.h);

  // ── Initialize fabric canvas once ──
  useEffect(() => {
    let disposed = false;
    (async () => {
      const fabric = await import("fabric");
      if (disposed || !elRef.current) return;
      fabricRef.current = fabric;
      const canvas = new fabric.Canvas(elRef.current, {
        backgroundColor: bg,
        preserveObjectStacking: true,
      });
      canvasRef.current = canvas;
      setReady(true);
    })();
    return () => {
      disposed = true;
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resize canvas to format (display = format * scale) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setDimensions({ width: format.w * scale, height: format.h * scale });
    canvas.setZoom(scale);
    canvas.renderAll();
  }, [format, scale, ready]);

  // ── Background color ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.backgroundColor = bg;
    canvas.renderAll();
  }, [bg, ready]);

  // ── Sync the selected object into the properties panel ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      const o = canvas.getActiveObject() as unknown as {
        type?: string;
        fill?: unknown;
        fontSize?: number;
      } | null;
      if (!o) return setSel(null);
      setSel({
        type: o.type ?? "object",
        fill: typeof o.fill === "string" ? o.fill : "#ffffff",
        fontSize: o.fontSize ?? 64,
      });
    };
    const clear = () => setSel(null);
    canvas.on("selection:created", sync);
    canvas.on("selection:updated", sync);
    canvas.on("selection:cleared", clear);
    return () => {
      canvas.off("selection:created", sync);
      canvas.off("selection:updated", sync);
      canvas.off("selection:cleared", clear);
    };
  }, [ready]);

  // ── Delete selected object(s) with Delete/Backspace ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject() as unknown as { isEditing?: boolean } | null;
      if (active?.isEditing) return; // editing text: let backspace edit it
      const objs = canvas.getActiveObjects();
      if (!objs.length) return;
      e.preventDefault();
      objs.forEach((o) => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.renderAll();
      setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Apply property changes to the currently selected object.
  const updateActive = (props: Record<string, unknown>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.set(props);
    canvas.renderAll();
    setSel((s) => (s ? { ...s, ...props } : s));
  };

  // ── Load asset gallery ──
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
    loadAssets();
  }, [loadAssets]);

  // Tag a fabric object with a stable id so the assistant can reference it.
  const tag = (obj: import("fabric").FabricObject) => {
    (obj as unknown as { id: string }).id = `o${++idRef.current}`;
    return obj;
  };

  // ── Toolbar actions ──
  const addText = () => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const t = new fabric.Textbox("Doble clic para editar", {
      left: format.w / 2 - 200,
      top: format.h / 2 - 40,
      width: 400,
      fontSize: 64,
      fill: "#ffffff",
      fontFamily: "Barlow, sans-serif",
      textAlign: "center",
    });
    tag(t);
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
  };

  const addRect = () => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const r = new fabric.Rect({
      left: format.w / 2 - 150,
      top: format.h / 2 - 100,
      width: 300,
      height: 200,
      fill: "#1a52c7",
      rx: 16,
      ry: 16,
    });
    tag(r);
    canvas.add(r);
    canvas.setActiveObject(r);
    canvas.renderAll();
  };

  const addCircle = () => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const c = new fabric.Circle({
      left: format.w / 2 - 100,
      top: format.h / 2 - 100,
      radius: 100,
      fill: "#7eb8f7",
    });
    tag(c);
    canvas.add(c);
    canvas.setActiveObject(c);
    canvas.renderAll();
  };

  const addImage = async (src: string) => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const img = await fabric.FabricImage.fromURL(src, {
      crossOrigin: "anonymous",
    });
    const max = format.w * 0.6;
    const s = Math.min(max / (img.width ?? max), max / (img.height ?? max), 1);
    img.scale(s);
    img.set({ left: format.w / 2 - (img.getScaledWidth() / 2), top: format.h / 2 - (img.getScaledHeight() / 2) });
    tag(img);
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
    setShowGallery(false);
  };

  const deleteSel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getActiveObjects().forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.renderAll();
    setSel(null);
  };

  // Renders the canvas at full format resolution (undoing the display zoom).
  const renderPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL({ format: "png", multiplier: 1 / scale });
  };

  const exportPng = () => {
    const url = renderPng();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `lienzo-${format.id}.png`;
    a.click();
    flash("PNG descargado ✓");
  };

  const shareAsana = async () => {
    if (busy) return;
    const url = renderPng();
    if (!url) return;
    const base64 = url.split(",")[1];
    setBusy(true);
    try {
      const res = await fetch("/api/asana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: `Lienzo — ${format.label}`,
          notes: `Diseño exportado desde el Lienzo del Content Hub.\nFormato ${format.label} (${format.w}×${format.h}).`,
          fileName: `lienzo-${format.id}.png`,
          fileBase64: base64,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash("Asana: " + (data.error ?? "falló la petición"));
        return;
      }
      flash(data.message ?? "Tarea creada en Asana ✓");
    } catch {
      flash("No pude conectar con Asana.");
    } finally {
      setBusy(false);
    }
  };

  // Serialize the canvas into a compact state the assistant can reason about.
  const getCanvasState = () => {
    const canvas = canvasRef.current;
    const objects = (canvas?.getObjects() ?? []).map((o) => {
      const r = o as unknown as {
        id?: string;
        type?: string;
        text?: string;
        fill?: string;
        fontSize?: number;
        left?: number;
        top?: number;
      };
      return {
        id: r.id ?? "",
        type: r.type ?? "object",
        text: r.text,
        fill: typeof r.fill === "string" ? r.fill : undefined,
        fontSize: r.fontSize,
        left: r.left != null ? Math.round(r.left) : undefined,
        top: r.top != null ? Math.round(r.top) : undefined,
      };
    });
    return { format: format.label, w: format.w, h: format.h, bg, objects };
  };

  type Op = {
    action: "update_object" | "add_text" | "delete_object" | "set_background";
    id?: string;
    text?: string;
    fill?: string;
    fontSize?: number;
    left?: number;
    top?: number;
    color?: string;
  };

  const applyOperations = async (ops: Op[]) => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const byId = (id?: string) =>
      canvas.getObjects().find((o) => (o as unknown as { id?: string }).id === id);

    for (const op of ops) {
      if (op.action === "set_background" && op.color) {
        setBg(op.color);
      } else if (op.action === "delete_object") {
        const obj = byId(op.id);
        if (obj) canvas.remove(obj);
      } else if (op.action === "update_object") {
        const obj = byId(op.id);
        if (!obj) continue;
        const props: Record<string, unknown> = {};
        if (op.text != null) props.text = op.text;
        if (op.fill != null) props.fill = op.fill;
        if (op.fontSize != null) props.fontSize = op.fontSize;
        if (op.left != null) props.left = op.left;
        if (op.top != null) props.top = op.top;
        obj.set(props);
      } else if (op.action === "add_text") {
        const t = new fabric.Textbox(op.text ?? "Texto", {
          left: op.left ?? format.w / 2 - 200,
          top: op.top ?? format.h / 2 - 40,
          width: 400,
          fontSize: op.fontSize ?? 64,
          fill: op.fill ?? "#ffffff",
          fontFamily: "Barlow, sans-serif",
          textAlign: "center",
        });
        tag(t);
        canvas.add(t);
      }
    }
    canvas.renderAll();
  };

  const sendChat = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    const history = [...chat, { role: "user" as const, text }];
    setChat(history);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(1),
          canvas: getCanvasState(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChat((c) => [...c, { role: "assistant", text: data.error ?? "Error del asistente." }]);
        return;
      }
      if (Array.isArray(data.operations) && data.operations.length) {
        await applyOperations(data.operations as Op[]);
      }
      setChat((c) => [...c, { role: "assistant", text: data.reply ?? "…" }]);
    } catch {
      setChat((c) => [...c, { role: "assistant", text: "No pude conectar con el asistente." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col text-[#ededed]">
      {/* Header */}
      <header className="glass flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-unbounded text-lg font-extrabold uppercase tracking-tight">
            WindMar <span className="text-[#ffc145] underline decoration-2 underline-offset-4">Lienzo</span>
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
            Espacio de diseño
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/carruseles?c=water"
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <LayoutGrid size={16} /> Carrusel
          </Link>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Toolbar */}
        <aside className="glass flex w-16 flex-col items-center gap-2 border-r border-white/10 py-4">
          <ToolBtn label="Texto" onClick={addText}>
            <Type size={20} />
          </ToolBtn>
          <ToolBtn label="Rectángulo" onClick={addRect}>
            <Square size={20} />
          </ToolBtn>
          <ToolBtn label="Círculo" onClick={addCircle}>
            <Circle size={20} />
          </ToolBtn>
          <ToolBtn
            label="Imagen"
            onClick={() => {
              loadAssets();
              setShowGallery((s) => !s);
            }}
          >
            <ImageIcon size={20} />
          </ToolBtn>
          <div className="my-1 h-px w-8 bg-white/10" />
          <ToolBtn label="Borrar" onClick={deleteSel}>
            <Trash2 size={20} />
          </ToolBtn>
          <ToolBtn label="Exportar PNG" onClick={exportPng}>
            <Download size={20} />
          </ToolBtn>
          <ToolBtn label="Enviar a Asana" onClick={shareAsana}>
            <Share2 size={20} />
          </ToolBtn>
        </aside>

        {/* Canvas stage */}
        <main className="stage-bg relative flex min-w-0 flex-1 flex-col items-center justify-center gap-4 overflow-auto p-6">
          {/* Format + bg controls */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={format.id}
              onChange={(e) =>
                setFormat(FORMATS.find((f) => f.id === e.target.value) ?? FORMATS[0])
              }
              className="rounded-lg border border-white/10 bg-[#121a2e] px-3 py-2 text-sm"
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} · {f.w}×{f.h}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-white/60">
              Fondo
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
              />
            </label>
          </div>

          {/* Selected-object properties */}
          {sel && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-[#121a2e] px-3 py-2 text-sm text-white/70">
              <span className="text-xs uppercase tracking-wide text-white/40">
                {sel.type === "textbox" ? "Texto" : sel.type === "rect" ? "Rectángulo" : sel.type === "circle" ? "Círculo" : "Imagen"}
              </span>
              {sel.type !== "image" && (
                <label className="flex items-center gap-2">
                  Color
                  <input
                    type="color"
                    value={sel.fill}
                    onChange={(e) => updateActive({ fill: e.target.value })}
                  />
                </label>
              )}
              {sel.type === "textbox" && (
                <label className="flex items-center gap-2">
                  Tamaño
                  <input
                    type="range"
                    min={16}
                    max={200}
                    value={sel.fontSize}
                    onChange={(e) => updateActive({ fontSize: Number(e.target.value) })}
                    className="w-28"
                  />
                  <span className="w-8 text-right text-xs">{sel.fontSize}</span>
                </label>
              )}
              <button
                onClick={deleteSel}
                className="ml-1 flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-300 hover:bg-red-500/25"
              >
                <Trash2 size={14} /> Borrar
              </button>
            </div>
          )}

          <div className="rounded-lg shadow-2xl ring-1 ring-white/10">
            <canvas ref={elRef} />
          </div>

          {toast && (
            <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-white/10 bg-[#121a2e] px-4 py-2 text-sm text-white shadow-2xl">
              {toast}
            </div>
          )}

          {/* Asset gallery popover */}
          {showGallery && (
            <div className="absolute left-6 top-6 z-20 max-h-[70vh] w-64 overflow-auto rounded-xl border border-white/10 bg-[#121a2e] p-3 shadow-2xl">
              <div className="mb-2 text-xs uppercase tracking-wide text-white/50">
                Tu galería
              </div>
              {assets.length === 0 ? (
                <p className="text-sm text-white/40">No hay imágenes aún.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {assets.map((a) => (
                    <button
                      key={a.src}
                      onClick={() => addImage(a.src)}
                      className="overflow-hidden rounded-lg border border-white/10 hover:border-[#7eb8f7]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.src} alt={a.name} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* AI chat sidebar */}
        <aside className="glass flex w-80 flex-col border-l border-white/10">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Sparkles size={18} className="text-[#7eb8f7]" />
            <span className="font-display tracking-wide">Asistente IA</span>
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            {chat.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] whitespace-pre-line border-2 px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto border-black bg-[#1098f7] text-white"
                    : "border-white/20 bg-white/5 text-white/80"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="max-w-[90%] rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/50">
                Pensando…
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t-2 border-white/20 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Pide una revisión o un cambio…"
              className="min-w-0 flex-1 border-2 border-white/20 bg-[#121212] px-3 py-2 text-sm outline-none focus:border-white"
            />
            <button
              onClick={sendChat}
              disabled={busy}
              className="border-2 border-black p-2 text-black transition hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-40"
              style={{ background: "#ffc145" }}
            >
              <Send size={18} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
