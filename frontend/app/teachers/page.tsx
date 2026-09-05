"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { del, get, post, put } from "@/lib/api";
import { dashboardForRole, getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

interface Teacher {
  id: string;
  user_id: string;
  teacher_number: string;
  subject_specialization: string;
  department?: string;
  user?: { full_name: string; email: string };
  full_name?: string;
  email?: string;
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#059669] text-xs font-bold text-white shadow-xs">
      {initials || "TC"}
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
    <Modal open={open} onClose={onClose} title="Confirm Faculty Deletion" maxWidth={400}>
      <p className="text-sm text-[#475569]">
        Remove <strong className="text-[#0f172a]">{name}</strong> from faculty records? This action cannot be reversed.
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

function TeachersContent() {
  const router = useRouter();
  const user = getUser();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [delTarget, setDelTarget] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    teacher_number: "",
    subject_specialization: "",
    department: "",
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
    loadTeachers();
  }, []);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<Teacher[]>("/teachers");
      const flat = (Array.isArray(data) ? data : []).map((t) => ({
        ...t,
        full_name: t.user?.full_name ?? "—",
        email: t.user?.email ?? "—",
      }));
      setTeachers(flat);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load faculty.", "error");
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
      teacher_number: "",
      subject_specialization: "",
      department: "General Sciences",
      user_id: "",
    });
    setModalOpen(true);
  }

  function openEdit(t: Teacher) {
    setEditing(t);
    setForm({
      full_name: t.full_name ?? "",
      email: t.email ?? "",
      password: "",
      teacher_number: t.teacher_number,
      subject_specialization: t.subject_specialization,
      department: t.department ?? "",
      user_id: t.user_id,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await put(`/teachers/${editing.id}`, {
          subject_specialization: form.subject_specialization,
          department: form.department,
        });
        toast.showToast("Teacher updated successfully!", "success");
      } else {
        if (!/^\d+$/.test(form.password)) {
          throw new Error("Password must contain digits only (numeric PIN).");
        }
        const newUser = await post<any>("/auth/register", {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: "TEACHER",
        });
        await post("/teachers", {
          user_id: newUser.id,
          teacher_number: form.teacher_number,
          subject_specialization: form.subject_specialization,
          department: form.department,
        });
        toast.showToast("Teacher added successfully!", "success");
      }
      setModalOpen(false);
      loadTeachers();
    } catch (e: any) {
      toast.showToast(e.message || "Operation failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/teachers/${delTarget.id}`);
      toast.showToast("Teacher removed.", "success");
      setDelTarget(null);
      loadTeachers();
    } catch (e: any) {
      toast.showToast(e.message || "Delete failed.", "error");
    }
  }

  const columns: Column<Teacher>[] = [
    {
      key: "avatar",
      label: "",
      width: 48,
      render: (t) => <Avatar name={t.full_name ?? "?"} />,
    },
    {
      key: "full_name",
      label: "Full Name",
      render: (t) => (
        <div>
          <span className="font-bold text-[#0f172a]">{t.full_name}</span>
          <p className="text-[11px] text-[#64748b] sm:hidden">{t.teacher_number}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (t) => <span className="text-[#475569]">{t.email}</span>,
    },
    {
      key: "teacher_number",
      label: "Employee ID",
      render: (t) => (
        <span className="font-mono text-xs font-semibold text-[#059669]">
          {t.teacher_number}
        </span>
      ),
    },
    {
      key: "subject_specialization",
      label: "Subject Specialization",
      render: (t) => (
        <span className="rounded-md bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-bold text-[#059669]">
          {t.subject_specialization}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      render: (t) =>
        isAdmin ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEdit(t)}
              title="Edit Faculty"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#1267e8] transition hover:bg-[#eaf2ff]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => setDelTarget(t)}
              title="Delete Faculty"
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
              Teaching Faculty
            </h1>
            {!loading && (
              <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-bold text-[#059669]">
                {teachers.length} Instructors
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#64748b]">
            Faculty records, subject specializations, and departmental assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-3 py-2 text-xs">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search faculty…"
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
              + Add Teacher
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        searchQuery={search}
        searchKeys={["full_name", "email", "subject_specialization", "teacher_number"]}
        emptyMessage="No teaching faculty recorded yet."
        emptyIcon="👨‍🏫"
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Faculty Record" : "Add New Teacher"}
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
                  placeholder="e.g. Dr. Daniel Tadesse"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">
                  Faculty Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="teacher@school.edu"
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
                  placeholder="e.g. 889900"
                  inputMode="numeric"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#334155]">
                  Teacher Employee ID
                </label>
                <input
                  required
                  value={form.teacher_number}
                  onChange={(e) => setForm({ ...form, teacher_number: e.target.value })}
                  placeholder="TCH-2024-001"
                  className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold text-[#334155]">
              Subject Specialization
            </label>
            <input
              required
              value={form.subject_specialization}
              onChange={(e) => setForm({ ...form, subject_specialization: e.target.value })}
              placeholder="e.g. Mathematics, Physics, English"
              className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs text-[#0f172a] outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#334155]">
              Department
            </label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Natural Sciences, Languages"
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
              {saving ? "Saving…" : editing ? "Update Faculty" : "Add Faculty"}
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

export default function TeachersPage() {
  return (
    <ToastProvider>
      <TeachersContent />
    </ToastProvider>
  );
}
