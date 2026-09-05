"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import DataTable, { Column } from "@/components/DataTable";
import AttendanceToggle, { AttendanceStatus } from "@/components/AttendanceToggle";
import { ToastProvider, useToast } from "@/components/Toast";

interface SchoolClass {
  id: string;
  class_name: string;
  grade_level: string;
  section: string;
}

interface Student {
  id: string;
  student_number: string;
  user?: { full_name: string };
  full_name?: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  student?: { student_number: string; user?: { full_name: string } };
  school_class?: { class_name: string };
  recorder?: { full_name: string };
  student_name?: string;
  class_name?: string;
  recorder_name?: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = {
    PRESENT: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "Present" },
    ABSENT:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Absent" },
    LATE:    { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Late" },
  }[status] ?? { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", label: status };

  return (
    <span
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold"
    >
      {cfg.label}
    </span>
  );
}

function AttendanceContent() {
  const router = useRouter();
  const user = getUser();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;
  const canMark = isAdmin || isTeacher;

  const [tab, setTab] = useState<"take" | "records">(canMark ? "take" : "records");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selClassId, setSelClassId] = useState("");
  const [selDate, setSelDate] = useState(today());
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loadingStuds, setLoadingStuds] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recSearch, setRecSearch] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadClasses();
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const data = await get<SchoolClass[]>("/classes");
      const list = Array.isArray(data) ? data : [];
      setClasses(list);
      if (list.length > 0) {
        setSelClassId(list[0].id);
      }
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load classes.", "error");
    }
  }, [toast]);

  useEffect(() => {
    if (!selClassId) return;
    loadStudentsForClass(selClassId);
  }, [selClassId]);

  async function loadStudentsForClass(classId: string) {
    setLoadingStuds(true);
    try {
      const data = await get<Student[]>(`/classes/${classId}/students`);
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      const init: Record<string, AttendanceStatus> = {};
      list.forEach((s) => {
        init[s.id] = "PRESENT";
      });
      setStatuses(init);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load class roster.", "error");
    } finally {
      setLoadingStuds(false);
    }
  }

  const loadRecords = useCallback(async () => {
    setLoadingRecs(true);
    try {
      const data = await get<AttendanceRecord[]>("/attendance");
      const flat = (Array.isArray(data) ? data : []).map((r) => ({
        ...r,
        student_name: r.student?.user?.full_name ?? r.student?.student_number ?? "—",
        class_name: r.school_class?.class_name ?? "—",
        recorder_name: r.recorder?.full_name ?? "—",
      }));
      setRecords(flat);
    } catch (e: any) {
      toast.showToast(e.message || "Failed to load records.", "error");
    } finally {
      setLoadingRecs(false);
    }
  }, [toast]);

  useEffect(() => {
    if (tab === "records") {
      loadRecords();
    }
  }, [tab, loadRecords]);

  function markAll(status: AttendanceStatus) {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setStatuses(updated);
  }

  async function handleSubmitAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!selClassId || students.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        class_id: selClassId,
        date: selDate,
        records: students.map((s) => ({
          student_id: s.id,
          status: statuses[s.id] || "PRESENT",
        })),
      };
      await post("/attendance/bulk", payload);
      toast.showToast("Attendance successfully saved!", "success");
    } catch (e: any) {
      toast.showToast(e.message || "Failed to submit attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const recordColumns: Column<AttendanceRecord>[] = [
    {
      key: "date",
      label: "Date",
      render: (r) => <span className="font-mono text-xs font-semibold text-[#0f172a]">{r.date}</span>,
    },
    {
      key: "student_name",
      label: "Student Name",
      render: (r) => <span className="font-bold text-[#0f172a]">{r.student_name}</span>,
    },
    {
      key: "class_name",
      label: "Class / Section",
      render: (r) => <span className="text-xs text-[#64748b]">{r.class_name}</span>,
    },
    {
      key: "status",
      label: "Attendance Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "recorder_name",
      label: "Recorded By",
      render: (r) => <span className="text-xs text-[#94a3b8]">{r.recorder_name}</span>,
    },
  ];

  const markedCount = Object.keys(statuses).length;
  const pct = students.length > 0 ? Math.round((markedCount / students.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#0b1f3a] sm:text-2xl">
            Attendance Center
          </h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Daily roll call tracking, absence management, and historical attendance archives.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1 text-xs">
          {canMark && (
            <button
              onClick={() => setTab("take")}
              className={`rounded-lg px-4 py-1.5 font-bold transition-all ${
                tab === "take"
                  ? "bg-white text-[#1267e8] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Take Attendance
            </button>
          )}
          <button
            onClick={() => setTab("records")}
            className={`rounded-lg px-4 py-1.5 font-bold transition-all ${
              tab === "records"
                ? "bg-white text-[#1267e8] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Attendance Logs
          </button>
        </div>
      </div>

      {tab === "take" ? (
        <div className="card p-7 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-end gap-4 border-b border-[#e2e8f0] pb-6">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-bold text-[#334155]">Select Class</label>
              <select
                value={selClassId}
                onChange={(e) => setSelClassId(e.target.value)}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name} (Grade {c.grade_level})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <label className="mb-1 block text-xs font-bold text-[#334155]">Date</label>
              <input
                type="date"
                value={selDate}
                onChange={(e) => setSelDate(e.target.value)}
                className="input-glow w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll("PRESENT")}
                className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-3.5 py-2.5 text-xs font-bold text-[#059669] transition hover:bg-[#d1fae5]"
              >
                ✓ All Present
              </button>
              <button
                type="button"
                onClick={() => markAll("ABSENT")}
                className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-xs font-bold text-[#dc2626] transition hover:bg-[#fee2e2]"
              >
                ✕ All Absent
              </button>
            </div>
          </div>

          {/* Roster Table */}
          {loadingStuds ? (
            <div className="py-12 text-center text-xs text-[#64748b]">Loading roster…</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748b]">
              No students enrolled in this class yet.
            </div>
          ) : (
            <form onSubmit={handleSubmitAttendance} className="space-y-6">
              <div className="divide-y divide-[#f1f5f9] rounded-2xl border border-[#e2e8f0] bg-white">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1267e8] text-xs font-bold text-white shadow-xs">
                        {(s.user?.full_name || s.student_number).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">
                          {s.user?.full_name || s.student_number}
                        </p>
                        <p className="font-mono text-[11px] text-[#64748b]">
                          {s.student_number}
                        </p>
                      </div>
                    </div>

                    <AttendanceToggle
                      status={statuses[s.id] || "PRESENT"}
                      onChange={(newSt) => setStatuses({ ...statuses, [s.id]: newSt })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="shimmer-btn rounded-xl px-7 py-3 text-xs font-bold shadow-md"
                >
                  {submitting ? "Submitting Roll Call…" : "Save Official Attendance Record"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <DataTable
          columns={recordColumns}
          data={records}
          loading={loadingRecs}
          searchQuery={recSearch}
          searchKeys={["student_name", "class_name", "date"]}
          emptyMessage="No historical attendance records found."
          emptyIcon="📅"
        />
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <ToastProvider>
      <AttendanceContent />
    </ToastProvider>
  );
}
