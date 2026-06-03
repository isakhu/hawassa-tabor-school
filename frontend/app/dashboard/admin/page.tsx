"use client";

import { useEffect, useState, useRef } from "react";
import StatCard from "@/components/StatCard";
import { get } from "@/lib/api";

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ padding: 24, background: "rgba(19,19,26,0.7)", borderRadius: 16, border: "1px solid rgba(99,102,241,0.1)" }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: "40%", height: 32 }} />
    </div>
  );
}

// StatCard is now a separate client component using framer-motion (see components/StatCard.tsx)

// ─── Recent activity skeleton ─────────────────────────────────────────────────
function ActivitySkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: "55%", height: 12, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "35%", height: 10 }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 10 }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [students, teachers, classes] = await Promise.all([
          get<any[]>("/students"),
          get<any[]>("/teachers"),
          get<any[]>("/classes"),
        ]);
        setCounts({
          students: Array.isArray(students) ? students.length : 0,
          teachers: Array.isArray(teachers) ? teachers.length : 0,
          classes:  Array.isArray(classes)  ? classes.length  : 0,
        });
      } catch {
        // silently keep zeros on error
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const stats = [
    { label: "Total Students",     value: counts.students, gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", iconBg: "rgba(59,130,246,0.15)", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: "Total Teachers",     value: counts.teachers, gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", iconBg: "rgba(139,92,246,0.15)", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth={1.8}><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg> },
    { label: "Total Classes",      value: counts.classes,  gradient: "linear-gradient(135deg,#ec4899,#be185d)", iconBg: "rgba(236,72,153,0.15)", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ec4899" strokeWidth={1.8}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    { label: "Attendance Today",   value: 94,              gradient: "linear-gradient(135deg,#10b981,#047857)", iconBg: "rgba(16,185,129,0.15)", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  ];

  return (
    <div className="animate-page-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 800, color: "#e8e8f0", marginBottom: 6 }}>
          Welcome back 👋
        </h2>
        <p style={{ color: "#6b6b80", fontSize: 14 }}>Here's what's happening at your school today.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {loading
          ? [0,1,2,3].map((i) => <SkeletonCard key={i} />)
          : stats.map((s, i) => <StatCard key={s.label} index={i} {...s} />)
        }
      </div>

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="max-lg:grid-cols-1">
        {/* Activity feed */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "#e8e8f0" }}>
              Recent Activity
            </h3>
            <a href="/attendance" style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>View all →</a>
          </div>
          {loading
            ? [0,1,2,3,4].map((i) => <ActivitySkeleton key={i} />)
            : [
                { name: "Jane Doe",     action: "Grade submitted",   time: "2m ago",  color: "#6366f1" },
                { name: "Mr. Smith",    action: "Attendance marked", time: "10m ago", color: "#8b5cf6" },
                { name: "Alex Carter",  action: "Enrolled in class", time: "1h ago",  color: "#ec4899" },
                { name: "Sarah Lim",    action: "Grade submitted",   time: "2h ago",  color: "#10b981" },
                { name: "Tom Harris",   action: "Account created",   time: "3h ago",  color: "#3b82f6" },
              ].map((a) => (
                <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {a.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0" }}>{a.name}</p>
                    <p style={{ fontSize: 12, color: "#6b6b80" }}>{a.action}</p>
                  </div>
                  <span style={{ fontSize: 11, color: "#6b6b80", whiteSpace: "nowrap" }}>{a.time}</span>
                </div>
              ))
          }
        </div>

        {/* Quick stats */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 16 }}>
            Quick Overview
          </h3>
          {[
            { label: "Active Students",  pct: 87, color: "#6366f1" },
            { label: "Teacher Coverage", pct: 95, color: "#8b5cf6" },
            { label: "Classes Running",  pct: 100, color: "#ec4899" },
            { label: "Grades Submitted", pct: 72, color: "#10b981" },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#9898b0" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(99,102,241,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 3, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
