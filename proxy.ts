// ============================================================
// AYRA — Auth Middleware (proxy.ts for Next.js 16)
// Protects all dashboard routes — redirects to sign-in if not authed
// Note: In Next.js <16 rename this file to middleware.ts
// ============================================================

import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    /*
     * Match all dashboard routes:
     * /             → dashboard
     * /chat, /chat/[id], /chat/new
     * /memory
     * /tasks
     * /vault
     * /code
     * /studio
     * /settings
     *
     * Exclude:
     * /auth/*       → sign-in / sign-up pages
     * /api/auth/*   → Neon Auth API handler
     * /_next/*      → Next.js internals
     * /uploads/*    → public uploaded files
     */
    "/((?!auth|api/auth|_next/static|_next/image|uploads|favicon|icons).*)",
  ],
};
