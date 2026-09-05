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
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    let active = true;
    let resolved = false;

    try {
      if (!isAuthenticated()) {
        resolved = true;
        router.replace("/login");
      } else {
        const currentUser = getUser();
        if (!currentUser || !currentUser.role || !currentUser.email) {
          resolved = true;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
          router.replace("/login");
        } else if (active) {
          resolved = true;
          setUser(currentUser);
          setAuthChecking(false);
        }
      }
    } catch {
      resolved = true;
      router.replace("/login");
    }

    const timeout = window.setTimeout(() => {
      if (!active || resolved) return;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      router.replace("/login");
    }, 3000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [router]);

  if (authChecking || !user) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#f6f9fd] text-[#71849a]">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#cfe0f7] border-t-[#1267e8]" aria-label="Checking your session" />
        <p className="text-sm">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#f6f9fd] text-[#10243e]">
      <Sidebar user={user} />
      <TopBar title={pageTitle(pathname)} user={user} />

      <main className="ml-[260px] h-dvh overflow-hidden pt-[72px] max-lg:ml-0">
        <div className="h-full w-full overflow-hidden p-5 sm:p-6 lg:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
