"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { del, get, post } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassDetail {
  id: string;
  class_name: string;
  grade_level: string;
  section: string;
  academic_year: string;
  room_number?: string;
  teacher_id?: string;
  teacher?: { teacher_number: string; subject_specialization: string; user?: { full_name: string } };
  enrolled_student_count?: number;
}

interface EnrolledStudent {
  id: string;
  student_number: string;
  grade_level: string;
  section: string;
  user?: { full_name: string; email: string };
  full_name?: string;
  email?: string;
}

interface AllStudent {
  id: string;
  student_number: string;
  user?: { full_name: string; email: string };
}

interface GradeRecord {
  id: string;
  student_id: string;
  assessment_type: string;
  term: string;
  score: number;
  max_score: number;
  percentage: number;
  grade_letter: string;
  student?: { student_number: string; user?: { full_name: string } };
  student_name?: string;
}

// ─── Grade letter color ────────────────────────────────────────────────────────
function letterStyle(letter: string): React.CSSProperties {
  const l = letter?.[0] ?? "F";
  const configs: Record<string, { bg: string; color: string; shadow: string }> = {
    A: { bg: "rgba(16,185,129,0.15)",  color: "#10b981", shadow: "0 0 10px rgba(16,185,129,0.3)"  },
    B: { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", shadow: "0 0 10px rgba(99,102,241,0.3)"  },
    C: { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24", shadow: "0 0 10px rgba(245,158,11,0.3)"  },
    D: { bg: "rgba(239,68,68,0.12)",   color: "#f87171", shadow: "0 0 10px rgba(239,68,68,0.3)"   },
    F: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", shadow: "0 0 12px rgba(239,68,68,0.4)"   },
  };
  const cfg = configs[l] ?? configs.F;
  return { display: "inline-block", padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, boxShadow: cfg.shadow, fontWeight: 700, fontSize: 13, fontFamily: "var(--font-syne)" };
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function ClassDetailContent() {
  const params  = useParams<{ id: string }>();
  const classId = params.id;
  const router  = useRouter();
  const user    = getUser();
  const toast   = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [cls,       setCls]       = useState<ClassDetail | null>(null);
  const [students,  setStudents]  = useState<EnrolledStudent[]>([]);
  const [grades,    setGrades]    = useState<GradeRecord[]>([]);
  const [allStuds,  setAllStuds]  = useState<AllStudent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<"students" | "grades">("students");
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollId,  setEnrollId]  = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [delStudent, setDelStudent] = useState<EnrolledStudent | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    loadAll();
  }, [classId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, enrolledRaw, gradesRaw] = await Promise.all([
        get<ClassDetail>(`/classes/${classId}`),
        get<EnrolledStudent[]>(`/classes/${classId}`).catch(() => []),
        get<GradeRecord[]>(`/grades?class_id=${classId}`).catch(() => []),
      ]);
      setCls(detail as ClassDetail);

      // The class detail endpoint returns enrolled students via the students field
      const clsDetail = detail as any;
      const enrolled: EnrolledStudent[] = Array.isArray(clsDetail.students)
        ? clsDetail.students
        : Array.isArray(enrolledRaw) ? enrolledRaw : [];

      setStudents(enrolled.map((s: any) => ({ ...s, full_name: s.user?.full_name ?? "—", email: s.user?.email ?? "—" })));
      setGrades(Array.isArray(gradesRaw) ? gradesRaw.map((g: any) => ({ ...g, student_name: g.student?.user?.full_name ?? "—" })) : []);
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [classId, toast]);

  async function openEnroll() {
    try {
      const data = await get<AllStudent[]>("/students");
      const enrolledIds = new Set(students.map((s) => s.id));
      setAllStuds((Array.isArray(data) ? data : []).filter((s) => !enrolledIds.has(s.id)));
      setEnrollId("");
      setEnrollModal(true);
    } catch (e: any) {
      toast.showToast(e.message, "error");
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollId) return;
    setEnrolling(true);
    try {
      await post(`/classes/${classId}/enroll`, { student_id: enrollId });
      toast.showToast("Student enrolled!", "success");
      setEnrollModal(false);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRemove() {
    if (!delStudent) return;
    try {
      await del(`/classes/${classId}/enroll/${delStudent.id}`);
      toast.showToast("Student removed.", "success");
      setDelStudent(null);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    }
  }

  // ─── Student columns ────────────────────────────────────────────────────────
  const studentCols: Column<EnrolledStudent>[] = [
    { key: "avatar",         label: "",          width: 50, render: (s) => <Avatar name={s.full_name ?? "?"} /> },
    { key: "full_name",      label: "Full Name",  render: (s) => <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{s.full_name}</span> },
    { key: "email",          label: "Email",      render: (s) => <span style={{ color: "#9898b0" }}>{s.email}</span> },
    { key: "student_number", label: "Student ID" },
    {
      key: "remove", label: "", width: 80,
      render: (s) => isAdmin ? (
        <button onClick={() => setDelStudent(s)} style={{ padding: "5px 10px", borderRadius: 7, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", fontSize: 12, transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}>
          Remove
        </button>
      ) : null,
    },
  ];

  // ─── Grade columns ──────────────────────────────────────────────────────────
  const gradeCols: Column<GradeRecord>[] = [
    { key: "student_name",    label: "Student",     render: (g) => <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{g.student_name}</span> },
    { key: "assessment_type", label: "Assessment" },
    { key: "term",            label: "Term" },
    { key: "score",           label: "Score",       render: (g) => `${g.score} / ${g.max_score}` },
    { key: "percentage",      label: "%",           render: (g) => `${g.percentage?.toFixed(1) ?? "—"}%` },
    { key: "grade_letter",    label: "Grade",       render: (g) => <span style={letterStyle(g.grade_letter)}>{g.grade_letter}</span> },
  ];

  // Determine gradient index for the banner
  const GRADIENTS = ["linear-gradient(135deg,#6366f1,#4f46e5)","linear-gradient(135deg,#8b5cf6,#6d28d9)","linear-gradient(135deg,#ec4899,#be185d)"];
  const bannerGrad = cls ? GRADIENTS[cls.class_name.charCodeAt(0) % GRADIENTS.length] : GRADIENTS[0];

  return (
    <div className="animate-page-in">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "#6b6b80" }}>
        <Link href="/classes" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>Classes</Link>
        <span>›</span>
        <span style={{ color: "#9898b0" }}>{cls?.class_name ?? "Loading…"}</span>
      </div>

      {/* Banner */}
      {loading ? (
        <div className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 24 }} />
      ) : cls && (
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ background: bannerGrad, padding: "24px 28px", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  {cls.academic_year} · Grade {cls.grade_level} · Section {cls.section}
                </p>
                <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                  {cls.class_name}
                </h1>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ padding: "4px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 20, fontSize: 13, color: "#fff", backdropFilter: "blur(4px)" }}>
                    👨‍🏫 {cls.teacher?.user?.full_name ?? "Unassigned"}
                  </span>
                  {cls.room_number && (
                    <span style={{ padding: "4px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 20, fontSize: 13, color: "#fff", backdropFilter: "blur(4px)" }}>
                      🏫 {cls.room_number}
                    </span>
                  )}
                  <span style={{ padding: "4px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 20, fontSize: 13, color: "#fff", backdropFilter: "blur(4px)" }}>
                    👥 {students.length} students
                  </span>
                </div>
              </div>
              {isAdmin && (
                <button onClick={openEnroll} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-syne)", flexShrink: 0 }}>
                  + Enroll Student
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["students", "grades"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 400, fontFamily: "var(--font-syne)", background: tab === t ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" : "transparent", color: tab === t ? "#e8e8f0" : "#6b6b80", transition: "background 0.2s, color 0.2s" }}>
            {t === "students" ? "👥 Enrolled Students" : "📊 Grades Overview"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {tab === "students" ? (
          <DataTable columns={studentCols} data={students} loading={loading} searchKeys={["full_name", "email", "student_number"]} emptyMessage="No students enrolled yet" emptyIcon="👥" />
        ) : (
          <DataTable columns={gradeCols} data={grades} loading={loading} searchKeys={["student_name", "assessment_type", "term"]} emptyMessage="No grades recorded for this class" emptyIcon="📊" />
        )}
      </div>

      {/* Enroll modal */}
      <Modal open={enrollModal} onClose={() => setEnrollModal(false)} title="Enroll Student" maxWidth={420}>
        {allStuds.length === 0 ? (
          <p style={{ color: "#6b6b80", fontSize: 14 }}>All students are already enrolled in this class.</p>
        ) : (
          <form onSubmit={handleEnroll} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 6 }}>Select Student</label>
              <select required value={enrollId} onChange={(e) => setEnrollId(e.target.value)} className="input-glow" style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", appearance: "none" as any }}>
                <option value="">— Select a student —</option>
                {allStuds.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: "#13131a" }}>
                    {s.user?.full_name ?? s.student_number} · {s.student_number}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEnrollModal(false)} style={{ padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={enrolling} className="shimmer-btn" style={{ padding: "10px 22px", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: enrolling ? "not-allowed" : "pointer", opacity: enrolling ? 0.7 : 1, fontFamily: "var(--font-syne)" }}>
                {enrolling ? "Enrolling…" : "Enroll →"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm remove */}
      <Modal open={!!delStudent} onClose={() => setDelStudent(null)} title="Remove Student" maxWidth={380}>
        <p style={{ color: "#9898b0", fontSize: 14, marginBottom: 20 }}>
          Remove <strong style={{ color: "#e8e8f0" }}>{delStudent?.full_name}</strong> from this class?
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setDelStudent(null)} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
          <button onClick={handleRemove} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Remove</button>
        </div>
      </Modal>
    </div>
  );
}

export default function ClassDetailPage() {
  return <ToastProvider><ClassDetailContent /></ToastProvider>;
}
