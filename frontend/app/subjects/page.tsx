"use client";

import { useState } from "react";
import { BookMarked } from "lucide-react";
import Modal from "@/components/Modal";

interface Subject {
  id: string;
  name: string;
  code: string;
  teachers: number;
}

const mockSubjects: Subject[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
];

export default function SubjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
        <button onClick={() => setModalOpen(true)} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition-colors">
          Add Subjects
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {mockSubjects.map((subject, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div key={subject.id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border}`}>
              
              <div className="p-5 flex gap-4 relative">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <BookMarked size={20} strokeWidth={2} />
                </div>
                
                <div className="flex-1 mt-1">
                  <h3 className="font-bold text-[13px] text-slate-800 leading-tight pr-4">{subject.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{subject.code}</p>
                </div>

                <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 mt-auto flex justify-end">
                <span className="text-[11px] font-bold text-slate-800">Teachers: {subject.teachers}</span>
              </div>
            </div>
          );
        })}
        {mockSubjects.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500 text-sm">
            No subjects found.
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Subject"
        maxWidth={650}
      >
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Subject Name</label>
              <input placeholder="Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Short Name</label>
              <input placeholder="Short Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Subject Code</label>
              <input placeholder="Subject Code" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Department</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-400">
                <option>Select Department(s)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Subject Teacher(s)</label>
            <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-400">
              <option>Select Teacher(s)</option>
            </select>
          </div>

          <div className="flex pt-4">
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
