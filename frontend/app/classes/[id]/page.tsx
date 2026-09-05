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
      className="inline-block rounded-md border px-2 py-0.5 text-xs font-bold"
    >
      {letter || "—"}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1267e8] text-xs font-bold text-white shadow-xs">
      {initials || "ST"}
    </div>
  );
}

function ClassDetailContent() {
  const { id: classId } = useParams() as { id: string };
  const router = useRouter();
  const user = getUser();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"students" | "grades">("students");

  const [enrollModal, setEnrollModal] = useState(false);
  const [allStuds, setAllStuds] = useState<AllStudent[]>([]);
  const [enrollId, setEnrollId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [delStudent, setDelStudent] = useState<EnrolledStudent | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadAll();
  }, [classId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, studsData, gradesData] = await Promise.all([
        get<ClassDetail>(`/classes/${classId}`),
        get<EnrolledStudent[]>(`/classes/${classId}/students`),
        get<GradeRecord[]>(`/grades?class_id=${classId}`),
      ]);
      setCls(classData);
      setStudents(
        (Array.isArray(studsData) ? studsData : []).map((s) => ({
          ...s,
          full_name: s.user?.full_name ?? "—",
          email: s.user?.email ?? "—",
        }))
      );
      setGrades(
        (Array.isArray(gradesData) ? gradesData : []).map((g) => ({
          ...g,
          student_name: g.student?.user?.full_name ?? g.student?.student_number ?? "—",
        }))
      );
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load class roster.", "error");
    } finally {
      setLoading(false);
    }
  }, [classId, toast]);

  async function openEnrollModal() {
    try {
      const data = await get<AllStudent[]>("/students");
      const enrolledIds = new Set(students.map((s) => s.id));
      setAllStuds((Array.isArray(data) ? data : []).filter((s) => !enrolledIds.has(s.id)));
      setEnrollId("");
      setEnrollModal(true);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load students.", "error");
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollId) return;
    setEnrolling(true);
    try {
      await post(`/classes/${classId}/enroll`, { student_id: enrollId });
      toast.showToast("Student enrolled successfully!", "success");
      setEnrollModal(false);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message || "Enrollment failed.", "error");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRemove() {
    if (!delStudent) return;
    try {
      await del(`/classes/${classId}/enroll/${delStudent.id}`);
      toast.showToast("Student removed from class roster.", "success");
      setDelStudent(null);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message || "Remove failed.", "error");
    }
  }

  const studentCols: Column<EnrolledStudent>[] = [
    { key: "avatar", label: "", width: 44, render: (s) => <Avatar name={s.full_name ?? "?"} /> },
    { key: "full_name", label: "Full Name", render: (s) => <span className="font-bold text-[#0f172a]">{s.full_name}</span> },
    { key: "email", label: "Email", render: (s) => <span className="text-[#475569]">{s.email}</span> },
    { key: "student_number", label: "Student ID", render: (s) => <span className="font-mono text-xs font-semibold text-[#1267e8]">{s.student_number}</span> },
    {
      key: "remove",
      label: "Actions",
      width: 80,
      render: (s) =>
        isAdmin ? (
          <button
            onClick={() => setDelStudent(s)}
            className="rounded-lg border border-[#fecaca] bg-white px-2.5 py-1 text-xs font-bold text-[#dc2626] transition hover:bg-[#fef2f2]"
          >
            Remove
          </button>
        ) : null,
    },
  ];

  const gradeCols: Column<GradeRecord>[] = [
    { key: "student_name", label: "Student", render: (g) => <span className="font-bold text-[#0f172a]">{g.student_name}</span> },
    { key: "assessment_type", label: "Assessment", render: (g) => <span className="text-xs text-[#334155]">{g.assessment_type}</span> },
    { key: "term", label: "Term", render: (g) => <span className="text-xs text-[#64748b]">{g.term}</span> },
    { key: "score", label: "Score", render: (g) => <span className="font-mono text-xs font-bold text-[#0f172a]">{g.score} / {g.max_score}</span> },
    { key: "grade_letter", label: "Grade", render: (g) => <GradeBadge letter={g.grade_letter} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
        <Link href="/classes" className="text-[#1267e8] hover:underline">
          Classes
        </Link>
        <span>/</span>
        <span className="text-[#0f172a]">{cls?.class_name || "Class Details"}</span>
      </div>

      {/* Header Banner */}
      {cls && (
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-xs sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#eaf2ff] px-2.5 py-0.5 text-xs font-bold text-[#1267e8]">
                Grade {cls.grade_level} • Section {cls.section}
              </span>
              <span className="text-xs text-[#94a3b8]">{cls.academic_year}</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0b1f3a] sm:text-3xl">
              {cls.class_name}
            </h1>
            <p className="mt-1 text-xs text-[#64748b]">
              Head Instructor: <strong className="text-[#334155]">{cls.teacher?.user?.full_name || "Unassigned"}</strong> • Room: {cls.room_number || "Main Campus"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={openEnrollModal}
                className="shimmer-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
              >
                + Enroll Student
              </button>
            )}
            <Link
              href="/attendance"
              className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs transition hover:bg-[#f8fafc]"
            >
              Take Attendance
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2 text-sm font-bold">
        <button
          onClick={() => setTab("students")}
          className={`px-4 py-1.5 rounded-xl transition ${
            tab === "students"
              ? "bg-[#1267e8] text-white shadow-xs"
              : "text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          Enrolled Students ({students.length})
        </button>
        <button
          onClick={() => setTab("grades")}
          className={`px-4 py-1.5 rounded-xl transition ${
            tab === "grades"
              ? "bg-[#1267e8] text-white shadow-xs"
              : "text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          Assessment Records ({grades.length})
        </button>
      </div>

      {/* Table */}
      {tab === "students" ? (
        <DataTable
          columns={studentCols}
          data={students}
          loading={loading}
          searchKeys={["full_name", "student_number"]}
          emptyMessage="No students currently enrolled in this class section."
          emptyIcon="👥"
        />
      ) : (
        <DataTable
          columns={gradeCols}
          data={grades}
          loading={loading}
          searchKeys={["student_name", "assessment_type"]}
          emptyMessage="No assessment grades recorded for this class yet."
          emptyIcon="📊"
        />
      )}

      {/* Enroll Modal */}
      <Modal
        open={enrollModal}
        onClose={() => setEnrollModal(false)}
        title="Enroll Student in Class"
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#334155]">
              Select Enrolled Student
            </label>
            <select
              required
              value={enrollId}
              onChange={(e) => setEnrollId(e.target.value)}
              className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
            >
              <option value="">Choose student to add…</option>
              {allStuds.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.full_name || s.student_number} ({s.student_number})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setEnrollModal(false)}
              className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={enrolling || !enrollId}
              className="shimmer-btn rounded-xl px-5 py-2 text-xs font-bold shadow-sm"
            >
              {enrolling ? "Enrolling…" : "Enroll Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirmation */}
      {delStudent && (
        <Modal open={true} onClose={() => setDelStudent(null)} title="Remove Student from Class" maxWidth={400}>
          <p className="text-sm text-[#475569]">
            Remove <strong className="text-[#0f172a]">{delStudent.full_name}</strong> from {cls?.class_name}?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDelStudent(null)}
              className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              className="rounded-xl bg-[#dc2626] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ClassDetailPage() {
  return (
    <ToastProvider>
      <ClassDetailContent />
    </ToastProvider>
  );
}
