"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import AttendanceToggle, { AttendanceStatus } from "@/components/AttendanceToggle";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SchoolClass { id: string; class_name: string; grade_level: string; section: string; }
interface Student     { id: string; student_number: string; user?: { full_name: string }; full_name?: string; }
interface AttendanceRecord {
  id: string; student_id: string; class_id: string; date: string;
  status: AttendanceStatus; notes?: string;
  student?: { student_number: string; user?: { full_name: string } };
  school_class?: { class_name: string };
  recorder?: { full_name: string };
  student_name?: string; class_name?: string; recorder_name?: string;
}

function today() { return new Date().toISOString().slice(0, 10); }

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = {
    PRESENT: { bg: "rgba(16,185,129,0.15)",  color: "#10b981", shadow: "0 0 8px rgba(16,185,129,0.3)",  label: "Present" },
    ABSENT:  { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", shadow: "0 0 8px rgba(239,68,68,0.3)",   label: "Absent"  },
    LATE:    { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", shadow: "0 0 8px rgba(245,158,11,0.3)",  label: "Late"    },
  }[status] ?? { bg: "rgba(99,102,241,0.1)", color: "#818cf8", shadow: "none", label: status };

  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, boxShadow: cfg.shadow, fontWeight: 700, fontSize: 12 }}>
      {cfg.label}
    </span>
  );
}

const selectSt: React.CSSProperties = { padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", cursor: "pointer", appearance: "none" as any, minWidth: 160 };

// ─── Main ─────────────────────────────────────────────────────────────────────
function AttendanceContent() {
  const router    = useRouter();
  const user      = getUser();
  const toast     = useToast();
  const isAdmin   = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;
  const canMark   = isAdmin || isTeacher;

  const [tab, setTab] = useState<"take" | "records">(canMark ? "take" : "records");

  // ── Take attendance state ──────────────────────────────────────────────────
  const [classes,      setClasses]      = useState<SchoolClass[]>([]);
  const [selClassId,   setSelClassId]   = useState("");
  const [selDate,      setSelDate]      = useState(today());
  const [students,     setStudents]     = useState<Student[]>([]);
  const [statuses,     setStatuses]     = useState<Record<string, AttendanceStatus>>({});
  const [loadingStuds, setLoadingStuds] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveTotal,    setSaveTotal]    = useState(0);
  const [step,         setStep]         = useState<1 | 2>(1);

  // ── Records state ──────────────────────────────────────────────────────────
  const [records,      setRecords]      = useState<AttendanceRecord[]>([]);
  const [loadingRecs,  setLoadingRecs]  = useState(false);
  const [filterClass,  setFilterClass]  = useState("");
  const [filterDate,   setFilterDate]   = useState(today());
  const [searchStudent,setSearchStudent]= useState("");

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    loadClasses();
    loadRecords();
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const data = await get<SchoolClass[]>("/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  async function loadStudents() {
    if (!selClassId) { toast.showToast("Please select a class first.", "warning"); return; }
    setLoadingStuds(true);
    setStep(2);
    try {
      const detail = await get<any>(`/classes/${selClassId}`);
      const enrolled: Student[] = Array.isArray(detail.students)
        ? detail.students.map((s: any) => ({ ...s, full_name: s.user?.full_name ?? "—" }))
        : [];
      setStudents(enrolled);
      // Default all to PRESENT
      const init: Record<string, AttendanceStatus> = {};
      enrolled.forEach((s) => { init[s.id] = "PRESENT"; });
      setStatuses(init);
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoadingStuds(false);
    }
  }

  function markAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { next[s.id] = status; });
    setStatuses(next);
  }

  async function submitAttendance() {
    const entries = Object.entries(statuses);
    setSaveTotal(entries.length);
    setSaveProgress(0);
    setSubmitting(true);
    let errors = 0;
    for (let i = 0; i < entries.length; i++) {
      const [student_id, status] = entries[i];
      try {
        await post("/attendance", { student_id, class_id: selClassId, date: selDate, status });
      } catch { errors++; }
      setSaveProgress(i + 1);
    }
    setSubmitting(false);
    if (errors === 0) {
      toast.showToast(`Attendance saved for ${entries.length} students! ✅`, "success");
      setStep(1);
      setStudents([]);
      setStatuses({});
      loadRecords();
    } else {
      toast.showToast(`Saved with ${errors} error(s). Some may already exist.`, "warning");
      loadRecords();
    }
  }

  const loadRecords = useCallback(async () => {
    setLoadingRecs(true);
    try {
      let url = "/attendance?";
      if (filterClass)   url += `class_id=${filterClass}&`;
      if (filterDate)    url += `date=${filterDate}&`;
      const data = await get<AttendanceRecord[]>(url);
      setRecords((Array.isArray(data) ? data : []).map((r: any) => ({
        ...r,
        student_name:  r.student?.user?.full_name ?? "—",
        class_name:    r.school_class?.class_name  ?? "—",
        recorder_name: r.recorder?.full_name       ?? "—",
      })));
    } catch { setRecords([]); }
    finally  { setLoadingRecs(false); }
  }, [filterClass, filterDate]);

  const markedCount = Object.keys(statuses).length;
  const pct = students.length > 0 ? Math.round((markedCount / students.length) * 100) : 0;

  const recordCols: Column<AttendanceRecord>[] = [
    { key: "student_name",  label: "Student",    render: (r) => <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{r.student_name}</span> },
    { key: "class_name",    label: "Class",      render: (r) => <span style={{ color: "#9898b0" }}>{r.class_name}</span> },
    { key: "date",          label: "Date",       render: (r) => <span style={{ color: "#9898b0" }}>{r.date}</span> },
    { key: "status",        label: "Status",     render: (r) => <StatusBadge status={r.status} /> },
    { key: "recorder_name", label: "Marked By",  render: (r) => <span style={{ color: "#6b6b80", fontSize: 12 }}>{r.recorder_name}</span> },
  ];

  return (
    <div className="animate-page-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>Attendance</h2>
          <p style={{ color: "#6b6b80", fontSize: 13, marginTop: 2 }}>
            📅 {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/attendance/summary/overview" style={{ padding: "9px 16px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          📊 View Summary
        </Link>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {canMark && (
          <button onClick={() => setTab("take")} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === "take" ? 700 : 400, fontFamily: "var(--font-syne)", background: tab === "take" ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" : "transparent", color: tab === "take" ? "#e8e8f0" : "#6b6b80", transition: "all 0.2s" }}>
            ✅ Take Attendance
          </button>
        )}
        <button onClick={() => { setTab("records"); loadRecords(); }} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === "records" ? 700 : 400, fontFamily: "var(--font-syne)", background: tab === "records" ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" : "transparent", color: tab === "records" ? "#e8e8f0" : "#6b6b80", transition: "all 0.2s" }}>
          📋 Records
        </button>
      </div>

      {/* ── TAB 1: Take Attendance ── */}
      {tab === "take" && canMark && (
        <div>
          {step === 1 && (
            <div className="glass-card" style={{ padding: 28, maxWidth: 560 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>
                Step 1 — Select Class & Date
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 6 }}>Class</label>
                  <select value={selClassId} onChange={(e) => setSelClassId(e.target.value)} style={{ ...selectSt, width: "100%" }}>
                    <option value="">— Select a class —</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: "#13131a" }}>
                        {c.class_name} · Grade {c.grade_level} · Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 6 }}>Date</label>
                  <input type="date" value={selDate} onChange={(e) => setSelDate(e.target.value)} style={{ ...selectSt, width: "100%", cursor: "text" }} />
                </div>
                <button onClick={loadStudents} disabled={!selClassId || loadingStuds} className="shimmer-btn" style={{ padding: "12px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: (!selClassId || loadingStuds) ? "not-allowed" : "pointer", opacity: (!selClassId || loadingStuds) ? 0.6 : 1, fontFamily: "var(--font-syne)" }}>
                  {loadingStuds ? "Loading…" : "Load Students →"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {/* Step 2 header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "#e8e8f0" }}>
                    Step 2 — Mark Attendance
                  </h3>
                  <p style={{ fontSize: 13, color: "#6b6b80", marginTop: 2 }}>
                    {classes.find(c => c.id === selClassId)?.class_name} · {selDate}
                  </p>
                </div>
                <button onClick={() => setStep(1)} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 13 }}>
                  ← Back
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#9898b0" }}>Marked: {markedCount} / {students.length}</span>
                  <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(99,102,241,0.1)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 3, transition: "width 0.3s ease" }} />
                </div>
              </div>

              {/* Bulk actions */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button onClick={() => markAll("PRESENT")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  ✅ Mark All Present
                </button>
                <button onClick={() => markAll("ABSENT")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  ❌ Mark All Absent
                </button>
              </div>

              {/* Student rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {loadingStuds ? (
                  [0,1,2,3,4].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 58, borderRadius: 12 }} />
                  ))
                ) : students.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b6b80" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                    <p>No students enrolled in this class yet.</p>
                  </div>
                ) : students.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      background: statuses[s.id] === "PRESENT" ? "rgba(16,185,129,0.05)" : statuses[s.id] === "ABSENT" ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.05)",
                      border: `1px solid ${statuses[s.id] === "PRESENT" ? "rgba(16,185,129,0.15)" : statuses[s.id] === "ABSENT" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}`,
                      borderRadius: 12,
                      transition: "background 0.2s, border-color 0.2s",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, fontFamily: "var(--font-syne)" }}>
                        {(s.full_name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>{s.full_name ?? s.student_number}</p>
                        <p style={{ fontSize: 11, color: "#6b6b80" }}>{s.student_number}</p>
                      </div>
                    </div>
                    <AttendanceToggle
                      studentId={s.id}
                      value={statuses[s.id] ?? "PRESENT"}
                      onChange={(id, status) => setStatuses((prev) => ({ ...prev, [id]: status }))}
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>

              {/* Submit */}
              {submitting ? (
                <div style={{ padding: "16px 20px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12 }}>
                  <p style={{ fontSize: 14, color: "#e8e8f0", marginBottom: 8 }}>
                    Saving {saveProgress} / {saveTotal}…
                  </p>
                  <div style={{ height: 6, background: "rgba(99,102,241,0.1)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${saveTotal > 0 ? (saveProgress / saveTotal) * 100 : 0}%`, background: "linear-gradient(90deg,#6366f1,#ec4899)", borderRadius: 3, transition: "width 0.2s" }} />
                  </div>
                </div>
              ) : students.length > 0 && (
                <button onClick={submitAttendance} className="shimmer-btn" style={{ width: "100%", padding: "14px", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-syne)", letterSpacing: "0.02em" }}>
                  Submit Attendance ({students.length} students) →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Records ── */}
      {tab === "records" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
            {!isStudent && (
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Class</label>
                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={selectSt}>
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#13131a" }}>{c.class_name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Date</label>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ ...selectSt, cursor: "text" }} />
            </div>
            <button onClick={loadRecords} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-syne)" }}>
              Apply Filters
            </button>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <DataTable
              columns={recordCols}
              data={records}
              loading={loadingRecs}
              searchQuery={searchStudent}
              searchKeys={["student_name", "class_name"]}
              emptyMessage="No attendance records found"
              emptyIcon="📋"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return <ToastProvider><AttendanceContent /></ToastProvider>;
}
