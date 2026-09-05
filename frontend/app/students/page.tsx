"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { get, post, put, del } from "@/lib/api";
import { getUser, dashboardForRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

interface Student {
  id: string;
  user_id: string;
  student_number: string;
  grade_level: string;
  section: string;
  user?: { full_name: string; email: string; role: string };
  full_name?: string;
  email?: string;
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1267e8] text-xs font-bold text-white shadow-xs">
      {initials || "ST"}
    </div>
  );
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  name,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Deletion" maxWidth={400}>
      <p className="text-sm text-[#475569]">
        Are you sure you want to remove <strong className="text-[#0f172a]">{name}</strong> from enrolled students? This action cannot be reversed.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#334155] shadow-xs transition hover:bg-[#f8fafc]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-xl bg-[#dc2626] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#b91c1c]"
        >
          Confirm Delete
        </button>
      </div>
    </Modal>
  );
}

function StudentsContent() {
  const router = useRouter();
  const user = getUser();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [delTarget, setDelTarget] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    student_number: "",
    grade_level: "",
    section: "",
    user_id: "",
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === ROLES.STUDENT) {
      router.replace(dashboardForRole(user.role));
      return;
    }
    loadStudents();
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<Student[]>("/students");
      const flat = (Array.isArray(data) ? data : []).map((s) => ({
        ...s,
        full_name: s.user?.full_name ?? "—",
        email: s.user?.email ?? "—",
      }));
      setStudents(flat);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load students.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  function openAdd() {
    setEditing(null);
    setForm({
      full_name: "",
      email: "",
      password: "",
      student_number: "",
      grade_level: "Grade 10",
      section: "A",
      user_id: "",
    });
    setModalOpen(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setForm({
      full_name: s.full_name ?? "",
      email: s.email ?? "",
      password: "",
      student_number: s.student_number,
      grade_level: s.grade_level,
      section: s.section,
      user_id: s.user_id,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await put(`/students/${editing.id}`, {
          grade_level: form.grade_level,
          section: form.section,
        });
        toast.showToast("Student updated successfully!", "success");
      } else {
        if (!/^\d+$/.test(form.password)) {
          throw new Error("Password must contain digits only (numeric PIN).");
        }
        const newUser = await post<any>("/auth/register", {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: "STUDENT",
        });
        await post("/students", {
          user_id: newUser.id,
          student_number: form.student_number,
          grade_level: form.grade_level,
          section: form.section,
        });
        toast.showToast("Student enrolled successfully!", "success");
      }
      setModalOpen(false);
      loadStudents();
    } catch (e: any) {
      toast.showToast(e.message || "Operation failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/students/${delTarget.id}`);
      toast.showToast("Student removed.", "success");
      setDelTarget(null);
      loadStudents();
    } catch (e: any) {
      toast.showToast(e.message || "Delete failed.", "error");
    }
  }

  const columns: Column<Student>[] = [
    {
      key: "avatar",
      label: "",
      width: 48,
      render: (s) => <Avatar name={s.full_name ?? "?"} />,
    },
    {
      key: "full_name",
      label: "Full Name",
      render: (s) => (
        <div>
          <span className="font-bold text-[#0f172a]">{s.full_name}</span>
          <p className="text-[11px] text-[#64748b] sm:hidden">{s.student_number}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (s) => <span className="text-[#475569]">{s.email}</span>,
    },
    {
      key: "student_number",
      label: "Student ID",
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-[#1267e8]">
          {s.student_number}
        </span>
      ),
    },
    {
      key: "grade_level",
      label: "Grade / Section",
      render: (s) => (
        <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-xs font-bold text-[#334155]">
          {s.grade_level} • Sec {s.section}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (s) =>
        isAdmin ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEdit(s)}
              title="Edit Record"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#1267e8] transition hover:bg-[#eaf2ff]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setDelTarget(s)}
              title="Delete Record"
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
          <span className="text-xs text-[#94a3b8]">View only</span>
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
              Enrolled Students
            </h1>
            {!loading && (
              <span className="rounded-full bg-[#eaf2ff] px-2.5 py-0.5 text-xs font-bold text-[#1267e8]">
                {students.length} Total
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#64748b]">
            Manage student registrations, classroom allocations, and login profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Filter by name, ID…"
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
              + Enroll Student
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        searchQuery={search}
        searchKeys={["full_name", "email", "student_number"]}
        emptyMessage="No students currently enrolled."
        emptyIcon="🎓"
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Student Details" : "Enroll New Student"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">
                  Full Name
                </label>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. Abebe Kebede"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">
                  School Email / Username
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@school.edu"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">
                  Password / PIN (digits only)
                </label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value.replace(/\D/g, "") })}
                  placeholder="e.g. 123456"
                  inputMode="numeric"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">
                  Student ID Number
                </label>
                <input
                  required
                  value={form.student_number}
                  onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                  placeholder="STU-2024-001"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">
                Grade Level
              </label>
              <select
                required
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">
                Section
              </label>
              <input
                required
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A, B, or C"
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
              >
              </input>
            </div>
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
              {saving ? "Saving…" : editing ? "Update Details" : "Enroll Student"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        name={delTarget?.full_name ?? ""}
      />
    </div>
  );
}

export default function StudentsPage() {
  return (
    <ToastProvider>
      <StudentsContent />
    </ToastProvider>
  );
}
