import { NextRequest, NextResponse } from "next/server";

// If Neon Auth is configured, use its middleware; otherwise pass through
let authMiddleware: ((req: NextRequest) => Response | NextResponse) | null = null;

if (process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET) {
  const { auth } = require("@/lib/auth/server");
  if (auth) {
    const handler = auth.middleware({ loginUrl: "/auth/sign-in" });
    authMiddleware = handler;
  }
}

export default function middleware(req: NextRequest) {
  if (authMiddleware) return authMiddleware(req);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!auth|api/auth|_next/static|_next/image|uploads|favicon|icons).*)",
  ],
};