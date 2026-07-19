export type SlideKind = "cover" | "content" | "cta";

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
  theme?: "blueprint";
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
        url: "windmarhome.com",
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
      url: "windmarhome.com",
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
      url: "windmarhome.com",
      image: null,
    },
  ],
};

// Roofing follows its Claude Design system: Montserrat type, WindMar logo navy
// #0B38A8 + logo orange #F6921E, soft blue #93B6D8 and near-black ink #1C1D20.
export const roofingCarousel: CarouselDoc = {
  name: "WindMar Roofing — Techos",
  brand: "WindMar Roofing",
  colors: { headerBg: "#0b38a8", accent: "#93b6d8", orange: "#f6921e", bodyText: "#1c1d20", bullet: "#0b38a8" },
  fonts: { heading: "Montserrat", body: "Montserrat" },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "Un sellado\nque sí dura",
      subtitle: "Empieza por hacerlo bien desde la base.",
      body: "El secreto no es lo que se aplica encima, sino cómo se prepara el techo antes de sellarlo.",
      tag: "sellado de techo",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Lo que nos hace diferentes",
      title: "Somos los únicos\nque removemos",
      bullets: [
        { text: "La mayoría sella por encima de lo que ya está gastado" },
        { text: "Nosotros lo retiramos primero, hasta la base" },
        { text: "Un servicio que solo encuentras aquí" },
      ],
      highlight: "Remoción incluida — solo con WindMar",
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
      highlight: "Tu techo queda como nuevo",
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Nuestro proceso",
      title: "Así lo\nhacemos bien",
      checks: [
        "Evaluamos tu techo sin costo",
        "Removemos el sellado anterior",
        "Preparamos la superficie",
        "Aplicamos el sistema nuevo",
      ],
      image: null,
    },
    {
      id: "s6",
      kind: "cta",
      title: "¿Tu techo\nnecesita más?",
      subtitle: "Una evaluación gratis, sin compromiso.",
      cta: "Comenta ROOFING",
      checks: [
        "Evaluación 100% gratis",
        "Remoción incluida — solo con nosotros",
        "Financiamiento disponible",
      ],
      url: "windmarhome.com",
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
      url: "windmarhome.com",
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
      title: "La energía solar\nsigue siendo\nuna buena inversión.",
      subtitle: "Cambió quién te acompaña y cómo se financia.",
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
      url: "windmarhome.com",
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
      url: "windmarhome.com",
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
      url: "windmarhome.com",
      image: null,
    },
  ],
};

// Agosto · Water Negocios — water quality + businesses running low on water.
export const augWaterCarousel: CarouselDoc = {
  name: "Agosto · Water Negocios",
  brand: "WindMar Water",
  theme: "blueprint",
  colors: { ...defaultColors },
  fonts: { ...defaultFonts },
  slides: [
    {
      id: "s1",
      kind: "cover",
      title: "El agua\nde tu negocio",
      subtitle: "Calidad y suministro constante, sin interrupciones.",
      body: "Un sistema propio mantiene tu negocio con agua limpia y lista, todos los días.",
      tag: "agua para negocios",
      image: null,
    },
    {
      id: "s2",
      kind: "content",
      eyebrow: "Lo que está pasando",
      title: "Muchos negocios\nse quedan sin agua",
      bullets: [
        { text: "Interrupciones que frenan el servicio" },
        { text: "Agua turbia después de las lluvias" },
        { text: "Depender de que hoy sí llegue" },
      ],
      highlight: "Con un buen sistema, tu negocio no se detiene",
      image: null,
    },
    {
      id: "s3",
      kind: "content",
      eyebrow: "Por qué importa",
      title: "El agua es parte\nde tu operación",
      bullets: [
        { text: "Restaurantes, salones y clínicas la usan a diario" },
        { text: "Sin agua, el servicio se detiene" },
        { text: "Tus clientes notan la diferencia" },
      ],
      highlight: "Mantener el agua es mantener tu negocio abierto",
      image: null,
    },
    {
      id: "s4",
      kind: "content",
      eyebrow: "La solución",
      title: "Reserva y calidad\nen un solo sistema",
      checks: [
        "Cisterna que almacena tu agua",
        "Filtro UV — 99.9% de bacterias eliminadas",
        "Agua limpia y lista cuando la necesitas",
        "Instalación profesional incluida",
      ],
      image: null,
    },
    {
      id: "s5",
      kind: "content",
      eyebrow: "Calidad de tu agua",
      title: "¿Sabes qué\nhay en tu agua?",
      bullets: [
        { text: "Sedimentos y turbidez tras las lluvias" },
        { text: "Sabor y olor que cambian" },
        { text: "Filtración y purificación que sí se nota" },
      ],
      highlight: "Agua en la que puedes confiar",
      image: null,
    },
    {
      id: "s6",
      kind: "content",
      eyebrow: "Cómo te ayudamos",
      title: "Así te damos\ncontrol del agua",
      bullets: [
        { text: "Evaluamos el consumo de tu negocio" },
        { text: "Diseñamos tu sistema a la medida" },
        { text: "Instalamos de principio a fin" },
      ],
      highlight: "Tu agua, bajo tu control 24/7",
      image: null,
    },
    {
      id: "s7",
      kind: "cta",
      title: "¿Quieres\nagua segura?",
      subtitle: "Te contactamos gratis, sin compromiso.",
      cta: "Comenta WATER",
      checks: [
        "Consulta 100% gratis",
        "Instalación profesional en Puerto Rico",
        "Financiamiento disponible",
      ],
      url: "windmarhome.com",
      image: null,
    },
  ],
};

// Registry of every product carousel. The studio loads one of these by id and
// saves each independently, so Water keeps its own design + photos while Solar,
// Batería and Roofing each get their own editable area.
export const carousels: Record<string, CarouselDoc> = {
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
};

export const CAROUSEL_PRODUCTS: { id: string; label: string; brand: string; grad: string }[] = [
  { id: "aug_solar", label: "Agosto · Solar Comercial", brand: "WindMar Solar", grad: "linear-gradient(135deg,#1d429b,#f89b24)" },
  { id: "aug_roofing", label: "Agosto · Roofing Remoción", brand: "WindMar Roofing", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)" },
  { id: "aug_anker", label: "Agosto · Anker", brand: "WindMar Batería", grad: "linear-gradient(135deg,#48ba86,#1cadca,#00a6e0)" },
  { id: "aug_water", label: "Agosto · Water Negocios", brand: "WindMar Water", grad: "linear-gradient(135deg,#1a52c7,#7eb8f7)" },
  { id: "entonces", label: "RWB · Entonces & Ahora", brand: "Red White & Boricua", grad: "linear-gradient(135deg,#0e1430,#1f2758,#e0a23c)" },
  { id: "flhome", label: "FL · La casa (ES)", brand: "WindMar Home FL", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)" },
  { id: "flhome_en", label: "FL · The Home (EN)", brand: "WindMar Home FL", grad: "linear-gradient(135deg,#1d429b,#21274e,#f89b24)" },
  { id: "flroofing", label: "FL · Sellado y Techos (ES)", brand: "WindMar Roofing FL", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)" },
  { id: "flroofing_en", label: "FL · Roofing & Sealing (EN)", brand: "WindMar Roofing FL", grad: "linear-gradient(135deg,#0b38a8,#93b6d8)" },
  { id: "flsolar", label: "FL · Solar (ES)", brand: "WindMar Solar FL", grad: "linear-gradient(135deg,#1d429b,#f89b24)" },
  { id: "flsolar_en", label: "FL · Solar (EN)", brand: "WindMar Solar FL", grad: "linear-gradient(135deg,#1d429b,#f89b24)" },
  { id: "flbateria", label: "FL · Tesla Powerwall (ES)", brand: "WindMar Batería FL", grad: "linear-gradient(135deg,#171a20,#e82127)" },
  { id: "flbateria_en", label: "FL · Tesla Powerwall (EN)", brand: "WindMar Battery FL", grad: "linear-gradient(135deg,#171a20,#e82127)" },
];
