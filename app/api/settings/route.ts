// ============================================================
// AYRA — Settings API (session-aware)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId   = await getUserIdFromRequest(req);
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  return NextResponse.json(settings ?? {});
}

export async function PUT(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  const body   = await req.json();
  const { userId: _ignored, ...data } = body;   // strip any client-sent userId

  const settings = await prisma.userSettings.upsert({
    where:  { userId },
    update: data,
    create: { userId, ...data },
  });

  return NextResponse.json(settings);
}
