"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { del, get, post, put } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

interface Grade {
  id: string;
  student_id: string;
  class_id: string;
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

interface SchoolClass {
  id: string;
  class_name: string;
}

interface Student {
  id: string;
  student_number: string;
  user?: { full_name: string };
  full_name?: string;
}

function GradeBadge({ letter }: { letter: string }) {
  const l = (letter ?? "F")[0];
  const cfg = {
    A: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    B: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    C: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    D: { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
    F: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  }[l] ?? { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };

  return (
    <span
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      className="inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold"
    >
      {letter || "—"}
    </span>
  );
}

const ASSESSMENT_TYPES = ["EXAM", "QUIZ", "ASSIGNMENT", "PROJECT"];

function GradesContent() {
  const router = useRouter();
  const user = getUser();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;
  const canManage = isAdmin || isTeacher;

  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [delTarget, setDelTarget] = useState<Grade | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    student_id: "",
    class_id: "",
    assessment_type: "EXAM",
    term: "Term 1",
    score: 85,
    max_score: 100,
    comments: "",
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, classesData, studentsData] = await Promise.all([
        get<Grade[]>("/grades"),
        get<SchoolClass[]>("/classes"),
        get<Student[]>("/students"),
      ]);

      const flat = (Array.isArray(gradesData) ? gradesData : []).map((g) => ({
        ...g,
        student_name: g.student?.user?.full_name ?? g.student?.student_number ?? "—",
        class_name: g.school_class?.class_name ?? "—",
      }));

      setGrades(flat);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setStudents(
        (Array.isArray(studentsData) ? studentsData : []).map((s) => ({
          ...s,
          full_name: s.user?.full_name ?? s.student_number,
        }))
      );
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load grade records.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  function openAdd() {
    setEditing(null);
    setForm({
      student_id: students[0]?.id || "",
      class_id: classes[0]?.id || "",
      assessment_type: "EXAM",
      term: "Term 1",
      score: 85,
      max_score: 100,
      comments: "",
    });
    setModalOpen(true);
  }

  function openEdit(g: Grade) {
    setEditing(g);
    setForm({
      student_id: g.student_id,
      class_id: g.class_id,
      assessment_type: g.assessment_type,
      term: g.term,
      score: g.score,
      max_score: g.max_score,
      comments: g.comments || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await put(`/grades/${editing.id}`, {
          score: Number(form.score),
          max_score: Number(form.max_score),
          comments: form.comments,
        });
        toast.showToast("Grade updated successfully!", "success");
      } else {
        await post("/grades", {
          student_id: form.student_id,
          class_id: form.class_id,
          assessment_type: form.assessment_type,
          term: form.term,
          score: Number(form.score),
          max_score: Number(form.max_score),
          comments: form.comments,
        });
        toast.showToast("Grade recorded successfully!", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.showToast(e.message || "Failed to save grade.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/grades/${delTarget.id}`);
      toast.showToast("Grade record removed.", "success");
      setDelTarget(null);
      loadData();
    } catch (e: any) {
      toast.showToast(e.message || "Delete failed.", "error");
    }
  }

  const columns: Column<Grade>[] = [
    {
      key: "student_name",
      label: "Student",
      render: (g) => <span className="font-bold text-[#0f172a]">{g.student_name}</span>,
    },
    {
      key: "class_name",
      label: "Class / Subject",
      render: (g) => <span className="text-xs text-[#64748b]">{g.class_name}</span>,
    },
    {
      key: "assessment_type",
      label: "Assessment",
      render: (g) => (
        <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-xs font-semibold text-[#334155]">
          {g.assessment_type}
        </span>
      ),
    },
    {
      key: "score",
      label: "Score",
      render: (g) => (
        <span className="font-mono text-xs font-bold text-[#0f172a]">
          {g.score} / {g.max_score}
        </span>
      ),
    },
    {
      key: "percentage",
      label: "Percentage",
      render: (g) => (
        <span className="text-xs font-semibold text-[#64748b]">
          {g.percentage != null ? `${Math.round(g.percentage)}%` : "—"}
        </span>
      ),
    },
    {
      key: "grade_letter",
      label: "Grade",
      render: (g) => <GradeBadge letter={g.grade_letter} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (g) =>
        canManage ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEdit(g)}
              title="Edit Grade"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#1267e8] transition hover:bg-[#eaf2ff]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setDelTarget(g)}
              title="Delete Grade"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] transition hover:bg-[#fef2f2]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#94a3b8]">Verified</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#0b1f3a] sm:text-2xl">
              Academic Grades
            </h1>
            {!loading && (
              <span className="rounded-full bg-[#eaf2ff] px-2.5 py-0.5 text-xs font-bold text-[#1267e8]">
                {grades.length} Entries
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#64748b]">
            Continuous assessments, mid-term evaluations, and official final grades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search grades…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[#0f172a] placeholder-[#94a3b8] outline-none"
            />
          </div>

          {canManage && (
            <button
              onClick={openAdd}
              className="shimmer-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
            >
              + Record Grade
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={grades}
        loading={loading}
        searchQuery={search}
        searchKeys={["student_name", "class_name", "assessment_type", "grade_letter"]}
        emptyMessage="No assessment grades recorded yet."
        emptyIcon="📊"
      />

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Update Assessment Grade" : "Record Assessment Grade"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">Student</label>
                <select
                  required
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">Class</label>
                <select
                  required
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Assessment Type</label>
              <select
                value={form.assessment_type}
                onChange={(e) => setForm({ ...form, assessment_type: e.target.value })}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Academic Term</label>
              <select
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Score Obtained</label>
              <input
                required
                type="number"
                min={0}
                max={Number(form.max_score)}
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Max Score</label>
              <input
                required
                type="number"
                min={1}
                value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#334155]">Teacher Remarks</label>
            <input
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="e.g. Excellent work on analytical problems."
              className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs transition hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="shimmer-btn rounded-xl px-5 py-2 text-xs font-bold shadow-sm"
            >
              {saving ? "Saving…" : editing ? "Update Grade" : "Submit Grade"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {delTarget && (
        <Modal open={true} onClose={() => setDelTarget(null)} title="Delete Grade Record" maxWidth={400}>
          <p className="text-sm text-[#475569]">
            Delete the grade record for <strong className="text-[#0f172a]">{delTarget.student_name}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDelTarget(null)}
              className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl bg-[#dc2626] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function GradesPage() {
  return (
    <ToastProvider>
      <GradesContent />
    </ToastProvider>
  );
}
