"use client";
import { createAuthClient } from "@neondatabase/auth/next";

// Only create if env var is available (Neon Auth is optional)
export const authClient =
  typeof window !== "undefined"
    ? createAuthClient()
    : ({
        useSession: () => ({ data: null, isPending: false }),
        signOut: async () => {},
      } as ReturnType<typeof createAuthClient>);