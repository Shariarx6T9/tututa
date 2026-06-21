// ============================================================
// AYRA — Image Studio API
// Stable Diffusion / ComfyUI integration
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/studio — list images
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId       = searchParams.get("userId") ?? "default";
  const collectionId = searchParams.get("collectionId");
  const favorite     = searchParams.get("favorite") === "true";

  const images = await prisma.studioImage.findMany({
    where: {
      userId,
      ...(collectionId ? { collectionId } : {}),
      ...(favorite ? { isFavorite: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(images);
}
