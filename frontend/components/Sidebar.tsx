"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import type { AuthUser } from "@/lib/auth";

const Icons = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  Students: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Teachers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3V12"/><path d="M22 10v6"/></svg>,
  Classes: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>,
  Attendance: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Grades: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5M4 19h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  Close: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>,
};

const NAV = [
  { label: "Dashboard", href: "", icon: Icons.Dashboard, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Students", href: "/students", icon: Icons.Students, roles: [ROLES.ADMIN] },
  { label: "Teachers", href: "/teachers", icon: Icons.Teachers, roles: [ROLES.ADMIN] },
  { label: "Classes", href: "/classes", icon: Icons.Classes, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Attendance", href: "/attendance", icon: Icons.Attendance, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Grades", href: "/grades", icon: Icons.Grades, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
];

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function roleName(role: ROLES) {
  return role === ROLES.ADMIN ? "Administrator" : role === ROLES.TEACHER ? "Teacher" : "Student";
}

export default function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = user.role === ROLES.ADMIN ? "/dashboard/admin" : user.role === ROLES.TEACHER ? "/dashboard/teacher" : "/dashboard/student";
  const items = NAV.filter((item) => item.roles.includes(user.role)).map((item) => ({ ...item, href: item.href || basePath }));

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-[72px] shrink-0 items-center border-b border-[#e4ebf3] px-5">
        <Link href={basePath} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#1267e8]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="M6 10.5v5L12 19l6-3.5v-5"/></svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[18px] font-extrabold tracking-tight text-[#0b1f3a]">Tabor School</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8294a8]">School Management</span>
          </span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a9bad]">Navigation</p>
        <div className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium no-underline transition ${active ? "bg-[#eaf2ff] text-[#1267e8]" : "text-[#5f748b] hover:bg-[#f5f8fc] hover:text-[#183651]"}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[#e4ebf3] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-[#e2eaf3] bg-[#f8fbff] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1267e8] text-xs font-bold text-white">{initials(user.full_name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1b3854]">{user.full_name}</p>
            <p className="text-xs text-[#8395a8]">{roleName(user.role)}</p>
          </div>
        </div>
        <button onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-[#6a7e94] transition hover:bg-[#fff5f5] hover:text-[#bb4141]">
          <Icons.Logout />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[210] hidden h-10 w-10 items-center justify-center rounded-xl border border-[#dbe5f0] bg-white text-[#173653] shadow-sm max-lg:flex"
      >
        <Icons.Menu />
      </button>

      <aside className="fixed left-0 top-0 z-[200] h-dvh w-[260px] border-r border-[#dbe5f0] shadow-[4px_0_18px_rgba(20,52,90,0.04)] max-lg:hidden">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[300] max-lg:block" aria-modal="true" role="dialog">
          <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-[#0b1f3a]/30" />
          <aside className="absolute left-0 top-0 h-dvh w-[280px] border-r border-[#dbe5f0] shadow-xl">{content}</aside>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute left-[292px] top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white text-[#173653] shadow-sm">
            <Icons.Close />
          </button>
        </div>
      )}
    </>
  );
}
