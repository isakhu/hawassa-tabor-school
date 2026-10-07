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
      label: "Avatar",
      width: 80,
      render: (t) => (
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name || 'T')}&background=random&color=fff&rounded=true`} 
          alt={t.full_name} 
          className="w-8 h-8 rounded-full shadow-sm" 
        />
      ),
    },
    {
      key: "first_name",
      label: "FirstName",
      render: (t) => (t.full_name || "Unknown").split(" ")[0],
    },
    {
      key: "last_name",
      label: "LastName",
      render: (t) => {
        const parts = (t.full_name || "Unknown").split(" ");
        return parts.slice(1).join(" ") || "—";
      },
    },
    {
      key: "email",
      label: "Email",
      render: (t) => t.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (t) => "07" + Math.floor(Math.random() * 90000000 + 10000000), // Mock phone
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (t) => (
        <div className="flex flex-wrap gap-1.5">
          {(t.subject_specialization || "General").split(",").map((sub) => (
            <span key={sub} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold">
              {sub.trim()}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: 80,
      render: (t) => (
        <button onClick={() => isAdmin && openEdit(t)} className="text-slate-400 hover:text-slate-600 flex justify-center w-full">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
        {isAdmin && (
           <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
             Add Teachers
           </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        searchQuery={search}
        searchKeys={["full_name", "email", "subject_specialization", "teacher_number"]}
        emptyMessage="No teachers found."
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
