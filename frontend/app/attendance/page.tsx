"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";

interface AttendanceRecord {
  id: string;
  full_name: string;
  roll_number: string;
  status: string;
  reason: string;
}

const mockRecords: AttendanceRecord[] = [];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState("2026-10-07");
  const [mode, setMode] = useState("View");

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: 60,
      render: (r) => (
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.full_name || 'S')}&background=random&color=fff&rounded=true`} 
          alt={r.full_name} 
          className="w-8 h-8 rounded-full shadow-sm" 
        />
      ),
    },
    {
      key: "first_name",
      label: "FirstName",
      render: (r) => (r.full_name || "Unknown").split(" ")[0],
    },
    {
      key: "last_name",
      label: "LastName",
      render: (r) => {
        const parts = (r.full_name || "Unknown").split(" ");
        return parts.slice(1).join(" ") || "—";
      },
    },
    {
      key: "roll_number",
      label: "Roll Number",
      render: (r) => r.roll_number,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => r.status,
    },
    {
      key: "reason",
      label: "Reason",
      render: (r) => r.reason,
    },
  ];

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Calendar Sidebar */}
      <div className="w-80 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col h-full shrink-0">
        <h2 className="font-bold text-lg mb-4 text-slate-800">Calendar</h2>
        
        {/* Simple mock calendar */}
        <div className="border border-slate-100 rounded-xl p-4">
           <div className="flex justify-between items-center mb-4">
             <button className="text-slate-400 hover:text-slate-600">&lt;</button>
             <span className="font-bold text-sm text-slate-700">October 2026</span>
             <button className="text-slate-400 hover:text-slate-600">&gt;</button>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center mb-2">
             {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
               <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
             ))}
           </div>
           <div className="grid grid-cols-7 gap-1 text-center">
             {Array.from({length: 31}).map((_, i) => (
               <div 
                 key={i} 
                 className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm ${i + 1 === 7 ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'}`}
               >
                 {i + 1}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Right Attendance Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">PP1 - East Students</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Select Date:</span>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                className="border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-sm text-slate-600 outline-none" 
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Mode:</span>
              <div 
                onClick={() => setMode(mode === "View" ? "Edit" : "View")}
                className={`rounded-full w-14 h-7 flex items-center px-1 cursor-pointer transition-colors relative ${mode === "View" ? "bg-blue-500" : "bg-slate-300"}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform z-10 ${mode === "View" ? "translate-x-7" : "translate-x-0"}`}></div>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white pointer-events-none transition-opacity ${mode === "View" ? "opacity-100 pr-5" : "opacity-0"}`}>
                  View
                </span>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 pointer-events-none transition-opacity ${mode === "Edit" ? "opacity-100 pl-5" : "opacity-0"}`}>
                  Edit
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={mockRecords}
            emptyMessage="No data"
          />
        </div>
      </div>
    </div>
  );
}
