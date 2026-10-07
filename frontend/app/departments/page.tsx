"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import Modal from "@/components/Modal";

interface Department {
  id: string;
  name: string;
  members: number;
  active: boolean;
}

const mockDepartments: Department[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
];

export default function DepartmentsPage() {
  const [addDeptOpen, setAddDeptOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
        <button 
          onClick={() => setAddDeptOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Department
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {mockDepartments.map((dept, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div 
              key={dept.id} 
              className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border} pb-2`}
            >
              <div className="p-5 pb-3 flex items-center">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <Users size={20} strokeWidth={2} />
                </div>
                
                <div className="flex-1 flex justify-center items-center px-3">
                  <span className="font-extrabold text-[14px] text-slate-900 text-center leading-tight">
                    {dept.name}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 text-center">
                <span className="text-[13px] font-bold text-slate-900">Members: {dept.members}</span>
              </div>

              <div className="px-5 py-3 mt-auto flex justify-end">
                <span className="text-[12px] font-bold text-slate-900">Active: {dept.active ? "True" : "False"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      <Modal open={addDeptOpen} onClose={() => setAddDeptOpen(false)} title="Add Department" maxWidth={700}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Name</label>
              <input type="text" placeholder="Department Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Members</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value="">Select Member(s)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subjects</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value="">Select Subject(s)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Head of Department</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department status</label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Is Active?</span>
            </label>
          </div>

          <div className="pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
