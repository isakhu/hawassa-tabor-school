"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";

interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  students: string[];
}

const mockParents: Parent[] = [];

export default function ParentsPage() {
  const [loading] = useState(false);

  const columns: Column<Parent>[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: 80,
      render: (p) => (
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'P')}&background=random&color=fff&rounded=true`} 
          alt={p.full_name} 
          className="w-8 h-8 rounded-full shadow-sm" 
        />
      ),
    },
    {
      key: "first_name",
      label: "FirstName",
      render: (p) => (p.full_name || "Unknown").split(" ")[0],
    },
    {
      key: "last_name",
      label: "LastName",
      render: (p) => {
        const parts = (p.full_name || "Unknown").split(" ");
        return parts.slice(1).join(" ") || "—";
      },
    },
    {
      key: "email",
      label: "Email",
      render: (p) => p.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (p) => p.phone,
    },
    {
      key: "students",
      label: "Students",
      render: (p) => (
        <div className="flex flex-wrap gap-1.5">
          {p.students.map((student) => (
            <span key={student} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
              {student}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: 80,
      render: () => (
        <button className="text-slate-400 hover:text-slate-600 flex justify-center w-full">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
          Add Parents
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockParents}
        loading={loading}
        emptyMessage="No parents found."
      />
    </div>
  );
}
