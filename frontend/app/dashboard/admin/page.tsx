"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";

function StatIcon({ type }: { type: "students" | "teachers" | "classes" }) {
  if (type === "students") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (type === "teachers") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3V12"/><path d="M22 10v6"/></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>;
}

function StatCard({ label, value, type }: { label: string; value: number; type: "students" | "teachers" | "classes" }) {
  return (
    <div className="flex h-[132px] flex-col justify-between rounded-2xl border border-[#dbe5f0] bg-white p-5 shadow-[0_8px_24px_rgba(20,52,90,0.05)]">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#1267e8]"><StatIcon type={type} /></span>
        <span className="text-xs font-medium text-[#91a1b2]">Current</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-medium text-[#62778e]">{label}</span>
        <strong className="text-3xl font-extrabold tracking-tight text-[#0b1f3a]">{value.toLocaleString()}</strong>
      </div>
    </div>
  );
}

const actions = [
  { label: "Students", href: "/students" },
  { label: "Teachers", href: "/teachers" },
  { label: "Classes", href: "/classes" },
  { label: "Grades", href: "/grades" },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([get<any[]>("/students"), get<any[]>("/teachers"), get<any[]>("/classes")])
      .then(([students, teachers, classes]) => {
        if (!active) return;
        setCounts({
          students: Array.isArray(students) ? students.length : 0,
          teachers: Array.isArray(teachers) ? teachers.length : 0,
          classes: Array.isArray(classes) ? classes.length : 0,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-5">
      <section>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0b1f3a]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#70849a]">Hawassa Tabor Primary and Secondary School</p>
      </section>

      <section className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <StatCard label="Students" value={loading ? 0 : counts.students} type="students" />
        <StatCard label="Teachers" value={loading ? 0 : counts.teachers} type="teachers" />
        <StatCard label="Classes" value={loading ? 0 : counts.classes} type="classes" />
      </section>

      <section className="grid min-h-0 grid-cols-[1.15fr_.85fr] gap-5 max-lg:grid-cols-1">
        <div className="min-h-0 rounded-2xl border border-[#dbe5f0] bg-white p-5 shadow-[0_8px_24px_rgba(20,52,90,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#142d47]">School records</h2>
              <p className="mt-1 text-xs text-[#8294a8]">Current data</p>
            </div>
            <span className="rounded-full bg-[#eaf2ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1267e8]">Live</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <div className="rounded-xl border border-[#e1e9f2] bg-[#f8fbff] p-4"><p className="text-xs text-[#8294a8]">Students</p><p className="mt-2 text-2xl font-extrabold text-[#0b1f3a]">{counts.students.toLocaleString()}</p></div>
            <div className="rounded-xl border border-[#e1e9f2] bg-[#f8fbff] p-4"><p className="text-xs text-[#8294a8]">Teachers</p><p className="mt-2 text-2xl font-extrabold text-[#0b1f3a]">{counts.teachers.toLocaleString()}</p></div>
            <div className="rounded-xl border border-[#e1e9f2] bg-[#f8fbff] p-4"><p className="text-xs text-[#8294a8]">Classes</p><p className="mt-2 text-2xl font-extrabold text-[#0b1f3a]">{counts.classes.toLocaleString()}</p></div>
          </div>
        </div>

        <div className="min-h-0 rounded-2xl border border-[#dbe5f0] bg-white p-5 shadow-[0_8px_24px_rgba(20,52,90,0.05)]">
          <h2 className="text-base font-bold text-[#142d47]">Open</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <Link key={action.label} href={action.href} className="group flex min-h-[74px] items-center justify-between rounded-xl border border-[#dbe5f0] bg-[#fbfdff] px-4 no-underline transition hover:border-[#b9d1ec] hover:bg-[#f4f8fd]">
                <span className="text-sm font-semibold text-[#18344f]">{action.label}</span>
                <span className="text-lg text-[#1267e8] transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
