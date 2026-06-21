// ============================================================
// AYRA — Session Helper
// Call in Server Components, Route Handlers, and Server Actions
// ============================================================

import { auth }     from "@/lib/auth/server";
import { prisma }   from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers }  from "next/headers";

// ── Types ─────────────────────────────────────────────────────

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  image?: string | null;
}

// ── getSession ────────────────────────────────────────────────
// Returns null when no session exists (use for optional auth).

export async function getSession(): Promise<SessionUser | null> {
  try {
    const session = await auth.getSession({ headers: await headers() });
    if (!session?.user) return null;
    return {
      id:    session.user.id,
      name:  session.user.name  ?? "AYRA User",
      email: session.user.email ?? "",
      image: session.user.image ?? null,
    };
  } catch {
    return null;
  }
}

// ── getOrCreateUser ───────────────────────────────────────────
// Upserts an AYRA User row whose id matches the Neon Auth UUID.
// Called on every authenticated request so the row always exists.

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
// Also ensures a matching AYRA User row exists (upsert pattern).

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
    const session = await auth.getSession({ headers: req.headers as never });
    if (!session?.user?.id) return "default";

    // Lazily sync the user row on every API call
    await getOrCreateUser({
      id:    session.user.id,
      name:  session.user.name  ?? "AYRA User",
      email: session.user.email ?? "",
      image: session.user.image ?? null,
    });

    return session.user.id;
  } catch {
    return "default";
  }
}
