"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Download, RefreshCcw, Calendar } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  user: string;
  isEmail: boolean;
  role: string;
  isActivity: boolean;
  statusCode: number;
  updatedAt: string;
}

const mockAudits: AuditLog[] = [];

export default function AuditsPage() {
  const columns: Column<AuditLog>[] = [
    { 
      key: "action", 
      label: "Action", 
      render: (a) => (
        <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded">
          {a.action}
        </span>
      ) 
    },
    { key: "resource", label: "Resource", render: (a) => <span className="text-slate-700 text-[13px]">{a.resource}</span> },
    { 
      key: "user", 
      label: "Username/Email", 
      render: (a) => (
        <span className={`text-[12px] font-medium ${
          a.isEmail ? "text-purple-600 bg-purple-50 px-2 py-0.5 rounded" : "text-slate-700"
        }`}>
          {a.user}
        </span>
      ) 
    },
    { 
      key: "role", 
      label: "Role/Activity", 
      render: (a) => (
        <span className={`text-[12px] font-medium ${
          a.isActivity ? "text-orange-600 bg-orange-50 px-2 py-0.5 rounded" : "text-slate-700"
        }`}>
          {a.role}
        </span>
      ) 
    },
    { 
      key: "statusCode", 
      label: "Status Code", 
      render: (a) => {
        let colorClass = "text-green-500";
        if (a.statusCode >= 400) colorClass = "text-orange-500";
        else if (a.statusCode === 201) colorClass = "text-blue-500";
        return <span className={`text-[13px] font-medium ${colorClass}`}>{a.statusCode}</span>;
      } 
    },
    { key: "updatedAt", label: "Updated At", render: (a) => <span className="text-slate-600 text-[13px]">{a.updatedAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Audits</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Start date           →       End date" 
              className="w-72 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400"
            />
            <div className="absolute right-3 pointer-events-none text-slate-300">
              <Calendar size={16} />
            </div>
          </div>
          
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
            <Download size={16} />
            Export to CSV
          </button>

          <button className="text-slate-600 hover:text-slate-900 transition-colors p-2">
            <RefreshCcw size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockAudits}
      />
    </div>
  );
}
