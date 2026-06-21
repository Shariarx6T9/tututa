"use client";

// ============================================================
// AYRA — Neon Auth Client
// Used in client components for sign-in/sign-up/sign-out
// and for reading session state via authClient.useSession()
// ============================================================

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
