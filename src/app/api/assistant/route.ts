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
          "Falta ANTHROPIC_API_KEY en .env.local. Añádela y reinicia el servidor para activar el asistente.",
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
    "Eres el asistente de diseño del Content Hub de WindMar Water (marca de cisternas/agua en Puerto Rico).",
    "Revisas diseños para redes sociales y anuncios, y aplicas cambios al lienzo cuando se te pide.",
    "Marca: azul #1a52c7, azul claro #7eb8f7, fondo navy #0a1628. Tono profesional, claro, en español.",
    "Cuando el usuario pida un cambio concreto (reescribir un titular, acortar texto, cambiar color, mover algo), usa la herramienta apply_canvas_edits.",
    "Cuando solo pidan opinión o revisión, responde en texto sin llamar la herramienta.",
    "Sé conciso. Refiérete a los objetos por su contenido, no por su id, al hablar con el usuario.",
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
