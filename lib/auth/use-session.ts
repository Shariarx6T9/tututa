"use client";

// ============================================================
// AYRA — useSession Client Hook
// Wraps Neon Auth useSession into an AYRA-typed interface
// ============================================================

import { useCallback }   from "react";
import { authClient }    from "@/lib/auth/client";
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

  // useSession from @neondatabase/auth/next exposes { data, isPending }
  // We use the authClient directly to avoid a double-package import here.
  // The session is read from the cookie via the client.
  const { data: session, isPending } = authClient.useSession();

  const signOut = useCallback(async () => {
    await authClient.signOut();
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
