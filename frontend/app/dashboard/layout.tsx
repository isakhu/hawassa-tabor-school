"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function pageTitle(pathname: string): string {
  if (pathname.includes("/students")) return "Students";
  if (pathname.includes("/teachers")) return "Teachers";
  if (pathname.includes("/classes")) return "Classes";
  if (pathname.includes("/attendance")) return "Attendance";
  if (pathname.includes("/grades")) return "Grades";
  return "Dashboard";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f6f9fd]">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#cfe0f7] border-t-[#1267e8]" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#f6f9fd] text-[#10243e]">
      <Sidebar user={user} />
      <TopBar title={pageTitle(pathname)} user={user} />

      <main className="ml-[260px] h-[calc(100dvh-72px)] overflow-hidden pt-[72px] max-lg:ml-0">
        <div className="h-full w-full p-5 sm:p-6 lg:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
