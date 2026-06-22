import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — AYRA",
};

// Bare layout — no sidebar, no padding, no wrapper divs.
// The page itself handles all positioning with position:fixed centering.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
