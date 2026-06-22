"use client";
import { useCallback }   from "react";
import { useRouter }     from "next/navigation";

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  image?: string | null;
}

export function useSession(): {
  user:    SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
} {
  const router = useRouter();

  // Try to use authClient if Neon Auth is configured
  let sessionData: { data: { user?: { id: string; name?: string | null; email?: string | null; image?: string | null } } | null; isPending: boolean } = { data: null, isPending: false };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { authClient } = require("@/lib/auth/client");
    sessionData = authClient.useSession();
  } catch {
    // no auth configured
  }

  const { data: session, isPending } = sessionData;

  const signOut = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { authClient } = require("@/lib/auth/client");
      await authClient.signOut();
    } catch { /* no auth */ }
    router.push("/auth/sign-in");
    router.refresh();
  }, [router]);

  const user: SessionUser | null = session?.user
    ? {
        id:    session.user.id,
        name:  session.user.name  ?? "AYRA User",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  return { user, loading: isPending, signOut };
}