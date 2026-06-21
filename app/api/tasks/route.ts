// ============================================================
// AYRA — Tasks API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOllamaClient } from "@/lib/ollama";
import { getUserIdFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/tasks
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const collectionId = searchParams.get("collectionId");
  const due = searchParams.get("due"); // "today" | "overdue" | "upcoming"

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      parentId: null, // top-level only
      ...(status ? { status: status as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
      ...(collectionId ? { collectionId } : {}),
      ...(due === "today"
        ? { dueDate: { gte: todayStart, lte: todayEnd } }
        : due === "overdue"
        ? { dueDate: { lt: now }, status: { not: "DONE" } }
        : due === "upcoming"
        ? { dueDate: { gt: now } }
        : {}),
    },
    include: {
      children: { orderBy: { position: "asc" } },
      collection: { select: { name: true, color: true, icon: true } },
    },
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" },
      { position: "asc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks
const CreateTaskSchema = z.object({
  userId: z.string().default("default"),
  collectionId: z.string().optional(),
  parentId: z.string().optional(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED", "DEFERRED"]).default("TODO"),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]).default("NONE"),
  tags: z.array(z.string()).default([]),
  dueDate: z.string().datetime().optional(),
  dueTime: z.string().optional(),
  reminderAt: z.string().datetime().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]).optional(),
  aiGenerated: z.boolean().default(false),
  estimatedMin: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const body = CreateTaskSchema.parse(await req.json());

  const task = await prisma.task.create({
    data: {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      reminderAt: body.reminderAt ? new Date(body.reminderAt) : undefined,
    },
    include: { children: true, collection: true },
  });

  return NextResponse.json(task, { status: 201 });
}

// PUT /api/tasks/ai-generate — AI task generation from natural language
export async function PUT(req: NextRequest) {
  const { prompt, userId = "default" } = await req.json();
  if (!prompt) return NextResponse.json({ tasks: [] });

  const ollama = getOllamaClient();
  const systemPrompt = `Generate a list of actionable tasks from the user's input.
Return ONLY a JSON array with format:
[{"title":"task title","description":"optional details","priority":"NONE|LOW|MEDIUM|HIGH|URGENT","estimatedMin":30,"dueDate":"ISO date or null"}]
Today is ${new Date().toISOString()}.`;

  try {
    const raw = await ollama.generate(
      `Generate tasks for: "${prompt}"`,
      "llama3.2",
      { format: "json" }
    );
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const tasks = JSON.parse(cleaned);

    const created = await Promise.all(
      tasks.slice(0, 10).map((t: z.infer<typeof CreateTaskSchema>) =>
        prisma.task.create({
          data: {
            userId,
            title: t.title,
            description: t.description,
            priority: t.priority ?? "NONE",
            estimatedMin: t.estimatedMin,
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            aiGenerated: true,
          },
        })
      )
    );

    return NextResponse.json({ tasks: created });
  } catch {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
