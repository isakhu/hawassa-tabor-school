"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { get, post, put, del } from "@/lib/api";
import { getUser, dashboardForRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Student {
  id: string;
  user_id: string;
  student_number: string;
  grade_level: string;
  section: string;
  user?: { full_name: string; email: string; role: string };
  // flattened for table
  full_name?: string;
  email?: string;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--font-syne)", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete" maxWidth={380}>
      <p style={{ color: "#9898b0", fontSize: 14, marginBottom: 20 }}>
        Are you sure you want to delete <strong style={{ color: "#e8e8f0" }}>{name}</strong>? This action cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Delete</button>
      </div>
    </Modal>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" };

// ─── Main content ─────────────────────────────────────────────────────────────
function StudentsContent() {
  const router  = useRouter();
  const user    = getUser();
  const toast   = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [students, setStudents]         = useState<Student[]>([]);
  const [loading,  setLoading]          = useState(true);
  const [search,   setSearch]           = useState("");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing,   setEditing]         = useState<Student | null>(null);
  const [delTarget, setDelTarget]       = useState<Student | null>(null);
  const [saving,    setSaving]          = useState(false);

  // Form state
  const [form, setForm] = useState({ full_name: "", email: "", password: "", student_number: "", grade_level: "", section: "", user_id: "" });

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role === ROLES.STUDENT) { router.replace(dashboardForRole(user.role)); return; }
    loadStudents();
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<Student[]>("/students");
      const flat = data.map((s) => ({ ...s, full_name: s.user?.full_name ?? "—", email: s.user?.email ?? "—" }));
      setStudents(flat);
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  function openAdd() {
    setEditing(null);
    setForm({ full_name: "", email: "", password: "", student_number: "", grade_level: "", section: "", user_id: "" });
    setModalOpen(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setForm({ full_name: s.full_name ?? "", email: s.email ?? "", password: "", student_number: s.student_number, grade_level: s.grade_level, section: s.section, user_id: s.user_id });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await put(`/students/${editing.id}`, { grade_level: form.grade_level, section: form.section });
        toast.showToast("Student updated successfully!", "success");
      } else {
        // 1. Create user account first
        const newUser = await post<any>("/auth/register", { full_name: form.full_name, email: form.email, password: form.password, role: "STUDENT" });
        // 2. Create student profile
        await post("/students", { user_id: newUser.id, student_number: form.student_number, grade_level: form.grade_level, section: form.section });
        toast.showToast("Student added successfully!", "success");
      }
      setModalOpen(false);
      loadStudents();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/students/${delTarget.id}`);
      toast.showToast("Student deleted.", "success");
      setDelTarget(null);
      loadStudents();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    }
  }

  // ─── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<Student>[] = [
    {
      key: "avatar", label: "", width: 50,
      render: (s) => <Avatar name={s.full_name ?? "?"} />,
    },
    { key: "full_name",      label: "Full Name",   render: (s) => <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{s.full_name}</span> },
    { key: "email",          label: "Email",       render: (s) => <span style={{ color: "#9898b0" }}>{s.email}</span> },
    { key: "student_number", label: "Student ID" },
    {
      key: "actions", label: "Actions", width: 100,
      render: (s) => isAdmin ? (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => openEdit(s)} title="Edit" style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button onClick={() => setDelTarget(s)} title="Delete" style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
          </button>
        </div>
      ) : <span style={{ color: "#6b6b80", fontSize: 12 }}>View only</span>,
    },
  ];

  return (
    <div className="animate-page-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>Students</h2>
            {!loading && (
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", fontSize: 12, fontWeight: 700, color: "#818cf8" }}>
                {students.length}
              </span>
            )}
          </div>
          <p style={{ color: "#6b6b80", fontSize: 13, marginTop: 2 }}>Manage enrolled students</p>
        </div>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, minWidth: 220 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "#e8e8f0", fontSize: 13, width: "100%", fontFamily: "var(--font-dm-sans)" }} />
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-syne)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Student
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          searchQuery={search}
          searchKeys={["full_name", "email", "student_number"]}
          emptyMessage="No students yet"
          emptyIcon="🎓"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!editing && (
            <>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Full Name</label><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-glow" style={inputSt} placeholder="Jane Doe" /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-glow" style={inputSt} placeholder="jane@school.edu" /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Password</label><input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-glow" style={inputSt} placeholder="Min 8 characters" /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Student ID</label><input required value={form.student_number} onChange={(e) => setForm({ ...form, student_number: e.target.value })} className="input-glow" style={inputSt} placeholder="STU-2024-001" /></div>
            </>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Grade Level</label><input required value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} className="input-glow" style={inputSt} placeholder="Grade 10" /></div>
            <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Section</label><input required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="input-glow" style={inputSt} placeholder="A" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} className="shimmer-btn" style={{ padding: "10px 22px", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-syne)" }}>
              {saving ? "Saving…" : editing ? "Update" : "Add Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} name={delTarget?.full_name ?? ""} />
    </div>
  );
}

export default function StudentsPage() {
  return <ToastProvider><StudentsContent /></ToastProvider>;
}
