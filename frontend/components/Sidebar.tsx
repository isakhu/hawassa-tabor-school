"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import type { AuthUser } from "@/lib/auth";
import { 
  Home, GraduationCap, Users, UserSquare, BookOpen, FileDigit,
  ClipboardList, CheckSquare, CalendarCheck, Building2, UserCircle, 
  ShieldCheck, CircleDollarSign, Megaphone, CalendarDays, MessageSquare, 
  Clock, FileText, Award, Landmark, ClipboardCheck, MessageCircleQuestion,
  MessageCircleReply, Folder, FolderLock, File, List, BarChart3, Building,
  LogOut, Menu, X
} from "lucide-react";
import logoImg from "../public/logo.jpg";

const NAV = [
  { label: "Home", href: "", icon: Home, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Teachers", href: "/teachers", icon: GraduationCap, roles: [ROLES.ADMIN] },
  { label: "Students", href: "/students", icon: Users, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { label: "Parents", href: "/parents", icon: UserSquare, roles: [ROLES.ADMIN] },
  { label: "Subjects", href: "/subjects", icon: BookOpen, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Grades", href: "/grades", icon: FileDigit, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Lessons", href: "/lessons", icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Assignments", href: "/assignments", icon: CheckSquare, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Departments", href: "/departments", icon: Building2, roles: [ROLES.ADMIN] },
  { label: "Staff", href: "/staff", icon: UserCircle, roles: [ROLES.ADMIN] },
  { label: "Admins", href: "/admins", icon: ShieldCheck, roles: [ROLES.ADMIN] },
  { label: "Fees", href: "/fees", icon: CircleDollarSign, roles: [ROLES.ADMIN, ROLES.STUDENT] },
  { label: "Announcements", href: "/announcements", icon: Megaphone, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Events", href: "/events", icon: CalendarDays, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Messages", href: "/messages", icon: MessageSquare, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Periods", href: "/periods", icon: Clock, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Exams", href: "/exams", icon: FileText, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Results", href: "/results", icon: Award, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark, roles: [ROLES.ADMIN] },
  { label: "Evaluations", href: "/evaluations", icon: ClipboardCheck, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { label: "Responses - Students", href: "/responses-students", icon: MessageCircleQuestion, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { label: "Responses - Teachers", href: "/responses-teachers", icon: MessageCircleReply, roles: [ROLES.ADMIN] },
  { label: "Files", href: "/file-manager", icon: Folder, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Private Files", href: "/private-files", icon: FolderLock, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Documents", href: "/documents", icon: File, roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
  { label: "Audit Trails", href: "/audits", icon: List, roles: [ROLES.ADMIN] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: [ROLES.ADMIN, ROLES.TEACHER] },
  { label: "School Profile", href: "/school-profile", icon: Building, roles: [ROLES.ADMIN] },
];

function roleName(role: ROLES) {
  return role === ROLES.ADMIN ? "Administrator" : role === ROLES.TEACHER ? "Teacher" : "Student";
}

export default function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = user.role === ROLES.ADMIN ? "/dashboard/admin" : user.role === ROLES.TEACHER ? "/dashboard/teacher" : "/dashboard/student";
  const items = NAV.filter((item) => item.roles.includes(user.role)).map((item) => ({ ...item, href: item.href || basePath }));

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-[72px] shrink-0 items-center border-b border-[#e4ebf3] px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <Link href={basePath} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 no-underline z-10 w-full group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/30 shrink-0 transform transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
             <img src={logoImg.src} alt="Logo" className="w-[85%] h-[85%] object-cover rounded-md" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-[#1d3557] leading-tight truncate group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-purple-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Hawassa Tabor</span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6 text-slate-600 custom-scrollbar pb-10" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 10px;
          }
        `}</style>
        <p className="mb-3 px-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-clip-text">MENU</p>
        <div className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[13px] font-semibold no-underline transition-all duration-300 group ${
                  active 
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-700 hover:scale-[1.01]"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${
                  active ? "text-white scale-110" : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110"
                }`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 mb-3 px-2 flex items-center gap-2">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">OTHER</p>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        <div className="space-y-1">
           <Link href="/profile" className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-300 group hover:scale-[1.01]">
              <UserCircle size={18} strokeWidth={2} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span>Profile</span>
           </Link>
           <button onClick={logout} className="flex w-full min-h-[42px] items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group hover:scale-[1.01]">
              <LogOut size={18} strokeWidth={2} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              <span>Logout</span>
           </button>
        </div>
      </nav>
      
      {/* Profile summary at bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-2 rounded-xl mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center border border-blue-200 shadow-sm shrink-0">
             <span className="text-blue-700 font-bold text-sm">{(user.full_name || "AD").substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user.full_name}</p>
            <p className="text-xs font-semibold text-blue-600 truncate">{roleName(user.role)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[210] hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md text-slate-700 shadow-sm max-lg:flex transition-colors hover:bg-slate-50"
      >
        <Menu size={20} />
      </button>

      <aside className="fixed left-0 top-0 z-[200] h-dvh w-[260px] border-r border-[#e4ebf3] bg-white max-lg:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[300] max-lg:block" aria-modal="true" role="dialog">
          <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm transition-opacity" />
          <aside className="absolute left-0 top-0 h-dvh w-[280px] border-r border-[#dbe5f0] shadow-2xl transition-transform transform translate-x-0">{content}</aside>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute left-[292px] top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/20 backdrop-blur-md text-white shadow-sm hover:bg-white/30 transition-colors">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}
