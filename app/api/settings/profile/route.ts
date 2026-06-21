// ============================================================
// AYRA — User Profile API
// PATCH /api/settings/profile — update name / avatar
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  name:   z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  const body   = PatchSchema.parse(await req.json());

  const user = await prisma.user.update({
    where:  { id: userId },
    data:   body,
    select: { id: true, name: true, email: true, avatar: true },
  });

  return NextResponse.json(user);
}
