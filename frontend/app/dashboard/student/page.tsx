"use client";

import { useEffect, useState } from "react";
import { downloadFile, get } from "@/lib/api";
import { getUser } from "@/lib/auth";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function SummaryCard({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="glass-card stat-card" style={{ padding: 24, borderColor: `${color}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />
        <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "#e8e8f0" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.07)" }}>
      <div className="skeleton" style={{ width: "45%", height: 12 }} />
      <div className="skeleton" style={{ width: "20%", height: 12 }} />
    </div>
  );
}

export default function StudentDashboardPage() {
  const user = getUser();

  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any | null>(null);
  const [resultReady, setResultReady] = useState(false);
  const [downloadingResult, setDownloadingResult] = useState(false);
  const [resultError, setResultError] = useState("");

  useEffect(() => {
    async function load() {
      const [gradesResult, attendanceResult, finalResult] = await Promise.allSettled([
        get<any[]>("/grades"),
        get<any[]>("/attendance"),
        get<any>("/student-portal/results"),
      ]);

      if (gradesResult.status === "fulfilled") {
        setGrades(Array.isArray(gradesResult.value) ? gradesResult.value : []);
      }
      if (attendanceResult.status === "fulfilled") {
        setAttendance(Array.isArray(attendanceResult.value) ? attendanceResult.value : []);
      }
      if (finalResult.status === "fulfilled") {
        setResult(finalResult.value);
        setResultReady(Array.isArray(finalResult.value?.subjects) && finalResult.value.subjects.length > 0);
        setResultError("");
      } else {
        setResult(null);
        setResultReady(false);
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleDownloadResult() {
    setDownloadingResult(true);
    setResultError("");
    try {
      await downloadFile("/student-portal/results/pdf", "final_result.pdf");
    } catch (error) {
      setResultError(error instanceof Error ? error.message : "Unable to download the final result.");
    } finally {
      setDownloadingResult(false);
    }
  }

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  const total = attendance.length;
  const attRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  function letterColor(letter: string) {
    if (letter.startsWith("A")) return "#10b981";
    if (letter.startsWith("B")) return "#6366f1";
    if (letter.startsWith("C")) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <div className="animate-page-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          <span className="gradient-text">{greeting()}</span>
          <span style={{ color: "#e8e8f0" }}>, {user?.full_name.split(" ")[0] ?? "Student"} 🎓</span>
        </h2>
        <p style={{ color: "#6b6b80", fontSize: 14 }}>Here's a summary of your academic progress.</p>
      </div>

      {/* Final Result */}
      <SummaryCard title="Final Result" color="#f59e0b">
        {loading ? (
          <SkeletonRow />
        ) : resultReady && result ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, background: "rgba(245,158,11,0.08)", borderRadius: 10 }}>
                <p style={{ fontSize: 11, color: "#6b6b80" }}>Overall Average</p>
                <p style={{ fontSize: 21, fontWeight: 800, color: "#f59e0b" }}>{result.overall_average}%</p>
              </div>
              <div style={{ padding: 12, background: "rgba(99,102,241,0.08)", borderRadius: 10 }}>
                <p style={{ fontSize: 11, color: "#6b6b80" }}>Overall Grade</p>
                <p style={{ fontSize: 21, fontWeight: 800, color: "#818cf8" }}>{result.overall_grade}</p>
              </div>
              <div style={{ padding: 12, background: "rgba(16,185,129,0.08)", borderRadius: 10 }}>
                <p style={{ fontSize: 11, color: "#6b6b80" }}>Subjects</p>
                <p style={{ fontSize: 21, fontWeight: 800, color: "#10b981" }}>{result.subjects.length}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadResult}
              disabled={downloadingResult}
              style={{ border: 0, borderRadius: 10, padding: "11px 18px", background: downloadingResult ? "#4b5563" : "#f59e0b", color: "#111827", fontWeight: 800, cursor: downloadingResult ? "wait" : "pointer" }}
            >
              {downloadingResult ? "Preparing PDF..." : "Download Final Result PDF"}
            </button>
            {resultError && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>{resultError}</p>}
          </div>
        ) : (
          <div>
            <p style={{ color: "#9898b0", fontSize: 14, marginBottom: 6 }}>Your final result is not ready yet.</p>
            <p style={{ color: "#6b6b80", fontSize: 12 }}>All required subject grades must be approved by the class head before the final result and PDF become available.</p>
          </div>
        )}
      </SummaryCard>

      {!loading && total > 0 && (
        <div style={{ margin: "24px 0", padding: "16px 20px", background: `${attRate >= 75 ? "rgba(16,185,129" : "rgba(239,68,68"},0.08)`, border: `1px solid ${attRate >= 75 ? "rgba(16,185,129" : "rgba(239,68,68"},0.25)`, borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{attRate >= 75 ? "✅" : "⚠️"}</span>
          <div>
            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "#e8e8f0", fontSize: 15 }}>
              Your attendance rate is <span style={{ color: attRate >= 75 ? "#10b981" : "#ef4444" }}>{attRate}%</span>
            </p>
            <p style={{ fontSize: 13, color: "#6b6b80" }}>{present} present · {late} late · {absent} absent</p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="max-lg:grid-cols-1">
        <SummaryCard title="My Grades" color="#6366f1">
          {loading
            ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
            : grades.length === 0
              ? <p style={{ color: "#6b6b80", fontSize: 14 }}>No grades recorded yet.</p>
              : <>
                  {grades.slice(0, 6).map((g) => (
                    <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.07)" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0" }}>{g.assessment_type}</p>
                        <p style={{ fontSize: 11, color: "#6b6b80" }}>Term: {g.term}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: `${letterColor(g.grade_letter)}22`, color: letterColor(g.grade_letter), fontSize: 13, fontWeight: 700, fontFamily: "var(--font-syne)" }}>
                          {g.grade_letter}
                        </span>
                        <p style={{ fontSize: 11, color: "#6b6b80", marginTop: 2 }}>{g.percentage ?? g.score}%</p>
                      </div>
                    </div>
                  ))}
                  <a href="/grades" style={{ display: "block", marginTop: 12, fontSize: 13, color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>View all grades →</a>
                </>
          }
        </SummaryCard>

        <SummaryCard title="My Attendance" color="#10b981">
          {loading
            ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
            : attendance.length === 0
              ? <p style={{ color: "#6b6b80", fontSize: 14 }}>No attendance records yet.</p>
              : (
                <>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                    {[
                      { label: "Present", count: present, color: "#10b981" },
                      { label: "Late", count: late, color: "#f59e0b" },
                      { label: "Absent", count: absent, color: "#ef4444" },
                    ].map((s) => (
                      <div key={s.label} style={{ flex: 1, minWidth: 70, padding: "12px 8px", background: `${s.color}12`, borderRadius: 10, textAlign: "center", border: `1px solid ${s.color}30` }}>
                        <p style={{ fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</p>
                        <p style={{ fontSize: 11, color: "#6b6b80" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {attendance.slice(0, 5).map((a) => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(99,102,241,0.07)" }}>
                      <p style={{ fontSize: 13, color: "#9898b0" }}>{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: a.status === "PRESENT" ? "rgba(16,185,129,0.15)" : a.status === "LATE" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: a.status === "PRESENT" ? "#10b981" : a.status === "LATE" ? "#f59e0b" : "#ef4444" }}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </>
              )
          }
        </SummaryCard>
      </div>
    </div>
  );
}
