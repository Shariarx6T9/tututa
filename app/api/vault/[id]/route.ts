// ============================================================
// AYRA — Vault Item [id] API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

// GET /api/vault/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);

  const item = await prisma.vaultItem.findFirst({ where: { id, userId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

// PATCH /api/vault/[id]
const PatchSchema = z.object({
  title:       z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  rawContent:  z.string().optional(),
  tags:        z.array(z.string()).optional(),
  folderId:    z.string().nullable().optional(),
  isPinned:    z.boolean().optional(),
  type:        z.enum(["PDF","DOCUMENT","NOTE","IMAGE","PRESCRIPTION","MEDICAL_REPORT","FINANCIAL","CODE","LINK","OTHER"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);
  const body   = PatchSchema.parse(await req.json());

  const result = await prisma.vaultItem.updateMany({
    where: { id, userId },
    data:  {
      ...body,
      // For notes, keep rawContent and content in sync
      content: body.rawContent,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.vaultItem.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

// DELETE /api/vault/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id }   = await params;
  const userId   = await getUserIdFromRequest(req);

  // TODO: also delete the file from Vercel Blob / local disk
  const result = await prisma.vaultItem.deleteMany({ where: { id, userId } });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
