"use client";

import { useState } from "react";
import Link from "next/link";
import { CAROUSEL_PRODUCTS } from "@/data/carousel";
import {
  Circle,
  Palette,
  Type,
  Link2,
  Download,
  Upload,
  Layers,
  MessageSquareText,
  Plus,
  X,
  LayoutGrid,
  Box,
  Check,
  Copy,
  Eye,
  GripVertical,
  PenTool,
  Wand2,
  Frame,
  ExternalLink,
} from "lucide-react";

const ACCENT = "#ffc145"; // Sunflower Gold
const ACCENT2 = "#1098f7"; // Dodger Blue

type Category = "Brand Identity" | "UI/UX Motion" | "3D Art";

interface Project {
  id: string;
  title: string;
  category: Category;
  span: string; // bento grid span classes
  cover: string; // gradient
  palette: string[];
  fonts: string[];
  figma: string;
}

const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Helios Rebrand",
    category: "Brand Identity",
    span: "md:col-span-2 md:row-span-2",
    cover: "linear-gradient(135deg,#7000FF,#00FF66)",
    palette: ["#7000FF", "#00FF66", "#0a0a0f", "#f5f5f7"],
    fonts: ["Clash Display", "Inter"],
    figma: "figma.com/file/helios-rebrand",
  },
  {
    id: "p2",
    title: "Pulse Motion Kit",
    category: "UI/UX Motion",
    span: "md:col-span-1 md:row-span-1",
    cover: "linear-gradient(135deg,#00FF66,#0a0a0f)",
    palette: ["#00FF66", "#0a0a0f", "#1a1a24"],
    fonts: ["Satoshi", "JetBrains Mono"],
    figma: "figma.com/file/pulse-motion",
  },
  {
    id: "p3",
    title: "Voxel City",
    category: "3D Art",
    span: "md:col-span-1 md:row-span-2",
    cover: "linear-gradient(160deg,#7000FF,#1a1a24)",
    palette: ["#7000FF", "#b388ff", "#1a1a24"],
    fonts: ["Space Grotesk"],
    figma: "figma.com/file/voxel-city",
  },
  {
    id: "p4",
    title: "Orbit Dashboard",
    category: "UI/UX Motion",
    span: "md:col-span-2 md:row-span-1",
    cover: "linear-gradient(135deg,#0a0a0f,#00FF66)",
    palette: ["#00FF66", "#0a0a0f", "#2a2a38", "#f5f5f7"],
    fonts: ["Inter", "IBM Plex Mono"],
    figma: "figma.com/file/orbit-dash",
  },
  {
    id: "p5",
    title: "Mythos Identity",
    category: "Brand Identity",
    span: "md:col-span-1 md:row-span-1",
    cover: "linear-gradient(135deg,#b388ff,#7000FF)",
    palette: ["#7000FF", "#b388ff", "#fefefe"],
    fonts: ["Canela", "Inter"],
    figma: "figma.com/file/mythos",
  },
];

const FILTERS: ("All" | Category)[] = [
  "All",
  "Brand Identity",
  "UI/UX Motion",
  "3D Art",
];

const TOKENS = [
  { name: "--color-accent", value: "#00FF66", kind: "color" },
  { name: "--color-violet", value: "#7000FF", kind: "color" },
  { name: "--color-surface", value: "#12121a", kind: "color" },
  { name: "--space-md", value: "16px", kind: "space" },
  { name: "--space-lg", value: "24px", kind: "space" },
  { name: "--radius-xl", value: "20px", kind: "space" },
];

const ASSETS = [
  { id: "a1", name: "Logo Mark.svg", type: "Icon", grad: "linear-gradient(135deg,#00FF66,#7000FF)" },
  { id: "a2", name: "Brand Grid.png", type: "Layout", grad: "linear-gradient(135deg,#7000FF,#12121a)" },
  { id: "a3", name: "Grain Texture.png", type: "Texture", grad: "linear-gradient(135deg,#2a2a38,#00FF66)" },
  { id: "a4", name: "Nav System.svg", type: "Layout", grad: "linear-gradient(135deg,#00FF66,#0a0a0f)" },
  { id: "a5", name: "Glyph Set.svg", type: "Icon", grad: "linear-gradient(135deg,#b388ff,#7000FF)" },
  { id: "a6", name: "Noise Field.png", type: "Texture", grad: "linear-gradient(135deg,#12121a,#7000FF)" },
];

interface Pin {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface Tool {
  id: string;
  name: string;
  tagline: string;
  url: string;
  grad: string;
  Icon: typeof Frame;
  actions: { label: string; href: string }[];
}

const TOOLS: Tool[] = [
  {
    id: "figma",
    name: "Figma",
    tagline: "UI/UX · prototipos · dev handoff",
    url: "https://figma.com",
    grad: "linear-gradient(135deg,#FF7262,#A259FF)",
    Icon: Frame,
    actions: [
      { label: "Nuevo archivo", href: "https://figma.com/files" },
      { label: "Comunidad", href: "https://figma.com/community" },
    ],
  },
  {
    id: "adobe",
    name: "Adobe CC",
    tagline: "Photoshop · Illustrator · Express",
    url: "https://creativecloud.adobe.com",
    grad: "linear-gradient(135deg,#FF0000,#330000)",
    Icon: Wand2,
    actions: [
      { label: "Express", href: "https://express.adobe.com" },
      { label: "Photoshop web", href: "https://photoshop.adobe.com" },
    ],
  },
  {
    id: "affinity",
    name: "Affinity",
    tagline: "Designer · Photo · Publisher",
    url: "https://affinity.serif.com",
    grad: "linear-gradient(135deg,#1B72BE,#4DA8DA)",
    Icon: PenTool,
    actions: [
      { label: "Designer", href: "https://affinity.serif.com/designer" },
      { label: "Photo", href: "https://affinity.serif.com/photo" },
    ],
  },
  {
    id: "canva",
    name: "Canva",
    tagline: "Plantillas · social · rápido",
    url: "https://canva.com",
    grad: "linear-gradient(135deg,#00C4CC,#7D2AE8)",
    Icon: Palette,
    actions: [
      { label: "Crear diseño", href: "https://canva.com/create" },
      { label: "Plantillas", href: "https://canva.com/templates" },
    ],
  },
];

export default function DesignerHub() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [openProject, setOpenProject] = useState<Project | null>(null);

  const [handoffAsset, setHandoffAsset] = useState<string | null>(null);

  const [dragAsset, setDragAsset] = useState<string | null>(null);
  const [droppedAsset, setDroppedAsset] = useState<string | null>(null);

  const [pins, setPins] = useState<Pin[]>([]);
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [pinText, setPinText] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const shown = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  const addPin = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDraftPin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
    setPinText("");
  };

  const commitPin = () => {
    if (!draftPin || !pinText.trim()) {
      setDraftPin(null);
      return;
    }
    setPins((p) => [...p, { id: Date.now(), x: draftPin.x, y: draftPin.y, text: pinText.trim() }]);
    setDraftPin(null);
    setPinText("");
  };

  return (
    <div className="font-ui min-h-screen bg-[var(--wm-bg)] text-white antialiased">
      <main className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--wm-surface)] px-6 py-12 sm:px-10 sm:py-16">
          {/* solar background image */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/img/studio-hero.webp')" }}
          />
          {/* readability overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--wm-bg)] via-[var(--wm-bg)]/85 to-[var(--wm-bg)]/40" />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
            style={{ background: `radial-gradient(circle,${ACCENT},transparent 70%)` }}
          />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
              <Circle size={8} fill={ACCENT} stroke="none" /> Creamos contenido que convierte
            </span>
            <h1 className="wm-headline mt-6 text-5xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-7xl">
              Creative
              <br />
              <span style={{ color: ACCENT }}>Studio</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/55 sm:text-lg">
              Diseña, edita y publica los carruseles de cada producto WindMar — Home, Water,
              Solar, Batería y Roofing — desde un solo lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/carruseles?c=water" className="wm-pill">
                <PenTool size={16} /> Editar carruseles
              </Link>
              <Link href="/lienzo" className="wm-pill wm-pill-ghost">
                <Layers size={16} /> Abrir Lienzo
              </Link>
            </div>
          </div>

          <div className="relative mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { n: "4", l: "Productos" },
              { n: "6", l: "Slides / carrusel" },
              { n: "100%", l: "Editable" },
              { n: "1080²", l: "Export Instagram" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-unbounded text-3xl font-extrabold sm:text-4xl" style={{ color: ACCENT }}>
                  {s.n}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/45">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLATAFORMA (lanzador: todo en un solo lugar) ── */}
        <section>
          <div className="mb-6">
            <h2 className="wm-headline flex items-center gap-2 text-2xl">
              <LayoutGrid size={22} style={{ color: ACCENT }} /> Plataforma
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Todas tus herramientas WindMar en un solo lugar · clic para abrir.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/windmar_content_hub.html", name: "Content Hub", desc: "Dashboard, calendarios y planning", grad: "linear-gradient(135deg,#18314f,#1098f7)", ext: true },
              { href: "/carruseles?c=home", name: "Editor de Carruseles", desc: "Home · Water · Solar · Batería · Roofing", grad: "linear-gradient(135deg,#1a52c7,#7eb8f7)", ext: false },
              { href: "/lienzo", name: "Lienzo", desc: "Espacio de diseño libre + IA", grad: "linear-gradient(135deg,#7000FF,#b388ff)", ext: false },
              { href: "/produccion.html", name: "Producción", desc: "Plan de contenido semanal", grad: "linear-gradient(135deg,#f57c0a,#ffc14d)", ext: true },
              { href: "/Windmar_Guiones_Portal.html", name: "Guiones Portal", desc: "Guiones y scripts de video", grad: "linear-gradient(135deg,#0a7d4d,#4ade80)", ext: true },
              { href: "/windmar-social-hub.html", name: "Social Hub", desc: "Enlaces y recursos sociales", grad: "linear-gradient(135deg,#334155,#94a3b8)", ext: true },
            ].map((t) => {
              const inner = (
                <>
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl transition group-hover:opacity-45" style={{ background: t.grad }} />
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: t.grad }}>
                      <LayoutGrid size={20} />
                    </div>
                    <ExternalLink size={16} className="text-white/30 transition group-hover:text-white" />
                  </div>
                  <div className="mt-4">
                    <div className="font-unbounded font-bold uppercase tracking-tight">{t.name}</div>
                    <div className="mt-1 text-[12px] text-white/45">{t.desc}</div>
                  </div>
                </>
              );
              const cls = "group relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--wm-surface)] p-5 transition hover:scale-[1.01] hover:border-white/30";
              return t.ext ? (
                <a key={t.name} href={t.href} className={cls}>{inner}</a>
              ) : (
                <Link key={t.name} href={t.href} className={cls}>{inner}</Link>
              );
            })}
          </div>
        </section>

        {/* ── WINDMAR CAROUSELS (edita cada producto en el studio) ── */}
        <section>
          <div className="mb-6">
            <h2 className="wm-headline flex items-center gap-2 text-2xl">
              <LayoutGrid size={22} style={{ color: ACCENT }} /> Carruseles WindMar
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Cada producto tiene su propia área editable · clic para abrirlo en el studio.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAROUSEL_PRODUCTS.map((c) => (
              <Link
                key={c.id}
                href={`/carruseles?c=${c.id}`}
                className="group relative h-40 overflow-hidden rounded-3xl border border-white/10 transition hover:scale-[1.02] hover:border-white/30"
                style={{ background: c.grad }}
              >
                <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/10" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="w-fit rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                    {c.brand}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold drop-shadow">{c.label}</h3>
                    <span className="flex items-center gap-1 text-xs text-white/80 opacity-0 transition group-hover:opacity-100">
                      <PenTool size={12} /> Editar carrusel
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── UNIFIED TOOLBOX (Figma · Adobe · Affinity · Canva) ── */}
        <section>
          <div className="mb-6">
            <h2 className="wm-headline flex items-center gap-2 text-2xl">
              <ExternalLink size={22} style={{ color: ACCENT }} /> Toolbox
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Todas tus herramientas de diseño en un solo lugar · clic para abrir.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t) => (
              <div
                key={t.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--wm-surface)] p-5 transition hover:border-white/30"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
                  style={{ background: t.grad }}
                />
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                    style={{ background: t.grad }}
                  >
                    <t.Icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold leading-tight">{t.name}</div>
                    <div className="text-[11px] text-white/40">{t.tagline}</div>
                  </div>
                </div>

                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm font-semibold transition hover:border-white/30"
                  style={{ color: ACCENT }}
                >
                  Abrir {t.name} <ExternalLink size={14} />
                </a>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.actions.map((a) => (
                    <a
                      key={a.label}
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      {a.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERACTIVE BENTO PORTFOLIO ── */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="wm-headline flex items-center gap-2 text-2xl">
                <LayoutGrid size={22} style={{ color: ACCENT }} /> Bento Portfolio
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Filtra por categoría · clic en un proyecto para inspeccionarlo
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="rounded-full border px-4 py-1.5 text-xs font-semibold transition"
                  style={{
                    borderColor: filter === f ? ACCENT : "#ffffff14",
                    background: filter === f ? `${ACCENT}1a` : "transparent",
                    color: filter === f ? ACCENT : "#ffffff88",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid auto-rows-[150px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenProject(p)}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 text-left transition duration-300 hover:scale-[1.02] hover:border-white/30 ${p.span}`}
                style={{ background: p.cover }}
              >
                <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/10" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="w-fit rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                    {p.category}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold drop-shadow">{p.title}</h3>
                    <span className="flex items-center gap-1 text-xs text-white/70 opacity-0 transition group-hover:opacity-100">
                      <Eye size={12} /> Inspeccionar
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── UI/UX COLLABORATION ZONE (HANDOFF) ── */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[var(--wm-surface)] p-6">
            <h2 className="wm-headline flex items-center gap-2 text-xl">
              <Layers size={20} style={{ color: ACCENT2 }} /> Handoff Inspector
            </h2>
            <p className="mt-1 text-sm text-white/40">
              El diseñador sube un asset; UI/UX lee los tokens.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {ASSETS.slice(0, 3).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setHandoffAsset(a.name)}
                  className="rounded-xl border p-0.5 transition hover:scale-105"
                  style={{ borderColor: handoffAsset === a.name ? ACCENT : "#ffffff14" }}
                >
                  <div className="h-16 w-full rounded-lg" style={{ background: a.grad }} />
                  <div className="truncate px-1 py-1 text-[10px] text-white/60">{a.name}</div>
                </button>
              ))}
            </div>

            {!handoffAsset ? (
              <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 py-8 text-white/40">
                <Upload size={22} />
                <span className="text-sm">Selecciona un asset para inspeccionar</span>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{handoffAsset}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => flash("SVG exportado ✓")}
                      className="rounded-lg bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
                    >
                      SVG
                    </button>
                    <button
                      onClick={() => flash("PNG exportado ✓")}
                      className="rounded-lg px-3 py-1 text-xs font-semibold text-black"
                      style={{ background: ACCENT }}
                    >
                      PNG
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {TOKENS.map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs"
                    >
                      <span className="font-mono text-white/60">{t.name}</span>
                      <span className="flex items-center gap-2 font-mono">
                        {t.kind === "color" && (
                          <span
                            className="h-3 w-3 rounded-full ring-1 ring-white/20"
                            style={{ background: t.value }}
                          />
                        )}
                        {t.value}
                        <button onClick={() => flash(`Copiado ${t.value}`)}>
                          <Copy size={12} className="text-white/40 hover:text-white" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── LIVE ASSET MANAGER ── */}
          <div className="rounded-3xl border border-white/10 bg-[var(--wm-surface)] p-6">
            <h2 className="wm-headline flex items-center gap-2 text-xl">
              <Box size={20} style={{ color: ACCENT }} /> Live Asset Manager
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Arrastra al lienzo o descarga al instante.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {ASSETS.map((a) => (
                <div
                  key={a.id}
                  draggable
                  onDragStart={() => setDragAsset(a.name)}
                  className="group relative cursor-grab overflow-hidden rounded-2xl border border-white/10 active:cursor-grabbing"
                >
                  <div className="h-20 w-full" style={{ background: a.grad }} />
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="flex items-center gap-1 truncate text-[10px] text-white/60">
                      <GripVertical size={11} /> {a.type}
                    </span>
                    <button
                      onClick={() => flash(`Descargando ${a.name}`)}
                      className="text-white/40 transition hover:text-[#00FF66]"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragAsset) {
                  setDroppedAsset(dragAsset);
                  flash(`${dragAsset} colocado en el lienzo`);
                  setDragAsset(null);
                }
              }}
              className="mt-4 flex h-24 items-center justify-center rounded-2xl border-2 border-dashed text-sm transition"
              style={{ borderColor: dragAsset ? ACCENT : "#ffffff1a", color: dragAsset ? ACCENT : "#ffffff55" }}
            >
              {droppedAsset ? (
                <span className="flex items-center gap-2 text-white/80">
                  <Check size={16} style={{ color: ACCENT }} /> {droppedAsset}
                </span>
              ) : (
                "Suelta un asset aquí"
              )}
            </div>
          </div>
        </section>

        {/* ── DESIGN FEEDBACK TERMINAL ── */}
        <section>
          <h2 className="wm-headline mb-1 flex items-center gap-2 text-2xl">
            <MessageSquareText size={22} style={{ color: ACCENT2 }} /> Feedback Terminal
          </h2>
          <p className="mb-5 text-sm text-white/40">
            Haz clic en el lienzo para dejar un punto de feedback estilo Figma.
          </p>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div
              onClick={addPin}
              className="relative h-[360px] cursor-crosshair overflow-hidden rounded-3xl border border-white/10"
              style={{ background: "radial-gradient(circle at 30% 20%,#7000FF22,transparent 50%), #0e0e16" }}
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Palette size={64} className="text-white/5" />
              </div>

              {pins.map((p, i) => (
                <div
                  key={p.id}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full rounded-bl-none text-xs font-bold text-black shadow-lg"
                    style={{ background: ACCENT }}
                  >
                    {i + 1}
                  </div>
                  <div className="pointer-events-none absolute left-8 top-0 hidden w-40 rounded-lg bg-black/90 px-3 py-2 text-xs shadow-xl group-hover:block">
                    {p.text}
                  </div>
                </div>
              ))}

              {draftPin && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="mb-2 flex h-7 w-7 items-center justify-center rounded-full rounded-bl-none text-black shadow-lg"
                    style={{ background: ACCENT2 }}
                  >
                    <Plus size={14} />
                  </div>
                  <div className="w-52 rounded-xl border border-white/10 bg-[var(--wm-surface-2)] p-2 shadow-2xl">
                    <input
                      autoFocus
                      value={pinText}
                      onChange={(e) => setPinText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && commitPin()}
                      placeholder="Escribe feedback…"
                      className="w-full rounded-lg bg-black/40 px-2 py-1.5 text-xs outline-none placeholder:text-white/30"
                    />
                    <div className="mt-2 flex justify-end gap-1.5">
                      <button
                        onClick={() => setDraftPin(null)}
                        className="rounded-md px-2 py-1 text-xs text-white/50 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={commitPin}
                        className="rounded-md px-3 py-1 text-xs font-semibold text-black"
                        style={{ background: ACCENT }}
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[var(--wm-surface)] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Comentarios ({pins.length})</span>
                {pins.length > 0 && (
                  <button
                    onClick={() => setPins([])}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {pins.length === 0 && (
                  <p className="text-sm text-white/30">Aún no hay feedback.</p>
                )}
                {pins.map((p, i) => (
                  <div key={p.id} className="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-sm">
                    <span
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black"
                      style={{ background: ACCENT }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-white/80">{p.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── PROJECT MODAL ── */}
      {openProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpenProject(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[var(--wm-surface)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-44" style={{ background: openProject.cover }}>
              <button
                onClick={() => setOpenProject(null)}
                className="absolute right-4 top-4 rounded-full bg-black/40 p-2 backdrop-blur transition hover:bg-black/60"
              >
                <X size={16} />
              </button>
              <span className="absolute bottom-4 left-5 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                {openProject.category}
              </span>
            </div>
            <div className="space-y-5 p-6">
              <h3 className="text-2xl font-bold">{openProject.title}</h3>

              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Palette size={14} /> Paleta
                </div>
                <div className="flex gap-2">
                  {openProject.palette.map((c) => (
                    <div key={c} className="flex-1">
                      <div
                        className="h-12 rounded-xl ring-1 ring-white/10"
                        style={{ background: c }}
                      />
                      <div className="mt-1 text-center font-mono text-[10px] text-white/40">{c}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Type size={14} /> Tipografías
                </div>
                <div className="flex flex-wrap gap-2">
                  {openProject.fonts.map((f) => (
                    <span key={f} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={`https://${openProject.figma}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  flash("Figma link copiado (simulado)");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-black transition hover:opacity-90"
                style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT2})` }}
              >
                <Link2 size={16} /> Abrir en Figma
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-[var(--wm-surface-2)] px-5 py-2.5 text-sm shadow-2xl">
          <span className="flex items-center gap-2">
            <Check size={15} style={{ color: ACCENT }} /> {toast}
          </span>
        </div>
      )}
    </div>
  );
}
