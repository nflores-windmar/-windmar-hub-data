"use client";

import { Slide, ImageState, BrandColors, BrandFonts, defaultFonts } from "@/data/carousel";

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

interface Props {
  slide: Slide;
  colors: BrandColors;
  fonts?: BrandFonts;
  brand?: string;
  theme?: "blueprint" | "grid" | "signature";
  editing: boolean;
  onEdit: (field: keyof Slide, value: string) => void;
  showBadge?: boolean;
  // Canvas size override. Defaults to the 4:5 carousel; Story docs pass 9:16.
  size?: { w: number; h: number };
}

// Split a brand like "WindMar Water" into a leading word + accent tail so the
// header can color the product name (e.g. WindMar **Water**).
function brandParts(brand: string): { lead: string; tail: string } {
  const parts = brand.trim().split(/\s+/);
  if (parts.length < 2) return { lead: brand, tail: "" };
  return { lead: parts[0], tail: parts.slice(1).join(" ") };
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Color values we accept inside a span (hex, rgb/rgba, named) — anything else is
// dropped so a committed span can't break out of the style attribute.
function safeColor(c: string): string | null {
  const v = c.trim();
  return /^(#[0-9a-fA-F]{3,8}|rgb\(\s*[\d.\s,]+\)|rgba\(\s*[\d.\s,%]+\)|[a-zA-Z]+)$/.test(v) ? v : null;
}

// Keep only colored <span>/<font> runs and newlines from contentEditable HTML;
// everything else becomes escaped text. Runs at commit time (client) so render
// can trust the stored value.
function sanitizeRichHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const root = document.createElement("div");
  root.innerHTML = html;
  const render = (node: Node): string => {
    let out = "";
    node.childNodes.forEach((c) => {
      if (c.nodeType === 3) {
        out += escHtml(c.textContent ?? "");
      } else if (c.nodeType === 1) {
        const el = c as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const inner = render(el);
        if (tag === "br") out += "\n";
        else if (tag === "div" || tag === "p") out += (out && !out.endsWith("\n") ? "\n" : "") + inner;
        else if (tag === "span" || tag === "font") {
          const raw = el.style.color || el.getAttribute("color") || "";
          const color = safeColor(raw);
          out += color ? `<span style="color:${color}">${inner}</span>` : inner;
        } else out += inner;
      }
    });
    return out;
  };
  return render(root).replace(/\n{3,}/g, "\n\n");
}

function Editable({
  value,
  editing,
  onCommit,
  className,
  style,
}: {
  value: string;
  editing: boolean;
  onCommit: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        whiteSpace: "pre-line",
        outline: editing ? "2px dashed rgba(126,184,247,0.6)" : "none",
        borderRadius: editing ? 4 : 0,
      }}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={(e) => onCommit(sanitizeRichHtml(e.currentTarget.innerHTML))}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

function BrandBadge({ colors, brand }: { colors: BrandColors; brand: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        right: 32,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(4px)",
        borderRadius: 46,
        padding: "8px 18px",
      }}
    >
      <svg width={42} height={42} viewBox="0 0 100 130" fill="none">
        <path
          d="M50 5 C50 5 10 55 10 80 C10 103 28 120 50 120 C72 120 90 103 90 80 C90 55 50 5 50 5Z"
          stroke={colors.headerBg}
          strokeWidth={5}
          fill="white"
        />
        <path
          d="M30 95 Q40 75 55 88 Q65 98 75 85"
          stroke={colors.accent}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-display"
        style={{ color: "#fff", fontSize: 26, letterSpacing: 1 }}
      >
        {brand}
      </span>
    </div>
  );
}

// Free positioning: posX/posY are 0–100 (50 = centered) and translate the image
// across the frame, so it can be dragged/placed anywhere. Zoom (scale) fills any
// gap the move leaves at the edges. The base image fills with object-fit cover;
// overlay layers use contain so a logo shows whole, and sit above via z-index.
function imgStyleFor(img: ImageState, opts?: { z?: number; fit?: "cover" | "contain" }): React.CSSProperties {
  const tx = img.posX - 50;
  const ty = img.posY - 50;
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: opts?.fit ?? "cover",
    transform: `translate(${tx}%, ${ty}%) scale(${img.scale})`,
    opacity: img.opacity,
    zIndex: opts?.z,
  };
}

function imgStyle(slide: Slide): React.CSSProperties {
  return imgStyleFor(slide.image!);
}

function Overlays({ slide }: { slide: Slide }) {
  if (!slide.overlays?.length) return null;
  return (
    <>
      {slide.overlays.map((ov, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={ov.src} alt="" style={imgStyleFor(ov, { z: 5, fit: "contain" })} />
      ))}
    </>
  );
}

// Blueprint theme: a bright architectural-sketch background — deep-blue canvas
// with a soft top glow, a two-level engineering grid, drafting corner marks, a
// compass arc, and an orange "energy flow" path with nodes. Tuned to read as a
// dynamic technical blueprint (matching WindMar's clean, confident brand feel)
// while staying legible behind slide text.
function BlueprintBg({ w = 1080, h = 1350, orange = "#f89b24" }: { w?: number; h?: number; orange?: string }) {
  const white = "#dcebff";
  const cx = w * 0.82;
  const cy = h * 0.16;
  const R = w * 0.42;
  // Stepping "energy flow" path — nodes at grid crossings, one orange accent run.
  const y0 = h * 0.5;
  const flow = `M ${w * 0.06} ${y0} H ${w * 0.28} V ${y0 - h * 0.09} H ${w * 0.52} V ${y0 + h * 0.06} H ${w * 0.74} V ${y0 - h * 0.04} H ${w * 0.98}`;
  const nodes = [
    [w * 0.28, y0],
    [w * 0.28, y0 - h * 0.09],
    [w * 0.52, y0 - h * 0.09],
    [w * 0.52, y0 + h * 0.06],
    [w * 0.74, y0 + h * 0.06],
    [w * 0.74, y0 - h * 0.04],
  ];
  const t = 34; // corner tick length
  const m = 40; // corner margin
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bpBg" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#2f63c4" />
            <stop offset="0.55" stopColor="#245aad" />
            <stop offset="1" stopColor="#1c4491" />
          </linearGradient>
          <radialGradient id="bpGlow" cx="0.72" cy="0.12" r="0.9">
            <stop offset="0" stopColor="#5b93e8" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#5b93e8" stopOpacity="0" />
          </radialGradient>
          <pattern id="bpGridMinor" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke={white} strokeOpacity="0.12" strokeWidth="1" />
          </pattern>
          <pattern id="bpGrid" width="135" height="135" patternUnits="userSpaceOnUse">
            <rect width="135" height="135" fill="url(#bpGridMinor)" />
            <path d="M135 0H0V135" fill="none" stroke={white} strokeOpacity="0.32" strokeWidth="1.3" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#bpBg)" />
        <rect width={w} height={h} fill="url(#bpGrid)" />
        <rect width={w} height={h} fill="url(#bpGlow)" />

        {/* compass arc / technical ring, top-right */}
        <g fill="none" stroke={white} strokeOpacity="0.16">
          <circle cx={cx} cy={cy} r={R} strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r={R * 0.66} strokeWidth="1.2" strokeDasharray="2 14" />
          <circle cx={cx} cy={cy} r={R * 0.36} strokeWidth="1.2" />
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} strokeWidth="1" strokeOpacity="0.1" />
          <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} strokeWidth="1" strokeOpacity="0.1" />
        </g>

        {/* drafting corner marks */}
        <g stroke={white} strokeOpacity="0.5" strokeWidth="2.5" fill="none">
          <path d={`M${m} ${m + t} V${m} H${m + t}`} />
          <path d={`M${w - m - t} ${m} H${w - m} V${m + t}`} />
          <path d={`M${m} ${h - m - t} V${h - m} H${m + t}`} />
          <path d={`M${w - m - t} ${h - m} H${w - m} V${h - m - t}`} />
        </g>

        {/* orange energy-flow path with nodes — the dynamic accent */}
        <path d={flow} fill="none" stroke={orange} strokeOpacity="0.55" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 12" />
        {nodes.map(([nx, ny], i) => (
          <circle key={i} cx={nx} cy={ny} r="7" fill="#1c4491" stroke={orange} strokeOpacity="0.8" strokeWidth="3" />
        ))}
      </svg>
    </div>
  );
}

// Light "architectural sketch" grid: faint blue lines on white. Keeps the
// bright blueprint-on-white look (blue text stays legible) instead of the dark
// blue field of the full "blueprint" theme. Sits behind slide content.
function LightGridBg({ accent = "#0b38a8", w = 1080, h = 1350 }: { accent?: string; w?: number; h?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bpGridLightMinor" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke={accent} strokeOpacity="0.13" strokeWidth="1" />
          </pattern>
          <pattern id="bpGridLight" width="135" height="135" patternUnits="userSpaceOnUse">
            <rect width="135" height="135" fill="url(#bpGridLightMinor)" />
            <path d="M135 0H0V135" fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="1.4" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="#ffffff" />
        <rect width={w} height={h} fill="url(#bpGridLight)" />
      </svg>
    </div>
  );
}

// Signature theme ("Blueprint Oscuro"): the dark, cinematic look from the style
// guide. A near-black canvas with a faint ink blueprint grid, a soft accent glow
// top-right, drafting registration corners in the product's neon accent, and a
// film-grain overlay. One neon accent per piece (passed in). Sits behind content.
// `frameOnly` keeps only the drafting registration corners + film grain (no
// solid canvas / grid / glow) so it can overlay a full-bleed photo and preserve
// the brand frame. `z` lets it sit above the photo layer (z=1) instead of the
// base background (z=0).
function SignatureBg({ w = 1080, h = 1350, accent = "#ffd24a", frameOnly = false, z = 0 }: { w?: number; h?: number; accent?: string; frameOnly?: boolean; z?: number }) {
  const ink = "#1a52c7";
  const t = 42; // corner tick length
  const m = 48; // corner margin
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: z, overflow: "hidden", pointerEvents: "none" }} aria-hidden>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="sigGridMinor" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke={ink} strokeOpacity="0.16" strokeWidth="1" />
          </pattern>
          <pattern id="sigGrid" width="135" height="135" patternUnits="userSpaceOnUse">
            <rect width="135" height="135" fill="url(#sigGridMinor)" />
            <path d="M135 0H0V135" fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1.2" />
          </pattern>
          <radialGradient id="sigGlow" cx="0.72" cy="0.12" r="0.9">
            <stop offset="0" stopColor={accent} stopOpacity="0.14" />
            <stop offset="0.6" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <filter id="sigGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        {!frameOnly && (
          <>
            <rect width={w} height={h} fill="#0a0e18" />
            <rect width={w} height={h} fill="url(#sigGrid)" />
            <rect width={w} height={h} fill="url(#sigGlow)" />
          </>
        )}
        {/* drafting registration corners in the neon accent */}
        <g stroke={accent} strokeOpacity="0.85" strokeWidth="3" fill="none">
          <path d={`M${m} ${m + t} V${m} H${m + t}`} />
          <path d={`M${w - m - t} ${m} H${w - m} V${m + t}`} />
          <path d={`M${m} ${h - m - t} V${h - m} H${m + t}`} />
          <path d={`M${w - m - t} ${h - m} H${w - m} V${h - m - t}`} />
        </g>
        {/* film grain */}
        <rect width={w} height={h} filter="url(#sigGrain)" opacity="0.07" style={{ mixBlendMode: "overlay" }} />
      </svg>
    </div>
  );
}

// Blueprint Oscuro photo treatment (style guide §06 "Tratamiento Oscuro"):
// cinematic B/W + a duotone tint toward the product accent, film grain, and —
// for the cover — the photo's top edge fades into the dark canvas so it reads as
// part of the blueprint instead of a raw rectangle. The desaturation itself is a
// CSS filter on the <img>; this paints the tint/grain/blend layers over it.
const SIG_PHOTO_FILTER = "grayscale(1) contrast(1.06) brightness(0.94)";
// `color`: keep the photo in its natural color (skip the B/W filter + duotone
// layers) — used when the image is meant to read as a full-color background,
// with only a legibility veil + light grain over it.
function SignaturePhotoFx({ accent, bleed = false, color = false }: { accent: string; bleed?: boolean; color?: boolean }) {
  return (
    <>
      {/* duotone: push shadows navy, tint toward the accent (skipped in color mode) */}
      {!color && (
        <>
          <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "#0a0e18", mixBlendMode: "color", opacity: 0.55 }} aria-hidden />
          <div style={{ position: "absolute", inset: 0, zIndex: 3, background: accent, mixBlendMode: "soft-light", opacity: 0.4 }} aria-hidden />
        </>
      )}
      {/* cover: blend the top seam into the canvas + darken the foot for text.
          In color mode the top is darkened harder so top-left headline text reads. */}
      {!bleed && (
        <div style={{ position: "absolute", inset: 0, zIndex: 4, background: color
          ? "linear-gradient(180deg,rgba(10,14,24,0.9) 0%,rgba(10,14,24,0.55) 26%,rgba(10,14,24,0.15) 52%,rgba(10,14,24,0.55) 78%,rgba(10,14,24,0.92) 100%)"
          : "linear-gradient(180deg,#0a0e18 0%,rgba(10,14,24,0) 24%,rgba(10,14,24,0) 60%,rgba(10,14,24,0.85) 100%)" }} aria-hidden />
      )}
      {/* film grain */}
      <svg style={{ position: "absolute", inset: 0, zIndex: 4, width: "100%", height: "100%", mixBlendMode: "overlay", opacity: 0.12 }} aria-hidden>
        <filter id="spGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#spGrain)" />
      </svg>
    </>
  );
}

// A placed photo dressed in the Blueprint Oscuro treatment: the B/W CSS filter
// on the <img>, then the duotone/grain/blend layers on top. Wrapped in a
// zIndex:0 stacking context so the FX layers (z3/z4) stay *inside* this box and
// never rise above the slide's veil (z1) or content (z2). Full-bleed by default.
function SigPhoto({ slide, accent, bleed = true, color = false }: { slide: Slide; accent: string; bleed?: boolean; color?: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={slide.image!.src} alt="" style={{ ...imgStyle(slide), filter: color ? undefined : SIG_PHOTO_FILTER }} />
      <SignaturePhotoFx accent={accent} bleed={bleed} color={color} />
    </div>
  );
}

// A small energy-bolt glyph for the chip icon box.
function ChipIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill={color} />
    </svg>
  );
}

// "Chip" button used as the kicker / tag in the Blueprint Oscuro look: a fully
// rounded pill with a faint accent fill + accent border, and a rounded-square
// icon holder on the left — echoing the reference button set. Text sits inside
// (its own accent color) so an editable label can live here.
function ChipShell({ accent, big, children }: { accent: string; big?: boolean; children: React.ReactNode }) {
  const s = big ? 1.5 : 1;
  const box = 40 * s;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12 * s,
        padding: `${7 * s}px ${22 * s}px ${7 * s}px ${7 * s}px`,
        borderRadius: 999,
        background: `${accent}1f`,
        border: `${1.5 * s}px solid ${accent}`,
        boxShadow: `0 ${6 * s}px ${22 * s}px ${accent}26`,
      }}
    >
      <span style={{ width: box, height: box, borderRadius: box * 0.3, background: `${accent}38`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <ChipIcon color={accent} size={22 * s} />
      </span>
      {children}
    </span>
  );
}

// Blueprint Oscuro diagrams & charts, straight from the style guide's visual
// language: thin structural lines in light ink, one accent "energy" highlight,
// mono labels. Rendered on the dark canvas so structure reads light and the
// accent is the thing to remember. Sized in slide coordinates and centered.
function SignatureArt({ kind, accent, value, caption }: { kind: NonNullable<Slide["art"]>; accent: string; value?: string; caption?: string }) {
  const struct = "#8fb0e6"; // light blueprint ink on dark
  const label = "#b9cdf2";
  const mono = "'Martian Mono', ui-monospace, monospace";
  const box: React.CSSProperties = { display: "block", maxWidth: "90%", height: "auto" };

  if (kind === "energy-flow") {
    return (
      <svg viewBox="0 0 260 150" width={660} style={box} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="saAr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6" fill={accent} />
          </marker>
        </defs>
        <g fill="none" stroke={struct} strokeWidth="2">
          <circle cx="30" cy="40" r="14" />
          <rect x="70" y="26" width="34" height="28" rx="3" />
          <rect x="130" y="26" width="30" height="28" rx="3" />
          <rect x="186" y="20" width="26" height="40" rx="3" />
          <rect x="40" y="96" width="40" height="34" rx="3" />
        </g>
        <g fill="none" stroke={accent} strokeWidth="2.2">
          <path d="M44 40 H70 M104 40 H130 M160 40 H186" markerEnd="url(#saAr)" />
          <path d="M199 60 V110 H60 V96" />
        </g>
        <g fontFamily={mono} fontSize="8" fill={label}>
          <text x="16" y="66">SOL</text>
          <text x="72" y="70">PANEL</text>
          <text x="124" y="70">INVERSOR</text>
          <text x="184" y="74">BATERÍA</text>
          <text x="44" y="142">CASA</text>
        </g>
      </svg>
    );
  }
  if (kind === "coverage-route") {
    const [a, b] = (caption ?? "SAN JUAN→MAYAGÜEZ").split("→");
    return (
      <svg viewBox="0 0 260 150" width={640} style={box} xmlns="http://www.w3.org/2000/svg">
        <path d="M30 120 C 80 90 60 60 110 70 C 150 78 150 40 200 50 C 225 55 230 40 235 30" fill="none" stroke={accent} strokeWidth="2.6" strokeDasharray="2 6" strokeLinecap="round" />
        <circle cx="30" cy="120" r="4.5" fill={struct} />
        <circle cx="235" cy="30" r="4.5" fill={accent} />
        <g fontFamily={mono} fontSize="8" fill={label}>
          <text x="18" y="138">{a}</text>
          <text x="188" y="26">{b}</text>
        </g>
      </svg>
    );
  }
  if (kind === "roof-scheme") {
    return (
      <svg viewBox="0 0 260 150" width={560} style={box} xmlns="http://www.w3.org/2000/svg">
        <path d="M40 110 L130 40 L220 110 Z" fill="none" stroke={struct} strokeWidth="1.8" />
        <path d="M60 96 L130 52 L200 96" fill="none" stroke={accent} strokeWidth="1.8" />
        <line x1="130" y1="40" x2="130" y2="14" stroke={accent} strokeWidth="1.8" />
        <circle cx="130" cy="10" r="6" fill={accent} />
        {caption && <text x="130" y="132" textAnchor="middle" fontFamily={mono} fontSize="8" fill={label}>{caption}</text>}
      </svg>
    );
  }
  if (kind === "roof-process") {
    // Three stages of the removal job, left→right, with accent arrows between:
    // 1) worn/peeling coat, 2) stripped clean base, 3) fresh accent seal. The
    // last stage lands on the accent — the result to remember.
    const caps = (caption ?? "GASTADO→LIMPIO→SELLADO").split("→");
    const Stage = ({ x, i }: { x: number; i: number }) => (
      <g>
        {/* roof gable */}
        <path d={`M${x} 74 L${x + 30} 44 L${x + 60} 74`} fill="none" stroke={struct} strokeWidth="2" />
        <line x1={x} y1={74} x2={x + 60} y2={74} stroke={struct} strokeWidth="2" />
        {/* the coat on the two roof faces */}
        {i === 0 && (
          <path d={`M${x + 3} 71 L${x + 30} 47.5 L${x + 57} 71`} fill="none" stroke={struct} strokeOpacity="0.5" strokeWidth="3" strokeDasharray="3 4" strokeLinecap="round" />
        )}
        {i === 2 && (
          <path d={`M${x + 3} 71 L${x + 30} 47.5 L${x + 57} 71`} fill="none" stroke={accent} strokeWidth="3.4" strokeLinecap="round" />
        )}
        <text x={x + 30} y={90} textAnchor="middle" fontFamily={mono} fontSize="7.5" fill={i === 2 ? accent : label}>{caps[i] ?? ""}</text>
      </g>
    );
    return (
      <svg viewBox="0 0 260 100" width={680} style={box} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="rpAr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6" fill={accent} />
          </marker>
        </defs>
        <Stage x={10} i={0} />
        <Stage x={100} i={1} />
        <Stage x={190} i={2} />
        <g fill="none" stroke={accent} strokeWidth="2.2">
          <path d="M74 58 H96" markerEnd="url(#rpAr)" />
          <path d="M164 58 H186" markerEnd="url(#rpAr)" />
        </g>
      </svg>
    );
  }
  if (kind === "bar-chart") {
    // A negative value (e.g. "-92%") reads as a drop: bills shrink toward the
    // accent bar. Otherwise bars climb, ending on the accent (the number to keep).
    const drop = !!value && value.trim().startsWith("-");
    const hs = drop ? [92, 68, 48, 20] : [40, 55, 70, 92];
    const xs = [20, 56, 92, 128];
    return (
      <svg viewBox="0 0 200 128" width={560} style={box} xmlns="http://www.w3.org/2000/svg">
        {xs.map((x, i) => (
          <rect key={i} x={x} y={110 - hs[i]} width="26" height={hs[i]} fill={i === 3 ? accent : struct} opacity={i === 3 ? 1 : 0.32} />
        ))}
        <line x1="14" y1="110" x2="180" y2="110" stroke={struct} strokeWidth="1" />
        {value && <text x="141" y={Math.max(13, 110 - hs[3] - 6)} textAnchor="middle" fill={accent} fontFamily="'Anton'" fontSize="16">{value}</text>}
        {caption && <text x="97" y="124" textAnchor="middle" fontFamily={mono} fontSize="8" fill={label}>{caption}</text>}
      </svg>
    );
  }
  if (kind === "line-chart") {
    return (
      <svg viewBox="0 0 200 120" width={560} style={box} xmlns="http://www.w3.org/2000/svg">
        <polyline points="18,104 50,90 82,74 114,56 146,38 178,20" fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="178" cy="20" r="4" fill={accent} />
        <line x1="14" y1="108" x2="188" y2="108" stroke={struct} strokeWidth="1" />
        {caption && <text x="100" y="16" textAnchor="middle" fontFamily={mono} fontSize="8" fill={label}>{caption}</text>}
      </svg>
    );
  }
  // donut
  return (
    <svg viewBox="0 0 120 120" width={340} style={box} xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="42" fill="none" stroke={struct} strokeWidth="14" opacity="0.3" />
      <circle cx="60" cy="60" r="42" fill="none" stroke={accent} strokeWidth="14" strokeDasharray="198 264" transform="rotate(-90 60 60)" />
      <text x="60" y="58" textAnchor="middle" fontFamily="'Anton'" fontSize="22" fill="#fff">{value ?? "75%"}</text>
      {caption && <text x="60" y="74" textAnchor="middle" fontFamily={mono} fontSize="7" fill={label}>{caption}</text>}
    </svg>
  );
}

// Water journey: one continuous pipeline spanning all 6 slides. The full
// panorama (cistern → pump → gauge → filter → home) is drawn in panorama
// coordinates (total*w wide); each slide shows its window via a viewBox offset,
// so the main pipe lines up edge-to-edge as you swipe. White architectural
// sketch on the blue field, with orange flow valves + arrows. Tuned for the
// 1080×1920 (9:16) canvas the water deck uses.
function WaterJourneyBg({ index, total, w, h, orange }: { index: number; total: number; w: number; h: number; orange: string }) {
  const FW = total * w; // full panorama width
  const PIPE = h - 440; // main horizontal pipe Y  (1480 @ 1920)
  const GND = h - 180; //  ground line Y          (1740 @ 1920)
  const white = "#e8f1ff";
  const arrows = [980, 1480, 2040, 2540, 3140, 3600, 4180, 4640, 5260];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" }} aria-hidden>
      <svg width="100%" height="100%" viewBox={`${index * w} 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        {/* faint foliage, corners of the run */}
        <g fill="none" stroke={white} strokeOpacity="0.1" strokeWidth="4" strokeLinecap="round">
          <path d={`M120 ${GND - 620} q 120 -80 260 -40 M170 ${GND - 560} q 90 -30 180 -10 M150 ${GND - 500} q 100 -10 200 30`} />
          <path d={`M${FW - 120} ${GND - 640} q -120 -70 -260 -30 M${FW - 170} ${GND - 580} q -90 -25 -180 0 M${FW - 150} ${GND - 520} q -100 0 -200 40`} />
        </g>

        {/* house glow */}
        <rect x={5600} y={h - 780} width={620} height={620} rx={20} fill="none" stroke={white} strokeOpacity="0.1" strokeWidth={28} />

        <g fill="none" stroke={white} strokeOpacity="0.9" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
          {/* ground */}
          <line x1={120} y1={GND} x2={FW - 120} y2={GND} strokeOpacity="0.32" />
          {/* main pipe (the continuous line) */}
          <line x1={720} y1={PIPE} x2={5660} y2={PIPE} strokeWidth={13} />

          {/* ── Cistern (slice 0) ── */}
          <ellipse cx={540} cy={GND - 560} rx={210} ry={34} />
          <path d={`M330 ${GND - 560} V ${GND} M750 ${GND - 560} V ${GND} M330 ${GND} H 750`} />
          <path d={`M540 ${GND - 526} V ${GND}`} strokeOpacity="0.35" />

          {/* ── Pump + motor (slice 1) ── */}
          <circle cx={1620} cy={PIPE} r={96} />
          <circle cx={1620} cy={PIPE} r={46} />
          <g strokeWidth={4}>
            <line x1={1620} y1={PIPE - 96} x2={1620} y2={PIPE - 118} />
            <line x1={1620} y1={PIPE + 96} x2={1620} y2={PIPE + 118} />
            <line x1={1524} y1={PIPE} x2={1502} y2={PIPE} />
            <line x1={1716} y1={PIPE} x2={1738} y2={PIPE} />
            <line x1={1552} y1={PIPE - 68} x2={1536} y2={PIPE - 84} />
            <line x1={1688} y1={PIPE - 68} x2={1704} y2={PIPE - 84} />
            <line x1={1552} y1={PIPE + 68} x2={1536} y2={PIPE + 84} />
            <line x1={1688} y1={PIPE + 68} x2={1704} y2={PIPE + 84} />
          </g>
          <path d={`M1500 ${PIPE + 96} h 240 v ${GND - PIPE - 96} h -240 Z`} strokeOpacity="0.55" />

          {/* ── Pressure gauge (slice 2) ── */}
          <line x1={2700} y1={PIPE} x2={2700} y2={PIPE - 60} />
          <circle cx={2700} cy={PIPE - 130} r={74} />
          <circle cx={2700} cy={PIPE - 130} r={6} fill={white} stroke="none" />
          <line x1={2700} y1={PIPE - 130} x2={2748} y2={PIPE - 168} stroke={orange} strokeWidth={6} />
          <g strokeWidth={3} strokeOpacity="0.6">
            <line x1={2700} y1={PIPE - 196} x2={2700} y2={PIPE - 186} />
            <line x1={2626} y1={PIPE - 130} x2={2636} y2={PIPE - 130} />
            <line x1={2774} y1={PIPE - 130} x2={2764} y2={PIPE - 130} />
          </g>

          {/* ── Filter / RO cartridges (slice 3) ── */}
          <rect x={3610} y={PIPE - 150} width={340} height={40} rx={14} />
          <rect x={3600} y={PIPE - 210} width={360} height={48} rx={24} />
          <circle cx={3600} cy={PIPE - 186} r={10} fill={white} stroke="none" />
          <circle cx={3960} cy={PIPE - 186} r={10} fill={white} stroke="none" />
          <rect x={3648} y={PIPE - 110} width={70} height={170} rx={30} />
          <rect x={3745} y={PIPE - 110} width={70} height={170} rx={30} />
          <rect x={3842} y={PIPE - 110} width={70} height={170} rx={30} />

          {/* ── Flex connector into the home (slice 4) ── */}
          <path d={`M4700 ${PIPE} q 22 -46 44 0 q 22 46 44 0 q 22 -46 44 0 q 22 46 44 0`} strokeWidth={7} />

          {/* ── Home (slice 5) ── */}
          <path d={`M5600 ${h - 690} L5940 ${h - 770} L6210 ${h - 690}`} />
          <path d={`M5640 ${h - 690} V ${GND} M6180 ${h - 690} V ${GND} M5640 ${GND} H 6180`} />
          {/* interior plumbing + fixtures */}
          <path d={`M5660 ${PIPE} H 5720 V ${h - 640} H 6120`} strokeWidth={7} strokeOpacity="0.7" />
          <path d={`M5820 ${h - 640} V ${h - 560}`} strokeWidth={5} />
          <path d={`M6040 ${h - 640} V ${h - 590} q 0 20 -20 20 h -20`} strokeWidth={5} />
          <g stroke={orange} strokeWidth={5}>
            <line x1={5806} y1={h - 520} x2={5806} y2={h - 500} />
            <line x1={5820} y1={h - 520} x2={5820} y2={h - 494} />
            <line x1={5834} y1={h - 520} x2={5834} y2={h - 500} />
            <line x1={5990} y1={h - 548} x2={5990} y2={h - 526} />
            <line x1={6004} y1={h - 548} x2={6004} y2={h - 520} />
          </g>

          {/* orange flow valves on the pipe */}
          <g stroke={orange} strokeWidth={6}>
            <line x1={1180} y1={PIPE} x2={1180} y2={PIPE - 46} />
            <line x1={1152} y1={PIPE - 46} x2={1208} y2={PIPE - 46} />
            <line x1={3320} y1={PIPE} x2={3320} y2={PIPE - 46} />
            <line x1={3292} y1={PIPE - 46} x2={3348} y2={PIPE - 46} />
            <line x1={5300} y1={PIPE} x2={5300} y2={PIPE - 46} />
            <line x1={5272} y1={PIPE - 46} x2={5328} y2={PIPE - 46} />
          </g>
        </g>

        {/* orange flow arrows along the pipe */}
        <g fill={orange}>
          {arrows.map((x) => (
            <polygon key={x} points={`${x},${PIPE - 15} ${x + 26},${PIPE} ${x},${PIPE + 15}`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

// Roof-removal process line: ONE continuous line spanning the content slides,
// whose *state changes left→right* to teach the removal process — the old
// cracked sealant (dashed) is lifted, the base is exposed clean, then a fresh
// accent seal is rolled on. Four stage nodes (Evalúa · Remueve · Prepara ·
// Sella) sit on the line with a tool glyph above and a mono label below, ending
// on a "LISTO" check in the accent. Drawn in panorama coordinates (total*w wide)
// with each slide showing its window via a viewBox offset, so the line lines up
// edge-to-edge as you swipe. Sits above the veil so it reads on the dark canvas.
function RoofRemovalBg({ index, total, w, h, accent }: { index: number; total: number; w: number; h: number; accent: string }) {
  const FW = total * w; // full panorama width
  const Y = h * 0.72; // the process line height
  const struct = "#8fb0e6"; // light blueprint ink
  const label = "#b9cdf2";
  const mono = "'Martian Mono', ui-monospace, monospace";
  const cx = (i: number) => i * w + w / 2; // window i center x
  const xs = [cx(0), cx(1), cx(2), cx(3)]; // 4 stage node x's
  const xEnd = cx(4); // final "LISTO" endpoint
  const tools = ["evalua", "remueve", "prepara", "sella"] as const;
  const caps = ["01 · EVALÚA", "02 · REMUEVE", "03 · PREPARA", "04 · SELLA"];
  const IY = Y - 150; // tool glyph top
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }} aria-hidden>
      <svg width="100%" height="100%" viewBox={`${index * w} 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        {/* the roof line, changing state along its length */}
        <path d={`M120 ${Y} H ${xs[1]}`} fill="none" stroke={struct} strokeOpacity="0.5" strokeWidth="8" strokeDasharray="10 13" strokeLinecap="round" />
        <line x1={xs[1]} y1={Y} x2={xs[3]} y2={Y} stroke={struct} strokeOpacity="0.9" strokeWidth="6" strokeLinecap="round" />
        <line x1={xs[3]} y1={Y} x2={FW - 120} y2={Y} stroke={accent} strokeWidth="10" strokeLinecap="round" />

        {/* directional chevrons between stages (accent, subtle) */}
        <g fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {[cx(0) + w * 0.28, cx(1) + w * 0.28, cx(2) + w * 0.28, cx(3) + w * 0.28].map((x, i) => (
            <path key={i} d={`M${x} ${Y - 14} L${x + 16} ${Y} L${x} ${Y + 14}`} />
          ))}
        </g>

        {/* stage tool glyphs + connectors + nodes + labels */}
        {xs.map((x, i) => {
          const col = i === 3 ? accent : struct;
          return (
            <g key={i}>
              {/* connector from glyph to the node on the line */}
              <line x1={x} y1={IY + 54} x2={x} y2={Y - 12} stroke={col} strokeOpacity="0.6" strokeWidth="3" strokeDasharray="3 5" />
              {/* tool glyph */}
              <g transform={`translate(${x} ${IY})`} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {tools[i] === "evalua" && (
                  <>
                    <circle cx="-6" cy="0" r="20" />
                    <line x1="9" y1="15" x2="26" y2="34" />
                  </>
                )}
                {tools[i] === "remueve" && (
                  <>
                    <rect x="-6" y="-8" width="12" height="30" rx="3" />
                    <path d="M-22 22 L22 22 L14 38 L-14 38 Z" />
                    <path d="M22 38 q 18 -4 30 -20" strokeDasharray="6 8" />
                  </>
                )}
                {tools[i] === "prepara" && (
                  <>
                    <line x1="0" y1="-12" x2="0" y2="18" />
                    <rect x="-18" y="18" width="36" height="12" rx="3" />
                    <g strokeWidth="3.5">
                      <line x1="-12" y1="30" x2="-12" y2="44" />
                      <line x1="-4" y1="30" x2="-4" y2="46" />
                      <line x1="4" y1="30" x2="4" y2="46" />
                      <line x1="12" y1="30" x2="12" y2="44" />
                    </g>
                  </>
                )}
                {tools[i] === "sella" && (
                  <>
                    <rect x="-22" y="-14" width="44" height="18" rx="7" />
                    <line x1="0" y1="4" x2="0" y2="26" />
                    <path d="M0 26 h 18" />
                  </>
                )}
              </g>
              {/* node on the line */}
              <circle cx={x} cy={Y} r="11" fill="#0a0e18" stroke={col} strokeWidth="4" />
              {/* label */}
              <text x={x} y={Y + 66} textAnchor="middle" fontFamily={mono} fontSize="27" fill={i === 3 ? accent : label} letterSpacing="1">{caps[i]}</text>
            </g>
          );
        })}

        {/* final result: sealed + "LISTO" check in accent */}
        <g>
          <circle cx={xEnd} cy={Y} r="28" fill="none" stroke={accent} strokeWidth="5" />
          <path d={`M${xEnd - 12} ${Y} L${xEnd - 3} ${Y + 10} L${xEnd + 14} ${Y - 12}`} fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <text x={xEnd} y={Y + 76} textAnchor="middle" fontFamily={mono} fontSize="27" fill={accent} letterSpacing="1">LISTO</text>
        </g>
      </svg>
    </div>
  );
}

export default function CarouselSlide({ slide, colors, fonts, brand, theme, editing, onEdit, showBadge = true, size }: Props) {
  const W = size?.w ?? SLIDE_W;
  const H = size?.h ?? SLIDE_H;
  const bp = theme === "blueprint";
  const sig = theme === "signature"; // dark "Blueprint Oscuro" signature look
  const dark = bp || sig; // dark field → white text
  const accentCol = sig ? colors.accent : colors.orange; // neon accent per product
  const mono = "'Martian Mono', ui-monospace, monospace"; // data/annotation font
  const bpHi = "#ffd23f"; // bright yellow for labels/tags — high contrast on the blue field
  const grid = theme === "grid"; // blueprint grid on white (blue text stays)
  const wj = slide.art === "water-journey"; // continuous cistern→home pipeline
  const rr = slide.art === "roof-removal"; // continuous roof-removal process line
  const sigArt = sig && !!slide.art && !wj && !rr; // self-contained guide diagram/chart
  const f = fonts ?? defaultFonts;
  const bName = slide.brand ?? brand ?? "WindMar Water";
  const { lead: bLead, tail: bTail } = brandParts(bName);
  // Resolve a text element's color: a per-field override wins, then the broad
  // title/body group override, then the design default passed by the caller.
  const tc = slide.textColors ?? {};
  const titleC = slide.titleColor;
  const bodyC = slide.bodyColor;
  const col = (field: string, fallback: string, group?: "title" | "body") =>
    tc[field] ?? (group === "title" ? titleC : group === "body" ? bodyC : undefined) ?? fallback;
  const base = {
    width: W,
    height: H,
    position: "relative",
    overflow: "hidden",
    background: "#0a1628",
    fontFamily: "var(--font-body, var(--font-barlow)), sans-serif",
    "--font-heading": `'${f.heading}'`,
    "--font-body": `'${f.body}'`,
  } as React.CSSProperties;

  // ── COVER (s1) ──
  if (slide.kind === "cover") {
    return (
      <div style={{ ...base, background: dark ? "transparent" : "#fff", display: "flex", flexDirection: "column", justifyContent: sig && !slide.image ? "center" : undefined }}>
        {bp && <BlueprintBg orange={colors.orange} />}
        {sig && !slide.image && <SignatureBg w={W} h={H} accent={colors.accent} />}
        {/* signature + photo: the image is a full-bleed COLOR background (like the
            Florida stories) with a legibility veil, and the brand corners overlay it */}
        {sig && slide.image && (
          <>
            <SigPhoto slide={slide} accent={colors.accent} color bleed={false} />
            <SignatureBg w={W} h={H} accent={colors.accent} frameOnly z={1} />
          </>
        )}
        {grid && <LightGridBg accent={colors.headerBg} />}
        <div style={{ padding: "70px 70px 30px", position: "relative", zIndex: 2 }}>
          {sig && slide.eyebrow && (
            <div style={{ marginBottom: 26 }}>
              <ChipShell accent={colors.accent}>
                <Editable
                  editing={editing}
                  value={slide.eyebrow}
                  onCommit={(v) => onEdit("eyebrow", v)}
                  style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1, color: col("eyebrow", colors.accent), textTransform: "uppercase", paddingRight: 4 }}
                />
              </ChipShell>
            </div>
          )}
          {showBadge && (
            <div className="font-display" style={{ fontSize: 28, letterSpacing: 3, color: dark ? "#fff" : colors.headerBg, marginBottom: 28, textTransform: "uppercase" }}>
              {bLead} <span style={{ color: colors.accent }}>{bTail}</span>
            </div>
          )}
          <Editable
            editing={editing}
            value={slide.title}
            onCommit={(v) => onEdit("title", v)}
            className="font-display"
            style={{ fontSize: sig ? 132 : 108, fontWeight: 900, color: col("title", dark ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", lineHeight: 0.9, marginBottom: 20 }}
          />
          {slide.subtitle && (
            <Editable
              editing={editing}
              value={slide.subtitle}
              onCommit={(v) => onEdit("subtitle", v)}
              style={{ fontSize: 36, fontWeight: 500, color: col("subtitle", dark ? "rgba(233,244,255,0.9)" : "#475569", "body"), marginBottom: 28 }}
            />
          )}
          {slide.body && (
            <Editable
              editing={editing}
              value={slide.body}
              onCommit={(v) => onEdit("body", v)}
              style={{ fontSize: 30, fontWeight: 400, color: col("body", dark ? "rgba(233,244,255,0.8)" : "#64748b", "body"), lineHeight: 1.5 }}
            />
          )}
          {slide.tag && (
            sig ? (
              <div style={{ marginTop: 32 }}>
                <ChipShell accent={colors.accent}>
                  <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: 1, color: col("tag", colors.accent), textTransform: "uppercase", paddingRight: 4 }}>
                    {slide.tag}
                  </span>
                </ChipShell>
              </div>
            ) : (
              <span
                className="font-display"
                style={{ display: "inline-block", marginTop: 32, background: bp ? "rgba(255,255,255,0.12)" : "rgba(26,82,199,0.08)", border: `3px solid ${bp ? "rgba(255,255,255,0.5)" : `${colors.bullet}55`}`, borderRadius: 100, padding: "10px 32px", fontSize: 30, color: col("tag", bp ? "#fff" : colors.bullet), textTransform: "uppercase", letterSpacing: 2 }}
              >
                {slide.tag}
              </span>
            )
          )}
        </div>
        {/* Non-signature covers keep the boxed photo below the text. Signature
            covers render the photo as a full-bleed background above, so no box. */}
        {!sig && (
          <div style={{ flex: 1, position: "relative", overflow: "hidden", zIndex: 2 }}>
            {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
          </div>
        )}
        <Overlays slide={slide} />
        {showBadge && <BrandBadge colors={colors} brand={bName} />}
      </div>
    );
  }

  // ── FUN FACT (Instagram Story, 9:16) ──
  // A single "¿Sabías que…?" card: brand up top, an optional big stat, the fact
  // headline, a supporting line, and the site at the foot. Blueprint-grid white.
  if (slide.kind === "funfact") {
    return (
      <div style={{ ...base, background: dark ? "transparent" : "#fff", display: "flex", flexDirection: "column", padding: "120px 90px", justifyContent: "space-between" }}>
        {grid && <LightGridBg accent={colors.headerBg} w={W} h={H} />}
        {bp && <BlueprintBg w={W} h={H} orange={colors.orange} />}
        {sig && <SignatureBg w={W} h={H} accent={colors.accent} />}
        {slide.image && (sig ? <SigPhoto slide={slide} accent={colors.accent} /> : <img src={slide.image.src} alt="" style={imgStyle(slide)} />)}
        {/* top: brand + FUN FACT tag */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="font-display" style={{ fontSize: 34, fontWeight: bp ? 800 : undefined, letterSpacing: 4, color: sig ? "#fff" : bp ? bpHi : colors.headerBg, textTransform: "uppercase" }}>
            {bLead} <span style={{ color: sig ? colors.accent : bp ? bpHi : colors.accent }}>{bTail}</span>
          </div>
          <span className="font-display" style={{ fontFamily: sig ? mono : undefined, fontSize: sig ? 22 : 26, fontWeight: sig ? 500 : bp ? 800 : undefined, letterSpacing: 3, color: sig ? colors.accent : bp ? bpHi : colors.orange, border: `2px solid ${sig ? colors.accent : bp ? bpHi : colors.orange}`, borderRadius: 100, padding: "8px 24px", textTransform: "uppercase" }}>
            Fun fact
          </span>
        </div>
        {/* middle: the fact */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 36 }}>
          {slide.tag && (
            sig ? (
              <ChipShell accent={colors.accent} big>
                <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: 1, color: col("tag", colors.accent), textTransform: "uppercase", paddingRight: 4 }}>
                  {slide.tag}
                </span>
              </ChipShell>
            ) : (
              <span className="font-display" style={{ display: "inline-block", fontWeight: bp ? 800 : undefined, fontSize: 38, background: bp ? "rgba(255,210,63,0.14)" : "rgba(26,82,199,0.08)", border: `3px solid ${bp ? bpHi : `${colors.bullet}55`}`, borderRadius: 100, padding: "14px 40px", color: col("tag", bp ? bpHi : colors.bullet), textTransform: "uppercase", letterSpacing: 2 }}>
                {slide.tag}
              </span>
            )
          )}
          {slide.highlight && (
            <Editable editing={editing} value={slide.highlight} onCommit={(v) => onEdit("highlight", v)} className="font-display" style={{ fontSize: 190, fontWeight: 900, lineHeight: 0.9, color: col("highlight", accentCol) }} />
          )}
          <Editable editing={editing} value={slide.title} onCommit={(v) => onEdit("title", v)} className="font-display" style={{ fontSize: 104, fontWeight: 900, color: col("title", dark ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", lineHeight: 1.02 }} />
          {slide.body && (
            <Editable editing={editing} value={slide.body} onCommit={(v) => onEdit("body", v)} style={{ fontSize: 46, fontWeight: 500, color: col("body", dark ? "rgba(233,244,255,0.85)" : "#475569", "body"), lineHeight: 1.4 }} />
          )}
        </div>
        {/* bottom: site + optional CTA line */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {slide.url && <div style={{ fontFamily: sig ? mono : undefined, fontSize: sig ? 30 : 36, color: col("url", sig ? colors.accent : bp ? "rgba(255,255,255,0.6)" : "#64748b"), letterSpacing: 2 }}>{slide.url}</div>}
          {slide.subtitle && <div className="font-display" style={{ fontSize: 32, color: col("subtitle", dark ? "#fff" : colors.headerBg), letterSpacing: 1, textTransform: "uppercase" }}>{slide.subtitle}</div>}
        </div>
        <Overlays slide={slide} />
      </div>
    );
  }

  // ── CTA (s6) ──
  if (slide.kind === "cta") {
    // Grid slides with no photo must stay clean white so the blue text reads —
    // force the veil off, ignoring any stale saved value from the slider.
    const ctaVeil = grid && !slide.image ? 0 : slide.veil ?? (dark && !slide.image ? 0 : 1);
    return (
      <div style={grid ? { ...base, background: "#fff" } : sig ? { ...base, background: "transparent" } : base}>
        {bp && <BlueprintBg orange={colors.orange} />}
        {sig && <SignatureBg w={W} h={H} accent={colors.accent} />}
        {grid && <LightGridBg accent={colors.headerBg} />}
        {slide.image && (sig ? <SigPhoto slide={slide} accent={colors.accent} /> : <img src={slide.image.src} alt="" style={imgStyle(slide)} />)}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: `linear-gradient(180deg, rgba(10,14,24,${0.75 * ctaVeil}) 0%, rgba(10,14,24,${0.55 * ctaVeil}) 50%, rgba(10,14,24,${0.8 * ctaVeil}) 100%)`,
          }}
        />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "90px 80px", textAlign: "center" }}>
          {showBadge && (
            <div className="font-display" style={{ fontSize: 30, letterSpacing: 4, color: grid ? colors.headerBg : "rgba(255,255,255,0.4)", marginBottom: 50, textTransform: "uppercase" }}>
              {bLead} <span style={{ color: colors.accent }}>{bTail}</span>
            </div>
          )}
          <Editable
            editing={editing}
            value={slide.title}
            onCommit={(v) => onEdit("title", v)}
            className="font-display"
            style={{ fontSize: 128, fontWeight: 900, color: col("title", grid ? colors.headerBg : "#fff", "title"), textTransform: "uppercase", lineHeight: 0.95, marginBottom: 20 }}
          />
          {slide.subtitle && (
            <Editable
              editing={editing}
              value={slide.subtitle}
              onCommit={(v) => onEdit("subtitle", v)}
              style={{ fontSize: 34, color: col("subtitle", grid ? "#475569" : "rgba(255,255,255,0.55)", "body"), marginBottom: 50 }}
            />
          )}
          {slide.cta && (
            <div className="font-display" style={{ background: sig ? colors.accent : colors.headerBg, padding: "30px 64px", borderRadius: 18, fontSize: 50, fontWeight: 900, color: col("cta", sig ? "#0a0e18" : "#fff"), textTransform: "uppercase", letterSpacing: 1, marginBottom: 44 }}>
              {slide.cta}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", textAlign: "left", marginBottom: 32 }}>
            {slide.checks?.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, color: col("checks", grid ? "#1c1d20" : "rgba(255,255,255,0.7)", "body") }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: sig ? colors.accent : grid ? colors.headerBg : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: sig ? "#0a0e18" : "#fff", flexShrink: 0 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
          {slide.url && (
            <div style={{ fontSize: 26, color: col("url", grid ? "#64748b" : "rgba(255,255,255,0.4)", "body"), letterSpacing: 2 }}>{slide.url}</div>
          )}
        </div>
        <Overlays slide={slide} />
        {showBadge && <BrandBadge colors={colors} brand={bName} />}
      </div>
    );
  }

  // ── CONTENT (s2-s5) ──
  const veil = grid && !slide.image ? 0 : slide.veil ?? 1;
  return (
    <div style={{ ...base, background: dark ? "transparent" : "#fff" }}>
      {bp && <BlueprintBg w={W} h={H} orange={colors.orange} />}
      {sig && <SignatureBg w={W} h={H} accent={colors.accent} />}
      {wj && <WaterJourneyBg index={slide.artIndex ?? 0} total={6} w={W} h={H} orange={colors.orange} />}
      {grid && <LightGridBg accent={colors.headerBg} />}
      {slide.image && (sig ? <SigPhoto slide={slide} accent={colors.accent} /> : <img src={slide.image.src} alt="" style={imgStyle(slide)} />)}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: sig
            ? `linear-gradient(180deg, rgba(10,14,24,${0.55 * veil}) 0%, rgba(10,14,24,${0.2 * veil}) 40%, rgba(10,14,24,${0.75 * veil}) 100%)`
            : bp
            ? `linear-gradient(180deg, rgba(15,58,125,${0.15 * veil}) 0%, rgba(15,58,125,0) 40%, rgba(15,58,125,${0.35 * veil}) 100%)`
            : `linear-gradient(180deg, rgba(255,255,255,${0.85 * veil}) 0%, rgba(255,255,255,${0.55 * veil}) 45%, rgba(255,255,255,${0.25 * veil}) 100%)`,
        }}
      />
      {/* continuous roof-removal process line — above the veil so it stays crisp */}
      {rr && <RoofRemovalBg index={slide.artIndex ?? 0} total={5} w={W} h={H} accent={colors.accent} />}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", padding: "80px 70px", justifyContent: sig ? "center" : undefined }}>
        {slide.eyebrow && (
          sig ? (
            <div style={{ marginBottom: H >= 1700 ? 28 : 20 }}>
              <ChipShell accent={colors.accent} big={H >= 1700}>
                <Editable
                  editing={editing}
                  value={slide.eyebrow}
                  onCommit={(v) => onEdit("eyebrow", v)}
                  style={{ fontSize: H >= 1700 ? 34 : 24, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: col("eyebrow", colors.accent, "title"), paddingRight: 4 }}
                />
              </ChipShell>
            </div>
          ) : (
            <Editable
              editing={editing}
              value={slide.eyebrow}
              onCommit={(v) => onEdit("eyebrow", v)}
              style={{ fontSize: H >= 1700 ? 36 : 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: col("eyebrow", bp ? "#cfe0ff" : colors.headerBg, "title"), marginBottom: H >= 1700 ? 24 : 16 }}
            />
          )
        )}
        <Editable
          editing={editing}
          value={slide.title}
          onCommit={(v) => onEdit("title", v)}
          className="font-display"
          style={{ fontSize: H >= 1700 ? 116 : sig ? 96 : 80, fontWeight: 900, color: col("title", dark ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", lineHeight: sig ? 0.92 : 1.0, marginBottom: slide.subtitle ? 8 : 36 }}
        />
        {slide.subtitle && (
          <Editable
            editing={editing}
            value={slide.subtitle}
            onCommit={(v) => onEdit("subtitle", v)}
            className="font-display"
            style={{ fontSize: 52, fontWeight: 700, color: col("subtitle", dark ? "rgba(233,244,255,0.9)" : "#475569", "title"), textTransform: "uppercase", marginBottom: slide.body ? 24 : 36 }}
          />
        )}
        {slide.body && (
          <Editable
            editing={editing}
            value={slide.body}
            onCommit={(v) => onEdit("body", v)}
            style={{ fontSize: H >= 1700 ? 46 : 34, fontWeight: 400, color: col("body", dark ? "rgba(233,244,255,0.85)" : "#334155", "body"), lineHeight: 1.45, marginBottom: 12 }}
          />
        )}
        {slide.bullets && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 12 }}>
            {slide.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 24, fontSize: 38, fontWeight: 600, color: col("bullets", dark ? "rgba(233,244,255,0.92)" : "#334155", "body"), lineHeight: 1.3 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: dark ? accentCol : colors.bullet, flexShrink: 0, marginTop: 14 }} />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        )}
        {slide.checks && (
          <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 12 }}>
            {slide.checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 36, fontWeight: 600, color: col("checks", dark ? "rgba(233,244,255,0.92)" : "#334155", "body") }}>
                <span style={{ width: 48, height: 48, borderRadius: "50%", background: i === slide.checks!.length - 1 ? accentCol : (dark ? "rgba(255,255,255,0.25)" : colors.headerBg), color: sig && i === slide.checks!.length - 1 ? "#0a0e18" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
        )}
        {sigArt && (
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 44 }}>
            <SignatureArt kind={slide.art!} accent={colors.accent} value={slide.artValue} caption={slide.artCaption} />
          </div>
        )}
        {slide.highlight && (
          <div className="font-display" style={{ marginTop: 36, background: sig ? "rgba(255,255,255,0.05)" : bp ? "rgba(255,255,255,0.12)" : "rgba(26,82,199,0.08)", border: `3px solid ${sig ? `${accentCol}88` : bp ? "rgba(255,255,255,0.5)" : `${colors.bullet}55`}`, borderRadius: 14, padding: "22px 32px", fontSize: 36, color: col("highlight", dark ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", letterSpacing: 1 }}>
            {slide.highlight}
          </div>
        )}
        {slide.url && (
          <div style={{ marginTop: "auto", paddingTop: 40, fontFamily: sig ? mono : undefined, fontSize: H >= 1700 ? 30 : 24, fontWeight: sig ? 500 : 700, letterSpacing: 2, color: col("url", sig ? colors.accent : bp ? "rgba(233,244,255,0.75)" : colors.headerBg, "body") }}>
            {slide.url}
          </div>
        )}
      </div>
      <Overlays slide={slide} />
      {showBadge && <BrandBadge colors={colors} brand={bName} />}
    </div>
  );
}
