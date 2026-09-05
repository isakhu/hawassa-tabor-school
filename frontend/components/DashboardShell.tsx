"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function getPageTitle(pathname: string): string {
  if (pathname.includes("/students"))   return "Students Management";
  if (pathname.includes("/teachers"))   return "Teachers Management";
  if (pathname.includes("/classes"))    return "Classes & Sections";
  if (pathname.includes("/attendance")) return "Attendance Management";
  if (pathname.includes("/grades"))     return "Academic Grades";
  if (pathname.includes("/dashboard/admin"))   return "Administrator Dashboard";
  if (pathname.includes("/dashboard/teacher")) return "Teacher Portal";
  if (pathname.includes("/dashboard/student")) return "Student Portal";
  return "Tabor School Portal";
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-3 border-[#1267e8]/20 border-t-[#1267e8]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            Loading School Records…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <Sidebar user={user} />
      <TopBar title={getPageTitle(pathname)} user={user} />

      <main className="min-h-screen px-4 pb-12 pt-[90px] sm:px-6 md:px-8 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-7xl animate-page-in">
          {children}
        </div>
      </main>
    </div>
  );
}
