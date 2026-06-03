"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

// Derive a readable page title from the current pathname
function pageTitle(pathname: string): string {
  if (pathname.includes("/students"))   return "Students";
  if (pathname.includes("/teachers"))   return "Teachers";
  if (pathname.includes("/classes"))    return "Classes";
  if (pathname.includes("/attendance")) return "Attendance";
  if (pathname.includes("/grades"))     return "Grades";
  return "Dashboard";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  // If there's no token in localStorage, immediately navigate to login
  // to avoid rendering a persistent Loading screen while the auth check runs.
  if (typeof window !== "undefined" && !isAuthenticated()) {
    router.replace("/login");
    return null;
  }

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) {
    // Full-screen loading state while auth check runs
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08080f" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6b6b80", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", position: "relative" }}>
      {/* Subtle background mesh */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div className="animate-blob-1" style={{ position: "absolute", top: "20%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="animate-blob-2" style={{ position: "absolute", bottom: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)", filter: "blur(70px)" }} />
      </div>

      <Sidebar user={user} />
      <TopBar title={pageTitle(pathname)} user={user} />

      {/* Main content */}
      <main
        style={{
          marginLeft: 260,
          paddingTop: 64,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
        className="max-lg:ml-0"
      >
        <div style={{ padding: "28px 28px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
