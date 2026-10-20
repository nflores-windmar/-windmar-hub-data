import type { Metadata } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed, Unbounded, Inter, Space_Mono, Syne } from "next/font/google";
import "./globals.css";

// Syne — neo-brutalist display family (OFL, free for commercial use).
const syne = Syne({
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  subsets: ["latin"],
});
import TopNav from "@/components/TopNav";
import AssistantWidget from "@/components/AssistantWidget";

// UI chrome (Hub / Studio / Lienzo) design system — Unbounded display + Inter body.
const unbounded = Unbounded({
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-unbounded",
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  subsets: ["latin"],
});

// Brutalist UI chrome — monospaced display + body.
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Hub Studio — Windmar",
  description: "Live creative editor for Windmar Home social content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${barlow.variable} ${barlowCondensed.variable} ${unbounded.variable} ${inter.variable} ${spaceMono.variable} ${syne.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Anek+Latin:wght@600;700;800&family=Archivo:wght@400;600;700&family=Bebas+Neue&family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@600;700;800&family=Cinzel:wght@400;700&family=DM+Sans:wght@400;500;600;700&family=League+Spartan:wght@400;700;800&family=Lato:wght@400;700&family=Martian+Mono:wght@400;500;600&family=Montserrat:wght@400;600;700;800&family=Oswald:wght@400;600;700&family=Playfair+Display:wght@400;700;800&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--wm-bg)]">
        <TopNav />
        {children}
        <AssistantWidget />
      </body>
    </html>
  );
}
