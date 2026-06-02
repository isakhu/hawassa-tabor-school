"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@/lib/api";
import { getUser } from "@/lib/auth";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ClassCard({ cls }: { cls: any }) {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#10b981","#3b82f6","#f59e0b"];
  const color = colors[(cls.class_name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      className="stat-card"
      style={{ padding: 20, background: "rgba(19,19,26,0.8)", borderRadius: 14, border: `1px solid ${color}33`, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "14px 14px 0 0" }} />
      <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "#e8e8f0", marginBottom: 6 }}>{cls.class_name}</p>
      <p style={{ fontSize: 12, color: "#6b6b80", marginBottom: 10 }}>
        Grade {cls.grade_level} · Section {cls.section} · {cls.academic_year}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Link href="/attendance" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: `${color}18`, border: `1px solid ${color}40`, color, fontSize: 12, fontWeight: 600, textDecoration: "none", textAlign: "center", transition: "background 0.2s" }}>
          Attendance
        </Link>
        <Link href="/grades" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9898b0", fontSize: 12, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
          Grades
        </Link>
      </div>
    </div>
  );
}

function SkeletonClassCard() {
  return (
    <div style={{ padding: 20, background: "rgba(19,19,26,0.8)", borderRadius: 14, border: "1px solid rgba(99,102,241,0.1)" }}>
      <div className="skeleton" style={{ width: "70%", height: 16, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: "50%", height: 11, marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skeleton" style={{ flex: 1, height: 32, borderRadius: 8 }} />
        <div className="skeleton" style={{ flex: 1, height: 32, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const user = getUser();
  const [classes, setClasses]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    get<any[]>("/classes")
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch((e)   => setError(e.message))
      .finally(()  => setLoading(false));
  }, []);

  return (
    <div className="animate-page-in">
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          <span className="gradient-text">{greeting()}</span>
          <span style={{ color: "#e8e8f0" }}>, {user?.full_name.split(" ")[0] ?? "Teacher"} 👋</span>
        </h2>
        <p style={{ color: "#6b6b80", fontSize: 14 }}>Here are your assigned classes for today.</p>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <Link href="/attendance" className="shimmer-btn" style={{ padding: "12px 22px", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-syne)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Take Attendance
        </Link>
        <Link href="/grades" style={{ padding: "12px 22px", borderRadius: 12, color: "#e8e8f0", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-syne)", textDecoration: "none", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", display: "inline-flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
          Enter Grades
        </Link>
      </div>

      {/* My classes */}
      <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>
        My Classes
      </h3>

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#fca5a5", fontSize: 14, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {loading
          ? [0,1,2].map((i) => <SkeletonClassCard key={i} />)
          : classes.length === 0
            ? <p style={{ color: "#6b6b80", fontSize: 14 }}>No classes assigned yet.</p>
            : classes.map((cls) => <ClassCard key={cls.id} cls={cls} />)
        }
      </div>
    </div>
  );
}
