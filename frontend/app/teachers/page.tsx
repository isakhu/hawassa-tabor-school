"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { del, get, post, put } from "@/lib/api";
import { dashboardForRole, getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--font-syne)", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete" maxWidth={380}>
      <p style={{ color: "#9898b0", fontSize: 14, marginBottom: 20 }}>
        Delete <strong style={{ color: "#e8e8f0" }}>{name}</strong>? This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Delete</button>
      </div>
    </Modal>
  );
}

const inputSt: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", transition: "border-color 0.2s" };

// ─── Main ─────────────────────────────────────────────────────────────────────
function TeachersContent() {
  const router  = useRouter();
  const user    = getUser();
  const toast   = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [teachers,   setTeachers]   = useState<Teacher[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Teacher | null>(null);
  const [delTarget,  setDelTarget]  = useState<Teacher | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", teacher_number: "", subject_specialization: "", department: "" });

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role === ROLES.STUDENT) { router.replace(dashboardForRole(user.role)); return; }
    loadTeachers();
  }, []);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<Teacher[]>("/teachers");
      setTeachers(data.map((t) => ({ ...t, full_name: t.user?.full_name ?? "—", email: t.user?.email ?? "—" })));
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  function openAdd() {
    setEditing(null);
    setForm({ full_name: "", email: "", password: "", teacher_number: "", subject_specialization: "", department: "" });
    setModalOpen(true);
  }

  function openEdit(t: Teacher) {
    setEditing(t);
    setForm({ full_name: t.full_name ?? "", email: t.email ?? "", password: "", teacher_number: t.teacher_number, subject_specialization: t.subject_specialization, department: t.department ?? "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await put(`/teachers/${editing.id}`, { subject_specialization: form.subject_specialization, department: form.department });
        toast.showToast("Teacher updated!", "success");
      } else {
        const newUser = await post<any>("/auth/register", { full_name: form.full_name, email: form.email, password: form.password, role: "TEACHER" });
        await post("/teachers", { user_id: newUser.id, teacher_number: form.teacher_number, subject_specialization: form.subject_specialization, department: form.department || undefined });
        toast.showToast("Teacher added!", "success");
      }
      setModalOpen(false);
      loadTeachers();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    try {
      await del(`/teachers/${delTarget.id}`);
      toast.showToast("Teacher deleted.", "success");
      setDelTarget(null);
      loadTeachers();
    } catch (e: any) {
      toast.showToast(e.message, "error");
    }
  }

  const columns: Column<Teacher>[] = [
    { key: "avatar", label: "", width: 50, render: (t) => <Avatar name={t.full_name ?? "?"} /> },
    { key: "full_name", label: "Full Name",  render: (t) => <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{t.full_name}</span> },
    { key: "email",     label: "Email",      render: (t) => <span style={{ color: "#9898b0" }}>{t.email}</span> },
    { key: "teacher_number", label: "Teacher ID" },
    { key: "subject_specialization", label: "Subject" },
    {
      key: "actions", label: "Actions", width: 100,
      render: (t) => isAdmin ? (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => openEdit(t)} title="Edit" style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button onClick={() => setDelTarget(t)} title="Delete" style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}>
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
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>Teachers</h2>
            {!loading && (
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
                {teachers.length}
              </span>
            )}
          </div>
          <p style={{ color: "#6b6b80", fontSize: 13, marginTop: 2 }}>Manage teaching staff</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, minWidth: 220 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input placeholder="Search teachers…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "#e8e8f0", fontSize: 13, width: "100%", fontFamily: "var(--font-dm-sans)" }} />
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-syne)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Teacher
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <DataTable columns={columns} data={teachers} loading={loading} searchQuery={search} searchKeys={["full_name", "email", "teacher_number", "subject_specialization"]} emptyMessage="No teachers yet" emptyIcon="📚" />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Teacher" : "Add Teacher"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!editing && (
            <>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Full Name</label><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-glow" style={inputSt} placeholder="Mr. Smith" /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-glow" style={inputSt} placeholder="smith@school.edu" /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Password</label><input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-glow" style={inputSt} placeholder="Min 8 characters" /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Teacher ID</label><input required value={form.teacher_number} onChange={(e) => setForm({ ...form, teacher_number: e.target.value })} className="input-glow" style={inputSt} placeholder="TCH-2024-001" /></div>
            </>
          )}
          <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Subject Specialization</label><input required value={form.subject_specialization} onChange={(e) => setForm({ ...form, subject_specialization: e.target.value })} className="input-glow" style={inputSt} placeholder="Mathematics" /></div>
          <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Department (optional)</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-glow" style={inputSt} placeholder="Science" /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} className="shimmer-btn" style={{ padding: "10px 22px", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-syne)" }}>
              {saving ? "Saving…" : editing ? "Update" : "Add Teacher"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} name={delTarget?.full_name ?? ""} />
    </div>
  );
}

export default function TeachersPage() {
  return <ToastProvider><TeachersContent /></ToastProvider>;
}
