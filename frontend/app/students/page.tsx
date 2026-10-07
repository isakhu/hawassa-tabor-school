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
        title={editing ? "Edit Student" : "Register Student"}
        maxWidth={850}
      >
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">Single Admission</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700 font-semibold text-sm">Bulk Admission</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-6">
            <div className="w-40 flex-shrink-0">
              <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center relative">
                <svg className="w-24 h-24 text-white mt-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <button type="button" className="absolute top-2 right-2 bg-white rounded-md p-1.5 shadow hover:bg-gray-50">
                   <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 15V5"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">First name</label>
                <input required value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} placeholder="First Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Last name</label>
                <input placeholder="Last Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Surname</label>
                <input placeholder="Surname" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Gender</label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-600">
                  <option></option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Date Of Birth</label>
                <input type="date" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none text-gray-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Age</label>
                <input placeholder="Age" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-gray-50" readOnly />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Parent(s)</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-400">
                <option>Select Parent(s)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Admission Date</label>
              <input type="date" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none text-gray-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Roll Number</label>
              <input required value={form.student_number} onChange={(e)=>setForm({...form, student_number: e.target.value})} placeholder="Roll Number" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Grade</label>
              <select required value={form.grade_level} onChange={(e)=>setForm({...form, grade_level: e.target.value})} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-600">
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
              <label className="mb-1 block text-xs text-gray-500">Section</label>
              <input required value={form.section} onChange={(e)=>setForm({...form, section: e.target.value})} placeholder="Section (A, B, C)" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Address</label>
              <input placeholder="Address" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nationality</label>
              <input defaultValue="Kenyan" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Religion</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-600"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Student learning status</label>
              <div className="flex items-center gap-2 h-9">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm">Is Active?</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Email (Username)</label>
              <input type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="Email" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-gray-500">Password</label>
                {!editing && (
                  <button type="button" onClick={() => setForm({...form, password: Math.floor(100000 + Math.random() * 900000).toString()})} className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">Generate</button>
                )}
              </div>
              <input required={!editing} type="text" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value.replace(/\D/g,"")})} placeholder="Password (Digits)" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Additional Info</label>
            <textarea placeholder="Additional info about the student" rows={3} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none resize-none"></textarea>
          </div>

          <div className="flex pt-4">
             <button
               type="submit"
               disabled={saving}
               className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md px-6 py-2 text-sm font-semibold transition-colors"
             >
               {saving ? "Saving…" : editing ? "Update" : "Submit"}
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
