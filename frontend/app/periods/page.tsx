"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import Modal from "@/components/Modal";

interface Period {
  id: string;
  year: string;
  term: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const mockPeriods: Period[] = [];

const COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
];

export default function PeriodsPage() {
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Periods</h1>
        <button 
          onClick={() => setAddPeriodOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Period
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {mockPeriods.map((period, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div 
              key={period.id} 
              className={`bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col border-t-[3px] ${color.border} pb-2 relative`}
            >
              <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>

              <div className="p-5 pb-3 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                  <CalendarDays size={20} strokeWidth={2} />
                </div>
                
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] text-slate-900">{period.year}</span>
                  <span className="font-extrabold text-[15px] text-slate-900 leading-tight">
                    {period.term}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 flex flex-col gap-1">
                <div className="flex justify-between max-w-[200px]">
                  <span className="text-[13px] font-bold text-slate-900">Start Date:</span>
                  <span className="text-[13px] text-slate-600">{period.startDate}</span>
                </div>
                <div className="flex justify-between max-w-[200px]">
                  <span className="text-[13px] font-bold text-slate-900">End Date:</span>
                  <span className="text-[13px] text-slate-600">{period.endDate}</span>
                </div>
              </div>

              <div className="px-5 py-3 mt-auto flex justify-end">
                <span className="text-[12px] font-bold text-slate-900">Active: {period.active ? "True" : "False"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Period Modal */}
      <Modal open={addPeriodOpen} onClose={() => setAddPeriodOpen(false)} title="Add Period" maxWidth={700}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year</label>
              <input type="text" defaultValue="2026" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Term</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
              <input type="text" placeholder="Select date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date</label>
              <input type="text" placeholder="Select date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Period status</label>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Is Active?</span>
            </label>
          </div>

          <div className="pt-2">
            <button className="bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
