import { requireSession } from "@/lib/auth/session";
import DashboardShell     from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard — redirects to /auth/sign-in if not authed
  const user = await requireSession();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
