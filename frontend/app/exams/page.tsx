"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import Modal from "@/components/Modal";

interface Exam {
  id: string;
  title: string;
  type: string;
}

const mockExams: Exam[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
];

export default function ExamsPage() {
  const [addExamOpen, setAddExamOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Exams</h1>
        <button 
          onClick={() => setAddExamOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Exam Type
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {mockExams.map((exam, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div 
              key={exam.id} 
              className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border} pb-4 relative h-[150px]`}
            >
              <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>

              <div className="p-6 pb-4 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <CalendarDays size={20} strokeWidth={2} />
                </div>
                
                <span className="font-extrabold text-[15px] text-slate-900 leading-tight">
                  {exam.title}
                </span>
              </div>

              <div className="px-6 py-4 mt-auto text-center">
                <span className="text-[13.5px] font-medium text-slate-600">{exam.type}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      <Modal open={addExamOpen} onClose={() => setAddExamOpen(false)} title="Add Exam Type" maxWidth={600}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period *</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Exam Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-700">
                <option value="Opener">Opener</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Term">End-Term</option>
                <option value="Test">Test</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button className="w-full bg-[#3b82f6] hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
              Create Exam Type
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
