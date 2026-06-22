import { requireSession } from "@/lib/auth/session";
import DashboardShell     from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}