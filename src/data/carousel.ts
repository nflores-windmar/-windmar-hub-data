export type SlideKind = "cover" | "content" | "cta";

export interface ImageState {
  src: string;
  scale: number;
  posX: number; // 0-100
  posY: number; // 0-100
  opacity: number; // 0-1
}

export interface Bullet {
  text: string;
}

export interface Slide {
  id: string;
  kind: SlideKind;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  tag?: string;
  bullets?: Bullet[];
  highlight?: string;
  cta?: string;
  checks?: string[];
  url?: string;
  image: ImageState | null;
}

export interface BrandColors {
  headerBg: string;
  accent: string;
  orange: string;
  bodyText: string;
  bullet: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
}

export interface CarouselDoc {
  name: string;
  brand: string;
  colors: BrandColors;
  fonts: BrandFonts;
  slides: Slide[];
}

export const defaultColors: BrandColors = {
  headerBg: "#1a52c7",
  accent: "#7eb8f7",
  orange: "#f57c0a",
  bodyText: "#1a2e5a",
  bullet: "#1a52c7",
};

export const defaultFonts: BrandFonts = {
  heading: "Bebas Neue",
  body: "Barlow",
};

// Google Fonts loaded in layout.tsx; family names must match exactly.
export const HEADING_FONTS = [
  "Bebas Neue",
  "Anton",
  "Oswald",
  "League Spartan",
  "Archivo",
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Cinzel",
];

export const BODY_FONTS = [
  "Barlow",
  "Barlow Condensed",
  "Montserrat",
  "Poppins",
  "Lato",
  "Archivo",
];

export const waterCarousel: CarouselDoc = {
  name: "Windmar Water — Cisternas",
  brand: "WindMar Water",
  colors: { ...defaultColors },
  fonts: { ...defaultFonts },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "¿Qué es\nuna cisterna?",
      subtitle: "y por qué es necesidad, no un lujo",
      body: "Un tanque que almacena agua en tu hogar. Sin interrupciones, sin incertidumbre.",
      tag: "tu agua, tu control",
      image: { src: "/img/s1_tanque.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Lo que está sucediendo",
      title: "En Puerto Rico surgen 18 interrupciones de agua al mes.",
      bullets: [
        { text: "Agua turbia después de las lluvias" },
        { text: "Duchas cortadas sin aviso previo" },
        { text: "La incertidumbre de no saber si habrá agua mañana" },
      ],
      image: { src: "/img/3.png", scale: 1.2, posX: 50, posY: 55, opacity: 1 },
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "El impacto real",
      title: "No es solo inconveniencia.",
      subtitle: "Es tu rutina completa.",
      bullets: [
        { text: "No puedes cocinar con agua sucia o sin agua." },
        { text: "No puedes bañar a tus hijos ni atender lo básico." },
        { text: "No puedes confiar en que habrá agua cuando la necesitas." },
      ],
      image: { src: "/img/2.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "La solución",
      title: "La solución existe.",
      subtitle: "Con WindMar Water.",
      checks: [
        "Cisterna Ecotake 500 gal",
        "Filtro UV Viqua — 99.9% bacterias eliminadas",
        "Instalación profesional incluida",
        "Garantía y financiamiento disponible",
      ],
      image: { src: "/img/s1_recalentador.png", scale: 1.2, posX: 0, posY: 50, opacity: 1 },
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Tu plan",
      title: "Así te independizamos del sistema.",
      bullets: [
        { text: "Visitamos tu hogar y evaluamos tu necesidad" },
        { text: "Diseñamos tu sistema personalizado" },
        { text: "Instalamos todo de principio a fin" },
      ],
      highlight: "Tu tienes control total de tu agua 24/7",
      image: { src: "/img/s5_products.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Quieres\nindependencia\nhídrica?",
      subtitle: "Te contactamos gratis, sin compromiso.",
      cta: "Comenta WATER",
      checks: [
        "Consulta 100% gratis",
        "Instalación profesional en Puerto Rico",
        "Financiamiento disponible",
      ],
      url: "windmarhome.com",
      image: { src: "/img/s6_landscape.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
  ],
};
