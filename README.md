# AYRA — Private AI Operating System

<div align="center">
  <h3>Your sovereign AI. Runs locally. Knows you deeply.</h3>
  <p>A premium self-hosted AI OS built with Next.js 16, React 19, and Ollama</p>
</div>

---

## What is AYRA?

AYRA is a **complete, private AI operating system** for a single user. It runs 100% locally — your data never leaves your machine. Think of it as a self-hosted version of ChatGPT, Notion, Linear, and Midjourney — unified under one premium interface, powered by your local AI models.

---

## Core Modules

| Module | Description |
|--------|-------------|
| **Chat** | ChatGPT-style streaming conversations with multiple models |
| **Memory** | Long-term AI memory system that learns from your chats |
| **Tasks** | Personal task manager with AI generation and priorities |
| **Vault** | Knowledge base for PDFs, documents, notes, prescriptions |
| **Code** | Monaco editor workspace with AI code assistant |
| **Studio** | Image generation via Stable Diffusion / ComfyUI |
| **Dashboard** | Unified overview with today's focus and quick actions |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **AI Engine**: Ollama (local) with OpenAI-compatible API
- **State**: Zustand + Immer
- **Editor**: Monaco Editor
- **Image Gen**: Stable Diffusion A1111 / ComfyUI

---

## Prerequisites

1. **Node.js** 22+ and **pnpm**
2. **PostgreSQL** 16+
3. **Ollama** (https://ollama.ai)
4. (Optional) **Stable Diffusion WebUI** or **ComfyUI** for image generation

---

## Installation

### 1. Clone & install

```bash
git clone <your-repo>
cd ayra
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ayra"
OLLAMA_HOST="http://localhost:11434"
```

### 3. Set up the database

```bash
# Create the database
createdb ayra

# Push schema & generate client
pnpm db:push

# (Optional) Seed with sample data
pnpm db:seed
```

### 4. Install Ollama models

```bash
# Recommended models
ollama pull llama3.2          # Fast, capable (default)
ollama pull llama3.1:8b       # Larger, smarter
ollama pull codellama:13b     # Best for code
ollama pull nomic-embed-text  # For semantic memory search
```

### 5. Run AYRA

```bash
pnpm dev
```

Open **http://localhost:3000** — AYRA is live.

---

## Project Structure

```
ayra/
├── app/
│   ├── (dashboard)/          # All protected routes
│   │   ├── page.tsx          # Dashboard
│   │   ├── chat/             # Chat module
│   │   │   ├── page.tsx      # Chat list
│   │   │   ├── [id]/         # Individual chat
│   │   │   └── new/          # New chat
│   │   ├── memory/           # Memory system
│   │   ├── tasks/            # Task manager
│   │   ├── vault/            # Knowledge vault
│   │   ├── code/             # Code workspace
│   │   ├── studio/           # Image studio
│   │   └── settings/         # Settings
│   ├── api/
│   │   ├── chat/             # Streaming chat endpoint
│   │   ├── chats/            # Chat CRUD
│   │   ├── memory/           # Memory CRUD + extraction
│   │   ├── tasks/            # Task CRUD + AI generation
│   │   ├── vault/            # Vault CRUD + search
│   │   ├── studio/           # Image listing
│   │   │   └── generate/     # Image generation
│   │   ├── models/           # Ollama model management
│   │   └── settings/         # User settings
│   ├── globals.css           # Tailwind v4 + design tokens
│   └── layout.tsx            # Root layout
│
├── components/
│   ├── ui/                   # Design system primitives
│   │   ├── index.tsx         # Button, GlassCard, Badge, etc.
│   │   └── QuantumOrb.tsx    # Signature AI status orb
│   ├── chat/
│   │   ├── ChatInterface.tsx # Full streaming chat UI
│   │   ├── MessageBubble.tsx # Message rendering + code highlighting
│   │   └── ModelPicker.tsx   # Ollama model selector
│   ├── sidebar/
│   │   └── Sidebar.tsx       # Collapsible navigation sidebar
│   └── layout/
│       └── CommandPalette.tsx # ⌘K universal command palette
│
├── lib/
│   ├── prisma.ts             # Database client singleton
│   ├── ollama.ts             # Ollama streaming client
│   ├── store/
│   │   └── index.ts          # Zustand stores (chat, tasks, memory, UI)
│   └── utils/
│       └── index.ts          # Shared utilities
│
├── prisma/
│   └── schema.prisma         # Full database schema
│
├── types/
│   └── index.ts              # TypeScript type definitions
│
└── .env.example              # Environment variables template
```

---

## Design System

AYRA uses a custom dark-only design system with:

- **Colors**: Deep void backgrounds, violet accent, cyan secondary
- **Glass morphism**: Layered surfaces with blur and transparency
- **Quantum Orb**: Animated canvas element that shows AI state (idle/thinking/speaking)
- **Typography**: Inter (UI) + JetBrains Mono (code)
- **Animations**: Framer Motion with spring physics

### CSS Variables

```css
--color-void:        #050507   /* Deepest background */
--color-surface-1:   #0f0f14   /* Cards */
--color-surface-2:   #141419   /* Hover states */
--color-violet-600:  #7c3aed   /* Primary accent */
--color-cyan-500:    #06b6d4   /* Secondary accent */
--color-text-primary: #f0f0f8  /* Main text */
--color-text-muted:  #4a4a62   /* Subtle text */
```

---

## API Architecture

### Chat Streaming
```
POST /api/chat
Body: { chatId, messages, model, systemPrompt, includeMemory }
Response: Server-Sent Events stream
  data: {"type":"text","content":"..."}
  data: {"type":"done","metadata":{...}}
```

### Memory Extraction
```
PUT /api/memory
Body: { chatId, messages, userId }
Response: { memories: Memory[] }
```

### Task AI Generation
```
PUT /api/tasks
Body: { prompt, userId }
Response: { tasks: Task[] }
```

### Image Generation
```
POST /api/studio/generate
Body: { prompt, negativePrompt, steps, cfgScale, width, height, seed, engine }
Response: StudioImage
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open command palette |
| `⌘1–7` | Navigate to module |
| `Enter` | Send chat message |
| `Shift+Enter` | New line in chat |
| `Escape` | Close modal/palette |

---

## Roadmap

### v1.1
- [ ] Semantic search with pgvector
- [ ] Chat folders & drag-drop organization
- [ ] Voice input/output
- [ ] Mobile app (Capacitor)

### v1.2  
- [ ] Multi-agent workflows
- [ ] Calendar integration
- [ ] Email reader & summarizer
- [ ] Browser extension

### v2.0
- [ ] Plugin system
- [ ] RAG pipeline for vault documents
- [ ] Local fine-tuning interface
- [ ] AYRA-to-AYRA sync (encrypted)

---

## License

MIT — Build, customize, self-host freely.

---

<div align="center">
  <p>Built with 🖤 for those who believe their AI should be <em>theirs</em>.</p>
</div>
