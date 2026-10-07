"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";

interface ResultGroup {
  id: string;
  title: string;
  type: string;
}

const mockResults: ResultGroup[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
];

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Results</h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {mockResults.map((res, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <Link 
              href={`/results/${res.id}`}
              key={res.id} 
              className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border} pb-4 h-[150px] hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="p-6 pb-4 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <CalendarDays size={20} strokeWidth={2} />
                </div>
                
                <span className="font-extrabold text-[15px] text-slate-900 leading-tight">
                  {res.title}
                </span>
              </div>

              <div className="px-6 py-4 mt-auto text-center border-t border-slate-50/50">
                <span className="text-[13.5px] font-medium text-slate-600">{res.type}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
