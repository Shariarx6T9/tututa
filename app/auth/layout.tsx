import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — AYRA",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // No sidebar, no nav — pure focused auth experience
  return <>{children}</>;
}
