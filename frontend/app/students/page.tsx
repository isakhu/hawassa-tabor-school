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
      label: "Avatar",
      width: 80,
      render: (s) => (
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name || 'S')}&background=random&color=fff&rounded=true`} 
          alt={s.full_name} 
          className="w-8 h-8 rounded-full shadow-sm" 
        />
      ),
    },
    {
      key: "first_name",
      label: "FirstName",
      render: (s) => (s.full_name || "Unknown").split(" ")[0],
    },
    {
      key: "last_name",
      label: "LastName",
      render: (s) => {
        const parts = (s.full_name || "Unknown").split(" ");
        return parts.slice(1).join(" ") || "—";
      },
    },
    {
      key: "grade",
      label: "Grade",
      render: (s) => `${s.grade_level} - ${s.section}`,
    },
    {
      key: "roll_number",
      label: "Roll Number",
      render: (s) => s.student_number.replace(/\D/g, '') || Math.floor(Math.random() * 900000000 + 100000000), // mock numeric roll
    },
    {
      key: "parents",
      label: "Parents",
      render: (s) => (
         <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
            Thomas Kennedy
         </span>
      ), // mocked parent link for visuals
    },
    {
      key: "actions",
      label: "Action",
      width: 80,
      render: (s) => (
        <button onClick={() => isAdmin && openEdit(s)} className="text-slate-400 hover:text-slate-600 flex justify-center w-full">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        {isAdmin && (
           <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
             Add Students
           </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        searchQuery={search}
        searchKeys={["full_name", "email", "student_number"]}
        emptyMessage="No students found."
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
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
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
