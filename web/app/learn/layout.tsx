import { AppShell } from "@/components/shell/app-shell";

export const instant = false;

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
