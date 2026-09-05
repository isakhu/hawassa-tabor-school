"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { get } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ToastProvider, useToast } from "@/components/Toast";

interface SummaryRow {
  student_id: string;
  student_number: string;
  full_name: string;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  attendance_rate: number;
}

function PctBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#059669" : pct >= 75 ? "#d97706" : "#dc2626";
  const bg = pct >= 90 ? "#ecfdf5" : pct >= 75 ? "#fffbeb" : "#fef2f2";
  return (
    <div className="flex items-center gap-2.5 min-w-[140px]">
      <div className="h-2 flex-1 rounded-full bg-[#e2e8f0] overflow-hidden">
        <div
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
          className="h-full rounded-full transition-all duration-500"
        />
      </div>
      <span
        style={{ color, backgroundColor: bg }}
        className="rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold"
      >
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function exportCSV(rows: SummaryRow[], className: string) {
  const headers = ["Student Name", "Student ID", "Present", "Absent", "Late", "Total", "Rate %"];
  const lines = rows.map((r) =>
    [
      `"${r.full_name}"`,
      r.student_number,
      r.present,
      r.absent,
      r.late,
      r.total_sessions,
      (r.attendance_rate * 100).toFixed(1),
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-summary-${className.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AttendanceSummaryContent() {
  const { classId } = useParams() as { classId: string };
  const router = useRouter();
  const user = getUser();
  const toast = useToast();

  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [classId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clsData, summData] = await Promise.all([
        get<any>(`/classes/${classId}`),
        get<SummaryRow[]>(`/attendance/summary/${classId}`),
      ]);
      setClassName(clsData.class_name ?? "Class Section");
      setSummary(Array.isArray(summData) ? summData : []);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load attendance summary.", "error");
    } finally {
      setLoading(false);
    }
  }, [classId, toast]);

  const filtered = summary.filter((r) => {
    const q = search.toLowerCase();
    return r.full_name.toLowerCase().includes(q) || r.student_number.toLowerCase().includes(q);
  });

  const avgRate =
    summary.length > 0
      ? (summary.reduce((acc, r) => acc + r.attendance_rate, 0) / summary.length) * 100
      : 100;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
        <Link href="/attendance" className="text-[#1267e8] hover:underline">
          Attendance
        </Link>
        <span>/</span>
        <span className="text-[#0f172a]">{className || "Summary"}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-xs sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1267e8]">
            Term Attendance Report
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0b1f3a] sm:text-3xl">
            {className || "Class Section"} Summary
          </h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Cumulative attendance statistics, presence percentages, and absence analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV(summary, className)}
            disabled={summary.length === 0}
            className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs transition hover:bg-[#f8fafc] disabled:opacity-50"
          >
            📥 Export CSV
          </button>
          <Link
            href="/attendance"
            className="shimmer-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
          >
            Take Attendance
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card p-5">
          <p className="text-xs font-semibold text-[#64748b]">Average Attendance Rate</p>
          <p className="mt-1 text-2xl font-black text-[#0b1f3a]">{avgRate.toFixed(1)}%</p>
          <p className="mt-1 text-[11px] text-[#059669]">Overall class engagement</p>
        </div>

        <div className="stat-card p-5">
          <p className="text-xs font-semibold text-[#64748b]">Students Evaluated</p>
          <p className="mt-1 text-2xl font-black text-[#0b1f3a]">{summary.length}</p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">Enrolled student roster</p>
        </div>

        <div className="stat-card p-5">
          <p className="text-xs font-semibold text-[#64748b]">Total Recorded Sessions</p>
          <p className="mt-1 text-2xl font-black text-[#0b1f3a]">
            {summary[0]?.total_sessions ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">School days counted</p>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] p-4">
          <h2 className="text-sm font-bold text-[#0b1f3a]">Student Roster Breakdown</h2>
          <input
            type="text"
            placeholder="Search student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs text-[#0f172a] placeholder-[#94a3b8] outline-none focus:border-[#1267e8]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[11px] font-bold uppercase text-[#64748b]">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Student ID</th>
                <th className="px-5 py-3">Present</th>
                <th className="px-5 py-3">Absent</th>
                <th className="px-5 py-3">Late</th>
                <th className="px-5 py-3">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748b]">
                    Loading summary…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748b]">
                    No attendance summary records available.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.student_id} className="hover:bg-[#f8fafc]">
                    <td className="px-5 py-3.5 font-bold text-[#0f172a]">{r.full_name}</td>
                    <td className="px-5 py-3.5 font-mono text-[#64748b]">{r.student_number}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#059669]">{r.present}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#dc2626]">{r.absent}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#d97706]">{r.late}</td>
                    <td className="px-5 py-3.5">
                      <PctBar pct={r.attendance_rate * 100} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AttendanceSummaryPage() {
  return (
    <ToastProvider>
      <AttendanceSummaryContent />
    </ToastProvider>
  );
}
