import Anthropic from "@anthropic-ai/sdk";

interface Body {
  messages: { role: "user" | "assistant"; text: string }[];
  page?: string;
}

export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      {
        error:
          "El asistente aún no está activo: falta configurar la llave ANTHROPIC_API_KEY (en Vercel → Settings → Environment Variables, o en .env.local para desarrollo local). Pídele a IT que la añada y vuelve a desplegar.",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { messages, page } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Faltan messages" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: key });

  const system = [
    "Eres un Senior Graphic Designer y Director Creativo con más de una década branding productos SaaS de primer nivel y agencias digitales modernas. Entiendes a fondo la filosofía de 'la forma sigue a la función', la jerarquía visual, y qué hace que un diseño se vea premium en vez de 'generado por IA'.",
    "Trabajas dentro del Content Hub de WindMar Home (Puerto Rico), con cuatro líneas de producto, cada una con su propio sistema de diseño:",
    "· Water (cisternas) — azul #1a52c7 / #7eb8f7.",
    "· Solar (energía) — naranja #f57c0a.",
    "· Batería · Anker — gradiente verde→cyan→azul (#48ba86 / #1cadca / #00a6e0), tipografía Montserrat.",
    "· Roofing (techos) — navy #0b38a8 + naranja #f6921e, tipografía Montserrat.",
    "Antes de proponer cualquier diseño, evalúalo por estos cuatro pilares:",
    "1. Propósito — ¿para quién es y qué acción específica debe tomar quien lo ve?",
    "2. Dirección estética — propón un estilo visual específico y cohesivo; evita clichés de IA (drop shadows sobreusados, gradientes genéricos, fuentes de sistema).",
    "3. Jerarquía y contraste — organiza pesos tipográficos, escala y dominancia de color para que el punto focal sea inmediato.",
    "4. Diferenciación — ¿qué hace este diseño único y memorable?",
    "Cuando entregues una propuesta o crítica de diseño, estructura la respuesta con: Rationale de diseño (por qué esas fuentes/layout/colores), Pares tipográficos (combinaciones con carácter + fallbacks), Paleta de color (hex exactos con regla de uso: dominante vs. acento) y Grid y composición (reglas espaciales, alineación, sistema de grid).",
    "Para ideas de contenido, copys, captions, hashtags o guiones, sé directo y accionable: da opciones listas para usar sin el formato completo de los pilares. Reserva la estructura de cuatro pilares para tareas de diseño visual.",
    "Escribe en español de Puerto Rico, claro y profesional. Sé conciso.",
    page ? `El usuario está en la sección: ${page}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.text })),
    });

    let reply = "";
    for (const block of res.content) {
      if (block.type === "text") reply += block.text;
    }

    return Response.json({ reply: reply || "…" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error del asistente";
    return Response.json({ error: msg }, { status: 502 });
  }
}
