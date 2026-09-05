"use client";

import { useEffect, useState } from "react";
import { downloadFile, get } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function StudentDashboardPage() {
  const user = getUser();
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingResult, setDownloadingResult] = useState(false);
  const [resultError, setResultError] = useState("");

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [gradesRes, attendanceRes] = await Promise.allSettled([
          get<any[]>("/grades"),
          get<any[]>("/attendance"),
        ]);

        if (gradesRes.status === "fulfilled" && Array.isArray(gradesRes.value)) {
          setGrades(gradesRes.value);
        }
        if (attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value)) {
          setAttendance(attendanceRes.value);
        }
      } catch (err) {
        console.error("Student portal load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  async function handleDownloadReport() {
    setDownloadingResult(true);
    setResultError("");
    try {
      await downloadFile("/student-portal/results/download", "Tabor_School_Report_Card.pdf");
    } catch (err: any) {
      setResultError(err.message || "Final academic result is not yet published.");
    } finally {
      setDownloadingResult(false);
    }
  }

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-xs sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1267e8]">
            Student Academic Portal
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0b1f3a] sm:text-3xl">
            Welcome, {user?.full_name || "Student"}
          </h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Hawassa Tabor Primary and Secondary School • Academic Year 2024/25
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloadingResult}
          className="shimmer-btn rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm"
        >
          {downloadingResult ? "Generating PDF…" : "📄 Download Official Report Card"}
        </button>
      </div>

      {resultError && (
        <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4 text-xs font-semibold text-[#c2410c]">
          Notice: {resultError}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="stat-card p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#059669]">
            📅
          </div>
          <p className="mt-4 text-xs font-semibold text-[#64748b]">Attendance Rate</p>
          <p className="mt-1 text-3xl font-black text-[#0b1f3a]">
            {attendanceRate}%
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">
            {presentCount} of {attendance.length} sessions attended
          </p>
        </div>

        <div className="stat-card p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf2ff] text-[#1267e8]">
            📊
          </div>
          <p className="mt-4 text-xs font-semibold text-[#64748b]">Recorded Assessments</p>
          <p className="mt-3 text-3xl font-black text-[#0b1f3a]">
            {grades.length}
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">Evaluated subjects & tests</p>
        </div>

        <div className="stat-card p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3c7] text-[#d97706]">
            🎓
          </div>
          <p className="mt-4 text-xs font-semibold text-[#64748b]">Enrollment Status</p>
          <p className="mt-1 text-3xl font-black text-[#059669]">
            Active
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">Regular Full-time Student</p>
        </div>
      </div>

      {/* Recent Grades Table */}
      <div className="card p-6">
        <h2 className="text-base font-extrabold text-[#0b1f3a]">
          Your Academic Assessment Record
        </h2>
        <p className="mt-0.5 text-xs text-[#64748b]">
          Verified assessment results submitted by your subject teachers.
        </p>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#64748b]">Loading grades…</div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748b]">
              No subject assessment records published yet for this term.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-[11px] font-bold uppercase text-[#64748b]">
                  <th className="py-3">Subject / Class</th>
                  <th className="py-3">Assessment</th>
                  <th className="py-3">Score</th>
                  <th className="py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {grades.map((g) => (
                  <tr key={g.id} className="text-xs">
                    <td className="py-3.5 font-bold text-[#0f172a]">{g.class_name || "—"}</td>
                    <td className="py-3.5 text-[#475569]">{g.assessment_type || "Exam"}</td>
                    <td className="py-3.5 font-semibold text-[#0f172a]">{g.score} / {g.max_score}</td>
                    <td className="py-3.5">
                      <span className="rounded-md bg-[#eaf2ff] px-2 py-0.5 font-bold text-[#1267e8]">
                        {g.grade_letter || "A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
