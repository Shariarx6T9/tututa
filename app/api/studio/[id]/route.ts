// ============================================================
// AYRA — Studio Image [id] API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  isFavorite:   z.boolean().optional(),
  collectionId: z.string().nullable().optional(),
  tags:         z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id }   = await params;
  const userId   = await getUserIdFromRequest(req);
  const body     = PatchSchema.parse(await req.json());

  const result = await prisma.studioImage.updateMany({
    where: { id, userId },
    data:  body,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.studioImage.findUnique({ where: { id } });
  return NextResponse.json({ ...updated, seed: updated?.seed?.toString() });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id }   = await params;
  const userId   = await getUserIdFromRequest(req);

  const image = await prisma.studioImage.findFirst({ where: { id, userId } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete file from disk / Vercel Blob
  if (image.url.startsWith("/uploads/")) {
    try {
      const path = await import("path");
      const fs   = await import("fs/promises");
      await fs.unlink(path.join(process.cwd(), image.url));
    } catch { /* file may not exist */ }
  } else if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { del } = await import("@vercel/blob");
      await del(image.url);
    } catch { /* skip */ }
  }

  await prisma.studioImage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
