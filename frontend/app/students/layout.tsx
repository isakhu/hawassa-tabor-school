import DashboardShell from "@/components/DashboardShell";

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
