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
        title={editing ? "Edit Teacher" : "Add Teacher"}
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
                <label className="mb-1 block text-xs text-gray-500">Title</label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-600">
                  <option></option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                </select>
              </div>
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
              <label className="mb-1 block text-xs text-gray-500">Subject(s)</label>
              <input value={form.subject_specialization} onChange={(e)=>setForm({...form, subject_specialization: e.target.value})} placeholder="Select Subject(s)" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Department(s)</label>
              <input value={form.department} onChange={(e)=>setForm({...form, department: e.target.value})} placeholder="Select Department(s)" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Assign Class Teacher</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-400">
                <option>Select Grade(s)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Gender</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Preferred Contact Method</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Status</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nationality</label>
              <input defaultValue="Kenyan" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Religion</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Address</label>
              <input placeholder="Address" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Qualification</label>
              <input placeholder="Qualification" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Experience</label>
              <input placeholder="Experience" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Teacher Role</label>
              <div className="flex items-center gap-2 h-9">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Is Admin?</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">National ID/Passport</label>
              <input placeholder="Identification" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Employee ID/Number</label>
              <input required value={form.teacher_number} onChange={(e)=>setForm({...form, teacher_number: e.target.value})} placeholder="Employee Identification" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Teacher teaching status</label>
              <div className="flex items-center gap-2 h-9">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm">Is Active?</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="Email" className="w-full rounded-md border border-gray-200 pl-9 pr-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-gray-500">Password</label>
                {!editing && (
                  <button type="button" onClick={() => setForm({...form, password: Math.floor(100000 + Math.random() * 900000).toString()})} className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">Generate</button>
                )}
              </div>
              <div className="relative">
                <input required={!editing} type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value.replace(/\D/g,"")})} placeholder="Password" title="Digits only" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                   <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Phone</label>
              <input placeholder="Phone" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Specialization</label>
              <input placeholder="Specialization" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Additional Info</label>
              <input placeholder="Additional info about the teacher" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button
               type="submit"
               disabled={saving}
               className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-md px-6 py-2 text-sm font-semibold transition-colors"
             >
               {saving ? "Saving…" : editing ? "Update" : "Add Teachers"}
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
