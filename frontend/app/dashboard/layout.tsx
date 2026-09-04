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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f9fd]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#cfe0f7] border-t-[#1267e8]" />
          <p className="text-sm font-medium text-[#71849a]">Checking your session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-[#10243e]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[#1267e8]/[0.035] blur-3xl" />
        <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#4a91f5]/[0.025] blur-3xl" />
      </div>

      <Sidebar user={user} />
      <TopBar title={pageTitle(pathname)} user={user} />

      <main className="relative z-[1] ml-[260px] min-h-screen pt-16 max-lg:ml-0">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-7 lg:px-9">
          {children}
        </div>
      </main>
    </div>
  );
}
