"use client";

import DataTable, { Column } from "@/components/DataTable";

interface Assignment {
  id: string;
  type: string;
  grade: string;
  subjectsCount: number;
  assignedBy: string;
  assignedOn: string;
}

const mockAssignments: Assignment[] = [];

export default function AssignmentsPage() {
  const columns: Column<Assignment>[] = [
    {
      key: "type",
      label: "Assignment Type",
      render: (a) => a.type,
    },
    {
      key: "grade",
      label: "Grades",
      render: (a) => (
        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-500 text-[11px] font-semibold">
          {a.grade}
        </span>
      ),
    },
    {
      key: "subjectsCount",
      label: "No. of Subjects",
      render: (a) => a.subjectsCount,
    },
    {
      key: "assignedBy",
      label: "Assigned By",
      render: (a) => <span className="text-slate-500">{a.assignedBy}</span>,
    },
    {
      key: "assignedOn",
      label: "Assigned On",
      render: (a) => <span className="text-slate-500">{a.assignedOn}</span>,
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
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
          Add Assignment
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockAssignments}
      />
    </div>
  );
}
