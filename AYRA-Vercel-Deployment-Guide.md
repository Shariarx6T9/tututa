# AYRA — Vercel Deployment Guide

## Overview

AYRA runs **100% locally** by default (Ollama + PostgreSQL). Deploying to Vercel
requires replacing 2 things:

| Local             | Vercel Equivalent             | Cost   |
|-------------------|-------------------------------|--------|
| PostgreSQL (local)| Neon Serverless Postgres       | Free   |
| Ollama (local)    | Groq API                      | Free   |
| Disk uploads      | Vercel Blob                   | Free   |
| SD / ComfyUI      | Replicate (optional)          | Pay/use|

Total cost for a personal deployment: **$0/month** with free tiers.

---

## Step 1 — Set Up Neon Database (5 min)

Neon is a serverless PostgreSQL that pairs perfectly with Vercel.

1. Go to **https://neon.tech** → Sign up (GitHub login works)
2. Click **"New Project"** → name it `ayra` → choose a region close to you
3. Copy the **Connection String** — it looks like:
   ```
   postgresql://alex:AbC123dEf@ep-cool-lab-123.us-east-2.aws.neon.tech/ayra?sslmode=require
   ```
4. Save this — you'll use it in Step 4

**Alternative databases that also work:**
- **Supabase** → Settings → Database → Connection string (use the "URI" format)
- **Vercel Postgres** → Vercel Dashboard → Storage → Create Database
- **PlanetScale** (MySQL) → requires changing `provider = "mysql"` in `schema.prisma`

---

## Step 2 — Get a Groq API Key (2 min)

Groq runs Llama 3 at incredible speed — 500+ tokens/sec — and has a generous free tier.

1. Go to **https://console.groq.com** → Sign up
2. Go to **API Keys** → **Create API Key**
3. Copy the key → it starts with `gsk_`

**Default model on Groq:** `llama-3.3-70b-versatile`
This is close to GPT-4o in quality, completely free up to rate limits.

**Alternative AI providers:**

| Provider    | Get Key                  | Best Model                          |
|-------------|--------------------------|-------------------------------------|
| OpenRouter  | openrouter.ai            | `meta-llama/llama-3.3-70b-instruct` |
| OpenAI      | platform.openai.com      | `gpt-4o-mini`                       |
| Anthropic   | console.anthropic.com    | `claude-3-5-haiku-20241022`         |

---

## Step 3 — Push Code to GitHub (2 min)

```bash
cd ayra

# Initialize git repo
git init
git add .
git commit -m "initial commit"

# Create repo on GitHub then:
git remote add origin https://github.com/YOUR_USERNAME/ayra.git
git push -u origin main
```

Create a `.gitignore` to keep secrets out:

```gitignore
# .gitignore
.env
.env.local
.env.production
node_modules/
.next/
uploads/
*.log
```

---

## Step 4 — Deploy to Vercel (3 min)

### Option A — Vercel Dashboard (Recommended)

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New Project"** → Import your `ayra` repository
3. Vercel auto-detects Next.js — leave the defaults as-is
4. **Before clicking Deploy**, click **"Environment Variables"** and add:

```
DATABASE_URL        postgresql://user:pass@ep-xxx.neon.tech/ayra?sslmode=require
GROQ_API_KEY        gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL https://your-project.vercel.app
AUTH_SECRET         [generate 32+ random chars — use: openssl rand -base64 32]
```

5. Click **Deploy** → wait ~2 minutes

### Option B — Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add GROQ_API_KEY
vercel env add AUTH_SECRET
vercel env add NEXT_PUBLIC_APP_URL

# Redeploy to pick up env vars
vercel --prod
```

---

## Step 5 — Run Database Migrations

After first deploy, you need to push your schema to Neon.

### Option A — From your local machine

```bash
# Set the Neon DATABASE_URL in your local .env.local temporarily
DATABASE_URL="postgresql://..." pnpm db:push

# Or with migrate (creates migration files)
DATABASE_URL="postgresql://..." pnpm db:migrate

# Seed initial data
DATABASE_URL="postgresql://..." pnpm db:seed
```

### Option B — Via Vercel CLI (runs in Vercel's environment)

```bash
vercel run "prisma db push"
vercel run "tsx prisma/seed.ts"
```

### Option C — Neon Console (SQL)

In the Neon dashboard → SQL Editor, you can run raw SQL if needed.

---

## Step 6 — (Optional) Set Up Vercel Blob for File Uploads

Without this, the Vault upload feature is disabled on Vercel.

1. In **Vercel Dashboard** → your project → **Storage** tab
2. Click **"Create Database"** → choose **Blob**
3. Name it `ayra-uploads` → Create
4. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` to your project env vars
5. Redeploy: `vercel --prod`

Install the SDK:
```bash
npm install @vercel/blob
```

---

## Step 7 — Verify Deployment

Visit your Vercel URL and check:

```
https://your-project.vercel.app/api/models
```

Should return:
```json
{
  "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  "available": true,
  "provider": "groq"
}
```

---

## Full Environment Variables Reference

Paste into **Vercel → Project → Settings → Environment Variables**:

```bash
# ── Required ─────────────────────────────────────────────────
DATABASE_URL="postgresql://..."           # Neon / Supabase / Vercel Postgres
GROQ_API_KEY="gsk_..."                   # OR use OPENAI_API_KEY / OPENROUTER_API_KEY
AUTH_SECRET="random-32-char-string"      # openssl rand -base64 32
NEXT_PUBLIC_APP_URL="https://xxx.vercel.app"

# ── Optional: Alternative AI providers ───────────────────────
# OPENAI_API_KEY="sk-..."
# OPENROUTER_API_KEY="sk-or-v1-..."

# ── Optional: File uploads ────────────────────────────────────
# BLOB_READ_WRITE_TOKEN="..."            # Auto-added by Vercel Blob

# ── Optional: Self-hosted Ollama on a VPS ────────────────────
# OLLAMA_HOST="https://ollama.your-vps.com"

# ── Optional: Image generation on a VPS ──────────────────────
# SD_HOST="https://sd.your-vps.com"
# COMFY_HOST="https://comfy.your-vps.com"
```

---

## Provider Auto-Detection Logic

AYRA automatically picks the right AI provider based on which env vars are present:

```
GROQ_API_KEY set?       → Uses Groq (llama-3.3-70b-versatile)
OPENROUTER_API_KEY set? → Uses OpenRouter
OPENAI_API_KEY set?     → Uses OpenAI (gpt-4o-mini)
None of the above?      → Uses Ollama (http://localhost:11434)
```

You can also force a provider per-request by passing `provider` in the API body.

---

## Keeping Ollama + Running Locally

If you want the **best of both worlds** — local AI when at home, Vercel for access anywhere:

1. Deploy to Vercel with `GROQ_API_KEY` for cloud access
2. Run locally with `.env.local` pointing to Ollama
3. AYRA auto-switches based on environment

```bash
# .env.local (local dev — uses Ollama)
DATABASE_URL="postgresql://localhost/ayra"
OLLAMA_HOST="http://localhost:11434"

# Vercel env vars (production — uses Groq)
DATABASE_URL="postgresql://neon.tech/ayra"
GROQ_API_KEY="gsk_..."
```

---

## Self-Hosting on a VPS (Alternative to Vercel)

For maximum privacy with no third-party AI:

### Requirements
- VPS with **8GB+ RAM** (for Ollama with 7B model)
- Ubuntu 22.04 or Debian 12
- Domain with SSL (Caddy handles this automatically)

### Quick Setup

```bash
# 1. Install Node, PostgreSQL, Ollama
curl -fsSL https://ollama.com/install.sh | sh
sudo apt install postgresql nodejs npm -y

# 2. Clone and build
git clone https://github.com/you/ayra
cd ayra && npm install
npm run build

# 3. Set env vars
cp .env.example .env.local
nano .env.local   # fill in DATABASE_URL, etc.

# 4. Run with PM2
npm install -g pm2
pm2 start npm --name ayra -- start
pm2 save && pm2 startup

# 5. Caddy reverse proxy (auto SSL)
sudo apt install caddy
```

`/etc/caddy/Caddyfile`:
```
ayra.yourdomain.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

---

## Troubleshooting

### "PrismaClientInitializationError" on Vercel

The database URL is wrong or the schema hasn't been pushed.

```bash
# Re-run from local with Neon URL
DATABASE_URL="postgresql://neon..." pnpm db:push
```

### "Groq API key invalid"

Check the key starts with `gsk_` and has no extra spaces in the Vercel env var.

### "Function timeout" on long AI responses

Upgrade to **Vercel Pro** to increase `maxDuration` to 300 seconds.
On the Hobby plan, functions time out at 10 seconds — too short for large AI responses.

**Workaround for Hobby plan:** Use Groq with a smaller model like
`llama-3.1-8b-instant` which responds in 1-3 seconds.

### File uploads not working on Vercel

Set up Vercel Blob (Step 6) or use Cloudinary:

```bash
npm install cloudinary
# CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

### "NEXT_DIST_DIR" build error

Make sure `vercel.json` has:
```json
{ "buildCommand": "prisma generate && next build" }
```

Prisma client must be generated before Next.js builds.

---

## Deployment Checklist

- [ ] Neon database created and connection string copied
- [ ] Groq API key generated
- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked to repo
- [ ] All env vars added in Vercel dashboard
- [ ] `prisma db push` run against Neon database
- [ ] `prisma db seed` run for initial data
- [ ] `/api/models` endpoint returns `"available": true`
- [ ] Can create a chat and get a streaming response
- [ ] (Optional) Vercel Blob set up for file uploads

---

*AYRA v1.0 — Self-hosted AI OS*
