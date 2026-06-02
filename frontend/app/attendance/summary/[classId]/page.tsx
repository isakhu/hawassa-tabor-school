"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { get } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SummaryRow {
  student_id: string;
  student_number: string;
  full_name: string;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  attendance_rate: number; // 0.0–1.0
}

// ─── % bar ────────────────────────────────────────────────────────────────────
function PctBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
      <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 38, textAlign: "right" }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function MiniCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ padding: "16px 20px", background: "rgba(19,19,26,0.8)", borderRadius: 14, border: `1px solid ${color}25`, flex: 1, minWidth: 120 }}>
      <p style={{ fontSize: 11, color: "#6b6b80", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(rows: SummaryRow[], className: string) {
  const headers = ["Student Name", "Student ID", "Present", "Absent", "Late", "Total", "Rate %"];
  const lines   = rows.map((r) => [
    `"${r.full_name}"`, r.student_number, r.present, r.absent, r.late, r.total_sessions,
    (r.attendance_rate * 100).toFixed(1),
  ].join(","));
  const csv  = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `attendance-summary-${className.replace(/\s/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function SummaryContent() {
  const params  = useParams<{ classId: string }>();
  const classId = params.classId;
  const router  = useRouter();
  const user    = getUser();
  const toast   = useToast();

  const [summary, setSummary]     = useState<SummaryRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [className, setClassName] = useState("Class");
  const [sortAsc, setSortAsc]     = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (classId === "overview") { loadAllSummary(); return; }
    loadSummary();
  }, [classId]);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, classData] = await Promise.all([
        get<SummaryRow[]>(`/attendance/summary/${classId}`),
        get<any>(`/classes/${classId}`).catch(() => null),
      ]);
      setSummary(Array.isArray(summaryData) ? summaryData : []);
      if (classData?.class_name) setClassName(classData.class_name);
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [classId, toast]);

  const loadAllSummary = useCallback(async () => {
    setLoading(true);
    setClassName("All Classes Overview");
    try {
      const classes = await get<any[]>("/classes");
      if (!Array.isArray(classes) || classes.length === 0) { setSummary([]); return; }
      const summaries = await Promise.all(
        classes.map((c) => get<SummaryRow[]>(`/attendance/summary/${c.id}`).catch(() => []))
      );
      const merged = summaries.flat();
      setSummary(merged);
    } catch { setSummary([]); }
    finally { setLoading(false); }
  }, [toast]);

  const sorted = [...summary].sort((a, b) =>
    sortAsc
      ? a.attendance_rate - b.attendance_rate
      : b.attendance_rate - a.attendance_rate
  );

  // Stats
  const avgRate    = summary.length > 0 ? summary.reduce((s, r) => s + r.attendance_rate, 0) / summary.length * 100 : 0;
  const perfect    = summary.filter((r) => r.attendance_rate === 1).length;
  const mostAbsent = summary.length > 0 ? [...summary].sort((a, b) => b.absent - a.absent)[0] : null;
  const totalSess  = summary.length > 0 ? Math.max(...summary.map((r) => r.total_sessions)) : 0;

  return (
    <div className="animate-page-in">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "#6b6b80" }}>
        <Link href="/attendance" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>Attendance</Link>
        <span>›</span>
        <span style={{ color: "#9898b0" }}>Summary</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "#e8e8f0", marginBottom: 4 }}>
            {className}
          </h2>
          <p style={{ color: "#6b6b80", fontSize: 13 }}>Attendance summary — all recorded sessions</p>
        </div>
        <button
          onClick={() => exportCSV(sorted, className)}
          style={{ padding: "10px 18px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Export CSV
        </button>
      </div>

      {/* Stats row */}
      {loading ? (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[0,1,2,3].map((i) => <div key={i} className="skeleton" style={{ flex: 1, minWidth: 120, height: 72, borderRadius: 14 }} />)}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <MiniCard label="Total Sessions"   value={totalSess}           color="#6366f1" />
          <MiniCard label="Avg Attendance"   value={`${avgRate.toFixed(1)}%`} color={avgRate >= 75 ? "#10b981" : "#ef4444"} />
          <MiniCard label="Perfect Attend."  value={perfect}             color="#10b981" />
          <MiniCard label="Most Absent"      value={mostAbsent?.full_name.split(" ")[0] ?? "—"} color="#ef4444" />
        </div>
      )}

      {/* Sort button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={() => setSortAsc((v) => !v)} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer", fontSize: 13 }}>
          Sort: {sortAsc ? "Lowest first ↑" : "Highest first ↓"}
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(99,102,241,0.12)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(99,102,241,0.06)" }}>
              {["Student Name", "Present", "Absent", "Late", "Total", "Attendance %", "Status"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b80", fontFamily: "var(--font-syne)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} style={{ padding: "14px 16px" }}><div className="skeleton" style={{ height: 12, borderRadius: 6, width: j === 0 ? "80%" : "60%" }} /></td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "60px", textAlign: "center", color: "#6b6b80" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
                <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, color: "#9898b0" }}>No attendance data found</p>
              </td></tr>
            ) : sorted.map((row) => {
              const pct    = Math.round(row.attendance_rate * 100);
              const status = pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "At Risk" : "Poor";
              const sCfg   = { "Excellent": { color: "#10b981", bg: "rgba(16,185,129,0.12)" }, "Good": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" }, "At Risk": { color: "#f97316", bg: "rgba(249,115,22,0.12)" }, "Poor": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" } }[status]!;
              return (
                <tr key={row.student_id} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.04)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ transition: "background 0.15s" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: "#e8e8f0", fontSize: 14 }}>{row.full_name}</td>
                  <td style={{ padding: "13px 16px", color: "#10b981", fontWeight: 600, fontSize: 14 }}>{row.present}</td>
                  <td style={{ padding: "13px 16px", color: "#ef4444", fontWeight: 600, fontSize: 14 }}>{row.absent}</td>
                  <td style={{ padding: "13px 16px", color: "#f59e0b", fontWeight: 600, fontSize: 14 }}>{row.late}</td>
                  <td style={{ padding: "13px 16px", color: "#9898b0", fontSize: 14 }}>{row.total_sessions}</td>
                  <td style={{ padding: "13px 16px" }}><PctBar pct={pct} /></td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sCfg.bg, color: sCfg.color }}>{status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return <ToastProvider><SummaryContent /></ToastProvider>;
}
