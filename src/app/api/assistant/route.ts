import Anthropic from "@anthropic-ai/sdk";

// Edits the model may apply to the live fabric canvas. Each op targets an
// object by the id the client assigned, or creates/removes one.
const EDIT_TOOL: Anthropic.Tool = {
  name: "apply_canvas_edits",
  description:
    "Apply concrete edits to the design canvas. Use only when the user asks for a change or you propose a fix worth applying. Reference existing objects by their id.",
  input_schema: {
    type: "object",
    properties: {
      operations: {
        type: "array",
        description: "Ordered list of edits to apply.",
        items: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: [
                "update_object",
                "add_text",
                "delete_object",
                "set_background",
              ],
            },
            id: { type: "string", description: "Target object id (for update/delete)." },
            text: { type: "string" },
            fill: { type: "string", description: "Hex color, e.g. #1a52c7." },
            fontSize: { type: "number" },
            left: { type: "number" },
            top: { type: "number" },
            color: { type: "string", description: "Background hex (for set_background)." },
          },
          required: ["action"],
        },
      },
    },
    required: ["operations"],
  },
};

interface CanvasObject {
  id: string;
  type: string;
  text?: string;
  fill?: string;
  fontSize?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

interface Body {
  messages: { role: "user" | "assistant"; text: string }[];
  canvas: { format: string; w: number; h: number; bg: string; objects: CanvasObject[] };
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

  const { messages, canvas } = body;
  if (!Array.isArray(messages) || !canvas) {
    return Response.json({ error: "Faltan messages o canvas" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: key });

  const system = [
    "Eres un Senior Graphic Designer y Director Creativo con más de una década branding productos SaaS de primer nivel y agencias digitales modernas. Entiendes la filosofía de 'la forma sigue a la función', la jerarquía visual, y qué hace que un diseño se vea premium en vez de 'generado por IA'.",
    "Trabajas en el lienzo del Content Hub de WindMar (Puerto Rico) para piezas de redes y anuncios; aplicas cambios al lienzo cuando se te pide.",
    "Marca Water: azul #1a52c7, azul claro #7eb8f7, fondo navy #0a1628. Otras líneas: Solar naranja #f57c0a; Batería·Anker gradiente #48ba86/#1cadca/#00a6e0 (Montserrat); Roofing navy #0b38a8 + naranja #f6921e (Montserrat).",
    "Evalúa cada diseño por cuatro pilares: 1) Propósito (para quién y qué acción busca), 2) Dirección estética (estilo específico y cohesivo, sin clichés de IA), 3) Jerarquía y contraste (pesos, escala y dominancia de color para un punto focal claro), 4) Diferenciación (qué lo hace memorable).",
    "Cuando el usuario pida un cambio concreto (reescribir un titular, acortar texto, cambiar color, mover algo), usa la herramienta apply_canvas_edits.",
    "Cuando pidan opinión o revisión de diseño, responde en texto justificando con: rationale (por qué esas fuentes/layout/colores), pares tipográficos con fallbacks, paleta con hex y regla dominante vs. acento, y grid/composición. Sé conciso y accionable.",
    "Refiérete a los objetos por su contenido, no por su id, al hablar con el usuario. Escribe en español de Puerto Rico.",
    `Estado actual del lienzo: formato ${canvas.format} (${canvas.w}×${canvas.h}), fondo ${canvas.bg}.`,
    `Objetos: ${JSON.stringify(canvas.objects)}`,
  ].join("\n");

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      tools: [EDIT_TOOL],
      messages: messages.map((m) => ({ role: m.role, content: m.text })),
    });

    let reply = "";
    let operations: unknown[] = [];
    for (const block of res.content) {
      if (block.type === "text") reply += block.text;
      else if (block.type === "tool_use" && block.name === "apply_canvas_edits") {
        const input = block.input as { operations?: unknown[] };
        operations = input.operations ?? [];
      }
    }
    if (!reply && operations.length) reply = "Listo, apliqué los cambios al lienzo.";

    return Response.json({ reply: reply || "…", operations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error del asistente";
    return Response.json({ error: msg }, { status: 502 });
  }
}
