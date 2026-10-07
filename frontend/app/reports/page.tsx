"use client";

import { useState } from "react";
import { BookOpen, Calendar, DollarSign, Users, BarChart3, FileText, Download } from "lucide-react";

type Tab = "Academic" | "Attendance" | "Finance" | "Directory" | "Evaluations";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "Academic", label: "Academic", icon: BookOpen },
  { id: "Attendance", label: "Attendance", icon: Calendar },
  { id: "Finance", label: "Finance", icon: DollarSign },
  { id: "Directory", label: "Directory", icon: Users },
  { id: "Evaluations", label: "Evaluations", icon: BarChart3 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Academic");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-[13px] text-slate-400 font-medium">
          Generate and download PDF or CSV reports for academic, attendance, and financial data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 px-2 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                isActive 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-slate-500 hover:text-slate-700 border-b-2 border-transparent"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content - Academic */}
      {activeTab === "Academic" && (
        <div className="space-y-6 px-2 pt-2">
          
          {/* Card 1: Student Report Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <BarChart3 size={18} className="text-slate-400" />
                Student Report Card
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Generate an individual student report card for a specific exam. Includes all subject results, percentages, and descriptors.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Grade / Class</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select grade</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Student</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-slate-50 text-slate-400" disabled>
                  <option value="">Select grade first</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Exam</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-slate-50 text-slate-400" disabled>
                  <option value="">Select grade first</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-400 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed">
                  <Download size={16} />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Class Performance Report */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <BarChart3 size={18} className="text-slate-400" />
                Class Performance Report
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Overview of all students in a class for a specific exam, showing each subject result in a summary table.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Grade / Class</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select grade</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Exam</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-slate-50 text-slate-400" disabled>
                  <option value="">Select grade first</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-400 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed">
                  <Download size={16} />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
