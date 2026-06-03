"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/auth";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function TopBar({ title, user }: { title: string; user: AuthUser }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: "var(--sidebar-width)",
        right: 0,
        height: 64,
        zIndex: 100,
        background: "rgba(8,8,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.12)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
      }}
      className="max-lg:left-0"
    >
      {/* Mobile menu toggle */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('educore-toggle-sidebar'))}
        className="lg:hidden"
        style={{ position: 'absolute', left: 12, top: 12, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.06)', color: 'var(--text)', cursor: 'pointer' }}
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {/* Page title */}
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: 18,
          fontWeight: 700,
          color: "#e8e8f0",
          flex: "0 0 auto",
          paddingLeft: 40,
        }}
        className="lg:pl-0"
      >
        {title}
      </h1>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: searchFocused ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${searchFocused ? "rgba(99,102,241,0.45)" : "rgba(99,102,241,0.15)"}`,
          borderRadius: 10,
          width: searchFocused ? 240 : 160,
          transition: "width 0.3s ease, border-color 0.2s, background 0.2s",
          boxShadow: searchFocused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
        }}
        className="max-sm:hidden"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search…"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{ background: "transparent", border: "none", outline: "none", color: "#e8e8f0", fontSize: 13, width: "100%", fontFamily: "var(--font-dm-sans)" }}
        />
      </div>

      {/* Notification bell */}
      <button
        style={{ position: "relative", width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      >
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#9898b0" strokeWidth={1.8}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* Red dot */}
        <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #08080f" }} />
      </button>

      {/* Avatar */}
      <div
        style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "var(--font-syne)", flexShrink: 0, border: "2px solid rgba(99,102,241,0.3)" }}
        title={user.full_name}
      >
        {getInitials(user.full_name)}
      </div>
    </header>
  );
}
