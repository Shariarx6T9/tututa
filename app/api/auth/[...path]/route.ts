// ============================================================
// AYRA — Neon Auth API Handler
// Proxies all /api/auth/* requests to Neon Auth service
// ============================================================

import { auth } from "@/lib/auth/server";

export const { GET, POST } = auth.handler();
