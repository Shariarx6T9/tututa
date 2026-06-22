// lib/auth/server.ts
import { createNeonAuth } from "@neondatabase/auth/next/server";

const hasAuth =
  !!process.env.NEON_AUTH_BASE_URL &&
  !!process.env.NEON_AUTH_COOKIE_SECRET;

export const auth = hasAuth
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
    })
  : null;