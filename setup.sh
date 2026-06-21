#!/usr/bin/env bash
# ============================================================
# AYRA — One-Command Setup Script
# Usage: bash setup.sh
# ============================================================

set -e

VIOLET='\033[0;35m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

print_step() { echo -e "\n${VIOLET}▸${RESET} ${BOLD}$1${RESET}"; }
print_ok()   { echo -e "  ${GREEN}✓${RESET} $1"; }
print_warn() { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
print_err()  { echo -e "  ${RED}✗${RESET} $1"; }
print_info() { echo -e "  ${CYAN}ℹ${RESET}  $1"; }

echo ""
echo -e "${VIOLET}${BOLD}╔══════════════════════════════════════╗${RESET}"
echo -e "${VIOLET}${BOLD}║         AYRA Setup Script           ║${RESET}"
echo -e "${VIOLET}${BOLD}║   Private AI Operating System        ║${RESET}"
echo -e "${VIOLET}${BOLD}╚══════════════════════════════════════╝${RESET}"
echo ""

# ── 1. Node.js check ─────────────────────────────────────────
print_step "Checking Node.js version"
if ! command -v node &>/dev/null; then
  print_err "Node.js not found. Install from https://nodejs.org (v22+ required)"
  exit 1
fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 22 ]; then
  print_warn "Node.js v$NODE_VER found. v22+ recommended."
else
  print_ok "Node.js $(node -v)"
fi

# ── 2. Package manager ────────────────────────────────────────
print_step "Installing dependencies"
if command -v pnpm &>/dev/null; then
  PKG="pnpm"
elif command -v npm &>/dev/null; then
  PKG="npm"
else
  print_err "No package manager found"
  exit 1
fi
print_info "Using $PKG"
$PKG install
print_ok "Dependencies installed"

# ── 3. .env.local setup ───────────────────────────────────────
print_step "Setting up environment"
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  print_ok "Created .env.local from .env.local.example"
  print_warn "Edit .env.local and set your DATABASE_URL before continuing"
else
  print_ok ".env.local already exists"
fi

# Check DATABASE_URL
if ! grep -q "^DATABASE_URL=" .env.local 2>/dev/null; then
  print_warn "DATABASE_URL not set in .env.local"
fi

# ── 4. Docker PostgreSQL ──────────────────────────────────────
print_step "Starting local PostgreSQL (Docker)"
if command -v docker &>/dev/null; then
  if docker compose ps postgres 2>/dev/null | grep -q "running"; then
    print_ok "PostgreSQL already running"
  else
    docker compose up -d postgres
    print_info "Waiting for PostgreSQL to be ready..."
    sleep 3
    print_ok "PostgreSQL started on port 5432"
  fi
else
  print_warn "Docker not found — skipping. Make sure PostgreSQL is running manually."
fi

# ── 5. Prisma setup ───────────────────────────────────────────
print_step "Setting up database schema"
$PKG run db:push 2>&1 | tail -5
print_ok "Schema pushed"

print_step "Seeding initial data"
if command -v tsx &>/dev/null; then
  tsx prisma/seed.ts
else
  $PKG exec tsx prisma/seed.ts
fi
print_ok "Database seeded"

# ── 6. Ollama check ───────────────────────────────────────────
print_step "Checking Ollama"
if command -v ollama &>/dev/null; then
  print_ok "Ollama found: $(ollama --version 2>/dev/null || echo 'installed')"
  
  # Check if llama3.2 is already pulled
  if ollama list 2>/dev/null | grep -q "llama3.2"; then
    print_ok "llama3.2 model available"
  else
    print_info "Pulling llama3.2 (this may take a few minutes)..."
    ollama pull llama3.2
    print_ok "llama3.2 ready"
  fi

  # Check embedding model
  if ollama list 2>/dev/null | grep -q "nomic-embed-text"; then
    print_ok "nomic-embed-text available"
  else
    print_info "Pulling nomic-embed-text for semantic memory..."
    ollama pull nomic-embed-text
    print_ok "nomic-embed-text ready"
  fi
else
  print_warn "Ollama not found."
  print_info "Install from: https://ollama.ai"
  print_info "Then run: ollama pull llama3.2"
fi

# ── 7. Final summary ──────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║        AYRA is ready! 🚀             ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Run ${CYAN}${BOLD}$PKG run dev${RESET} to start AYRA"
echo -e "  Open ${CYAN}${BOLD}http://localhost:3000${RESET} in your browser"
echo ""
echo -e "  ${VIOLET}⌘K${RESET} — Command palette"
echo -e "  ${VIOLET}→${RESET}  — Chat with your local AI"
echo -e "  ${VIOLET}→${RESET}  — Add memories and tasks"
echo ""
echo -e "  Neon Auth:  ${YELLOW}Not configured${RESET} (auth is skipped in local dev)"
echo -e "  Ollama:     $(command -v ollama &>/dev/null && echo "${GREEN}Ready${RESET}" || echo "${YELLOW}Install from ollama.ai${RESET}")"
echo -e "  Database:   ${GREEN}Ready on port 5432${RESET}"
echo ""
