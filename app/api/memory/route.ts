// ============================================================
// AYRA — Memory API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOllamaClient } from "@/lib/ollama";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/memory — list memories
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const search = searchParams.get("search") ?? "";
  const pinned = searchParams.get("pinned") === "true";

  const memories = await prisma.memory.findMany({
    where: {
      userId,
      ...(type ? { type: type as never } : {}),
      ...(pinned ? { isPinned: true } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [
      { isPinned: "desc" },
      { importance: "desc" },
      { updatedAt: "desc" },
    ],
    select: {
      id: true,
      type: true,
      importance: true,
      title: true,
      content: true,
      context: true,
      tags: true,
      source: true,
      confidence: true,
      isVerified: true,
      isPinned: true,
      expiresAt: true,
      accessCount: true,
      lastAccessed: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(memories);
}

// POST /api/memory — create memory
const CreateMemorySchema = z.object({
  userId: z.string().default("default"),
  type: z.enum([
    "FACT", "PREFERENCE", "PROJECT", "RELATIONSHIP",
    "GOAL", "SKILL", "CONTEXT", "MEDICAL", "FINANCIAL", "PERSONAL",
  ]),
  importance: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  context: z.string().optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
  generateEmbedding: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const body = CreateMemorySchema.parse(await req.json());

  // Generate embedding for semantic search
  let embedding: number[] = [];
  if (body.generateEmbedding) {
    try {
      const ollama = getOllamaClient();
      embedding = await ollama.embed(
        `${body.title}: ${body.content}`,
        "nomic-embed-text"
      );
    } catch { /* skip embedding on error */ }
  }

  const memory = await prisma.memory.create({
    data: {
      userId: body.userId,
      type: body.type,
      importance: body.importance,
      title: body.title,
      content: body.content,
      context: body.context,
      tags: body.tags,
      source: body.source,
      embedding,
    },
  });

  return NextResponse.json(memory, { status: 201 });
}

// POST /api/memory/extract — extract memories from conversation
export async function PUT(req: NextRequest) {
  const { chatId, messages, userId = "default" } = await req.json();
  if (!messages?.length) {
    return NextResponse.json({ memories: [] });
  }

  const ollama = getOllamaClient();
  const conversation = messages
    .slice(-10) // Last 10 messages
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `Analyze this conversation and extract factual memories about the user that should be remembered long-term. Return ONLY a JSON array of memory objects.

Conversation:
${conversation}

Return JSON array with format:
[{"type":"FACT|PREFERENCE|GOAL|SKILL|PERSONAL","importance":"LOW|MEDIUM|HIGH","title":"short title","content":"detailed content","tags":["tag1"]}]

Extract only concrete, specific, durable facts. Return empty array [] if nothing worth remembering.`;

  let extracted: Array<{
    type: string; importance: string; title: string; content: string; tags: string[];
  }> = [];

  try {
    const raw = await ollama.generate(prompt, "llama3.2", { format: "json" });
    const cleaned = raw.replace(/```json|```/g, "").trim();
    extracted = JSON.parse(cleaned);
  } catch { return NextResponse.json({ memories: [] }); }

  const created = await Promise.all(
    extracted.slice(0, 5).map((m) =>
      prisma.memory.create({
        data: {
          userId,
          type: m.type as never,
          importance: m.importance as never,
          title: m.title,
          content: m.content,
          tags: m.tags ?? [],
          source: chatId,
        },
      })
    )
  );

  return NextResponse.json({ memories: created });
}
