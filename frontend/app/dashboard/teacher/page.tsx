"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@/lib/api";
import { getUser } from "@/lib/auth";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ClassCard({ cls }: { cls: any }) {
  return (
    <div className="card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[#eaf2ff] px-2.5 py-1 text-[10px] font-bold text-[#1267e8]">
            Grade {cls.grade_level} • Sec {cls.section}
          </span>
          <span className="text-xs text-[#94a3b8]">{cls.academic_year}</span>
        </div>

        <h3 className="mt-3 text-lg font-extrabold text-[#0b1f3a]">
          {cls.class_name}
        </h3>
        <p className="mt-1 text-xs text-[#64748b]">
          Room: {cls.room_number || "Main Building"} • {cls.enrolled_student_count ?? 0} Students
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-[#f1f5f9] pt-4">
        <Link
          href="/attendance"
          className="flex-1 rounded-xl bg-[#1267e8] py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#0d54c2]"
        >
          Attendance
        </Link>
        <Link
          href="/grades"
          className="flex-1 rounded-xl border border-[#cbd5e1] bg-white py-2 text-center text-xs font-bold text-[#334155] shadow-xs transition hover:bg-[#f8fafc]"
        >
          Grades
        </Link>
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const user = getUser();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await get<any[]>("/classes");
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load classes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1267e8]">
          Faculty Portal
        </span>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0b1f3a] sm:text-3xl">
          {getGreeting()}, {user?.full_name || "Instructor"}
        </h1>
        <p className="mt-1 text-xs text-[#64748b]">
          Manage your assigned classes, take daily attendance, and submit student assessment marks.
        </p>
      </div>

      {/* Classes Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0b1f3a]">
            Your Classes & Sections
          </h2>
          <span className="text-xs font-semibold text-[#64748b]">
            {classes.length} {classes.length === 1 ? "Class" : "Classes"} Assigned
          </span>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-4 w-24 mb-3" />
                <div className="skeleton h-6 w-40 mb-2" />
                <div className="skeleton h-3 w-32 mb-6" />
                <div className="skeleton h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-12 text-center">
            <div className="text-4xl">📚</div>
            <p className="mt-2 text-sm font-bold text-[#0b1f3a]">No classes assigned yet</p>
            <p className="mt-1 text-xs text-[#64748b]">
              Your class assignments will appear here once configured by the administration.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
