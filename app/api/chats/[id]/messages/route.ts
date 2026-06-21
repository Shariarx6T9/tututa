// ============================================================
// AYRA — Chat Messages API
// POST /api/chats/[id]/messages  → persist a user message
// GET  /api/chats/[id]/messages  → list messages for a chat
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

// GET — return all messages for a chat
export async function GET(req: NextRequest, { params }: Params) {
  const { id: chatId } = await params;
  const userId = await getUserIdFromRequest(req);

  // Verify chat ownership
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where:   { chatId, isDeleted: false },
    orderBy: { createdAt: "asc" },
    include: { attachments: true },
  });

  return NextResponse.json(messages);
}

// POST — create a single message (used by the chat UI for user messages)
const CreateMessageSchema = z.object({
  role:    z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
  model:   z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id: chatId } = await params;
  const userId = await getUserIdFromRequest(req);
  const body   = CreateMessageSchema.parse(await req.json());

  // Verify ownership
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      chatId,
      role:    body.role,
      content: body.content,
      model:   body.model,
    },
    include: { attachments: true },
  });

  // Update chat lastMessageAt
  await prisma.chat.update({
    where: { id: chatId },
    data:  { lastMessageAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
