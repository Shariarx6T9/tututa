// ============================================================
// AYRA — Database Seed
// Run: pnpm db:seed
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AYRA database…");

  // Create default user
  const user = await prisma.user.upsert({
    where:  { email: "me@ayra.local" },
    update: {},
    create: {
      email:    "me@ayra.local",
      name:     "AYRA User",
      password: "changeme", // hashed in production
    },
  });
  console.log(`✅ User: ${user.email}`);

  // Default settings
  await prisma.userSettings.upsert({
    where:  { userId: user.id },
    update: {},
    create: {
      userId:       user.id,
      defaultModel: "llama3.2",
      temperature:  0.7,
      maxTokens:    4096,
      memoryEnabled: true,
    },
  });
  console.log("✅ Default settings");

  // Default task collection
  const inbox = await prisma.taskCollection.upsert({
    where:  { id: "default-inbox" },
    update: {},
    create: {
      id:        "default-inbox",
      userId:    user.id,
      name:      "Inbox",
      icon:      "📥",
      isDefault: true,
      position:  0,
    },
  });

  await prisma.taskCollection.upsert({
    where:  { id: "default-work" },
    update: {},
    create: {
      id:       "default-work",
      userId:   user.id,
      name:     "Work",
      icon:     "💼",
      color:    "#7c3aed",
      position: 1,
    },
  });
  console.log("✅ Default task collections");

  // Sample tasks
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { userId: user.id, collectionId: inbox.id, title: "Explore AYRA",          priority: "HIGH",   status: "TODO", aiGenerated: false },
      { userId: user.id, collectionId: inbox.id, title: "Connect Ollama models", priority: "MEDIUM", status: "TODO", aiGenerated: false },
      { userId: user.id, collectionId: inbox.id, title: "Add first memory",      priority: "LOW",    status: "TODO", aiGenerated: false },
    ],
  });
  console.log("✅ Sample tasks");

  // Default vault folder structure
  const personalFolder = await prisma.vaultFolder.upsert({
    where:  { id: "vault-personal" },
    update: {},
    create: {
      id:     "vault-personal",
      userId: user.id,
      name:   "Personal",
      icon:   "🏠",
      position: 0,
    },
  });

  await prisma.vaultFolder.upsert({
    where:  { id: "vault-medical" },
    update: {},
    create: {
      id:        "vault-medical",
      userId:    user.id,
      name:      "Medical",
      icon:      "❤️",
      isPrivate: true,
      position:  1,
    },
  });

  await prisma.vaultFolder.upsert({
    where:  { id: "vault-work" },
    update: {},
    create: {
      id:     "vault-work",
      userId: user.id,
      name:   "Work",
      icon:   "💼",
      position: 2,
    },
  });
  console.log("✅ Vault folders");

  // Welcome note
  await prisma.vaultItem.upsert({
    where:  { id: "welcome-note" },
    update: {},
    create: {
      id:         "welcome-note",
      userId:     user.id,
      folderId:   personalFolder.id,
      type:       "NOTE",
      title:      "Welcome to AYRA",
      isNote:     true,
      isPinned:   true,
      isProcessed: true,
      processedAt: new Date(),
      rawContent: `# Welcome to AYRA 🌟

AYRA is your private AI operating system. Here's how to get started:

## Quick Start

1. **Chat** — Start a conversation with your AI in the Chat module
2. **Memory** — Add important facts about yourself so AYRA remembers them
3. **Tasks** — Capture your to-dos and let AI help generate action plans
4. **Vault** — Upload documents, PDFs, and create notes here
5. **Code** — Open the coding workspace to write and review code with AI
6. **Studio** — Generate images with Stable Diffusion (requires local SD)

## Tips

- Press **⌘K** to open the command palette from anywhere
- AYRA learns from your conversations when memory extraction is enabled
- All your data stays on your machine (or your Vercel + Neon setup)

## Privacy

Your data is yours. AYRA stores everything in a PostgreSQL database that you control.`,
      tags: ["welcome", "getting-started"],
    },
  });
  console.log("✅ Welcome note");

  // Sample memory
  await prisma.memory.createMany({
    skipDuplicates: true,
    data: [
      {
        userId:     user.id,
        type:       "PERSONAL",
        importance: "MEDIUM",
        title:      "AYRA User",
        content:    "This is the primary user of the AYRA system.",
        tags:       ["identity"],
        isVerified: true,
      },
    ],
  });
  console.log("✅ Initial memory");

  console.log("\n✨ Seed complete! Visit http://localhost:3000 to start.");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
