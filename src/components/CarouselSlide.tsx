"use client";

import { Slide, ImageState, BrandColors, BrandFonts, defaultFonts } from "@/data/carousel";

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

interface Props {
  slide: Slide;
  colors: BrandColors;
  fonts?: BrandFonts;
  brand?: string;
  theme?: "blueprint";
  editing: boolean;
  onEdit: (field: keyof Slide, value: string) => void;
  showBadge?: boolean;
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

// Blueprint theme: a bright architectural-sketch background — medium-blue canvas,
// engineering grid, and faint white water-system + foliage line art with one
// orange flow accent. Sits behind slide content so text layers over it.
function BlueprintBg() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }} aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bpBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c57ab" />
            <stop offset="1" stopColor="#274e9c" />
          </linearGradient>
          <pattern id="bpGrid" width="135" height="135" patternUnits="userSpaceOnUse">
            <path d="M135 0H0V135" fill="none" stroke="#cfe0ff" strokeOpacity="0.28" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="1080" height="1350" fill="url(#bpBg)" />
        <rect width="1080" height="1350" fill="url(#bpGrid)" />
      </svg>
    </div>
  );
}

export default function CarouselSlide({ slide, colors, fonts, brand, theme, editing, onEdit, showBadge = true }: Props) {
  const bp = theme === "blueprint";
  const f = fonts ?? defaultFonts;
  const bName = brand ?? "WindMar Water";
  const { lead: bLead, tail: bTail } = brandParts(bName);
  // Resolve a text element's color: a per-field override wins, then the broad
  // title/body group override, then the design default passed by the caller.
  const tc = slide.textColors ?? {};
  const titleC = slide.titleColor;
  const bodyC = slide.bodyColor;
  const col = (field: string, fallback: string, group?: "title" | "body") =>
    tc[field] ?? (group === "title" ? titleC : group === "body" ? bodyC : undefined) ?? fallback;
  const base = {
    width: SLIDE_W,
    height: SLIDE_H,
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
      <div style={{ ...base, background: bp ? "transparent" : "#fff", display: "flex", flexDirection: "column" }}>
        {bp && <BlueprintBg />}
        <div style={{ padding: "70px 70px 30px", position: "relative", zIndex: 2 }}>
          {showBadge && (
            <div className="font-display" style={{ fontSize: 28, letterSpacing: 3, color: bp ? "#fff" : colors.headerBg, marginBottom: 28, textTransform: "uppercase" }}>
              {bLead} <span style={{ color: colors.accent }}>{bTail}</span>
            </div>
          )}
          <Editable
            editing={editing}
            value={slide.title}
            onCommit={(v) => onEdit("title", v)}
            className="font-display"
            style={{ fontSize: 108, fontWeight: 900, color: col("title", bp ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", lineHeight: 0.95, marginBottom: 20 }}
          />
          {slide.subtitle && (
            <Editable
              editing={editing}
              value={slide.subtitle}
              onCommit={(v) => onEdit("subtitle", v)}
              style={{ fontSize: 36, fontWeight: 500, color: col("subtitle", bp ? "rgba(233,244,255,0.9)" : "#475569", "body"), marginBottom: 28 }}
            />
          )}
          {slide.body && (
            <Editable
              editing={editing}
              value={slide.body}
              onCommit={(v) => onEdit("body", v)}
              style={{ fontSize: 30, fontWeight: 400, color: col("body", bp ? "rgba(233,244,255,0.8)" : "#64748b", "body"), lineHeight: 1.5 }}
            />
          )}
          {slide.tag && (
            <span
              className="font-display"
              style={{ display: "inline-block", marginTop: 32, background: bp ? "rgba(255,255,255,0.12)" : "rgba(26,82,199,0.08)", border: `3px solid ${bp ? "rgba(255,255,255,0.5)" : `${colors.bullet}55`}`, borderRadius: 100, padding: "10px 32px", fontSize: 30, color: col("tag", bp ? "#fff" : colors.bullet), textTransform: "uppercase", letterSpacing: 2 }}
            >
              {slide.tag}
            </span>
          )}
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden", zIndex: 2 }}>
          {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
        </div>
        <Overlays slide={slide} />
        {showBadge && <BrandBadge colors={colors} brand={bName} />}
      </div>
    );
  }

  // ── CTA (s6) ──
  if (slide.kind === "cta") {
    const ctaVeil = slide.veil ?? (bp && !slide.image ? 0 : 1);
    return (
      <div style={base}>
        {bp && <BlueprintBg />}
        {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: `linear-gradient(180deg, rgba(10,22,40,${0.75 * ctaVeil}) 0%, rgba(10,22,40,${0.55 * ctaVeil}) 50%, rgba(10,22,40,${0.8 * ctaVeil}) 100%)`,
          }}
        />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "90px 80px", textAlign: "center" }}>
          {showBadge && (
            <div className="font-display" style={{ fontSize: 30, letterSpacing: 4, color: "rgba(255,255,255,0.4)", marginBottom: 50, textTransform: "uppercase" }}>
              {bLead} <span style={{ color: colors.accent }}>{bTail}</span>
            </div>
          )}
          <Editable
            editing={editing}
            value={slide.title}
            onCommit={(v) => onEdit("title", v)}
            className="font-display"
            style={{ fontSize: 128, fontWeight: 900, color: col("title", "#fff", "title"), textTransform: "uppercase", lineHeight: 0.95, marginBottom: 20 }}
          />
          {slide.subtitle && (
            <Editable
              editing={editing}
              value={slide.subtitle}
              onCommit={(v) => onEdit("subtitle", v)}
              style={{ fontSize: 34, color: col("subtitle", "rgba(255,255,255,0.55)", "body"), marginBottom: 50 }}
            />
          )}
          {slide.cta && (
            <div className="font-display" style={{ background: colors.headerBg, padding: "30px 64px", borderRadius: 18, fontSize: 50, fontWeight: 900, color: col("cta", "#fff"), textTransform: "uppercase", letterSpacing: 1, marginBottom: 44 }}>
              {slide.cta}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", textAlign: "left", marginBottom: 32 }}>
            {slide.checks?.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, color: col("checks", "rgba(255,255,255,0.7)", "body") }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", flexShrink: 0 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
          {slide.url && (
            <div style={{ fontSize: 26, color: col("url", "rgba(255,255,255,0.4)", "body"), letterSpacing: 2 }}>{slide.url}</div>
          )}
        </div>
        <Overlays slide={slide} />
        {showBadge && <BrandBadge colors={colors} brand={bName} />}
      </div>
    );
  }

  // ── CONTENT (s2-s5) ──
  const veil = slide.veil ?? 1;
  return (
    <div style={{ ...base, background: bp ? "transparent" : "#fff" }}>
      {bp && <BlueprintBg />}
      {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: bp
            ? `linear-gradient(180deg, rgba(15,58,125,${0.15 * veil}) 0%, rgba(15,58,125,0) 40%, rgba(15,58,125,${0.35 * veil}) 100%)`
            : `linear-gradient(180deg, rgba(255,255,255,${0.85 * veil}) 0%, rgba(255,255,255,${0.55 * veil}) 45%, rgba(255,255,255,${0.25 * veil}) 100%)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", padding: "80px 70px" }}>
        {slide.eyebrow && (
          <Editable
            editing={editing}
            value={slide.eyebrow}
            onCommit={(v) => onEdit("eyebrow", v)}
            style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: col("eyebrow", bp ? "#cfe0ff" : colors.headerBg, "title"), marginBottom: 16 }}
          />
        )}
        <Editable
          editing={editing}
          value={slide.title}
          onCommit={(v) => onEdit("title", v)}
          className="font-display"
          style={{ fontSize: 80, fontWeight: 900, color: col("title", bp ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", lineHeight: 1.0, marginBottom: slide.subtitle ? 8 : 36 }}
        />
        {slide.subtitle && (
          <Editable
            editing={editing}
            value={slide.subtitle}
            onCommit={(v) => onEdit("subtitle", v)}
            className="font-display"
            style={{ fontSize: 52, fontWeight: 700, color: col("subtitle", bp ? "rgba(233,244,255,0.9)" : "#475569", "title"), textTransform: "uppercase", marginBottom: slide.body ? 24 : 36 }}
          />
        )}
        {slide.body && (
          <Editable
            editing={editing}
            value={slide.body}
            onCommit={(v) => onEdit("body", v)}
            style={{ fontSize: 34, fontWeight: 400, color: col("body", bp ? "rgba(233,244,255,0.85)" : "#334155", "body"), lineHeight: 1.45, marginBottom: 12 }}
          />
        )}
        {slide.bullets && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 12 }}>
            {slide.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 24, fontSize: 38, fontWeight: 600, color: col("bullets", bp ? "rgba(233,244,255,0.92)" : "#334155", "body"), lineHeight: 1.3 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: bp ? colors.orange : colors.bullet, flexShrink: 0, marginTop: 14 }} />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        )}
        {slide.checks && (
          <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 12 }}>
            {slide.checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 36, fontWeight: 600, color: col("checks", bp ? "rgba(233,244,255,0.92)" : "#334155", "body") }}>
                <span style={{ width: 48, height: 48, borderRadius: "50%", background: i === slide.checks!.length - 1 ? colors.orange : (bp ? "rgba(255,255,255,0.25)" : colors.headerBg), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
        )}
        {slide.highlight && (
          <div className="font-display" style={{ marginTop: 36, background: bp ? "rgba(255,255,255,0.12)" : "rgba(26,82,199,0.08)", border: `3px solid ${bp ? "rgba(255,255,255,0.5)" : `${colors.bullet}55`}`, borderRadius: 14, padding: "22px 32px", fontSize: 36, color: col("highlight", bp ? "#fff" : colors.headerBg, "title"), textTransform: "uppercase", letterSpacing: 1 }}>
            {slide.highlight}
          </div>
        )}
      </div>
      <Overlays slide={slide} />
      {showBadge && <BrandBadge colors={colors} brand={bName} />}
    </div>
  );
}
