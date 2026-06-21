// ============================================================
// AYRA — Neon Auth Webhook
// POST /api/auth/webhook
// Fires when Neon Auth creates a new user (user.created event)
// Set this URL in: Neon Console → Auth → Webhooks
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface NeonAuthWebhookPayload {
  event: "user.created" | "user.updated" | "user.deleted";
  data: {
    id:          string;
    display_name: string;
    primary_email: string;
    profile_image_url?: string;
    created_at_millis: number;
  };
}

export async function POST(req: NextRequest) {
  // Verify webhook secret to prevent spoofing
  const secret = req.headers.get("x-neon-webhook-secret");
  if (
    process.env.NEON_AUTH_WEBHOOK_SECRET &&
    secret !== process.env.NEON_AUTH_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: NeonAuthWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = payload;

  switch (event) {
    case "user.created": {
      // Create AYRA user row and seed default data
      await prisma.user.upsert({
        where:  { id: data.id },
        update: {},
        create: {
          id:       data.id,
          name:     data.display_name   ?? "AYRA User",
          email:    data.primary_email,
          avatar:   data.profile_image_url ?? undefined,
          password: "", // auth handled by Neon Auth
        },
      });

      // Seed default settings
      await prisma.userSettings.upsert({
        where:  { userId: data.id },
        update: {},
        create: {
          userId:        data.id,
          defaultModel:  "llama3.2",
          temperature:   0.7,
          maxTokens:     4096,
          memoryEnabled: true,
        },
      });

      // Seed default task collection
      await prisma.taskCollection.upsert({
        where:  { id: `${data.id}-inbox` },
        update: {},
        create: {
          id:        `${data.id}-inbox`,
          userId:    data.id,
          name:      "Inbox",
          icon:      "📥",
          isDefault: true,
          position:  0,
        },
      });

      // Seed welcome vault note
      await prisma.vaultItem.create({
        data: {
          userId:      data.id,
          type:        "NOTE",
          title:       "Welcome to AYRA",
          isNote:      true,
          isPinned:    true,
          isProcessed: true,
          processedAt: new Date(),
          rawContent:  `# Welcome to AYRA 🌟\n\nYour private AI operating system is ready.\n\n## Getting started\n\n1. **Chat** — Start a conversation with your AI\n2. **Memory** — Add facts AYRA should remember about you\n3. **Tasks** — Capture and organise your work\n4. **Vault** — Store documents, notes, and files\n5. **Code** — Write and review code with AI\n6. **Studio** — Generate images with Stable Diffusion\n\nPress **⌘K** anywhere to open the command palette.`,
          tags:        ["welcome"],
        },
      });

      // Seed welcome memory
      await prisma.memory.create({
        data: {
          userId:     data.id,
          type:       "PERSONAL",
          importance: "MEDIUM",
          title:      "AYRA User",
          content:    `Primary user of this AYRA instance. Email: ${data.primary_email}`,
          tags:       ["identity"],
          isVerified: true,
        },
      });

      console.log(`[Neon Auth] New user provisioned: ${data.primary_email}`);
      break;
    }

    case "user.updated": {
      await prisma.user.updateMany({
        where: { id: data.id },
        data: {
          name:   data.display_name ?? undefined,
          avatar: data.profile_image_url ?? undefined,
        },
      });
      break;
    }

    case "user.deleted": {
      // Cascade deletes handle all related data via Prisma schema
      await prisma.user.deleteMany({ where: { id: data.id } });
      console.log(`[Neon Auth] User deleted: ${data.id}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
