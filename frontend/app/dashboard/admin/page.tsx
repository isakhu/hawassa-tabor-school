"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";

function StatIcon({ type }: { type: "students" | "teachers" | "classes" }) {
  if (type === "students") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (type === "teachers") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3V12"/><path d="M22 10v6"/></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>;
}

function StatCard({ label, value, type, tone }: { label: string; value: number; type: "students" | "teachers" | "classes"; tone: "blue" | "green" | "purple" }) {
  const toneClasses = {
    blue: "stat-card-blue bg-gradient-to-br from-white via-white to-blue-50",
    green: "stat-card-green bg-gradient-to-br from-white via-white to-emerald-50",
    purple: "stat-card-purple bg-gradient-to-br from-white via-white to-violet-50",
  } as const;
  const iconClasses = {
    blue: "bg-blue-100 text-blue-600 ring-1 ring-blue-200",
    green: "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200",
    purple: "bg-violet-100 text-violet-600 ring-1 ring-violet-200",
  } as const;
  return (
    <div className={`stat-card ${toneClasses[tone]} flex h-[140px] flex-col justify-between p-5`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClasses[tone]}`}><StatIcon type={type} /></span>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 ring-1 ring-slate-200">Live</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-semibold text-slate-600">{label}</span>
        <strong className="text-3xl font-black tracking-tight text-slate-900">{value.toLocaleString()}</strong>
      </div>
    </div>
  );
}

const actions = [
  { label: "Students", href: "/students", tone: "blue", icon: "🎓" },
  { label: "Teachers", href: "/teachers", tone: "green", icon: "👨‍🏫" },
  { label: "Classes", href: "/classes", tone: "purple", icon: "📚" },
  { label: "Grades", href: "/grades", tone: "orange", icon: "📊" },
];

const actionTone = {
  blue: "border-blue-100 bg-blue-50/70 hover:border-blue-200 hover:bg-blue-100/70 text-blue-700",
  green: "border-emerald-100 bg-emerald-50/70 hover:border-emerald-200 hover:bg-emerald-100/70 text-emerald-700",
  purple: "border-violet-100 bg-violet-50/70 hover:border-violet-200 hover:bg-violet-100/70 text-violet-700",
  orange: "border-orange-100 bg-orange-50/70 hover:border-orange-200 hover:bg-orange-100/70 text-orange-700",
} as const;

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
        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 ring-1 ring-blue-100">Administration</div>
        <h1 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#0b1f3a]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#70849a]">Hawassa Tabor Primary and Secondary School</p>
      </section>

      <section className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <StatCard label="Students" value={loading ? 0 : counts.students} type="students" tone="blue" />
        <StatCard label="Teachers" value={loading ? 0 : counts.teachers} type="teachers" tone="green" />
        <StatCard label="Classes" value={loading ? 0 : counts.classes} type="classes" tone="purple" />
      </section>

      <section className="grid min-h-0 grid-cols-[1.15fr_.85fr] gap-5 max-lg:grid-cols-1">
        <div className="color-card color-card-blue min-h-0 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#142d47]">School records</h2>
              <p className="mt-1 text-xs text-[#8294a8]">Current data at a glance</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100">Live data</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <div className="color-card color-card-blue rounded-xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-none"><p className="text-xs font-semibold text-blue-600">Students</p><p className="mt-2 text-2xl font-black text-blue-950">{counts.students.toLocaleString()}</p></div>
            <div className="color-card color-card-green rounded-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-none"><p className="text-xs font-semibold text-emerald-600">Teachers</p><p className="mt-2 text-2xl font-black text-emerald-950">{counts.teachers.toLocaleString()}</p></div>
            <div className="color-card color-card-purple rounded-xl border-0 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 shadow-none"><p className="text-xs font-semibold text-violet-600">Classes</p><p className="mt-2 text-2xl font-black text-violet-950">{counts.classes.toLocaleString()}</p></div>
          </div>
        </div>

        <div className="color-card color-card-orange min-h-0 p-5">
          <div>
            <h2 className="text-base font-bold text-[#142d47]">Quick access</h2>
            <p className="mt-1 text-xs text-[#8294a8]">Jump directly to a management area</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <Link key={action.label} href={action.href} className={`group flex min-h-[82px] items-center justify-between rounded-xl border px-4 no-underline transition ${actionTone[action.tone as keyof typeof actionTone]}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-bold">{action.label}</span>
                </div>
                <span className="text-lg transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
