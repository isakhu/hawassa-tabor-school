"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

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
  const [modalOpen, setModalOpen] = useState(false);

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
        <button onClick={() => setModalOpen(true)} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition-colors">
          Add Assignment
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockAssignments}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Assignment" maxWidth={750}>
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }} className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assignment Type *</label>
              <select required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-500">
                <option value=""></option>
                <option value="Homework">Homework</option>
                <option value="Classwork">Classwork</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grades</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-400">
                <option value="">Select Grade(s)</option>
              </select>
            </div>
          </div>
          
          <div className="text-center font-bold text-slate-600 text-sm mt-4">Assignment Subjects</div>
          
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subjects *</label>
              <select required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-400">
                <option value="">Subject</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deadline Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Time</label>
              <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Time</label>
              <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
          </div>

          <div className="flex pt-2">
             <button
               type="submit"
               className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md px-6 py-2 text-sm font-semibold transition-colors"
             >
               Submit
             </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
