// ============================================================
// AYRA — Chats CRUD API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateChatTitle } from "@/lib/utils";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/chats — list all chats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = await getUserIdFromRequest(req);
  const search = searchParams.get("search") ?? "";
  const folderId = searchParams.get("folderId");
  const archived = searchParams.get("archived") === "true";

  const chats = await prisma.chat.findMany({
    where: {
      userId,
      isArchived: archived,
      ...(folderId ? { folderId } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      summary: true,
      model: true,
      isPinned: true,
      isArchived: true,
      folderId: true,
      tags: true,
      tokenCount: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(chats);
}

// POST /api/chats — create a new chat
const CreateChatSchema = z.object({
  userId: z.string().default("default"),
  title: z.string().default("New Chat"),
  model: z.string().default("llama3.2"),
  folderId: z.string().optional(),
  firstMessage: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const raw   = await req.json();
  const body  = CreateChatSchema.parse(raw);
  const userId = await getUserIdFromRequest(req);
  const title  = body.firstMessage
    ? generateChatTitle(body.firstMessage)
    : body.title;

  const chat = await prisma.chat.create({
    data: {
      userId,
      title,
      model: body.model,
      folderId: body.folderId,
    },
  });

  // Create initial user message if provided
  if (body.firstMessage) {
    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: body.firstMessage,
      },
    });
    await prisma.chat.update({
      where: { id: chat.id },
      data: { lastMessageAt: new Date() },
    });
  }

  return NextResponse.json(chat, { status: 201 });
}
