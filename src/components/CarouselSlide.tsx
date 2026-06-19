"use client";

import { Slide, BrandColors, BrandFonts, defaultFonts } from "@/data/carousel";

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

interface Props {
  slide: Slide;
  colors: BrandColors;
  fonts?: BrandFonts;
  editing: boolean;
  onEdit: (field: keyof Slide, value: string) => void;
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
      onBlur={(e) => onCommit(e.currentTarget.textContent ?? "")}
    >
      {value}
    </div>
  );
}

function BrandBadge({ colors }: { colors: BrandColors }) {
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
        WindMar Water
      </span>
    </div>
  );
}

function imgStyle(slide: Slide): React.CSSProperties {
  const img = slide.image!;
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${img.posX}% ${img.posY}%`,
    transform: `scale(${img.scale})`,
    opacity: img.opacity,
  };
}

export default function CarouselSlide({ slide, colors, fonts, editing, onEdit }: Props) {
  const f = fonts ?? defaultFonts;
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
      <div style={{ ...base, background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "70px 70px 30px" }}>
          <div className="font-display" style={{ fontSize: 28, letterSpacing: 3, color: colors.headerBg, marginBottom: 28, textTransform: "uppercase" }}>
            WindMar <span style={{ color: colors.accent }}>Water</span>
          </div>
          <Editable
            editing={editing}
            value={slide.title}
            onCommit={(v) => onEdit("title", v)}
            className="font-display"
            style={{ fontSize: 108, fontWeight: 900, color: colors.headerBg, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 20 }}
          />
          {slide.subtitle && (
            <Editable
              editing={editing}
              value={slide.subtitle}
              onCommit={(v) => onEdit("subtitle", v)}
              style={{ fontSize: 36, fontWeight: 500, color: "#475569", marginBottom: 28 }}
            />
          )}
          {slide.body && (
            <Editable
              editing={editing}
              value={slide.body}
              onCommit={(v) => onEdit("body", v)}
              style={{ fontSize: 30, fontWeight: 400, color: "#64748b", lineHeight: 1.5 }}
            />
          )}
          {slide.tag && (
            <span
              className="font-display"
              style={{ display: "inline-block", marginTop: 32, background: "rgba(26,82,199,0.08)", border: `3px solid ${colors.bullet}55`, borderRadius: 100, padding: "10px 32px", fontSize: 30, color: colors.bullet, textTransform: "uppercase", letterSpacing: 2 }}
            >
              {slide.tag}
            </span>
          )}
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
        </div>
        <BrandBadge colors={colors} />
      </div>
    );
  }

  // ── CTA (s6) ──
  if (slide.kind === "cta") {
    return (
      <div style={base}>
        {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.8) 100%)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "90px 80px", textAlign: "center" }}>
          <div className="font-display" style={{ fontSize: 30, letterSpacing: 4, color: "rgba(255,255,255,0.4)", marginBottom: 50, textTransform: "uppercase" }}>
            WindMar <span style={{ color: colors.accent }}>Water</span>
          </div>
          <Editable
            editing={editing}
            value={slide.title}
            onCommit={(v) => onEdit("title", v)}
            className="font-display"
            style={{ fontSize: 128, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 0.95, marginBottom: 20 }}
          />
          {slide.subtitle && (
            <Editable
              editing={editing}
              value={slide.subtitle}
              onCommit={(v) => onEdit("subtitle", v)}
              style={{ fontSize: 34, color: "rgba(255,255,255,0.55)", marginBottom: 50 }}
            />
          )}
          {slide.cta && (
            <div className="font-display" style={{ background: colors.headerBg, padding: "30px 64px", borderRadius: 18, fontSize: 50, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 44 }}>
              {slide.cta}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", textAlign: "left", marginBottom: 32 }}>
            {slide.checks?.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", flexShrink: 0 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
          {slide.url && (
            <div style={{ fontSize: 26, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>{slide.url}</div>
          )}
        </div>
        <BrandBadge colors={colors} />
      </div>
    );
  }

  // ── CONTENT (s2-s5) ──
  return (
    <div style={{ ...base, background: "#fff" }}>
      {slide.image && <img src={slide.image.src} alt="" style={imgStyle(slide)} />}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.25) 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", padding: "80px 70px" }}>
        {slide.eyebrow && (
          <Editable
            editing={editing}
            value={slide.eyebrow}
            onCommit={(v) => onEdit("eyebrow", v)}
            style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: colors.headerBg, marginBottom: 16 }}
          />
        )}
        <Editable
          editing={editing}
          value={slide.title}
          onCommit={(v) => onEdit("title", v)}
          className="font-display"
          style={{ fontSize: 80, fontWeight: 900, color: colors.headerBg, textTransform: "uppercase", lineHeight: 1.0, marginBottom: slide.subtitle ? 8 : 36 }}
        />
        {slide.subtitle && (
          <Editable
            editing={editing}
            value={slide.subtitle}
            onCommit={(v) => onEdit("subtitle", v)}
            className="font-display"
            style={{ fontSize: 52, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 36 }}
          />
        )}
        {slide.bullets && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 12 }}>
            {slide.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 24, fontSize: 38, fontWeight: 600, color: "#334155", lineHeight: 1.3 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: colors.bullet, flexShrink: 0, marginTop: 14 }} />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        )}
        {slide.checks && (
          <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 12 }}>
            {slide.checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 36, fontWeight: 600, color: "#334155" }}>
                <span style={{ width: 48, height: 48, borderRadius: "50%", background: i === slide.checks!.length - 1 ? colors.orange : colors.headerBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✓</span>
                {c}
              </div>
            ))}
          </div>
        )}
        {slide.highlight && (
          <div className="font-display" style={{ marginTop: 36, background: "rgba(26,82,199,0.08)", border: `3px solid ${colors.bullet}55`, borderRadius: 14, padding: "22px 32px", fontSize: 36, color: colors.headerBg, textTransform: "uppercase", letterSpacing: 1 }}>
            {slide.highlight}
          </div>
        )}
      </div>
      <BrandBadge colors={colors} />
    </div>
  );
}
