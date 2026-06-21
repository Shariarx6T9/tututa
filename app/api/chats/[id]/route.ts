// ============================================================
// AYRA — Chat [id] API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/chats/[id] — get chat + messages
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
        include: { attachments: true },
      },
    },
  });

  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(chat);
}

// PATCH /api/chats/[id] — update chat metadata
const PatchSchema = z.object({
  title: z.string().optional(),
  model: z.string().optional(),
  folderId: z.string().nullable().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = PatchSchema.parse(await req.json());
  const chat = await prisma.chat.update({ where: { id }, data: body });
  return NextResponse.json(chat);
}

// DELETE /api/chats/[id] — delete chat
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.chat.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
