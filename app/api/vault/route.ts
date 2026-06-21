// ============================================================
// AYRA — Knowledge Vault API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOllamaClient } from "@/lib/ollama";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/vault
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const folderId = searchParams.get("folderId");
  const search = searchParams.get("search") ?? "";
  const pinned = searchParams.get("pinned") === "true";

  const items = await prisma.vaultItem.findMany({
    where: {
      userId,
      ...(type ? { type: type as never } : {}),
      ...(folderId !== null ? { folderId: folderId || null } : {}),
      ...(pinned ? { isPinned: true } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { tags: { has: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      filename: true,
      mimeType: true,
      size: true,
      pageCount: true,
      tags: true,
      isNote: true,
      isPinned: true,
      isProcessed: true,
      url: true,
      folderId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(items);
}

// POST /api/vault — create note or register file
const CreateVaultItemSchema = z.object({
  userId: z.string().default("default"),
  folderId: z.string().optional(),
  type: z.enum([
    "PDF", "DOCUMENT", "NOTE", "IMAGE", "PRESCRIPTION",
    "MEDICAL_REPORT", "FINANCIAL", "CODE", "LINK", "OTHER",
  ]),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  rawContent: z.string().optional(),     // For notes: markdown
  url: z.string().optional(),           // For uploaded files
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  tags: z.array(z.string()).default([]),
  isNote: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const body = CreateVaultItemSchema.parse(await req.json());

  // For notes, content = rawContent
  const content = body.isNote ? body.rawContent : undefined;

  // Generate embedding for semantic search
  let embedding: number[] = [];
  if (content || body.description) {
    try {
      const ollama = getOllamaClient();
      const textToEmbed = `${body.title}. ${body.description ?? ""} ${content?.slice(0, 1000) ?? ""}`;
      embedding = await ollama.embed(textToEmbed.trim(), "nomic-embed-text");
    } catch { /* skip */ }
  }

  const item = await prisma.vaultItem.create({
    data: {
      ...body,
      content,
      embedding,
      isProcessed: body.isNote, // Notes are immediately processed
      processedAt: body.isNote ? new Date() : undefined,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

// POST /api/vault/search — semantic search across vault
export async function PUT(req: NextRequest) {
  const { query, userId = "default", limit = 10 } = await req.json();
  if (!query) return NextResponse.json([]);

  // Full-text search fallback (semantic search requires pgvector extension)
  const results = await prisma.vaultItem.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: query.split(" ") } },
      ],
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      content: true,
      tags: true,
      isNote: true,
      createdAt: true,
    },
  });

  return NextResponse.json(results);
}
