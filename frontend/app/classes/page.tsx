"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { del, get, post, put } from "@/lib/api";
import { dashboardForRole, getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import Modal from "@/components/Modal";
import { ToastProvider, useToast } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Card gradients ───────────────────────────────────────────────────────────
const CARD_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#4f46e5)",
  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  "linear-gradient(135deg,#ec4899,#be185d)",
  "linear-gradient(135deg,#10b981,#047857)",
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "linear-gradient(135deg,#f59e0b,#b45309)",
];

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "rgba(19,19,26,0.8)", border: "1px solid rgba(99,102,241,0.1)" }}>
      <div className="skeleton" style={{ height: 90, borderRadius: 0 }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ width: "70%", height: 18, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: "50%", height: 12, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "40%", height: 12, marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skeleton" style={{ flex: 1, height: 32, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Class card ───────────────────────────────────────────────────────────────
function ClassCard({
  cls, index, isAdmin, currentRole,
  onEdit, onDelete,
}: {
  cls: SchoolClass; index: number; isAdmin: boolean; currentRole: ROLES;
  onEdit: (c: SchoolClass) => void; onDelete: (c: SchoolClass) => void;
}) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const teacherName = cls.teacher?.user?.full_name ?? "Unassigned";

  return (
    <div
      style={{ borderRadius: 16, overflow: "hidden", background: "rgba(19,19,26,0.85)", border: "1px solid rgba(99,102,241,0.12)", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Gradient header */}
      <div style={{ height: 90, background: gradient, position: "relative", padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", fontSize: 11, color: "#fff", fontWeight: 700 }}>
          {cls.enrolled_student_count ?? 0} students
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
          {cls.academic_year}
        </p>
        <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
          {cls.class_name}
        </h3>
      </div>

      {/* Card body */}
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>
            <span style={{ fontSize: 13, color: "#9898b0" }}>{teacherName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span style={{ fontSize: 13, color: "#9898b0" }}>Grade {cls.grade_level} · Section {cls.section}</span>
          </div>
          {cls.room_number && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              <span style={{ fontSize: 13, color: "#9898b0" }}>{cls.room_number}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/classes/${cls.id}`}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 9, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center", transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
          >
            View Students
          </Link>
          {isAdmin && (
            <>
              <button onClick={() => onEdit(cls)} title="Edit" style={{ padding: "8px 10px", borderRadius: 9, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button onClick={() => onDelete(cls)} title="Delete" style={{ padding: "8px 10px", borderRadius: 9, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm delete ───────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Class" maxWidth={380}>
      <p style={{ color: "#9898b0", fontSize: 14, marginBottom: 20 }}>
        Delete <strong style={{ color: "#e8e8f0" }}>{name}</strong>? All enrollment records will be removed.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Delete</button>
      </div>
    </Modal>
  );
}

const inputSt: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, color: "#e8e8f0", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", transition: "border-color 0.2s" };
const selectSt: React.CSSProperties = { ...inputSt, cursor: "pointer", appearance: "none" as any };

// ─── Main ─────────────────────────────────────────────────────────────────────
function ClassesContent() {
  const router  = useRouter();
  const user    = getUser();
  const toast   = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [classes,   setClasses]   = useState<SchoolClass[]>([]);
  const [teachers,  setTeachers]  = useState<Teacher[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<SchoolClass | null>(null);
  const [delTarget, setDelTarget] = useState<SchoolClass | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ class_name: "", grade_level: "", section: "", academic_year: "", room_number: "", teacher_id: "" });

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    loadAll();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, tch] = await Promise.all([get<SchoolClass[]>("/classes"), get<Teacher[]>("/teachers").catch(() => [])]);
      setClasses(Array.isArray(cls) ? cls : []);
      setTeachers(Array.isArray(tch) ? tch : []);
    } catch (e: any) {
      toast.showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filtered = classes.filter((c) =>
    !search || [c.class_name, c.grade_level, c.section, c.academic_year].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() {
    setEditing(null);
    setForm({ class_name: "", grade_level: "", section: "", academic_year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1), room_number: "", teacher_id: "" });
    setModalOpen(true);
  }

  function openEdit(c: SchoolClass) {
    setEditing(c);
    setForm({ class_name: c.class_name, grade_level: c.grade_level, section: c.section, academic_year: c.academic_year, room_number: c.room_number ?? "", teacher_id: c.teacher_id ?? "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { class_name: form.class_name, grade_level: form.grade_level, section: form.section, academic_year: form.academic_year };
      if (form.room_number)  payload.room_number = form.room_number;
      if (form.teacher_id)   payload.teacher_id  = form.teacher_id;

      if (editing) {
        await put(`/classes/${editing.id}`, payload);
        toast.showToast("Class updated!", "success");
      } else {
        await post("/classes", payload);
        toast.showToast("Class created!", "success");
      }
      setModalOpen(false);
      loadAll();
    } catch (e: any) {
      toast.showToast(e.message, "error");
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
      toast.showToast(e.message, "error");
    }
  }

  return (
    <div className="animate-page-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>Classes</h2>
            {!loading && (
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)", fontSize: 12, fontWeight: 700, color: "#f472b6" }}>
                {filtered.length}
              </span>
            )}
          </div>
          <p style={{ color: "#6b6b80", fontSize: 13, marginTop: 2 }}>Manage school classes and enrollments</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 10, minWidth: 200 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b6b80" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input placeholder="Search classes…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "#e8e8f0", fontSize: 13, width: "100%", fontFamily: "var(--font-dm-sans)" }} />
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="shimmer-btn" style={{ padding: "10px 18px", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-syne)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Class
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {[0,1,2,3,4,5].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b6b80" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <p style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#9898b0", marginBottom: 6 }}>No classes yet</p>
          <p style={{ fontSize: 14 }}>{isAdmin ? 'Click "Add Class" to create the first class.' : "No classes available."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map((cls, i) => (
            <ClassCard key={cls.id} cls={cls} index={i} isAdmin={isAdmin} currentRole={user!.role} onEdit={openEdit} onDelete={setDelTarget} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Class" : "Add Class"} maxWidth={520}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Class Name</label>
            <input required value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} className="input-glow" style={inputSt} placeholder="Mathematics 10A" /></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Grade Level</label>
              <input required value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} className="input-glow" style={inputSt} placeholder="Grade 10" /></div>
            <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Section</label>
              <input required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="input-glow" style={inputSt} placeholder="A" /></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Academic Year</label>
              <input required value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} className="input-glow" style={inputSt} placeholder="2024-2025" /></div>
            <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Room (optional)</label>
              <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="input-glow" style={inputSt} placeholder="Room 204" /></div>
          </div>

          <div><label style={{ display: "block", fontSize: 12, color: "#9898b0", marginBottom: 5 }}>Teacher (optional)</label>
            <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} className="input-glow" style={selectSt}>
              <option value="">— Unassigned —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id} style={{ background: "#13131a" }}>
                  {t.user?.full_name ?? t.teacher_number} · {t.subject_specialization}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9898b0", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} className="shimmer-btn" style={{ padding: "10px 22px", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-syne)" }}>
              {saving ? "Saving…" : editing ? "Update" : "Create Class"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} name={delTarget?.class_name ?? ""} />
    </div>
  );
}

export default function ClassesPage() {
  return <ToastProvider><ClassesContent /></ToastProvider>;
}
