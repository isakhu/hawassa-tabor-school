"use client";

import type { AuthUser } from "@/lib/auth";
import { Search, MessageSquare, Bell } from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function roleName(role: AuthUser["role"]) {
  return role === "ADMIN" ? "Admin" : role === "TEACHER" ? "Teacher" : "Student";
}

export default function TopBar({ title, user }: { title: string; user: AuthUser }) {
  return (
    <header className="fixed left-[260px] right-0 top-0 z-[100] flex h-[72px] items-center border-b border-[#e4ebf3] bg-white px-8 shadow-sm max-lg:left-0 max-sm:pl-16">
      
      {/* Search Bar */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
             type="text" 
             placeholder="Search..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400">
           <button className="hover:text-blue-500 transition-colors">
              <MessageSquare size={20} strokeWidth={1.5} />
           </button>
           <button className="hover:text-blue-500 transition-colors relative">
              <Bell size={20} strokeWidth={1.5} />
           </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user.full_name}</p>
            <p className="text-[11px] font-semibold text-slate-500">{roleName(user.role)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm ring-2 ring-violet-100">
            {getInitials(user.full_name)}
          </div>
        </div>
      </div>
    </header>
  );
}
