const ASANA_BASE = "https://app.asana.com/api/1.0";
const DEFAULT_PROJECT_ID = "1215803013253937"; // Nicolle's first project

export async function POST(request: Request) {
  const token = process.env.ASANA_TOKEN;
  const projectId = process.env.ASANA_PROJECT_ID || DEFAULT_PROJECT_ID;

  if (!token) {
    return Response.json(
      {
        error:
          "Falta ASANA_TOKEN en .env.local. Genera un Personal Access Token en Asana (Settings → Apps → Developer) y reinicia el servidor.",
      },
      { status: 400 }
    );
  }

  let body: {
    taskName?: string;
    notes?: string;
    fileName?: string;
    fileBase64?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { taskName, notes, fileName, fileBase64 } = body;
  if (!taskName) {
    return Response.json({ error: "taskName requerido" }, { status: 400 });
  }

  // 1. Create task
  const taskRes = await fetch(`${ASANA_BASE}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: { name: taskName, notes: notes ?? "", projects: [projectId] },
    }),
  });

  if (!taskRes.ok) {
    const err = await taskRes.text();
    return Response.json(
      { error: `Asana rechazó la tarea (${taskRes.status}): ${err}` },
      { status: 502 }
    );
  }

  const taskData = await taskRes.json();
  const taskGid: string = taskData.data.gid;
  const permalink: string | undefined = taskData.data.permalink_url;

  // 2. Attach PNG if provided
  if (fileBase64 && fileName) {
    const buffer = Buffer.from(fileBase64, "base64");
    const form = new FormData();
    form.append("parent", taskGid);
    form.append(
      "file",
      new Blob([new Uint8Array(buffer)], { type: "image/png" }),
      fileName
    );

    const attachRes = await fetch(`${ASANA_BASE}/attachments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!attachRes.ok) {
      const err = await attachRes.text();
      return Response.json({
        message: `Tarea creada, pero falló el adjunto: ${err}`,
        taskGid,
        permalink,
      });
    }
  }

  return Response.json({
    message: "Tarea creada en Asana ✓",
    taskGid,
    permalink,
  });
}
