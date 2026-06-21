// ============================================================
// AYRA — Chat API Route (Vercel-compatible)
// Auto-detects: Ollama locally → Groq/OpenRouter on Vercel
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamChat, detectProvider, getDefaultModel } from "@/lib/ai-client";

export const runtime    = "nodejs";
export const dynamic    = "force-dynamic";
export const maxDuration = 60; // seconds (Vercel Pro: up to 300)

const RequestSchema = z.object({
  chatId:        z.string().optional(),
  messages:      z.array(z.object({ role: z.enum(["user","assistant","system"]), content: z.string() })),
  model:         z.string().optional(),
  systemPrompt:  z.string().optional(),
  temperature:   z.number().min(0).max(2).default(0.7),
  maxTokens:     z.number().min(1).max(32768).default(4096),
  includeMemory: z.boolean().default(false),
  userId:        z.string().default("default"),
});

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (err) {
    return Response.json({ error: "Invalid request", details: err }, { status: 400 });
  }

  const { chatId, messages, temperature, maxTokens, userId, includeMemory } = body;

  // Auto-detect provider based on available env vars
  const provider = detectProvider();
  const model    = body.model ?? getDefaultModel(provider);

  // Build system prompt
  let systemPrompt = body.systemPrompt ?? buildSystemPrompt();
  if (includeMemory && userId) {
    try {
      const memories = await prisma.memory.findMany({
        where:   { userId },
        orderBy: [{ importance: "desc" }, { accessCount: "desc" }],
        take:    20,
        select:  { title: true, content: true, type: true },
      });
      if (memories.length > 0) {
        systemPrompt += "\n\n## Your Memory Context\n" +
          memories.map((m) => `[${m.type}] ${m.title}: ${m.content}`).join("\n");
      }
    } catch { /* skip */ }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let accumulated = "";
      let tokenCount  = 0;

      const send = (data: object) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        for await (const chunk of streamChat(
          messages,
          { provider, model, temperature, maxTokens, systemPrompt },
          req.signal
        )) {
          if (chunk.type === "text" && chunk.content) {
            accumulated += chunk.content;
            send({ type: "text", content: chunk.content });
          } else if (chunk.type === "done") {
            tokenCount = (chunk.metadata?.evalCount as number) ?? 0;
            send({ type: "done", metadata: { ...chunk.metadata, provider, model } });
          } else if (chunk.type === "error") {
            send({ type: "error", error: chunk.error });
          }
        }

        // Persist assistant message to DB
        if (chatId && accumulated) {
          const latency = Date.now() - start;
          await Promise.all([
            prisma.message.create({
              data: { chatId, role: "assistant", content: accumulated, model, latency,
                tokenCount: tokenCount > 0 ? tokenCount : null },
            }),
            prisma.chat.update({
              where: { id: chatId },
              data:  { lastMessageAt: new Date(), tokenCount: { increment: tokenCount } },
            }),
          ]);
        }
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          send({ type: "error", error: String(err) });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":     "text/event-stream",
      "Cache-Control":    "no-cache",
      "X-Accel-Buffering":"no",
      "Connection":       "keep-alive",
    },
  });
}

function buildSystemPrompt(): string {
  const now = new Date();
  return `You are AYRA, a private AI operating system. You are intelligent, thoughtful, and concise.
Current date and time: ${now.toLocaleDateString("en-US",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })} at ${now.toLocaleTimeString("en-US")}.
Respond naturally and helpfully. Use markdown with proper code blocks.`;
}
