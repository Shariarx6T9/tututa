// ============================================================
// AYRA — Task [id] API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);

  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: { children: { orderBy: { position: "asc" } }, collection: true },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

// PATCH /api/tasks/[id]
const PatchSchema = z.object({
  title:          z.string().min(1).max(500).optional(),
  description:    z.string().optional(),
  status:         z.enum(["TODO","IN_PROGRESS","DONE","CANCELLED","DEFERRED"]).optional(),
  priority:       z.enum(["NONE","LOW","MEDIUM","HIGH","URGENT"]).optional(),
  tags:           z.array(z.string()).optional(),
  dueDate:        z.string().datetime().nullable().optional(),
  dueTime:        z.string().optional(),
  startDate:      z.string().datetime().nullable().optional(),
  completedAt:    z.string().datetime().nullable().optional(),
  reminderAt:     z.string().datetime().nullable().optional(),
  collectionId:   z.string().nullable().optional(),
  parentId:       z.string().nullable().optional(),
  isRecurring:    z.boolean().optional(),
  recurrenceType: z.enum(["DAILY","WEEKLY","MONTHLY","YEARLY","CUSTOM"]).optional(),
  estimatedMin:   z.number().optional(),
  position:       z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(req);
  const body   = PatchSchema.parse(await req.json());

  // Auto-set completedAt when marking done
  const completedAt =
    body.status === "DONE"
      ? body.completedAt ?? new Date().toISOString()
      : body.status !== undefined
      ? null
      : body.completedAt;

  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      ...body,
      dueDate:     body.dueDate     ? new Date(body.dueDate)     : body.dueDate     === null ? null : undefined,
      startDate:   body.startDate   ? new Date(body.startDate)   : body.startDate   === null ? null : undefined,
      completedAt: completedAt      ? new Date(completedAt)      : completedAt      === null ? null : undefined,
      reminderAt:  body.reminderAt  ? new Date(body.reminderAt)  : body.reminderAt  === null ? null : undefined,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.task.findUnique({
    where: { id },
    include: { children: true, collection: true },
  });
  return NextResponse.json(updated);
}

// DELETE /api/tasks/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id }   = await params;
  const userId   = await getUserIdFromRequest(req);
  const result   = await prisma.task.deleteMany({ where: { id, userId } });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
