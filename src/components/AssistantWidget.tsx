"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const PAGE_LABEL: Record<string, string> = {
  "/": "Inicio / Hub",
  "/carruseles": "Editor de Carruseles",
};

const SUGGESTIONS = [
  "Dame 3 ideas de post para Water esta semana",
  "Escribe un caption para el carrusel de Roofing",
  "Hashtags para batería Anker en Puerto Rico",
];

export default function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs, busy]);

  // Lienzo has its own canvas-aware assistant — don't double up there.
  if (pathname === "/lienzo") return null;

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user" as const, text: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          page: PAGE_LABEL[pathname] ?? pathname,
        }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: res.ok ? data.reply : data.error ?? "Error del asistente",
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: "No pude conectar con el asistente." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Asistente IA"
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center border-2 border-black transition hover:translate-x-[-2px] hover:translate-y-[-2px]"
        style={{ background: "#ffc145", boxShadow: "4px 4px 0 0 #000" }}
      >
        {open ? <X size={22} className="text-black" /> : <Sparkles size={22} className="text-black" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="brutal-scope font-ui fixed bottom-24 right-6 z-[70] flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden border-2 border-white bg-[var(--wm-surface)] text-white" style={{ boxShadow: "6px 6px 0 0 rgba(255,255,255,0.25)" }}>
          <div
            className="flex items-center gap-2 border-b-2 border-black px-5 py-4"
            style={{ background: "#ffc145" }}
          >
            <Sparkles size={18} className="text-black" />
            <div className="leading-tight">
              <div className="font-unbounded text-sm font-extrabold uppercase tracking-tight text-black">
                Asistente WindMar
              </div>
              <div className="text-[11px] text-black/70">Ideas, copys y estrategia</div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-white/55">
                  Hola 👋 Soy tu asistente creativo. Pídeme ideas de contenido, copys,
                  hashtags o guiones para cualquier producto WindMar.
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full border-2 border-white/30 bg-white/5 px-3 py-2 text-left text-[13px] text-white/75 transition hover:border-white hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap border-2 px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "border-black bg-[#1098f7] text-white"
                      : "border-white/20 bg-white/8 text-white/90"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/8 px-3.5 py-2.5 text-[13px] text-white/50">
                  Pensando…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t-2 border-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje…"
              className="flex-1 border-2 border-white/30 bg-black/30 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-white"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-10 w-10 items-center justify-center border-2 border-black text-black transition disabled:opacity-40"
              style={{ background: "#ffc145" }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
