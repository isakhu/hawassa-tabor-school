"use client";

import { useEffect, useState, useRef } from "react";
import { get } from "@/lib/api";

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
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

function SkeletonCard() {
  return (
    <div style={{ padding: 22, background: "#ffffff", borderRadius: 14, border: "1px solid #dbe5f0" }}>
      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 11, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "55%", height: 13, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: "35%", height: 28 }} />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const displayed = useCountUp(value);
  return (
    <div className="stat-card" style={{ padding: 22, background: "#ffffff", borderRadius: 14, border: "1px solid #dbe5f0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,102,255,.05), rgba(0,132,255,.02))", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: "#eaf2ff", color: "#0066ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 15 }}>
          {icon}
        </div>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{displayed.toLocaleString()}</p>
      </div>
    </div>
  );
}

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
          classes: Array.isArray(classes) ? classes.length : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const total = counts.students + counts.teachers;
  const classCoverage = counts.classes > 0 ? Math.min(100, Math.round((counts.classes / Math.max(1, counts.students)) * 100)) : 0;

  const stats = [
    { label: "Total Students", value: counts.students, icon: <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: "Total Teachers", value: counts.teachers, icon: <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg> },
    { label: "Total Classes", value: counts.classes, icon: <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
  ];

  return (
    <div className="animate-page-in">
      <div style={{ marginBottom: 26 }}>
        <p style={{ color: "#0066ff", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>School administration</p>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>A clear overview of your school records and operations.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 15, marginBottom: 26 }}>
        {loading ? [0, 1, 2].map((i) => <SkeletonCard key={i} />) : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, .8fr)", gap: 18 }} className="max-lg:grid-cols-1">
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", border: "1px solid #dbe5f0", boxShadow: "0 8px 30px rgba(15,23,42,.05)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 750, color: "#0f172a", marginBottom: 5 }}>School overview</h3>
              <p style={{ fontSize: 13, color: "#64748b" }}>Current records loaded from the database.</p>
            </div>
            <span style={{ padding: "6px 10px", borderRadius: 999, background: "#eaf2ff", color: "#0066ff", fontSize: 11, fontWeight: 700 }}>LIVE DATA</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fbff" }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>People in system</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{total.toLocaleString()}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>students + teachers</p>
            </div>
            <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fbff" }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Classes configured</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{counts.classes.toLocaleString()}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>academic classes</p>
            </div>
          </div>
          <div style={{ marginTop: 18, padding: 15, borderRadius: 12, background: "#f8fbff", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 650, color: "#334155" }}>Class-to-student coverage</span>
              <span style={{ fontSize: 12, fontWeight: 750, color: "#0066ff" }}>{classCoverage}%</span>
            </div>
            <div style={{ height: 7, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${classCoverage}%`, background: "#0066ff", borderRadius: 999 }} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, background: "#ffffff", border: "1px solid #dbe5f0", boxShadow: "0 8px 30px rgba(15,23,42,.05)" }}>
          <h3 style={{ fontSize: 17, fontWeight: 750, color: "#0f172a", marginBottom: 6 }}>Admin shortcuts</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>Jump directly to the areas you manage most.</p>
          <div style={{ display: "grid", gap: 10 }}>
            <a href="/students" style={{ textDecoration: "none", padding: "13px 14px", border: "1px solid #dbe5f0", borderRadius: 11, color: "#0f172a", background: "#f8fbff", fontSize: 13, fontWeight: 650 }}>Manage students <span style={{ float: "right", color: "#0066ff" }}>→</span></a>
            <a href="/teachers" style={{ textDecoration: "none", padding: "13px 14px", border: "1px solid #dbe5f0", borderRadius: 11, color: "#0f172a", background: "#f8fbff", fontSize: 13, fontWeight: 650 }}>Manage teachers <span style={{ float: "right", color: "#0066ff" }}>→</span></a>
            <a href="/classes" style={{ textDecoration: "none", padding: "13px 14px", border: "1px solid #dbe5f0", borderRadius: 11, color: "#0f172a", background: "#f8fbff", fontSize: 13, fontWeight: 650 }}>Manage classes <span style={{ float: "right", color: "#0066ff" }}>→</span></a>
            <a href="/grades" style={{ textDecoration: "none", padding: "13px 14px", border: "1px solid #dbe5f0", borderRadius: 11, color: "#0f172a", background: "#f8fbff", fontSize: 13, fontWeight: 650 }}>Review grades <span style={{ float: "right", color: "#0066ff" }}>→</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}
