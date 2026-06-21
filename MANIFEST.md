# AYRA — Complete File Manifest & Architecture Reference
# All files generated in this build session

## Root Files
- package.json              ✅ All 60+ dependencies
- tsconfig.json             ✅ TypeScript strict config
- next.config.ts            ✅ Next.js 16 config with PPR + React Compiler
- .env.example              ✅ All environment variables

## App (Next.js App Router)
- app/layout.tsx            ✅ Root layout with fonts & Toaster
- app/globals.css           ✅ Tailwind v4 config + full design system
- app/(dashboard)/layout.tsx ✅ Dashboard shell with sidebar + command palette
- app/(dashboard)/page.tsx  ✅ Main dashboard with widgets
- app/(dashboard)/chat/page.tsx         ✅ Chat list view
- app/(dashboard)/chat/new/page.tsx     ✅ New chat
- app/(dashboard)/chat/[id]/page.tsx    ✅ Chat detail
- app/(dashboard)/memory/page.tsx       ✅ Full memory CRUD UI
- app/(dashboard)/tasks/page.tsx        ✅ Task manager with AI generation
- app/(dashboard)/vault/page.tsx        ✅ Knowledge vault with upload + notes
- app/(dashboard)/code/page.tsx         ✅ Monaco editor + AI assistant
- app/(dashboard)/studio/page.tsx       ✅ Image generation gallery
- app/(dashboard)/settings/page.tsx     ✅ Full settings panel

## API Routes
- app/api/chat/route.ts                 ✅ Streaming SSE chat (Ollama)
- app/api/chats/route.ts                ✅ Chat CRUD list
- app/api/chats/[id]/route.ts           ✅ Chat CRUD detail
- app/api/memory/route.ts               ✅ Memory CRUD + AI extraction
- app/api/tasks/route.ts                ✅ Task CRUD + AI generation
- app/api/vault/route.ts                ✅ Vault CRUD + semantic search
- app/api/models/route.ts               ✅ Ollama model management
- app/api/studio/route.ts               ✅ Image listing
- app/api/studio/generate/route.ts      ✅ SD + ComfyUI generation
- app/api/settings/route.ts             ✅ User settings CRUD

## Components
- components/ui/index.tsx               ✅ GlassCard, Button, Badge, Input, PageHeader...
- components/ui/QuantumOrb.tsx          ✅ Canvas-based AI state orb
- components/chat/ChatInterface.tsx     ✅ Full streaming chat with welcome screen
- components/chat/MessageBubble.tsx     ✅ Markdown + syntax highlighted messages
- components/chat/ModelPicker.tsx       ✅ Live Ollama model dropdown
- components/sidebar/Sidebar.tsx        ✅ Collapsible sidebar with chat list
- components/layout/CommandPalette.tsx  ✅ ⌘K universal search

## Library
- lib/prisma.ts                         ✅ Prisma singleton
- lib/ollama.ts                         ✅ Streaming Ollama client
- lib/store/index.ts                    ✅ Zustand stores (UI, Chat, Task, Memory, Model)
- lib/utils/index.ts                    ✅ Utilities (cn, format, detect, etc.)

## Database
- prisma/schema.prisma                  ✅ Full schema (8 models, enums, indexes)

## Types
- types/index.ts                        ✅ Complete TypeScript definitions

## Documentation
- README.md                             ✅ Full setup guide + API docs + roadmap

## Still To Build (Production Hardening)
- app/(auth)/login/page.tsx             → Auth gate for single-user setup
- app/api/vault/upload/route.ts         → Multipart file upload + PDF extraction
- app/api/chats/[id]/messages/route.ts  → Message creation endpoint
- app/api/memory/[id]/route.ts          → Memory update/delete by ID
- app/api/tasks/[id]/route.ts           → Task update/delete by ID
- app/api/studio/[id]/route.ts          → Image favorite/delete by ID
- prisma/seed.ts                        → Database seeding script
- middleware.ts                         → Auth middleware
- public/icons/favicon.svg              → App icon
