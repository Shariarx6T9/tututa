// ============================================================
// AYRA — Memory [id] API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

// GET /api/memory/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const memory  = await prisma.memory.findUnique({ where: { id } });
  if (!memory) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment access count
  await prisma.memory.update({
    where: { id },
    data:  { accessCount: { increment: 1 }, lastAccessed: new Date() },
  });

  return NextResponse.json(memory);
}

// PATCH /api/memory/[id]
const PatchSchema = z.object({
  title:      z.string().min(1).optional(),
  content:    z.string().optional(),
  context:    z.string().optional(),
  type:       z.enum(["FACT","PREFERENCE","PROJECT","RELATIONSHIP","GOAL","SKILL","CONTEXT","MEDICAL","FINANCIAL","PERSONAL"]).optional(),
  importance: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  tags:       z.array(z.string()).optional(),
  isPinned:   z.boolean().optional(),
  isVerified: z.boolean().optional(),
  expiresAt:  z.string().datetime().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id }   = await params;
  const userId   = await getUserIdFromRequest(req);
  const body     = PatchSchema.parse(await req.json());

  const memory = await prisma.memory.updateMany({
    where: { id, userId },   // scoped to owner
    data:  {
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    },
  });

  if (memory.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.memory.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

// DELETE /api/memory/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);

  const result = await prisma.memory.deleteMany({ where: { id, userId } });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
