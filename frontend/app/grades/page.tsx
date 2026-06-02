"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { del, get, post, put } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Grade {
  id: string;
  student_id: string;
  class_id: string;
  graded_by?: string;
  assessment_type: string;
  term: string;
  score: number;
  max_score: number;
  percentage: number;
  grade_letter: string;
  comments?: string;
  created_at: string;
  student?: { student_number: string; user?: { full_name: string } };
  school_class?: { class_name: string };
  student_name?: string;
  class_name?: string;
}

interface SchoolClass { id: string; class_name: string; }
interface Student     { id: string; student_number: string; user?: { full_name: string }; full_name?: string; }

// ─── Grade letter styling ─────────────────────────────────────────────────────
function letterStyle(letter: string) {
  const l = (letter ?? "F")[0];
  const map: Record<string, { bg: string; color: string; shadow: string }> = {
    A: { bg: "rgba(16,185,129,0.15)",  color: "#10b981", shadow: "0 0 10px rgba(16,185,129,0.3)"  },
    B: { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", shadow: "0 0 10px rgba(99,102,241,0.3)"  },
    C: { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24", shadow: "0 0 10px rgba(245,158,11,0.3)"  },
    D: { bg: "rgba(239,68,68,0.12)",   color: "#f87171", shadow: "0 0 10px rgba(239,68,68,0.3)"   },
    F: { bg: "rgba(239,68,68,0.18)",   color: "#ef4444", shadow: "0 0 14px rgba(239,68,68,0.4)"   },
  };
  const cfg = map[l] ?? map.F;
  return { display: "inline-block", padding: "3px 10px", borderRadius: 20,
    background: cfg.bg, color: cfg.color, boxShadow: cfg.shadow,
    fontWeight: 700, fontSize: 13, fontFamily: "var(--font-syne)" } as React.CSSProperties;
}

const ASSESSMENT_TYPES = ["EXAM", "QUIZ", "ASSIGNMENT", "PROJECT"];

const inputSt: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(99,102,241,0.25)",
  borderRadius: 10, color: "#e8e8f0", fontSize: 14,
  fontFamily: "var(--font-dm-sans)", outline: "none",
};
const selectSt: React.CSSProperties = { ...inputSt, cursor: "pointer", appearance: "none" as any };
const labelSt: React.CSSProperties = { display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 };

// ─── Confirm delete ───────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Grade" maxWidth={360}>
      <p style={{ color: "#9898b0", fontSize: 14, marginBottom: 20 }}>
        Are you sure you want to delete this grade record? This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Delete</button>
      </div>
    </Modal>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function GradesContent() {
  const router    = useRouter();
  const user      = getUser();
  const toast     = useToast();
  const isAdmin   = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;
  const canWrite  = isAdmin || isTeacher;

  const [grades,    setGrades]    = useState<Grade[]>([]);
  const [classes,   setClasses]   = useState<SchoolClass[]>([]);
  const [students,  setStudents]  = useState<Student[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterCls, setFilterCls] = useState("");
  const [filterTerm,setFilterTerm]= useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<Grade | null>(null);
  const [delTarget, setDelTarget] = useState<Grade | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState<"list" | "report">("list");
  const [report,    setReport]    = useState<any[]>([]);
  const [loadingRpt,setLoadingRpt]= useState(false);

  const [form, setForm] = useState({
    student_id: "", class_id: "", assessment_type: "EXAM",
    term: "", score: "", max_score: "100", comments: "",
  });

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/grades?";
      if (filterCls)  url += `class_id=${filterCls}&`;
      if (filterTerm) url += `term=${encodeURIComponent(filterTerm)}&`;
      const [gradesData, classesData] = await Promise.all([
        get<Grade[]>(url),
        get<SchoolClass[]>("/classes").catch(() => []),
      ]);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setGrades((Array.isArray(gradesData) ? gradesData : []).map((g: any) => ({
        ...g,
        student_name: g.student?.user?.full_name ?? "—",
        class_name:   g.school_class?.class_name  ?? "—",
      })));
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filterCls, filterTerm, toast]);

  async function openAdd() {
    try {
      const studs = await get<Student[]>("/students");
      setStudents((Array.isArray(studs) ? studs : []).map((s: any) => ({ ...s, full_name: s.user?.full_name ?? s.student_number })));
    } catch { setStudents([]); }
    setEditing(null);
    setForm({ student_id: "", class_id: "", assessment_type: "EXAM", term: "", score: "", max_score: "100", comments: "" });
    setModalOpen(true);
  }

  function openEdit(g: Grade) {
    setEditing(g);
    setForm({ student_id: g.student_id, class_id: g.class_id, assessment_type: g.assessment_type, term: g.term, score: String(g.score), max_score: String(g.max_score), comments: g.comments ?? "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { assessment_type: form.assessment_type, term: form.term, score: parseFloat(form.score), max_score: parseInt(form.max_score) };
      if (form.comments) payload.comments = form.comments;
      if (editing) {
        await put(`/grades/${editing.id}`, payload);
        toast.showToast("Grade updated!", "success");
      } else {
        payload.student_id = form.student_id;
        payload.class_id   = form.class_id;
        await post("/grades", payload);
        toast.showToast("Grade added!", "success");
      }
      setModalOpen(false);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/grades/${delTarget.id}`);
      toast.showToast("Grade deleted.", "success");
      setDelTarget(null);
      loadAll();
    } catch (e: any) { toast.showToast(e.message, "error"); }
  }

  async function loadReport(studentId: string) {
    if (!studentId) return;
    setLoadingRpt(true);
    try {
      const data = await get<any[]>(`/grades/report/${studentId}`);
      setReport(Array.isArray(data) ? data : []);
    } catch { setReport([]); }
    finally { setLoadingRpt(false); }
  }

  // ─── Table columns ────────────────────────────────────────────────────────
  const cols: Column<Grade>[] = [
    { key: "student_name",  label: "Student",    render: (g) => <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{g.student_name}</span> },
    { key: "class_name",    label: "Class",      render: (g) => <span style={{ color: "#9898b0" }}>{g.class_name}</span> },
    { key: "assessment_type", label: "Type",     render: (g) => <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>{g.assessment_type}</span> },
    { key: "term",          label: "Term",       render: (g) => <span style={{ color: "#9898b0" }}>{g.term}</span> },
    { key: "score",         label: "Score",      render: (g) => `${g.score} / ${g.max_score}` },
    { key: "percentage",    label: "%",          render: (g) => `${(g.percentage ?? 0).toFixed(1)}%` },
    { key: "grade_letter",  label: "Grade",      render: (g) => <span style={letterStyle(g.grade_letter)}>{g.grade_letter}</span> },
    {
      key: "actions", label: "", width: 90,
      render: (g) => canWrite ? (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => openEdit(g)} title="Edit" style={{ padding: "5px 9px", borderRadius: 7, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          {isAdmin && (
            <button onClick={() => setDelTarget(g)} title="Delete" style={{ padding: "5px 9px", borderRadius: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
            </button>
          )}
        </div>
      ) : null,
    },
  ];

  // GPA-style average
  const avgPct = grades.length > 0 ? grades.reduce((s, g) => s + (g.percentage ?? 0), 0) / grades.length : 0;
  const avgLetter = avgPct >= 90 ? "A+" : avgPct >= 85 ? "A" : avgPct >= 80 ? "A-" : avgPct >= 75 ? "B+" : avgPct >= 70 ? "B" : avgPct >= 65 ? "B-" : avgPct >= 60 ? "C+" : avgPct >= 50 ? "C" : avgPct >= 40 ? "D" : "F";

  return (
    <div className="animate-page-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>Grades</h2>
            {!loading && <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", fontSize: 12, fontWeight: 700, color: "#818cf8" }}>{grades.length}</span>}
          </div>
          <p style={{ color: "#6b6b80", fontSize: 13, marginTop: 2 }}>Academic performance records</p>
        </div>
        {/* Overall avg badge */}
        {!loading && grades.length > 0 && (
          <div style={{ padding: "10px 16px", background: "rgba(19,19,26,0.8)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#6b6b80", marginBottom: 2 }}>Overall Average</p>
            <span style={letterStyle(avgLetter)}>{avgLetter} · {avgPct.toFixed(1)}%</span>
          </div>
        )}
        {canWrite && (
          <button onClick={openAdd} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-syne)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Grade
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["list", "report"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); if (t === "report" && isStudent && user) loadReport(user.id); }} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 400, fontFamily: "var(--font-syne)", background: tab === t ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" : "transparent", color: tab === t ? "#e8e8f0" : "#6b6b80", transition: "all 0.2s" }}>
            {t === "list" ? "📊 All Grades" : "📋 Grade Report"}
          </button>
        ))}
      </div>

      {/* ── List tab ── */}
      {tab === "list" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, minWidth: 200 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input placeholder="Search student or class…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "#e8e8f0", fontSize: 13, width: "100%", fontFamily: "var(--font-dm-sans)" }} />
            </div>
            {!isStudent && (
              <select value={filterCls} onChange={(e) => setFilterCls(e.target.value)} style={{ ...selectSt, minWidth: 160 }}>
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c.id} value={c.id} style={{ background: "#13131a" }}>{c.class_name}</option>)}
              </select>
            )}
            <input value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} placeholder="Filter by term…" style={{ ...inputSt, minWidth: 140 }} />
            <button onClick={loadAll} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-syne)" }}>Apply</button>
          </div>
          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <DataTable columns={cols} data={grades} loading={loading} searchQuery={search} searchKeys={["student_name", "class_name", "term"]} emptyMessage="No grades recorded yet" emptyIcon="📊" />
          </div>
        </>
      )}

      {/* ── Report tab ── */}
      {tab === "report" && (
        <div>
          {!isStudent && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={labelSt}>Select Student</label>
                <select onChange={(e) => loadReport(e.target.value)} style={{ ...selectSt, minWidth: 240 }}>
                  <option value="">— Select a student —</option>
                  {students.length === 0
                    ? <option disabled>Loading students…</option>
                    : students.map((s) => <option key={s.id} value={s.id} style={{ background: "#13131a" }}>{s.full_name} · {s.student_number}</option>)
                  }
                </select>
              </div>
              <button onClick={async () => { const s = await get<Student[]>("/students"); setStudents((Array.isArray(s) ? s : []).map((x: any) => ({ ...x, full_name: x.user?.full_name ?? x.student_number }))); }} style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer", fontSize: 13 }}>
                Load Students
              </button>
            </div>
          )}

          {loadingRpt ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b6b80" }}>Loading report…</div>
          ) : report.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b6b80" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, color: "#9898b0" }}>Select a student to view their grade report</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {report.map((item, i) => {
                const avgColor = item.overall_grade_letter?.[0] === "A" ? "#10b981" : item.overall_grade_letter?.[0] === "B" ? "#6366f1" : item.overall_grade_letter?.[0] === "C" ? "#f59e0b" : "#ef4444";
                return (
                  <div key={i} className="glass-card stat-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "#e8e8f0", marginBottom: 2 }}>{item.class_name}</p>
                        <p style={{ fontSize: 12, color: "#6b6b80" }}>Term: {item.term} · {item.assessment_count} assessment{item.assessment_count !== 1 ? "s" : ""}</p>
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 11, color: "#6b6b80" }}>Avg Score</p>
                          <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-syne)", color: "#e8e8f0" }}>{item.average_percentage?.toFixed(1)}%</p>
                        </div>
                        <span style={letterStyle(item.overall_grade_letter)}>{item.overall_grade_letter}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${Math.min(item.average_percentage, 100)}%`, background: avgColor, borderRadius: 3, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Grade" : "Add Grade"} maxWidth={500}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!editing && (
            <>
              <div>
                <label style={labelSt}>Student</label>
                <select required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="input-glow" style={selectSt}>
                  <option value="">— Select student —</option>
                  {students.map((s) => <option key={s.id} value={s.id} style={{ background: "#13131a" }}>{s.full_name} · {s.student_number}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Class</label>
                <select required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="input-glow" style={selectSt}>
                  <option value="">— Select class —</option>
                  {classes.map((c) => <option key={c.id} value={c.id} style={{ background: "#13131a" }}>{c.class_name}</option>)}
                </select>
              </div>
            </>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Assessment Type</label>
              <select value={form.assessment_type} onChange={(e) => setForm({ ...form, assessment_type: e.target.value })} className="input-glow" style={selectSt}>
                {ASSESSMENT_TYPES.map((t) => <option key={t} value={t} style={{ background: "#13131a" }}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Term</label>
              <input required value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className="input-glow" style={inputSt} placeholder="Fall 2024" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Score</label>
              <input required type="number" min="0" step="0.1" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="input-glow" style={inputSt} placeholder="85" />
            </div>
            <div>
              <label style={labelSt}>Max Score</label>
              <input required type="number" min="1" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} className="input-glow" style={inputSt} placeholder="100" />
            </div>
          </div>
          {form.score && form.max_score && (
            <div style={{ padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: 8, fontSize: 13, color: "#818cf8" }}>
              Grade preview: <strong>{((parseFloat(form.score) / parseInt(form.max_score)) * 100).toFixed(1)}%</strong>
            </div>
          )}
          <div>
            <label style={labelSt}>Comments (optional)</label>
            <textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} className="input-glow" style={{ ...inputSt, resize: "vertical", minHeight: 64 }} placeholder="Optional teacher feedback…" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} className="shimmer-btn" style={{ padding: "10px 22px", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-syne)" }}>
              {saving ? "Saving…" : editing ? "Update Grade" : "Add Grade"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}

export default function GradesPage() {
  return <ToastProvider><GradesContent /></ToastProvider>;
}
