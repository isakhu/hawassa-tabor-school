"use client";

import { useState } from "react";
import { BookMarked } from "lucide-react";

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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
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
      </div>
    </div>
  );
}
