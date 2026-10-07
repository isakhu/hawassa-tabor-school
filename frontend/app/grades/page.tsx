"use client";

import { useState } from "react";
import { BookMarked, Trash2, Plus, X } from "lucide-react";
import Modal from "@/components/Modal";

interface Grade {
  id: string;
  name: string;
  stream: string;
  teacher: string | null;
  students: number;
}

const mockGrades: Grade[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
];

export default function GradesPage() {
  const [streamsOpen, setStreamsOpen] = useState(false);
  const [addGradeOpen, setAddGradeOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Grades</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setStreamsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Streams
          </button>
          <button 
            onClick={() => setAddGradeOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Add Grade
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {mockGrades.map((grade, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div key={grade.id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border} relative`}>
              {/* Status Dot */}
              <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#34d399]"></div>
              
              <div className="p-5 pt-8 pb-4 flex relative">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <BookMarked size={20} strokeWidth={2} />
                </div>
                <div className="flex-1 flex justify-center items-center gap-4 pr-6">
                  <span className="font-extrabold text-[22px] text-slate-900">{grade.name}</span>
                  <span className="font-bold text-[15px] text-slate-800">{grade.stream}</span>
                </div>
                <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>

              {/* Teacher Info */}
              <div className="px-5 py-3 border-t border-slate-100 text-center min-h-[45px] flex items-center justify-center">
                {grade.teacher && (
                  <span className="text-[12px] font-semibold text-slate-700">
                    {grade.teacher}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 mt-auto flex justify-between items-center rounded-b-2xl">
                <span className="text-[11px] font-bold text-slate-800">Year: 2026</span>
                <span className="text-[11px] font-bold text-slate-800">Students: {grade.students}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streams Modal */}
      <Modal open={streamsOpen} onClose={() => setStreamsOpen(false)} title="Streams" maxWidth={700}>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 font-semibold text-sm">
              <span>East</span>
              <button className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 font-semibold text-sm">
              <span>North</span>
              <button className="text-green-400 hover:text-green-600"><Trash2 size={14} /></button>
            </div>
            <div className="flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg border border-sky-100 font-semibold text-sm">
              <span>West</span>
              <button className="text-sky-400 hover:text-sky-600"><Trash2 size={14} /></button>
            </div>
            <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg border border-pink-100 font-semibold text-sm">
              <span>South</span>
              <button className="text-pink-400 hover:text-pink-600"><Trash2 size={14} /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Add stream" 
              className="flex-1 max-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" 
            />
            <button className="flex items-center gap-2 border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus size={16} /> Add Input Field
            </button>
          </div>
          
          <div className="pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Submit
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Grade Modal */}
      <Modal open={addGradeOpen} onClose={() => setAddGradeOpen(false)} title="Add Grade" maxWidth={700}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grade</label>
              <input type="text" placeholder="Grade" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stream</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="South">South</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year</label>
              <input type="text" defaultValue="2026" className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grade status</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Is Active?</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assign Class Teacher(s)</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
              <option value="">Select Teacher(s)</option>
              <option value="1">Claudia Acosta Howard</option>
              <option value="2">Richard Stennett Marrero</option>
            </select>
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
