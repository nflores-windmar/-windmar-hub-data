"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

const LINKS: { label: string; href: string; ext?: boolean; match?: string }[] = [
  { label: "Inicio", href: "/", match: "/" },
  { label: "Carruseles", href: "/carruseles?c=water", match: "/carruseles" },
  { label: "Lienzo", href: "/lienzo", match: "/lienzo" },
  { label: "Editorial", href: "/editorial_agua.html", ext: true },
  { label: "Content Hub", href: "/windmar_content_hub.html", ext: true },
  { label: "Producción", href: "/produccion.html", ext: true },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="brutal-scope sticky top-0 z-50 border-b-2 border-white bg-[var(--wm-bg)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center border-2 border-white"
            style={{ background: "#ffc145" }}
          >
            <Sparkles size={16} className="text-black" />
          </span>
          <span className="font-unbounded text-sm font-extrabold uppercase tracking-tight text-white">
            WindMar Studio
          </span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {LINKS.map((l) => {
            const active = !l.ext && l.match && pathname === l.match;
            const cls = `px-3 py-1.5 text-sm uppercase tracking-wide transition ${
              active
                ? "bg-[#ffc145] font-bold text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`;
            return l.ext ? (
              <a key={l.label} href={l.href} className={`hidden sm:block ${cls}`}>
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className={cls}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
