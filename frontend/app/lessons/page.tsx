"use client";

import { BookMarked } from "lucide-react";

interface LessonClass {
  id: string;
  name: string;
  stream: string;
  teacher: string | null;
  students: number;
}

const mockClasses: LessonClass[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
];

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {mockClasses.map((cls, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div 
              key={cls.id} 
              className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border} cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="p-5 pt-8 pb-4 flex relative">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <BookMarked size={20} strokeWidth={2} />
                </div>
                
                <div className="flex-1 flex justify-center items-center gap-4">
                  <span className="font-extrabold text-[22px] text-slate-900">{cls.name}</span>
                  <span className="font-bold text-[15px] text-slate-800">{cls.stream}</span>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="px-5 py-3 border-t border-slate-100 text-center min-h-[45px] flex items-center justify-center">
                {cls.teacher && (
                  <span className="text-[12px] font-semibold text-slate-700">
                    {cls.teacher}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 mt-auto flex justify-end items-center rounded-b-2xl">
                <span className="text-[11px] font-bold text-slate-800">Students: {cls.students}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
