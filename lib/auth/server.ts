// ============================================================
// AYRA — Neon Auth Server Instance
// ============================================================

import { createServerAuth } from "@neondatabase/auth/next/server";

// The two env vars come from: Neon Console → your project → Auth → Setup Guide
export const auth = createServerAuth({
  baseUrl:      process.env.NEON_AUTH_BASE_URL!,
  cookieSecret: process.env.NEON_AUTH_COOKIE_SECRET!,
});
