"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/auth";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function TopBar({ title, user }: { title: string; user: AuthUser }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 260,
        right: 0,
        height: 72,
        zIndex: 100,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid #dbe5f0",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 16,
        boxShadow: "0 3px 14px rgba(20,52,90,0.04)",
      }}
      className="max-lg:left-0"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="max-sm:pl-10">
        <div style={{ width: 4, height: 26, borderRadius: 4, background: "#1267e8" }} />
        <div>
          <p style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 800, color: "#0b1f3a", fontFamily: "var(--font-heading)" }}>{title}</p>
          <p style={{ marginTop: 2, fontSize: 11, color: "#7b8ea3" }}>Tabor School Management System</p>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "8px 13px",
          background: searchFocused ? "#f8fbff" : "#f6f9fd",
          border: `1px solid ${searchFocused ? "#9dc2f3" : "#dbe5f0"}`,
          borderRadius: 11,
          width: searchFocused ? 260 : 190,
          transition: "width 0.2s ease, border-color 0.2s ease, background 0.2s ease",
          boxShadow: searchFocused ? "0 0 0 3px rgba(18,103,232,0.10)" : "none",
        }}
        className="max-md:hidden"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7890a7" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          aria-label="Search"
          placeholder="Search"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{ background: "transparent", border: "none", outline: "none", color: "#10243e", fontSize: 13, width: "100%", fontFamily: "var(--font-body)" }}
        />
      </div>

      <button
        aria-label="Notifications"
        style={{ position: "relative", width: 40, height: 40, borderRadius: 11, background: "#f6f9fd", border: "1px solid #dbe5f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#58718b" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#eaf2ff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#f6f9fd")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 4 }}>
        <div
          style={{ width: 40, height: 40, borderRadius: "50%", background: "#1267e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", cursor: "default", fontFamily: "var(--font-heading)", flexShrink: 0, border: "3px solid #eaf2ff" }}
          title={user.full_name}
        >
          {getInitials(user.full_name)}
        </div>
        <div className="max-sm:hidden" style={{ maxWidth: 150 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1d3754", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</p>
          <p style={{ marginTop: 2, fontSize: 11, color: "#7b8ea3", textTransform: "capitalize" }}>{String(user.role).toLowerCase()}</p>
        </div>
      </div>
    </header>
  );
}
