// ============================================================
// AYRA — Session Helper
// Call in Server Components, Route Handlers, and Server Actions
// ============================================================

import { auth }     from "@/lib/auth/server";
import { prisma }   from "@/lib/prisma";
import { redirect } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  image?: string | null;
}

// ── getSession ────────────────────────────────────────────────
// Returns null when no session exists (use for optional auth).
// In @neondatabase/auth >=0.4, getSession() reads from next/headers automatically.

export async function getSession(): Promise<SessionUser | null> {
  try {
    const session = await auth.getSession();
    if (!session?.data?.user) return null;
    const user = session.data.user;
    return {
      id:    user.id,
      name:  user.name  ?? "AYRA User",
      email: user.email ?? "",
      image: user.image ?? null,
    };
  } catch {
    return null;
  }
}

// ── getOrCreateUser ───────────────────────────────────────────
// Upserts an AYRA User row whose id matches the Neon Auth UUID.

export async function getOrCreateUser(authUser: SessionUser) {
  return prisma.user.upsert({
    where:  { id: authUser.id },
    update: {
      name:   authUser.name,
      avatar: authUser.image ?? undefined,
    },
    create: {
      id:       authUser.id,
      name:     authUser.name,
      email:    authUser.email,
      avatar:   authUser.image ?? undefined,
      password: "",             // auth is fully handled by Neon Auth
    },
  });
}

// ── requireSession ────────────────────────────────────────────
// Redirects to sign-in when unauthenticated.

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/auth/sign-in");

  // Sync Neon Auth user → AYRA users table (idempotent)
  await getOrCreateUser(user);

  return user;
}

// ── getUserIdFromRequest ──────────────────────────────────────
// For Route Handlers — extracts userId from the request session.
// Falls back to query-param userId in local dev (no auth env vars).

export async function getUserIdFromRequest(req: Request): Promise<string> {
  // Local dev fallback when Neon Auth is not configured
  if (!process.env.NEON_AUTH_BASE_URL) {
    const { searchParams } = new URL(req.url);
    return searchParams.get("userId") ?? "default";
  }

  try {
    // In route handlers the SDK reads cookies from the incoming request automatically
    const session = await auth.getSession();
    if (!session?.data?.user?.id) return "default";

    const u = session.data.user;
    await getOrCreateUser({
      id:    u.id,
      name:  u.name  ?? "AYRA User",
      email: u.email ?? "",
      image: u.image ?? null,
    });

    return u.id;
  } catch {
    return "default";
  }
}
