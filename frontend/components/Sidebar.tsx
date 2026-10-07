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
      <div className="flex h-[72px] shrink-0 items-center border-b border-[#e4ebf3] px-5">
        <Link href={basePath} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 no-underline">
          <div className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-black border border-slate-200 shadow-sm shrink-0">
             <img src={logoImg.src} alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-[#1d3557] leading-tight truncate">Hawassa Tabor</span>
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
        <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">MENU</p>
        <div className="space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold no-underline transition-colors ${active ? "bg-[#eaf2ff] text-[#1267e8] border-l-4 border-[#1267e8]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"}`}
              >
                <Icon size={18} strokeWidth={2} className={active ? "text-[#1267e8]" : "text-slate-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <p className="mt-8 mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">OTHER</p>
        <div className="space-y-0.5">
           <Link href="/profile" className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent transition-colors">
              <UserCircle size={18} strokeWidth={2} className="text-slate-400" />
              <span>Profile</span>
           </Link>
           <button onClick={logout} className="flex w-full min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-red-500 border-l-4 border-transparent transition-colors">
              <LogOut size={18} strokeWidth={2} className="text-slate-400" />
              <span>Logout</span>
           </button>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[210] hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm max-lg:flex"
      >
        <Menu size={20} />
      </button>

      <aside className="fixed left-0 top-0 z-[200] h-dvh w-[260px] border-r border-[#e4ebf3] bg-white max-lg:hidden">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[300] max-lg:block" aria-modal="true" role="dialog">
          <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-[#0b1f3a]/30" />
          <aside className="absolute left-0 top-0 h-dvh w-[280px] border-r border-[#dbe5f0] shadow-xl">{content}</aside>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute left-[292px] top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white text-[#173653] shadow-sm">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}
