"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import type { AuthUser } from "@/lib/auth";

const Icons = {
  Grid:         () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>,
  People:       () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Cap:          () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>,
  Book:         () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  Calendar:     () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Chart:        () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
  ExternalLink: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
  Logout:       () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Menu:         () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  X:            () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

const ALL_NAV = [
  { label: "Dashboard",  href: "",            icon: Icons.Grid,     roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Students",   href: "/students",   icon: Icons.People,   roles: [ROLES.ADMIN] },
  { label: "Teachers",   href: "/teachers",   icon: Icons.Cap,      roles: [ROLES.ADMIN] },
  { label: "Classes",    href: "/classes",    icon: Icons.Book,     roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Attendance", href: "/attendance", icon: Icons.Calendar, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Grades",     href: "/grades",     icon: Icons.Chart,    roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function roleBadgeGradient(role: ROLES) {
  if (role === ROLES.ADMIN)   return "linear-gradient(135deg,#6366f1,#4f46e5)";
  if (role === ROLES.TEACHER) return "linear-gradient(135deg,#8b5cf6,#7c3aed)";
  return "linear-gradient(135deg,#ec4899,#db2777)";
}

export default function Sidebar({ user }: { user: AuthUser }) {
  const pathname    = usePathname();
  const [open, setOpen] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const basePath =
    user.role === ROLES.ADMIN   ? "/dashboard/admin"
    : user.role === ROLES.TEACHER ? "/dashboard/teacher"
    : "/dashboard/student";

  const navItems = ALL_NAV
    .filter((n) => n.roles.includes(user.role))
    .map((n) => ({ ...n, href: n.href === "" ? basePath : n.href }));

  const isActive = (href: string) =>
    pathname === href || (href !== basePath && pathname.startsWith(href));

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-animated">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="sbLogo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6366f1" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z" fill="url(#sbLogo)" opacity="0.15" />
              <path d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z" stroke="url(#sbLogo)" strokeWidth="2" fill="none" />
              <path d="M17 24L22 29L31 19" stroke="url(#sbLogo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="gradient-text" style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 800 }}>
            EduCore
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#6b6b80", textTransform: "uppercase", padding: "0 10px", marginBottom: 8 }}>
          Main Menu
        </p>
        {navItems.map((item, idx) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none", position: "relative",
                background: active
                  ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))"
                  : "transparent",
                color: active ? "#e8e8f0" : "#9898b0",
                fontFamily: "var(--font-dm-sans)", fontSize: 14,
                fontWeight: active ? 600 : 400,
                transition: "background 0.2s ease, color 0.2s ease",
                animation: "itemIn 0.35s ease-out both",
                animationDelay: `${idx * 45}ms`,
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {/* Active left accent bar */}
              <div style={{
                position: "absolute", left: 0, top: "20%", bottom: "20%",
                width: 3, borderRadius: 2,
                background: active ? "linear-gradient(180deg,#6366f1,#ec4899)" : "transparent",
                ...(active ? { boxShadow: "0 0 10px #6366f1" } : {}),
              }} />
              <span style={{ color: active ? "#a78bfa" : "#6b6b80", transition: "color 0.2s ease", marginLeft: 2 }}>
                <item.icon />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "10px", borderTop: "1px solid rgba(99,102,241,0.1)" }}>
        <a
          href="https://github.com/isakhu/school-managment-system/actions"
          target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, textDecoration: "none", color: "#6b6b80", fontSize: 13, marginBottom: 2, transition: "background 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>System Status</span>
          <Icons.ExternalLink />
        </a>

        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "transparent", border: "none", color: "#6b6b80", fontSize: 13, cursor: "pointer", width: "100%", transition: "background 0.2s, color 0.2s", fontFamily: "var(--font-dm-sans)", minHeight: 44 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b6b80"; }}
        >
          <Icons.Logout /> Logout
        </button>

        {/* User card */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", marginTop: 6, background: "rgba(99,102,241,0.06)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.12)" }}>
          {/* Avatar with hover ring */}
          <div
            style={{ position: "relative", flexShrink: 0 }}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            {avatarHover && (
              <div style={{
                position: "absolute", inset: -3, borderRadius: "50%",
                background: "conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #6366f1)",
                animation: "ringRotate 1.5s linear infinite",
                zIndex: 0,
              }} />
            )}
            <div style={{
              position: "relative", zIndex: 1,
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff",
              fontFamily: "var(--font-syne)",
              border: "2px solid #08080f",
            }}>
              {getInitials(user.full_name)}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.full_name}
            </p>
            <span style={{ display: "inline-block", marginTop: 2, padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "#fff", background: roleBadgeGradient(user.role), textTransform: "capitalize" }}>
              {user.role.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Mobile bottom nav items ────────────────────────────────────────────────
  const bottomNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* Desktop/tablet hamburger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden"
        style={{ position: "fixed", top: 14, left: 14, zIndex: 200, width: 44, height: 44, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e8e8f0", transition: "background 0.2s" }}
      >
        {open ? <Icons.X /> : <Icons.Menu />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden"
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 149, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", animation: "pageIn 0.2s ease forwards" }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed", top: 0, left: 0, width: 260, height: "100vh",
          background: "rgba(11,11,18,0.97)",
          backdropFilter: "blur(24px)",
          zIndex: 150,
          display: "flex",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={!open ? "max-lg:translate-x-[-260px]" : ""}
      >
        {/* Animated right border */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 1, height: "100%", overflow: "hidden" }}>
          <div className="sidebar-border" style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>{sidebarContent}</div>
      </aside>

      {/* Mobile bottom navigation bar */}
      <nav className="bottom-nav lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {bottomNavItems.map((item, idx) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`bottom-nav-item${active ? " active" : ""}`}
              style={{ "--nav-index": idx } as React.CSSProperties}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
