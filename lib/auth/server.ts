// ============================================================
// AYRA — Neon Auth Server Instance
// ============================================================

import { createNeonAuth } from "@neondatabase/auth/next/server";

// The two env vars come from: Neon Console → your project → Auth → Setup Guide
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
