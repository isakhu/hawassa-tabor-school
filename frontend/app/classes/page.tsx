"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { del, get, post, put } from "@/lib/api";
import { dashboardForRole, getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

interface SchoolClass {
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

interface Teacher {
  id: string;
  teacher_number: string;
  subject_specialization: string;
  user?: { full_name: string };
}

function ClassCard({
  cls,
  isAdmin,
  onEdit,
  onDelete,
}: {
  cls: SchoolClass;
  isAdmin: boolean;
  onEdit: (c: SchoolClass) => void;
  onDelete: (c: SchoolClass) => void;
}) {
  return (
    <div className="card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[#eaf2ff] px-2.5 py-1 text-xs font-bold text-[#1267e8]">
            Grade {cls.grade_level} • Section {cls.section}
          </span>
          <span className="text-[11px] font-semibold text-[#94a3b8]">
            {cls.academic_year}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-black tracking-tight text-[#0b1f3a]">
          {cls.class_name}
        </h3>

        <div className="mt-2 space-y-1 text-xs text-[#64748b]">
          <p>
            <strong className="text-[#334155]">Class Head:</strong>{" "}
            {cls.teacher?.user?.full_name || "Unassigned"}
          </p>
          <p>
            <strong className="text-[#334155]">Room:</strong> {cls.room_number || "Main Campus"}
          </p>
          <p>
            <strong className="text-[#334155]">Enrolled:</strong>{" "}
            {cls.enrolled_student_count ?? 0} Students
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-[#f1f5f9] pt-4">
        <Link
          href={`/classes/${cls.id}`}
          className="flex-1 rounded-xl bg-[#1267e8] py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#0d54c2]"
        >
          View Roster
        </Link>

        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(cls)}
              title="Edit Class"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#1267e8] transition hover:bg-[#eaf2ff]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(cls)}
              title="Delete Class"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] transition hover:bg-[#fef2f2]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ClassesContent() {
  const router = useRouter();
  const user = getUser();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [delTarget, setDelTarget] = useState<SchoolClass | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    class_name: "",
    grade_level: "10",
    section: "A",
    academic_year: "2024/25",
    room_number: "",
    teacher_id: "",
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, teacherData] = await Promise.all([
        get<SchoolClass[]>("/classes"),
        get<Teacher[]>("/teachers"),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load classes.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  function openAdd() {
    setEditing(null);
    setForm({
      class_name: "",
      grade_level: "10",
      section: "A",
      academic_year: "2024/25",
      room_number: "",
      teacher_id: "",
    });
    setModalOpen(true);
  }

  function openEdit(cls: SchoolClass) {
    setEditing(cls);
    setForm({
      class_name: cls.class_name,
      grade_level: cls.grade_level,
      section: cls.section,
      academic_year: cls.academic_year,
      room_number: cls.room_number ?? "",
      teacher_id: cls.teacher_id ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        class_name: form.class_name,
        grade_level: form.grade_level,
        section: form.section,
        academic_year: form.academic_year,
        room_number: form.room_number || undefined,
        teacher_id: form.teacher_id || undefined,
      };

      if (editing) {
        await put(`/classes/${editing.id}`, payload);
        toast.showToast("Class updated successfully!", "success");
      } else {
        await post("/classes", payload);
        toast.showToast("Class created successfully!", "success");
      }
      setModalOpen(false);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message || "Failed to save class.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/classes/${delTarget.id}`);
      toast.showToast("Class deleted.", "success");
      setDelTarget(null);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message || "Delete failed.", "error");
    }
  }

  const filtered = classes.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.class_name.toLowerCase().includes(q) ||
      c.grade_level.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q) ||
      (c.teacher?.user?.full_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-[#0b1f3a] sm:text-2xl">
              Classes & Sections
            </h1>
            {!loading && (
              <span className="rounded-full bg-[#eaf2ff] px-2.5 py-0.5 text-xs font-bold text-[#1267e8]">
                {classes.length} Configured
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#64748b]">
            Manage academic rooms, homeroom head assignments, and student rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search classes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[#0f172a] placeholder-[#94a3b8] outline-none"
            />
          </div>

          {isAdmin && (
            <button
              onClick={openAdd}
              className="shimmer-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
            >
              + Create Class
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-6 w-36 mb-4" />
              <div className="skeleton h-3 w-48 mb-2" />
              <div className="skeleton h-3 w-40 mb-6" />
              <div className="skeleton h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-12 text-center">
          <div className="text-4xl">🏫</div>
          <p className="mt-2 text-sm font-bold text-[#0b1f3a]">No classes found</p>
          <p className="mt-1 text-xs text-[#64748b]">
            {isAdmin ? "Click '+ Create Class' to register your first section." : "No class records match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={setDelTarget}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Class Section" : "Configure New Class"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#334155]">Class Name</label>
            <input
              required
              value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
              placeholder="e.g. Grade 10-A Natural Sciences"
              className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Grade Level</label>
              <input
                required
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                placeholder="9, 10, 11, or 12"
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Section</label>
              <input
                required
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A, B, C…"
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Academic Year</label>
              <input
                required
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="2024/25"
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">Room Number</label>
              <input
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                placeholder="e.g. Block B, Room 14"
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#334155]">Class Head / Homeroom Teacher</label>
            <select
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
            >
              <option value="">Select an assigned teacher…</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.full_name ?? t.teacher_number} ({t.subject_specialization})
                </option>
              ))}
            </select>
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
              {saving ? "Saving…" : editing ? "Update Class" : "Create Class"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {delTarget && (
        <Modal open={true} onClose={() => setDelTarget(null)} title="Delete Class" maxWidth={400}>
          <p className="text-sm text-[#475569]">
            Are you sure you want to delete <strong className="text-[#0f172a]">{delTarget.class_name}</strong>?
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

export default function ClassesPage() {
  return (
    <ToastProvider>
      <ClassesContent />
    </ToastProvider>
  );
}
