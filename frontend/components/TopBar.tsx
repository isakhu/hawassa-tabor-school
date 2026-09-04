"use client";

import type { AuthUser } from "@/lib/auth";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function roleName(role: AuthUser["role"]) {
  return role === "ADMIN" ? "Administrator" : role === "TEACHER" ? "Teacher" : "Student";
}

export default function TopBar({ title, user }: { title: string; user: AuthUser }) {
  return (
    <header className="fixed left-[260px] right-0 top-0 z-[100] flex h-[72px] items-center border-b border-[#dbe5f0] bg-white px-5 shadow-[0_2px_14px_rgba(20,52,90,0.04)] max-lg:left-0 max-sm:pl-16">
      <div className="min-w-0">
        <p className="truncate text-[18px] font-extrabold tracking-tight text-[#0b1f3a]">{title}</p>
        <p className="mt-0.5 text-[11px] text-[#8294a8]">Hawassa Tabor Primary and Secondary School</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5 border-l border-[#e1e8f0] pl-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1267e8] text-xs font-bold text-white ring-4 ring-[#eaf2ff]">
            {getInitials(user.full_name)}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[170px] truncate text-sm font-semibold text-[#1b3854]">{user.full_name}</p>
            <p className="mt-0.5 text-[11px] text-[#8294a8]">{roleName(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
