// ============================================================
// AYRA — Models API (Ollama)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getOllamaClient } from "@/lib/ollama";

export const dynamic = "force-dynamic";

// GET /api/models — list available Ollama models
export async function GET() {
  const ollama = getOllamaClient();
  const [models, available] = await Promise.all([
    ollama.listModels(),
    ollama.isAvailable(),
  ]);

  return NextResponse.json({ models, available });
}

// POST /api/models/pull — pull a new model
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Model name required" }, { status: 400 });

  const ollama = getOllamaClient();

  // Stream pull progress
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        await ollama.pullModel(name, (status) => {
          controller.enqueue(
            enc.encode(`data: ${JSON.stringify({ status })}\n\n`)
          );
        });
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (err) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

// DELETE /api/models — delete a model
export async function DELETE(req: NextRequest) {
  const { name } = await req.json();
  const ollama = getOllamaClient();
  await ollama.deleteModel(name);
  return NextResponse.json({ success: true });
}
