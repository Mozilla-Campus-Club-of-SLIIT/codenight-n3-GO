import { AppShell } from "@/components/shell/app-shell";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
