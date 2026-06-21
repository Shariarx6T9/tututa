// ============================================================
// AYRA — Auth Middleware
// Protects all dashboard routes; redirects to /auth/sign-in
// ============================================================

import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // If Neon Auth is not configured (local dev without auth), pass through
  if (!process.env.NEON_AUTH_BASE_URL) {
    return NextResponse.next();
  }
  return auth.middleware({ loginUrl: "/auth/sign-in" })(req as never);
}

export const config = {
  matcher: [
    /*
     * Match every route EXCEPT:
     *  - /auth/*           sign-in / sign-up pages
     *  - /api/auth/*       Neon Auth API handler
     *  - /_next/*          Next.js internals
     *  - /uploads/*        public static files
     *  - /favicon*, /icons static assets
     */
    "/((?!auth|api/auth|_next/static|_next/image|uploads|favicon|icons).*)",
  ],
};
