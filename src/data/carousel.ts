export type SlideKind = "cover" | "content" | "cta" | "funfact";

export interface ImageState {
  src: string;
  scale: number;
  posX: number; // 0-100
  posY: number; // 0-100
  opacity: number; // 0-1
  // Pristine source kept when the user removes the photo's background, so the
  // transparency tolerance can be re-derived and the original restored.
  orig?: string;
}

export interface Bullet {
  text: string;
}

export interface Slide {
  id: string;
  kind: SlideKind;
  // Optional per-slide brand override for the header (e.g. a weekly deck that
  // mixes products shows "WindMar Water" on one slide, "WindMar Solar" on the
  // next). Falls back to the document brand when unset.
  brand?: string;
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
  // Stacked layers drawn on top of the base image (e.g. a logo over a doodle).
  // Each is positioned/scaled independently; rendered with object-fit contain.
  overlays?: ImageState[];
  // Strength of the readability veil over the background image (0 = none, the
  // photo shows full strength; 1 = full veil). Defaults to 1.
  veil?: number;
  // Broad per-slide text color overrides (legacy/group level). When unset, text
  // keeps its design default. titleColor covers headings; bodyColor paragraph
  // copy. Individual fields in `textColors` take precedence over these.
  titleColor?: string;
  bodyColor?: string;
  // Per-field color overrides, keyed by element: eyebrow, title, subtitle, body,
  // tag, cta, url, highlight, bullets, checks. Most specific wins.
  textColors?: Record<string, string>;
  // Line-art / data-viz drawn on the slide, in the Blueprint Oscuro visual
  // language from the style guide (thin structural lines + one accent "energy"
  // highlight). "water-journey" is the continuous panoramic pipeline (uses
  // `artIndex` for its segment). The rest are self-contained diagrams/charts the
  // guide defines: energy-flow (SOL→PANEL→INVERSOR→BATERÍA→CASA), coverage-route
  // (dashed island route), roof-scheme (techo + paneles + sol), roof-process
  // (3 etapas: gastado→removido→sellado, la última en acento), bar-chart
  // (barras, la última en acento), line-chart (curva con punto pico) and donut
  // (anillo con arco de acento). Optional artValue/artCaption drive the labels.
  art?:
    | "water-journey"
    | "roof-removal"
    | "energy-flow"
    | "coverage-route"
    | "roof-scheme"
    | "roof-process"
    | "bar-chart"
    | "line-chart"
    | "donut";
  artIndex?: number;
  artValue?: string; // big number for charts, e.g. "-92%", "75%"
  artCaption?: string; // small mono caption, e.g. "CADA AÑO ↑", "SAN JUAN→PONCE"
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
  theme?: "blueprint" | "grid" | "signature";
  // Canvas size in px. Defaults to 1080×1350 (Instagram 4:5 carousel). Story
  // docs set 1080×1920 (9:16) so the same renderer produces vertical Stories.
  size?: { w: number; h: number };
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
      url: "windmar.com",
      image: { src: "/img/s6_landscape.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
  ],
};

// Starter template for a new product carousel: same 6-slide WindMar layout as
// Water, with placeholder copy and no images (so uploads add to the gallery
// without replacing anything — you place photos where you want them).
function productTemplate(opts: {
  name: string;
  brand: string;
  cta: string;
  colors: BrandColors;
}): CarouselDoc {
  const { name, brand, cta, colors } = opts;
  return {
    name,
    brand,
    colors,
    fonts: { ...defaultFonts },
    slides: [
      {
        id: "s1",
        kind: "cover",
        title: "Título principal\ndel producto",
        subtitle: "Subtítulo de apoyo",
        body: "Describe el problema o la promesa en una frase clara.",
        tag: "etiqueta corta",
        image: null,
      },
      {
        id: "s2",
        kind: "content",
        eyebrow: "El problema",
        title: "¿Qué reto resuelve?",
        bullets: [
          { text: "Punto clave 1" },
          { text: "Punto clave 2" },
          { text: "Punto clave 3" },
        ],
        image: null,
      },
      {
        id: "s3",
        kind: "content",
        eyebrow: "El impacto real",
        title: "Por qué importa.",
        subtitle: "El beneficio para el cliente.",
        bullets: [
          { text: "Beneficio 1" },
          { text: "Beneficio 2" },
          { text: "Beneficio 3" },
        ],
        image: null,
      },
      {
        id: "s4",
        kind: "content",
        eyebrow: "La solución",
        title: "La solución existe.",
        subtitle: `Con ${brand}.`,
        checks: [
          "Característica destacada 1",
          "Característica destacada 2",
          "Instalación profesional incluida",
          "Garantía y financiamiento disponible",
        ],
        image: null,
      },
      {
        id: "s5",
        kind: "content",
        eyebrow: "Tu plan",
        title: "Así lo hacemos contigo.",
        bullets: [
          { text: "Visitamos tu hogar y evaluamos tu necesidad" },
          { text: "Diseñamos tu sistema personalizado" },
          { text: "Instalamos todo de principio a fin" },
        ],
        highlight: "El beneficio principal, destacado aquí",
        image: null,
      },
      {
        id: "s6",
        kind: "cta",
        title: "¿Listo para\nempezar?",
        subtitle: "Te contactamos gratis, sin compromiso.",
        cta: `Comenta ${cta}`,
        checks: [
          "Consulta 100% gratis",
          "Instalación profesional en Puerto Rico",
          "Financiamiento disponible",
        ],
        url: "windmar.com",
        image: null,
      },
    ],
  };
}

// Solar follows the official "WindMar Home Design System PR": corporate blue
// #1D429B + deep navy #21274E with the brand orange accent #F89B24, and the
// Bebas Neue (display) + Montserrat (body) type pairing.
export const solarCarousel: CarouselDoc = {
  name: "WindMar Solar — Energía",
  brand: "WindMar Solar",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "El sol,\ntu mejor aliado",
      subtitle: "Energía limpia para tu hogar.",
      body: "Mientras la luz va y viene, el sol te da energía estable todos los días.",
      tag: "energía solar pr",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "La realidad en PR",
      title: "La luz se va,\npero el sol no",
      bullets: [
        { text: "Los apagones son frecuentes en la isla" },
        { text: "La energía no siempre es estable" },
        { text: "Tu hogar merece más tranquilidad" },
      ],
      highlight: "El sol siempre está ahí para ti",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Cómo funciona",
      title: "Tu techo,\ntu energía",
      bullets: [
        { text: "Tus paneles generan de día" },
        { text: "Con batería, la usas de noche o si se va la luz" },
        { text: "Energía propia, todos los días" },
      ],
      highlight: "Tu techo trabajando para ti",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "El mejor momento es hoy",
      title: "Pasarte al sol\nes más fácil hoy",
      checks: [
        "Ahorro desde el primer mes",
        "Energía confiable todo el año",
        "Opciones de financiamiento flexibles",
        "Suma valor a tu hogar",
      ],
      highlight: "Pasar al sol nunca fue tan simple",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "WindMar Home",
      title: "Nosotros\nnos encargamos",
      checks: [
        "Evaluamos tu consumo real",
        "Diseñamos tu sistema a tu medida",
        "Instalación profesional, garantía incluida",
      ],
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Hablamos\nde tu energía?",
      subtitle: "Una consulta gratis, sin compromiso.",
      cta: "Comenta SOLAR",
      checks: [
        "Consulta 100% gratis",
        "Servicio en todo Puerto Rico",
        "Financiamiento disponible",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// Batería · Anker follows the "WindMar × Anker" Claude Design system:
// Montserrat type + the green→cyan→blue brand gradient (#48BA86 / #1CADCA / #00A6E0),
// ink #21274E and the Anker orange #F89B24.
export const ankerCarousel: CarouselDoc = {
  name: "WindMar Batería — Anker",
  brand: "WindMar Batería",
  colors: { headerBg: "#00a6e0", accent: "#48ba86", orange: "#f89b24", bodyText: "#21274e", bullet: "#1cadca" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Apoyo para\ntu negocio",
      subtitle: "Cuando la luz se va, lo esencial sigue encendido.",
      tag: "energía de apoyo",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Apoyo cuando lo necesitas",
      title: "Lo esencial\nsigue encendido",
      bullets: [
        { text: "Mantén tu nevera, punto de venta y luces" },
        { text: "Internet y equipos clave sin interrupción" },
        { text: "Sigues atendiendo durante el apagón" },
      ],
      highlight: "Un apoyo para lo que tu negocio no puede parar",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Cómo funciona",
      title: "Simple\ny automático",
      bullets: [
        { text: "Se carga con tus paneles solares o la red" },
        { text: "Si hay un corte, entra sola al instante" },
        { text: "Tú eliges qué equipos apoyar" },
      ],
      highlight: "Tu energía guardada, lista cuando la necesites",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Para todo negocio",
      title: "Hecho\npara ti",
      checks: [
        "Restaurantes y colmados",
        "Salones y farmacias",
        "Oficinas y talleres",
      ],
      highlight: "Una red de apoyo para lo esencial de tu negocio",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "WindMar lo instala",
      title: "Lo instalamos\ncontigo",
      checks: [
        "Evaluamos qué es esencial en tu negocio",
        "Diseñamos tu apoyo a tu medida",
        "Te decimos con claridad qué puede apoyar",
      ],
      highlight: "Sin sorpresas: expectativas claras desde el inicio",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Hablamos\nde tu negocio?",
      subtitle: "Una consulta gratis, sin compromiso.",
      cta: "Comenta ANKER",
      checks: [
        "Evaluamos qué necesita tu negocio",
        "Servicio en todo Puerto Rico",
        "Garantía incluida",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// Roofing follows its Claude Design system: Montserrat type, WindMar logo navy
// #0B38A8 + logo orange #F6921E, soft blue #93B6D8 and near-black ink #1C1D20.
// Julio · Roofing Inspección — hook de inspección + los 3 elementos técnicos de
// un techo bien hecho + CTA "Cuéntanos sobre tu techo". Estilo blanco con azul
// WindMar (igual que los demás carruseles, sin el fondo azul del tema blueprint).
export const roofingCarousel: CarouselDoc = {
  name: "Julio · Roofing Inspección",
  brand: "WindMar Roofing",
  theme: "grid",
  colors: { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#0b38a8" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "¿Cuándo\nrevisaste\ntu techo?",
      subtitle: "La mayoría no lo piensa hasta que el daño ya está hecho.",
      body: "Conocer el estado de tu techo a tiempo puede ahorrarte miles de dólares.",
      tag: "inspección de techo",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "El clima de Puerto Rico",
      title: "Lo que el clima\nle hace a tu techo",
      bullets: [
        { text: "El calor extremo degrada los materiales" },
        { text: "La lluvia encuentra cualquier grieta" },
        { text: "Los huracanes lo ponen todo a prueba" },
      ],
      highlight: "Pocos materiales aguantan sin el mantenimiento correcto",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "No todo trabajo es igual",
      title: "Los 3 elementos\nde un techo bien hecho",
      checks: [
        "Material y sellado",
        "Instalación sin fallas",
        "Drenaje que sí funciona",
      ],
      highlight: "3 factores deciden si tu techo protege a largo plazo",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Elemento 1",
      title: "Material\ny sellado",
      bullets: [
        { text: "El material correcto para PR no es el mismo que en otros lugares" },
        { text: "Un buen sellado es la primera defensa contra la humedad" },
        { text: "Menos filtraciones, más tranquilidad" },
      ],
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Elementos 2 y 3",
      title: "Instalación\ny drenaje",
      bullets: [
        { text: "Una instalación sin puntos débiles no deja entrar el agua" },
        { text: "Un buen drenaje maneja nuestra lluvia de la isla" },
        { text: "Sin comprometer la estructura de tu hogar" },
      ],
      highlight: "Así tu techo protege de verdad, por años",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "Cuéntanos\nsobre tu techo",
      subtitle: "Sin costo, sin compromiso.",
      cta: "Escribe Roofing",
      checks: [
        "Material que aguanta el clima de PR",
        "Instalación sin puntos débiles",
        "Drenaje que sí funciona",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// WindMar Home is the umbrella/parent brand: instead of one product, it tells
// the story of the whole house — energy, water and protection under one roof.
// Uses the corporate "WindMar Home Design System" (blue #1D429B + navy #21274E
// + orange #F89B24, Bebas Neue display / Montserrat body). Images start null so
// the user places their own photos from the gallery.
export const homeCarousel: CarouselDoc = {
  name: "WindMar Home — La casa",
  brand: "WindMar Home",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Una casa,\ntodas las soluciones",
      subtitle: "Bienvenido a WindMar Home",
      body: "Energía, agua y protección para tu hogar — todo bajo un mismo techo, con un solo equipo de confianza.",
      tag: "tu hogar, independiente",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "El reto de hoy",
      title: "Tu hogar depende de varios sistemas.",
      bullets: [
        { text: "Energía que sube de precio y se va sin aviso" },
        { text: "Agua que no siempre llega cuando la necesitas" },
        { text: "Un techo que enfrenta sol, lluvia y huracanes" },
      ],
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Nuestra misión",
      title: "Reunir todo bajo una sola casa.",
      subtitle: "WindMar Home.",
      bullets: [
        { text: "Un solo equipo que entiende tu hogar completo" },
        { text: "Soluciones que trabajan juntas, no por separado" },
        { text: "Instalación, garantía y soporte en un mismo lugar" },
      ],
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Lo que ofrecemos",
      title: "Cuatro soluciones, una casa.",
      checks: [
        "Solar — energía limpia que reduce tu factura",
        "Batería Anker — respaldo 24/7 cuando se va la luz",
        "Water — cisternas y filtración para agua segura",
        "Roofing — techos que protegen tu inversión",
      ],
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Por qué WindMar",
      title: "Tu hogar, completamente independiente.",
      bullets: [
        { text: "Evaluamos tu hogar como un todo, no por piezas" },
        { text: "Diseñamos un plan integral a tu medida" },
        { text: "Te acompañamos de principio a fin" },
      ],
      highlight: "Una sola casa para energía, agua y protección",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Listo para\nindependizar\ntu hogar?",
      subtitle: "Te contactamos gratis, sin compromiso.",
      cta: "Comenta HOME",
      checks: [
        "Consulta 100% gratis",
        "Soluciones integrales en Puerto Rico",
        "Financiamiento disponible",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// WindMar Home FL (Florida) — same formats as the Puerto Rico carousels, but
// adapted to the Florida market: hurricanes, rising electric rates, the roof
// insurance reality, and Tesla Powerwall (FL does not sell Anker). Tone stays
// simple, positive and reassuring — honest, no over-promising, no politics.
// ─────────────────────────────────────────────────────────────────────────

// FL umbrella brand: the whole house under one roof (solar + battery + roofing).
export const flHomeCarousel: CarouselDoc = {
  name: "WindMar Home FL — La casa",
  brand: "WindMar Home FL",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Una casa,\ntodas las soluciones",
      subtitle: "Solar, baterías y techos bajo un mismo techo.",
      tag: "tu hogar en florida",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "La vida en Florida",
      title: "Tu hogar\nenfrenta mucho",
      bullets: [
        { text: "Tormentas y huracanes cada temporada" },
        { text: "Facturas de luz que siguen subiendo" },
        { text: "Seguros que miran de cerca tu techo" },
      ],
      highlight: "Con el plan correcto, tu casa está lista",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Una sola casa",
      title: "Todo conectado,\nun solo equipo",
      bullets: [
        { text: "Soluciones que trabajan juntas, no por separado" },
        { text: "Un equipo que entiende tu hogar completo" },
        { text: "Instalación, garantía y soporte en un mismo lugar" },
      ],
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Lo que ofrecemos",
      title: "Tres soluciones,\nuna casa",
      checks: [
        "Solar — energía limpia que baja tu factura",
        "Tesla Powerwall — respaldo cuando la red cae",
        "Roofing — un techo sellado y asegurable",
      ],
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Por qué WindMar",
      title: "Listos\npara Florida",
      checks: [
        "Instalador certificado Tesla",
        "Contratista Owens Corning en techos",
        "Desde 2002 — experiencia que respalda",
      ],
      highlight: "Tu hogar, preparado para lo que venga",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Listo para\nproteger\ntu hogar?",
      subtitle: "Te contactamos gratis, sin compromiso.",
      cta: "Comenta HOME",
      checks: [
        "Consulta 100% gratis",
        "Servicio en Orlando, Tampa y Sur de Florida",
        "Financiamiento disponible",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

// FL Roofing / Sellado: insurance + hurricane angle, honest and reassuring.
export const flRoofingCarousel: CarouselDoc = {
  name: "WindMar FL — Sellado y Techos",
  brand: "WindMar Roofing FL",
  colors: { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#0b38a8" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Un techo\nlisto para Florida",
      subtitle: "Sellado, fuerte y asegurable.",
      tag: "techos en florida",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Hecho para Florida",
      title: "Preparado\npara la tormenta",
      bullets: [
        { text: "Resiste sol, lluvia y vientos fuertes" },
        { text: "Cubierta sellada contra filtraciones" },
        { text: "Cumple con el código actual de Florida" },
      ],
      highlight: "Un techo sellado te da tranquilidad todo el año",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Tu seguro lo nota",
      title: "Un buen techo,\nmejor cobertura",
      bullets: [
        { text: "Las aseguradoras miran la edad y condición del techo" },
        { text: "Un techo sellado y al día facilita tu póliza" },
      ],
      highlight: "Cuidar tu techo cuida tu seguro",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Fácil de revisar",
      title: "Atenderlo a tiempo\nes más simple",
      bullets: [
        { text: "Manchas, tejas movidas o agua acumulada" },
        { text: "Una revisión a tiempo evita sorpresas" },
      ],
      highlight: "Pequeños cuidados, techo tranquilo",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "WindMar Home FL",
      title: "Nosotros\nnos encargamos",
      checks: [
        "Inspeccionamos tu techo sin costo",
        "Te decimos qué necesita, claro y simple",
        "Contratista Owens Corning, trabajo profesional",
      ],
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Hablamos\nde tu techo?",
      subtitle: "Una inspección gratis, sin compromiso.",
      cta: "Comenta TECHO",
      checks: [
        "Inspección 100% gratis",
        "Servicio en Orlando, Tampa y Sur de Florida",
        "Financiamiento disponible",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

// FL Solar: reframe. Solar is still a good investment — the real estate/2008
// "balloon" analogy. The problem was bad actors (wrong sizing + hidden financing
// fine print), not the technology. Those companies are gone; serious ones like
// WindMar remain: academy-certified, 25 yrs, transparent financing, 60k+ clients.
export const flSolarCarousel: CarouselDoc = {
  name: "WindMar FL — Solar",
  brand: "WindMar Solar FL",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "La energía solar\nno dejó de\nser rentable.",
      subtitle: "Hoy, más que nunca, importa con quién la instalas.",
      tag: "hablemos claro",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Pongámoslo en perspectiva",
      title: "Lo mismo pasó\ncon los bienes raíces.",
      bullets: [
        { text: "En el 2008, un préstamo tóxico —el «balloon»— hizo daño" },
        { text: "Pero las propiedades nunca dejaron de ser valiosas" },
        { text: "Solo llegaron mejores formas de financiar la inversión" },
      ],
      highlight: "Con el solar es igual: la inversión es buena; hoy se financia mejor.",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Qué pasó antes",
      title: "No falló el sol.\nFalló quién\nlo vendió.",
      bullets: [
        { text: "Vendieron sistemas del tamaño equivocado" },
        { text: "No explicaron las letras pequeñas del financiamiento" },
        { text: "Prometieron lo que no podían cumplir" },
      ],
      highlight: "Esas compañías ya no existen. Hoy quedan las serias.",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Por qué WindMar",
      title: "Profesionales\ncertificados,\n25 años de\nexperiencia.",
      checks: [
        "Certificados por nuestra propia academia",
        "Te ayudamos a escoger el tamaño correcto",
        "Discutimos el acuerdo financiero con transparencia",
      ],
      highlight: "+60,000 clientes con historias de éxito.",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Cómo trabajamos",
      title: "Primero entiendes.\nDespués decides.",
      checks: [
        "Dimensionamos tu sistema según tu consumo real",
        "Te explicamos el financiamiento sin letras pequeñas",
        "Sin prisa y sin presión",
      ],
      highlight: "Con tiempo y con paciencia.",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Quieres\norientarte?",
      subtitle: "Consulta gratuita, sin compromiso.",
      cta: "Comenta SOLAR o visítanos",
      checks: [
        "Te ayudamos a escoger bien tu sistema",
        "Te explicamos todo antes de decidir",
        "Orlando, Tampa y Sur de Florida",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

// FL Battery: Tesla Powerwall. Sleek Tesla palette (near-black + red). Residential
// backup angle — outages, and solar that keeps working through a blackout.
export const flBateriaCarousel: CarouselDoc = {
  name: "WindMar FL — Tesla Powerwall",
  brand: "WindMar Batería FL",
  colors: { headerBg: "#171a20", accent: "#e82127", orange: "#e82127", bodyText: "#171a20", bullet: "#171a20" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Tus paneles\nnecesitan\nalmacenamiento",
      subtitle: "Generan todo el día — pero solos no guardan nada.",
      tag: "hablemos claro",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "El punto que pocos explican",
      title: "El panel solo\nno guarda energía",
      bullets: [
        { text: "Tus paneles producen mientras hay sol" },
        { text: "Por sí solos, no almacenan nada" },
        { text: "Cuando el sol se va, esa energía también" },
      ],
      highlight: "Sin batería, tu solar tiene un límite",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Qué hace una batería",
      title: "Es tu reserva\nde energía",
      bullets: [
        { text: "Guarda lo que tus paneles producen de día" },
        { text: "Te da luz de noche y en los apagones" },
        { text: "Entra sola, sin ruido ni gasolina" },
      ],
      highlight: "Tu energía, lista cuando la necesitas",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Tesla Powerwall",
      title: "La batería que\ncompleta tu sistema",
      checks: [
        "Se controla desde tu teléfono",
        "Aprovecha tu solar al máximo",
        "Respaldo limpio y silencioso",
      ],
      highlight: "Cierra el círculo: generar y guardar",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "WindMar está aquí para orientarte",
      title: "¿Tienes paneles\ny no batería?",
      checks: [
        "No importa si los instalamos nosotros o no",
        "Revisamos tu sistema sin costo",
        "Te orientamos sin compromiso",
      ],
      highlight: "Primero claridad, después decides tú",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Hablamos\nde tu batería?",
      subtitle: "Una consulta gratis, sin compromiso.",
      cta: "Comenta POWERWALL",
      checks: [
        "Consulta 100% gratis",
        "Servicio en Orlando, Tampa y Sur de Florida",
        "Financiamiento disponible",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// WindMar Home FL — English versions. WindMar Home FL is a bilingual brand, so
// each Florida carousel has an EN twin: same layout, colors, fonts and tone as
// its Spanish counterpart, just translated.
// ─────────────────────────────────────────────────────────────────────────

export const flHomeCarouselEn: CarouselDoc = {
  name: "WindMar Home FL — The Home (EN)",
  brand: "WindMar Home FL",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "One home,\nevery solution",
      subtitle: "Solar, batteries and roofing under one roof.",
      tag: "your florida home",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Life in Florida",
      title: "Your home\nfaces a lot",
      bullets: [
        { text: "Storms and hurricanes every season" },
        { text: "Power bills that keep climbing" },
        { text: "Insurers taking a close look at your roof" },
      ],
      highlight: "With the right plan, your home is ready",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "One home",
      title: "All connected,\none team",
      bullets: [
        { text: "Solutions that work together, not apart" },
        { text: "One team that understands your whole home" },
        { text: "Install, warranty and support in one place" },
      ],
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "What we offer",
      title: "Three solutions,\none home",
      checks: [
        "Solar — clean energy that lowers your bill",
        "Tesla Powerwall — backup when the grid goes down",
        "Roofing — a sealed, insurable roof",
      ],
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Why WindMar",
      title: "Ready\nfor Florida",
      checks: [
        "Tesla Certified Installer",
        "Owens Corning roofing contractor",
        "Since 2002 — experience you can count on",
      ],
      highlight: "Your home, ready for whatever comes",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "Ready to\nprotect\nyour home?",
      subtitle: "We'll reach out free, no obligation.",
      cta: "Comment HOME",
      checks: [
        "100% free consultation",
        "Serving Orlando, Tampa & South Florida",
        "Financing available",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

export const flRoofingCarouselEn: CarouselDoc = {
  name: "WindMar FL — Roofing & Sealing (EN)",
  brand: "WindMar Roofing FL",
  colors: { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#0b38a8" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "A roof\nready for Florida",
      subtitle: "Sealed, strong and insurable.",
      tag: "florida roofing",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Built for Florida",
      title: "Ready\nfor the storm",
      bullets: [
        { text: "Stands up to sun, rain and strong winds" },
        { text: "Sealed deck that keeps water out" },
        { text: "Meets Florida's current building code" },
      ],
      highlight: "A sealed roof brings peace of mind all year",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Your insurer notices",
      title: "A better roof,\nbetter coverage",
      bullets: [
        { text: "Insurers look at your roof's age and condition" },
        { text: "A sealed, up-to-date roof makes your policy easier" },
      ],
      highlight: "Caring for your roof cares for your coverage",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Easy to check",
      title: "Handling it early\nis simpler",
      bullets: [
        { text: "Stains, lifted shingles or standing water" },
        { text: "A timely check prevents surprises" },
      ],
      highlight: "Small care, peace of mind",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "WindMar Home FL",
      title: "We've got\nit covered",
      checks: [
        "We inspect your roof at no cost",
        "We tell you what it needs, clear and simple",
        "Owens Corning contractor, professional work",
      ],
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "Let's talk\nabout your roof",
      subtitle: "A free inspection, no obligation.",
      cta: "Comment ROOF",
      checks: [
        "100% free inspection",
        "Serving Orlando, Tampa & South Florida",
        "Financing available",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

export const flSolarCarouselEn: CarouselDoc = {
  name: "WindMar FL — Solar (EN)",
  brand: "WindMar Solar FL",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Solar is still\na smart investment.",
      subtitle: "What changed is who guides you — and how it's financed.",
      tag: "let's be clear",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Let's put it in perspective",
      title: "The same thing\nhappened with\nreal estate.",
      bullets: [
        { text: "In 2008, a toxic loan —the «balloon»— did damage" },
        { text: "But property never stopped being valuable" },
        { text: "Better ways to finance the investment simply arrived" },
      ],
      highlight: "Solar is the same: the investment is good; today it's financed better.",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "What happened before",
      title: "The sun didn't fail.\nWhoever sold it did.",
      bullets: [
        { text: "They sold the wrong-size systems" },
        { text: "They didn't explain the financing fine print" },
        { text: "They promised what they couldn't deliver" },
      ],
      highlight: "Those companies are gone. The serious ones remain.",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Why WindMar",
      title: "Certified pros,\n25 years of\nexperience.",
      checks: [
        "Certified by our own academy",
        "We help you choose the right size",
        "We discuss the financial agreement with transparency",
      ],
      highlight: "60,000+ clients with success stories.",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "How we work",
      title: "First you understand.\nThen you decide.",
      checks: [
        "We size your system to your real usage",
        "We explain the financing with no fine print",
        "No rush, no pressure",
      ],
      highlight: "With time and patience.",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "Want\nguidance?",
      subtitle: "Free consultation, no commitment.",
      cta: "Comment SOLAR or visit us",
      checks: [
        "We help you choose the right system",
        "We explain everything before you decide",
        "Orlando, Tampa & South Florida",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

export const flBateriaCarouselEn: CarouselDoc = {
  name: "WindMar FL — Tesla Powerwall (EN)",
  brand: "WindMar Battery FL",
  colors: { headerBg: "#171a20", accent: "#e82127", orange: "#e82127", bodyText: "#171a20", bullet: "#171a20" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Your panels\nneed\nstorage",
      subtitle: "They generate all day — but alone they store nothing.",
      tag: "let's keep it clear",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "The part few explain",
      title: "Panels alone\ndon't store power",
      bullets: [
        { text: "Your panels produce while the sun is up" },
        { text: "On their own, they store nothing" },
        { text: "When the sun's gone, so is that energy" },
      ],
      highlight: "Without a battery, your solar has a limit",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "What a battery does",
      title: "It's your\nenergy reserve",
      bullets: [
        { text: "Stores what your panels make during the day" },
        { text: "Powers your home at night and in outages" },
        { text: "Kicks in on its own — no noise, no gas" },
      ],
      highlight: "Your energy, ready when you need it",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Tesla Powerwall",
      title: "The battery that\ncompletes your system",
      checks: [
        "Control it from your phone",
        "Gets the most from your solar",
        "Clean, silent backup",
      ],
      highlight: "Closes the loop: generate and store",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "WindMar is here to guide you",
      title: "Have panels\nbut no battery?",
      checks: [
        "Doesn't matter if we installed them or not",
        "We review your system at no cost",
        "We guide you, no obligation",
      ],
      highlight: "Clarity first — then you decide",
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "Let's talk\nabout your battery",
      subtitle: "A free consultation, no obligation.",
      cta: "Comment POWERWALL",
      checks: [
        "100% free consultation",
        "Serving Orlando, Tampa & South Florida",
        "Financing available",
      ],
      url: "@windmarhomefl",
      image: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Red, White & Boricua — "Entonces & Ahora" (Quién carga la cultura). This is a
// docuseries carousel, not a WindMar product: navy + cream gig-poster palette
// (navy #0E1430 / #1F2758, cream #FCF8EF, amber #E0A23C, crimson #C32234) with a
// Playfair Display / Montserrat pairing. Images start null so the duotone figure
// of each icon (one per slide) can be placed from the gallery and zoomed to fill.
// ─────────────────────────────────────────────────────────────────────────
export const entoncesCarousel: CarouselDoc = {
  name: "RWB — Entonces & Ahora",
  brand: "Red White & Boricua",
  colors: { headerBg: "#0e1430", accent: "#e0a23c", orange: "#c32234", bodyText: "#1f2758", bullet: "#e0a23c" },
  fonts: { heading: "Playfair Display", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Quién carga\nla cultura",
      subtitle: "Entonces & Ahora",
      body: "Un relevo boricua, de generación en generación.",
      tag: "Desliza →",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Cine",
      title: "José Ferrer\n→ Benicio del Toro",
      bullets: [
        { text: "Entonces · Primer actor hispano en ganar un Óscar (1950)" },
        { text: "Ahora · Óscar a Mejor Actor de Reparto (2001)" },
      ],
      highlight: "El primero en abrir la puerta — y el que la cruzó después.",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Pantalla",
      title: "Raúl Julia\n→ Luis Guzmán",
      bullets: [
        { text: "Entonces · Gómez en \"The Addams Family\" (1991)" },
        { text: "Ahora · Gómez en \"Wednesday\" (2022)" },
      ],
      highlight: "El mismo Gómez Addams — treinta años después, sigue siendo boricua.",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Música",
      title: "Rafael Hernández Marín\n→ Lin-Manuel Miranda",
      bullets: [
        { text: "Entonces · Compositor de \"Lamento Borincano\" y \"Preciosa\"" },
        { text: "Ahora · Compositor · Hamilton & In the Heights" },
      ],
      highlight: "Dos compositores — la canción boricua nunca dejó de sonar.",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Escena",
      title: "Rita Moreno\n→ Ariana DeBose",
      bullets: [
        { text: "Entonces · EGOT · Óscar por West Side Story (1962)" },
        { text: "Ahora · Óscar por West Side Story (2022) · la misma Anita" },
      ],
      highlight: "La misma Anita, sesenta años después — dos generaciones, dos Óscars.",
      image: null,
    },
    {
      id: "s6",
      kind: "content",
      eyebrow: "Reggaetón",
      title: "Tego Calderón\n→ Bad Bunny",
      bullets: [
        { text: "Entonces · Pionero del reggaetón boricua" },
        { text: "Ahora · La voz boricua que hoy suena global" },
      ],
      highlight: "Del barrio al mundo — sin pedir permiso, sin traducir.",
      image: null,
    },
    {
      id: "s7",
      kind: "content",
      eyebrow: "Representación",
      title: "Antonia Pantoja\n→ Sonia Sotomayor",
      bullets: [
        { text: "Entonces · Fundó ASPIRA · Medalla Presidencial de la Libertad (1996)" },
        { text: "Ahora · Primera jueza Latina del Tribunal Supremo (2009)" },
      ],
      highlight: "De abrir aulas a sentarse en el tribunal más alto.",
      image: null,
    },
    {
      id: "s8",
      kind: "cta",
      title: "Las puertas\nquedaron abiertas",
      subtitle: "Y la próxima generación ya está entrando.",
      cta: "Sigue para más",
      checks: [
        "Red, White & Boricua",
        "Estreno · 12 de agosto",
      ],
      url: "@redwhiteandboricua",
      image: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// AGOSTO 2026 — Puerto Rico. New content, separate from the (already approved)
// July carousels so nothing gets overwritten. One per product, each with its
// own angle: Solar → comercial, Roofing → remoción, Anker → el producto y sus
// conexiones, Water → calidad + negocios que se quedan sin agua. Tone stays
// simple, positive and reassuring. Images start null — placed from the gallery.
// ─────────────────────────────────────────────────────────────────────────

// Agosto · Solar Comercial — solar for businesses (savings, stability, ROI).
export const augSolarCarousel: CarouselDoc = {
  name: "Agosto · Solar Comercial",
  brand: "WindMar Solar",
  theme: "blueprint",
  colors: { headerBg: "#1d429b", accent: "#f89b24", orange: "#f89b24", bodyText: "#21274e", bullet: "#1d429b" },
  fonts: { heading: "Bebas Neue", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Energía solar\npara tu negocio",
      subtitle: "Baja tu factura y gana estabilidad.",
      body: "El sol le da a tu empresa energía propia, estable y más económica todos los días.",
      tag: "solar comercial",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "El reto del negocio",
      title: "La luz comercial\npesa en tus números",
      bullets: [
        { text: "La factura sube mes a mes" },
        { text: "Los cortes frenan tu operación" },
        { text: "Es un gasto fijo que no da tregua" },
      ],
      highlight: "Hay una forma más estable de operar",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Cómo funciona",
      title: "Tu techo comercial\ngenera energía",
      bullets: [
        { text: "Los paneles generan durante el día" },
        { text: "Usas esa energía en tu operación" },
        { text: "Con batería, tienes respaldo si la red falla" },
      ],
      highlight: "Tu negocio con energía propia",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Por qué conviene",
      title: "Una inversión\nque se paga sola",
      checks: [
        "Ahorro desde el primer mes",
        "Crédito federal ITC 30% + incentivos locales",
        "Suma valor a tu propiedad",
        "Financiamiento comercial disponible",
      ],
      highlight: "Los números trabajan a tu favor",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Para todo tipo de negocio",
      title: "Hecho a la\nmedida de tu empresa",
      checks: [
        "Comercios y restaurantes",
        "Oficinas y clínicas",
        "Almacenes y talleres",
      ],
      highlight: "Diseñamos según tu consumo real",
      image: null,
    },
    {
      id: "s6",
      kind: "content",
      eyebrow: "WindMar lo instala",
      title: "Nosotros nos\nencargamos de todo",
      checks: [
        "Evaluamos tu consumo comercial",
        "Diseñamos tu sistema a tu medida",
        "Instalación profesional con garantía",
      ],
      image: null,
    },
    {
      id: "s7",
      kind: "cta",
      title: "¿Hablamos\nde tu negocio?",
      subtitle: "Una consulta gratis, sin compromiso.",
      cta: "Comenta SOLAR",
      checks: [
        "Consulta 100% gratis",
        "Servicio en todo Puerto Rico",
        "Financiamiento comercial disponible",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// Agosto · Roofing Remoción — the removal service, WindMar's differentiator.
export const augRoofingCarousel: CarouselDoc = {
  name: "Agosto · Roofing Remoción",
  brand: "WindMar Roofing",
  theme: "blueprint",
  colors: { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#0b38a8" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "La remoción\nque otros saltan",
      subtitle: "El paso que hace que tu sellado dure.",
      body: "El secreto no es lo que va encima, sino cómo se prepara el techo antes de sellarlo.",
      tag: "remoción de techo",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Lo que nos hace diferentes",
      title: "De los pocos\nque removemos",
      bullets: [
        { text: "La mayoría sella por encima de lo gastado" },
        { text: "Nosotros lo retiramos primero, hasta la base" },
        { text: "Un servicio que pocos ofrecen" },
      ],
      art: "roof-removal",
      artIndex: 0,
      highlight: "Remoción incluida — pocos la hacen",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "El servicio",
      title: "¿Qué es\nuna remoción?",
      bullets: [
        { text: "Retiramos el sellado viejo y desgastado" },
        { text: "Dejamos una superficie limpia y firme" },
      ],
      art: "roof-removal",
      artIndex: 1,
      highlight: "Lista para un sellado nuevo de verdad",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Por qué importa",
      title: "La base\nlo cambia todo",
      bullets: [
        { text: "El sellado nuevo se adhiere mejor" },
        { text: "Protege de verdad, no solo por encima" },
        { text: "Un trabajo que dura años, no meses" },
      ],
      art: "roof-removal",
      artIndex: 2,
      highlight: "Tu techo queda como nuevo",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Cómo se nota",
      title: "Un trabajo\nque se ve y se siente",
      bullets: [
        { text: "Sin burbujas ni desprendimientos" },
        { text: "Acabado parejo y bien sellado" },
        { text: "Tranquilidad en cada lluvia" },
      ],
      art: "roof-removal",
      artIndex: 3,
      highlight: "La diferencia se nota desde el primer aguacero",
      image: null,
    },
    {
      id: "s6",
      kind: "content",
      eyebrow: "Nuestro proceso",
      title: "Así lo\nhacemos bien",
      checks: [
        "Evaluamos tu techo sin costo",
        "Removemos el sellado anterior",
        "Preparamos la superficie",
        "Aplicamos el sistema nuevo",
      ],
      art: "roof-removal",
      artIndex: 4,
      image: null,
    },
    {
      id: "s7",
      kind: "cta",
      title: "¿Tu techo\nnecesita más?",
      subtitle: "Una evaluación gratis, sin compromiso.",
      cta: "Comenta ROOFING",
      checks: [
        "Evaluación 100% gratis",
        "Remoción incluida — pocos la hacen",
        "Financiamiento disponible",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// Agosto · Anker — the product itself: what it does and everything it connects.
export const augAnkerCarousel: CarouselDoc = {
  name: "Agosto · Anker",
  brand: "WindMar Batería",
  theme: "blueprint",
  colors: { headerBg: "#00a6e0", accent: "#48ba86", orange: "#f89b24", bodyText: "#21274e", bullet: "#1cadca" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Anker:\nenergía de respaldo",
      subtitle: "El producto, sus funciones y todo lo que puede conectar.",
      tag: "batería anker",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Qué es",
      title: "Una reserva\nde energía en casa",
      bullets: [
        { text: "Guarda energía de tus paneles o de la red" },
        { text: "Entra sola cuando se va la luz" },
        { text: "Silenciosa y sin gasolina" },
      ],
      highlight: "Energía lista cuando la necesitas",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Sus funciones",
      title: "Lo que\npuede hacer",
      bullets: [
        { text: "Se controla desde tu teléfono" },
        { text: "Monitoreas tu consumo en tiempo real" },
        { text: "Priorizas qué equipos mantener encendidos" },
      ],
      highlight: "Tú decides qué se queda encendido",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "Dónde se conecta",
      title: "A qué\nse puede conectar",
      checks: [
        "Nevera y congelador",
        "Internet, router y equipos de trabajo",
        "Luces esenciales del hogar",
        "Punto de venta de tu negocio",
      ],
      highlight: "Mantén encendido lo que no puede parar",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Cómo funciona",
      title: "Simple\ny automático",
      bullets: [
        { text: "Se carga con tus paneles o la red" },
        { text: "Si hay un corte, entra al instante" },
        { text: "Tú eliges qué equipos apoyar" },
      ],
      highlight: "Tu energía guardada, lista para usar",
      image: null,
    },
    {
      id: "s6",
      kind: "content",
      eyebrow: "Para casa o negocio",
      title: "Se adapta\na lo que necesitas",
      checks: [
        "Hogares que no quieren quedarse a oscuras",
        "Negocios que no pueden detenerse",
        "Sistema modular que crece contigo",
      ],
      image: null,
    },
    {
      id: "s7",
      kind: "cta",
      title: "¿Hablamos\nde tu respaldo?",
      subtitle: "Una consulta gratis, sin compromiso.",
      cta: "Comenta ANKER",
      checks: [
        "Evaluamos qué necesitas conectar",
        "Servicio en todo Puerto Rico",
        "Garantía incluida",
      ],
      url: "windmar.com",
      image: null,
    },
  ],
};

// Agosto · Water Negocios — water quality + businesses running low on water.
export const augWaterCarousel: CarouselDoc = {
  name: "Agua · Cómo llega a tu hogar",
  brand: "WindMar Water",
  theme: "blueprint",
  size: { w: 1080, h: 1920 },
  colors: { ...defaultColors },
  fonts: { ...defaultFonts },
  slides: [
    {
      id: "s1",
      kind: "content",
      veil: 0,
      eyebrow: "Paso 1 · Cisterna",
      title: "Tu agua,\nguardada en casa",
      body: "La cisterna almacena tu propia reserva, siempre lista.",
      image: { src: "/agua/paso-1.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s2",
      kind: "content",
      veil: 0,
      eyebrow: "Paso 2 · Bomba",
      title: "Presión\nen toda la casa",
      body: "La bomba empuja el agua con fuerza a cada tubería.",
      image: { src: "/agua/paso-2.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s3",
      kind: "content",
      veil: 0,
      eyebrow: "Paso 3 · Control",
      title: "Flujo\nbajo control",
      body: "Válvulas y medidor mantienen todo estable y seguro.",
      image: { src: "/agua/paso-3.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s4",
      kind: "content",
      veil: 0,
      eyebrow: "Paso 4 · Filtro",
      title: "Se filtra\ny se purifica",
      body: "El agua se limpia antes de llegar a tus llaves.",
      image: { src: "/agua/paso-4.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s5",
      kind: "content",
      veil: 0,
      eyebrow: "Paso 5 · En tu hogar",
      title: "Agua lista\nen tu hogar",
      body: "Llega limpia a la cocina, el baño y el lavado.",
      image: { src: "/agua/paso-5.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
    {
      id: "s6",
      kind: "cta",
      veil: 0,
      title: "¿Quieres agua\nsiempre lista?",
      subtitle: "Te evaluamos gratis, sin compromiso.",
      cta: "Comenta WATER",
      checks: [
        "Consulta gratis, sin compromiso",
        "Instalación profesional en Puerto Rico",
        "Financiamiento disponible",
      ],
      url: "windmar.com",
      image: { src: "/agua/cta.png", scale: 1, posX: 50, posY: 50, opacity: 1 },
    },
  ],
};

// ── Instagram Stories · Fun Facts (9:16, 1080×1920) ──
// Daily-story format, one fun fact per slide, blueprint-grid look (white bg +
// faint blue grid + blue text). Reassuring, no-fear tone. Big optional stat in
// `highlight`, the fact in `title`, a support line in `body`. 6 per product.
const FF_FONTS = { heading: "Montserrat", body: "Montserrat" };
const FF_SIZE = { w: 1080, h: 1920 };

export const funfactSolar: CarouselDoc = {
  name: "Stories · Solar Fun Facts",
  brand: "WindMar Solar",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24", bodyText: "#1c1d20", bullet: "#1d429b" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", tag: "¿Sabías que?", highlight: "300+", title: "Días de sol al año en Puerto Rico", body: "Una de las islas con más potencial solar del Caribe.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", tag: "¿Sabías que?", highlight: "25", title: "Años de vida útil de un panel moderno", body: "Siguen produciendo energía por décadas.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", tag: "¿Sabías que?", title: "El sol sale gratis cada mañana", body: "Tu techo puede convertir esa luz en ahorro.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", tag: "¿Sabías que?", highlight: "0", title: "Ruido al producir tu energía", body: "El sol trabaja en silencio, todos los días.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", tag: "¿Sabías que?", highlight: "1h", title: "De sol alcanza para mucho", body: "La luz que llega a la Tierra en una hora es enorme.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", tag: "¿Sabías que?", highlight: "100%", title: "Energía limpia y renovable", body: "Sin humo, sin emisiones: solo sol.", url: "windmar.com", image: null },
  ],
};

export const funfactRoofing: CarouselDoc = {
  name: "Stories · Roofing Fun Facts",
  brand: "WindMar Roofing",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#0b38a8" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", tag: "¿Sabías que?", title: "Tu techo es la primera defensa del hogar", body: "Cada día, contra sol, lluvia y viento.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", tag: "Servicio de remoción", title: "Ofrecemos remoción de techo", body: "Somos de las pocas compañías en la isla que lo hacen.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", tag: "Con garantía", title: "Diferentes tipos de garantía", body: "Escoges la cobertura que mejor te conviene.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", tag: "Todo en uno", title: "De la remoción a la instalación", body: "Un solo equipo se encarga de todo el proceso.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", tag: "¿Sabías que?", title: "Un techo bien hecho dura décadas", body: "El mantenimiento a tiempo alarga su vida.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", tag: "¿Sabías que?", title: "Conocer tu techo da tranquilidad", body: "Una inspección a tiempo evita sorpresas.", url: "windmar.com", image: null },
  ],
};

export const funfactWater: CarouselDoc = {
  name: "Stories · Water Fun Facts",
  brand: "WindMar Water",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#1a52c7", accent: "#7eb8f7", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#1a52c7" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", tag: "¿Sabías que?", highlight: "60%", title: "De tu cuerpo es agua", body: "Beber agua limpia es cuidarte cada día.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", tag: "¿Sabías que?", title: "El agua limpia sabe mejor", body: "Sin sabores raros: solo agua fresca.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", tag: "¿Sabías que?", highlight: "0", title: "Botellas plásticas de más", body: "Filtrar en casa cuida tu bolsillo y la isla.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", tag: "¿Sabías que?", highlight: "24/7", title: "Agua lista cuando la necesitas", body: "Directo de tu llave, todo el día.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", tag: "¿Sabías que?", title: "Cocinar con agua filtrada se nota", body: "Café, sopas y todo sabe más limpio.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", tag: "¿Sabías que?", highlight: "PR", title: "Pensado para el agua de la isla", body: "Un sistema que se adapta a lo que necesitas.", url: "windmar.com", image: null },
  ],
};

export const funfactBateria: CarouselDoc = {
  name: "Stories · Batería Fun Facts",
  brand: "WindMar Batería",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#1d429b", accent: "#00a6e0", orange: "#48ba86", bodyText: "#21274e", bullet: "#1cadca" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", tag: "Lo esencial", title: "Mantén lo esencial encendido", body: "Nevera, luces y tus equipos clave, siempre con energía.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", tag: "Eventos y negocios", title: "Energía para tu evento o negocio", body: "Lleva corriente donde la necesites, sin ruido ni humo.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", tag: "Para apartamentos", title: "También hay opción para apartamentos", body: "Soluciones compactas que caben en tu espacio.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", tag: "Siempre contigo", highlight: "24/7", title: "Siempre lista y conectada", body: "Se recarga sola y está ahí cuando la necesitas.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", tag: "Va contigo", title: "Energía que te acompaña", body: "Adentro o afuera, tú decides dónde usarla.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", tag: "Conversemos", title: "Energía cuando y donde quieras", body: "Cuéntanos tu día a día y te ayudamos.", subtitle: "Escribe Batería", url: "windmar.com", image: null },
  ],
};

export const funfactHome: CarouselDoc = {
  name: "Stories · Energía / Home Fun Facts",
  brand: "WindMar Home",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24", bodyText: "#1c1d20", bullet: "#1d429b" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", tag: "Nuestra misión", title: "Todos tus asuntos energéticos, resueltos con nosotros", body: "Techo, solar, batería y agua, con un solo equipo.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", tag: "Siempre contigo", highlight: "24/7", title: "Servicio cuando lo necesitas", body: "Estamos disponibles todos los días del año.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", tag: "Nuestra meta", title: "Estar para la comunidad", body: "Crecer junto a Puerto Rico, familia por familia.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", tag: "Visítanos", highlight: "4", title: "Showrooms en toda la isla", body: "San Juan, Mayagüez, Hatillo y Ponce.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", tag: "Todo en uno", highlight: "1", title: "Un solo lugar para tu energía", body: "Todas las soluciones bajo un mismo techo.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", tag: "Conversemos", title: "Todo empieza con una conversación", body: "Visítanos o escríbenos, sin compromiso.", subtitle: "Escribe Home", url: "windmar.com", image: null },
  ],
};

// Empresa & Comunidad — historias de marca: trayectoria, alianzas (Cruz Roja),
// Fundación WindMar / "Arte que Ilumina", financiamiento y redes. Datos
// verificados vía windmar.com y prensa.
export const funfactEmpresa: CarouselDoc = {
  name: "Stories · Empresa & Comunidad",
  brand: "WindMar Home",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24", bodyText: "#1c1d20", bullet: "#1d429b" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", tag: "Desde 2002", highlight: "+20", title: "Años impulsando la energía de PR", body: "Hicimos el primer parque solar del país.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", tag: "Confianza", highlight: "+50,000", title: "Baterías Tesla instaladas", body: "La primera compañía del mundo en lograrlo.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", tag: "Alianza", title: "Aliados con la Cruz Roja", body: "Baterías de respaldo para los servicios biomédicos de la isla.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", tag: "Trayectoria", highlight: "+1M", title: "Paneles solares instalados en PR", body: "Energía limpia para miles de familias.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", tag: "Financiamiento", highlight: "3", title: "Formas de financiar tu proyecto", body: "PPA, préstamo personal o Home Depot Credit Card.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", tag: "Síguenos", title: "Conéctate con WindMar", body: "Síguenos en @windmarhome y visita windmar.com.", subtitle: "@windmarhome", url: "windmar.com", image: null },
  ],
};

// ── Stories · Datos del día, separados POR SEMANA (9:16, 1080×1920) ──
// One designable story per day. Molde semanal fijo (7 datos):
//   • 1 por producto → Water, Roofing, Solar, Anker
//   • 1 de la compañía → booths en Home Depot / malls, variedad de
//     financiamientos, servicios que ofrecemos, eficiencia, garantías, etc.
//   • 1 de alianzas → Cruz Roja, PLATEA, vocero, fundación, etc.
//   • 1 general
// Estilo grid original (fondo blanco + cuadrícula azul tenue): marca del
// producto arriba, píldora "¿Sabías que?", número grande naranja (highlight),
// dato en azul (title) y línea de apoyo gris (body). Azul + naranja. Imagen
// null para que el usuario coloque su foto. El molde se replica en Semanas 2–5.
export const storiesSem1: CarouselDoc = {
  name: "Stories · Semana 1 · 1–7 ago",
  brand: "WindMar Home",
  theme: "grid",
  size: FF_SIZE,
  colors: { headerBg: "#1a52c7", accent: "#7eb8f7", orange: "#f89b24", bodyText: "#1c1d20", bullet: "#1a52c7" },
  fonts: FF_FONTS,
  slides: [
    { id: "s1", kind: "funfact", brand: "WindMar Water", tag: "¿Sabías que?", highlight: "24/7", title: "Agua lista cuando la necesitas", body: "Directo de tu llave o tu cisterna, todo el día.", url: "windmar.com", image: null },
    { id: "s2", kind: "funfact", brand: "WindMar Roofing", tag: "¿Sabías que?", title: "Tu techo es la primera defensa del hogar", body: "Revisarlo y sellarlo a tiempo protege tu inversión.", url: "windmar.com", image: null },
    { id: "s3", kind: "funfact", brand: "WindMar Solar", tag: "¿Sabías que?", highlight: "300+", title: "Días de sol al año en Puerto Rico", body: "Tu techo puede convertir esa luz en ahorro.", url: "windmar.com", image: null },
    { id: "s4", kind: "funfact", brand: "WindMar Batería", tag: "¿Sabías que?", title: "Energía aunque se vaya la luz", body: "Una batería Anker mantiene nevera, luces e internet.", url: "windmar.com", image: null },
    { id: "s5", kind: "funfact", brand: "WindMar Home", tag: "¿Sabías que?", title: "Estamos cerca de ti", body: "Nos encuentras en booths de Home Depot y en los malls de la isla.", url: "windmar.com", image: null },
    { id: "s6", kind: "funfact", brand: "WindMar Home", tag: "¿Sabías que?", title: "Aliados con la Cruz Roja", body: "Instalamos baterías de respaldo para sus servicios biomédicos.", url: "windmar.com", image: null },
    { id: "s7", kind: "funfact", brand: "WindMar Home", tag: "¿Sabías que?", highlight: "+20", title: "Años impulsando la energía de PR", body: "Hicimos el primer parque solar del país.", url: "windmar.com", image: null },
  ],
};

// ── Facebook · Posts estáticos (1:1, 1080×1080) ──
// Single-art pieces for the calendar's FB_Estatico_* slots. One clean square
// slide each: brand eyebrow + punchy headline + one support line. Image left
// null so the user drops their own photo from the gallery. Reassuring, no-fear
// tone. Uses the grid (white + faint blue grid) theme so it reads clean even
// before a photo is added.
const FB_SIZE = { w: 1080, h: 1080 };
function fbStatic(
  brand: string,
  colors: { headerBg: string; accent: string; orange: string },
  eyebrow: string,
  title: string,
  body: string
): CarouselDoc {
  return {
    name: eyebrow,
    brand,
    theme: "grid",
    size: FB_SIZE,
    colors: { ...defaultColors, ...colors, bullet: colors.headerBg },
    fonts: { ...defaultFonts },
    slides: [
      { id: "s1", kind: "content", veil: 1, eyebrow: brand, title, body, url: "windmar.com", image: null },
    ],
  };
}

export const fbEstaticoSolar = fbStatic(
  "WindMar Solar",
  { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24" },
  "FB Estático · Solar",
  "Tu factura de luz,\nbajo control",
  "Energía solar para tu hogar o negocio en Puerto Rico."
);
export const fbEstaticoWater = fbStatic(
  "WindMar Water",
  { headerBg: "#1a52c7", accent: "#7eb8f7", orange: "#f57c0a" },
  "FB Estático · Agua",
  "Agua limpia,\nsiempre lista",
  "Directo de tu llave, todos los días."
);
export const fbEstaticoRoofing = fbStatic(
  "WindMar Roofing",
  { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f89b24" },
  "FB Estático · Roofing",
  "Un techo\nque protege",
  "Sellado y techos que aguantan el clima de la isla."
);
export const fbEstaticoBateria = fbStatic(
  "WindMar Batería",
  { headerBg: "#0f7d8c", accent: "#48ba86", orange: "#00a6e0" },
  "FB Estático · Batería",
  "Energía\naunque se vaya la luz",
  "Respaldo de batería confiable para tu hogar."
);
export const fbEstaticoHome = fbStatic(
  "WindMar Home",
  { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24" },
  "FB Estático · Home",
  "Tu hogar,\nmás eficiente",
  "Soluciones de energía para vivir mejor."
);
export const fbEstaticoComunidad = fbStatic(
  "WindMar Home",
  { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24" },
  "FB · Comunidad",
  "Con Puerto Rico,\nsiempre",
  "Comprometidos con nuestra gente y nuestra isla."
);
// Post general "Qué ofrecemos" (mapea al slot del calendario
// FB_Foto_General_QueOfrecemos). Presenta los servicios de WindMar en una sola
// arte, siguiendo la GUÍA BLUEPRINT: fondo azul dinámico, título blanco y lista
// de servicios con checks (último en naranja). Imagen null para que el usuario
// coloque su foto si quiere.
export const fbEstaticoQueOfrecemos: CarouselDoc = {
  name: "FB Estático · Qué ofrecemos",
  brand: "WindMar Home",
  theme: "blueprint",
  size: FB_SIZE,
  colors: { headerBg: "#1d429b", accent: "#7eb8f7", orange: "#f89b24", bodyText: "#1c1d20", bullet: "#1d429b" },
  fonts: { ...defaultFonts },
  slides: [
    {
      id: "s1",
      kind: "content",
      veil: 0,
      eyebrow: "WindMar Home",
      title: "Todo tu hogar,\nen un solo lugar",
      checks: ["Energía solar", "Roofing y sellado", "Sistemas de agua", "Baterías de respaldo"],
      url: "windmar.com",
      image: null,
    },
  ],
};

// ── BLUEPRINT OSCURO · ESTILO FIRMA ─────────────────────────────────────────
// El primer carrusel bajo el nuevo concepto de la guía de estilo: fondo oscuro
// con grano de película, grilla de plano, esquinas de registro y UN acento neón
// por producto (aquí Solar = amarillo). Titular en Anton, datos en mono. Las
// imágenes van en null para que el usuario coloque sus propias fotos de PR/FL.
export const sigSolarCarousel: CarouselDoc = {
  name: "Blueprint Oscuro · Solar (PR & FL)",
  brand: "WindMar Home",
  theme: "signature",
  colors: {
    headerBg: "#0a0e18",
    accent: "#ffd24a", // neón Solar
    orange: "#f57c0a", // acento maestro de marca
    bodyText: "#e9f4ff",
    bullet: "#ffd24a",
  },
  fonts: { heading: "Anton", body: "Barlow" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      eyebrow: "SOLAR · PUERTO RICO & FLORIDA",
      title: '¿POR QUÉ\n<span style="color:#ffd24a">SOLAR?</span>',
      subtitle: "Tu techo puede trabajar para ti.",
      tag: "DESLIZA →",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "EL PROBLEMA",
      title: 'TU FACTURA\nSOLO <span style="color:#ffd24a">SUBE</span>',
      body: "El sol no cobra. Tu factura de luz sí — y cada año un poco más.",
      art: "line-chart",
      artCaption: "CADA AÑO ↑",
      url: "18.4655° N · 66.1057° W",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "CÓMO FUNCIONA",
      title: "ASÍ TRABAJA\nTU TECHO",
      bullets: [
        { text: "El panel capta el sol y genera energía." },
        { text: "De día alimentas tu casa, gratis." },
        { text: "El excedente carga tu batería." },
        { text: "De noche usas lo que guardaste." },
      ],
      art: "energy-flow",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "EL RESULTADO",
      title: 'HASTA\n<span style="color:#ffd24a">-92%</span>',
      subtitle: "EN TU FACTURA DE LUZ",
      body: "Con el sistema correcto, tu factura casi desaparece.",
      art: "bar-chart",
      artValue: "-92%",
      artCaption: "TU FACTURA",
      image: null,
    },
    {
      id: "s5",
      kind: "cta",
      title: 'EMPIEZA\n<span style="color:#ffd24a">HOY</span>',
      subtitle: "Evaluación gratis, sin compromiso.",
      cta: "EVALÚA GRATIS",
      url: "windmar.com",
      image: null,
    },
  ],
};

// Registry of every product carousel. The studio loads one of these by id and
// saves each independently, so Water keeps its own design + photos while Solar,
// Batería and Roofing each get their own editable area.
// ── Blueprint Oscuro rollout ───────────────────────────────────────────────
// The whole studio moves to the dark "signature" look from the style guide:
// near-black canvas, ink blueprint grid, film grain, and ONE neon accent per
// product (Martian Mono for data). Rather than rewrite every doc, we transform
// the registry — forcing theme:"signature" and each product's neon accent while
// keeping the slide content, fonts and images untouched. Accents come straight
// from guia-estilo.html: Solar amarillo, Agua/Roofing azul pastel, Anker verde,
// Powerwall rojo, Home naranja (also the master brand/CTA accent).
const SIG_ACCENT: Record<string, string> = {
  sig_solar: "#ffd24a",
  roofing_jul: "#9fd4ff",
  aug_solar: "#ffd24a",
  aug_roofing: "#9fd4ff",
  aug_anker: "#54e0a6",
  aug_water: "#9fd4ff",
  entonces: "#e0a23c", // Red White & Boricua conserva su dorado
  flhome: "#ff8a3d",
  flroofing: "#9fd4ff",
  flsolar: "#ffd24a",
  flbateria: "#ff4d4d", // Tesla Powerwall rojo energía
  flhome_en: "#ff8a3d",
  flroofing_en: "#9fd4ff",
  flsolar_en: "#ffd24a",
  flbateria_en: "#ff4d4d",
  ff_solar: "#ffd24a",
  ff_roofing: "#9fd4ff",
  ff_water: "#9fd4ff",
  ff_bateria: "#54e0a6",
  ff_home: "#ff8a3d",
  ff_empresa: "#ff8a3d",
  st_sem1: "#ff8a3d",
  fb_est_solar: "#ffd24a",
  fb_est_water: "#9fd4ff",
  fb_est_roofing: "#9fd4ff",
  fb_est_bateria: "#54e0a6",
  fb_est_home: "#ff8a3d",
  fb_est_comunidad: "#ff8a3d",
  fb_est_queofrecemos: "#ff8a3d",
};

// Give a headline its Blueprint Oscuro "pop": color the final word (the punch)
// in the product's neon accent. No-ops if the title already carries a colored
// span, so it's safe to re-run on templates and on previously-saved designs.
export function highlightTitle(title: string, accent: string): string {
  if (!title || /<span/i.test(title)) return title;
  const m = title.match(/^([\s\S]*?)(\S+)(\s*)$/);
  if (!m) return title;
  return `${m[1]}<span style="color:${accent}">${m[2]}</span>${m[3]}`;
}

function toSignature(doc: CarouselDoc, accent: string): CarouselDoc {
  return {
    ...doc,
    theme: "signature",
    colors: {
      ...doc.colors,
      headerBg: "#0a0e18",
      accent,
      bullet: accent,
      bodyText: "#e9f4ff",
      orange: "#f57c0a", // acento maestro de marca / CTA
    },
    // Highlight a key word per headline so every deck gets the accent pop.
    slides: doc.slides.map((s) => ({ ...s, title: highlightTitle(s.title, accent) })),
  };
}

const baseCarousels: Record<string, CarouselDoc> = {
  sig_solar: sigSolarCarousel,
  roofing_jul: roofingCarousel,
  aug_solar: augSolarCarousel,
  aug_roofing: augRoofingCarousel,
  aug_anker: augAnkerCarousel,
  aug_water: augWaterCarousel,
  entonces: entoncesCarousel,
  flhome: flHomeCarousel,
  flroofing: flRoofingCarousel,
  flsolar: flSolarCarousel,
  flbateria: flBateriaCarousel,
  flhome_en: flHomeCarouselEn,
  flroofing_en: flRoofingCarouselEn,
  flsolar_en: flSolarCarouselEn,
  flbateria_en: flBateriaCarouselEn,
  ff_solar: funfactSolar,
  ff_roofing: funfactRoofing,
  ff_water: funfactWater,
  ff_bateria: funfactBateria,
  ff_home: funfactHome,
  ff_empresa: funfactEmpresa,
  st_sem1: storiesSem1,
  fb_est_solar: fbEstaticoSolar,
  fb_est_water: fbEstaticoWater,
  fb_est_roofing: fbEstaticoRoofing,
  fb_est_bateria: fbEstaticoBateria,
  fb_est_home: fbEstaticoHome,
  fb_est_comunidad: fbEstaticoComunidad,
  fb_est_queofrecemos: fbEstaticoQueOfrecemos,
};

// Every product now renders in the dark Blueprint Oscuro look (signature theme)
// with its own neon accent. Any id without a mapped accent keeps its original.
export const carousels: Record<string, CarouselDoc> = Object.fromEntries(
  Object.entries(baseCarousels).map(([id, doc]) => [
    id,
    SIG_ACCENT[id] ? toSignature(doc, SIG_ACCENT[id]) : doc,
  ])
);

const _CAROUSEL_PRODUCTS: { id: string; label: string; brand: string; grad: string; group?: string }[] = [
  { id: "sig_solar", label: "Solar · Blueprint Oscuro", brand: "WindMar Home", grad: "linear-gradient(135deg,#0a0e18,#1a52c7,#ffd24a)", group: "★ Blueprint Oscuro" },
  { id: "roofing_jul", label: "Julio · Roofing Inspección", brand: "WindMar Roofing", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)", group: "Carruseles · Puerto Rico" },
  { id: "aug_solar", label: "Agosto · Solar Comercial", brand: "WindMar Solar", grad: "linear-gradient(135deg,#1d429b,#f89b24)", group: "Carruseles · Puerto Rico" },
  { id: "aug_roofing", label: "Agosto · Roofing Remoción", brand: "WindMar Roofing", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)", group: "Carruseles · Puerto Rico" },
  { id: "aug_anker", label: "Agosto · Anker", brand: "WindMar Batería", grad: "linear-gradient(135deg,#48ba86,#1cadca,#00a6e0)", group: "Carruseles · Puerto Rico" },
  { id: "aug_water", label: "Agosto · Agua (Cómo llega a tu hogar)", brand: "WindMar Water", grad: "linear-gradient(135deg,#1a52c7,#7eb8f7)", group: "Carruseles · Puerto Rico" },
  { id: "entonces", label: "RWB · Entonces & Ahora", brand: "Red White & Boricua", grad: "linear-gradient(135deg,#0e1430,#1f2758,#e0a23c)", group: "Carruseles · Puerto Rico" },
  { id: "ff_solar", label: "Solar Fun Facts", brand: "WindMar Solar", grad: "linear-gradient(135deg,#1d429b,#f89b24)", group: "Stories · Fun Facts (PR)" },
  { id: "ff_roofing", label: "Roofing Fun Facts", brand: "WindMar Roofing", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)", group: "Stories · Fun Facts (PR)" },
  { id: "ff_water", label: "Water Fun Facts", brand: "WindMar Water", grad: "linear-gradient(135deg,#1a52c7,#7eb8f7)", group: "Stories · Fun Facts (PR)" },
  { id: "ff_bateria", label: "Batería Fun Facts", brand: "WindMar Batería", grad: "linear-gradient(135deg,#48ba86,#1cadca,#00a6e0)", group: "Stories · Fun Facts (PR)" },
  { id: "ff_home", label: "Energía / Home Fun Facts", brand: "WindMar Home", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)", group: "Stories · Fun Facts (PR)" },
  { id: "ff_empresa", label: "Empresa & Comunidad", brand: "WindMar Home", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)", group: "Stories · Fun Facts (PR)" },
  { id: "st_sem1", label: "Semana 1 · 1–7 ago", brand: "WindMar Home", grad: "linear-gradient(135deg,#1d429b,#7eb8f7)", group: "Stories · Datos por semana (PR)" },
  { id: "flhome", label: "La casa", brand: "WindMar Home FL", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)", group: "Florida · Español" },
  { id: "flroofing", label: "Sellado y Techos", brand: "WindMar Roofing FL", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)", group: "Florida · Español" },
  { id: "flsolar", label: "Solar", brand: "WindMar Solar FL", grad: "linear-gradient(135deg,#1d429b,#f89b24)", group: "Florida · Español" },
  { id: "flbateria", label: "Tesla Powerwall", brand: "WindMar Batería FL", grad: "linear-gradient(135deg,#171a20,#e82127)", group: "Florida · Español" },
  { id: "flhome_en", label: "The Home", brand: "WindMar Home FL", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)", group: "Florida · English" },
  { id: "flroofing_en", label: "Roofing & Sealing", brand: "WindMar Roofing FL", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)", group: "Florida · English" },
  { id: "flsolar_en", label: "Solar", brand: "WindMar Solar FL", grad: "linear-gradient(135deg,#1d429b,#f89b24)", group: "Florida · English" },
  { id: "flbateria_en", label: "Tesla Powerwall", brand: "WindMar Battery FL", grad: "linear-gradient(135deg,#171a20,#e82127)", group: "Florida · English" },
  { id: "fb_est_solar", label: "Solar", brand: "WindMar Solar", grad: "linear-gradient(135deg,#1d429b,#f89b24)", group: "Facebook · Estáticos (PR)" },
  { id: "fb_est_water", label: "Agua", brand: "WindMar Water", grad: "linear-gradient(135deg,#1a52c7,#7eb8f7)", group: "Facebook · Estáticos (PR)" },
  { id: "fb_est_roofing", label: "Roofing", brand: "WindMar Roofing", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)", group: "Facebook · Estáticos (PR)" },
  { id: "fb_est_bateria", label: "Batería", brand: "WindMar Batería", grad: "linear-gradient(135deg,#0f7d8c,#48ba86,#00a6e0)", group: "Facebook · Estáticos (PR)" },
  { id: "fb_est_home", label: "Home / Energía", brand: "WindMar Home", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)", group: "Facebook · Estáticos (PR)" },
  { id: "fb_est_comunidad", label: "Comunidad", brand: "WindMar Home", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)", group: "Facebook · Estáticos (PR)" },
  { id: "fb_est_queofrecemos", label: "Qué ofrecemos (Blueprint)", brand: "WindMar Home", grad: "linear-gradient(135deg,#1d429b,#2f63c4,#f89b24)", group: "Facebook · Estáticos (PR)" },
];

// Every picker chip now previews the dark Blueprint Oscuro look: near-black →
// ink blue → the product's neon accent, matching the slides themselves.
export const CAROUSEL_PRODUCTS = _CAROUSEL_PRODUCTS.map((p) => ({
  ...p,
  grad: SIG_ACCENT[p.id]
    ? `linear-gradient(135deg,#0a0e18,#12213f,${SIG_ACCENT[p.id]})`
    : p.grad,
}));
