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

      {/* Content - Attendance */}
      {activeTab === "Attendance" && (
        <div className="space-y-6 px-2 pt-2">
          {/* Attendance Summary Report */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Calendar size={18} className="text-slate-400" />
                Attendance Summary Report
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Shows days present, days absent, and attendance percentage for every student in a class over a selected date range.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Grade / Class</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select grade</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px] max-w-[350px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Date Range</label>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Start date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400 bg-white" />
                  <span className="text-slate-300 text-sm">→</span>
                  <input type="text" placeholder="End date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400 bg-white" />
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content - Finance */}
      {activeTab === "Finance" && (
        <div className="space-y-6 px-2 pt-2">
          {/* Fee Collection Report */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <DollarSign size={18} className="text-slate-400" />
                Fee Collection Report
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Full fee collection status for a term — total charged, amount paid, balance, and collection rate. Filter by grade for a focused view.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Period <span className="text-red-500">*</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select period</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Grade / Class <span className="text-slate-400 font-normal">(optional)</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">All grades</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Payment Status <span className="text-slate-400 font-normal">(optional)</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">All statuses</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* Outstanding Balances Report */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <DollarSign size={18} className="text-slate-400" />
                Outstanding Balances Report
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Lists only students who still have an outstanding fee balance, sorted by highest balance first.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Period <span className="text-red-500">*</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select period</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Grade / Class <span className="text-slate-400 font-normal">(optional)</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">All grades</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content - Directory */}
      {activeTab === "Directory" && (
        <div className="space-y-6 px-2 pt-2">
          {/* All Students */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                All Students
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Complete directory of every student enrolled in the school.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <FileText size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <Download size={16} className="text-slate-400" />
                Download CSV
              </button>
            </div>
          </div>

          {/* Students by Grade */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                Students by Grade
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Directory of students in a specific grade / class.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Grade / Class</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select grade</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* All Teachers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                All Teachers
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Full directory of all teaching staff with their departments and subjects.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <FileText size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <Download size={16} className="text-slate-400" />
                Download CSV
              </button>
            </div>
          </div>

          {/* Department Members */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                Department Members
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Report for a specific department — shows HOD, all members (teachers & parents), and subjects offered.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Department</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">Select department</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* All Parents / Guardians */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                All Parents / Guardians
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Complete directory of all registered parents and guardians.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <FileText size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <Download size={16} className="text-slate-400" />
                Download CSV
              </button>
            </div>
          </div>

          {/* All Staff */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                All Staff
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Directory of all non-teaching staff members with their roles and specializations.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <FileText size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <Download size={16} className="text-slate-400" />
                Download CSV
              </button>
            </div>
          </div>

          {/* All Administrators */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <Users size={18} className="text-slate-400" />
                All Administrators
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                Directory of all admin users, distinguishing Super Admins from regular Admins.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <FileText size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <Download size={16} className="text-slate-400" />
                Download CSV
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Content - Evaluations */}
      {activeTab === "Evaluations" && (
        <div className="space-y-6 px-2 pt-2">
          {/* Teacher Evaluation Responses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <BarChart3 size={18} className="text-slate-400" />
                Teacher Evaluation Responses
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                All teacher evaluation responses. Each response shows scores by category and criterion, overall average, and evaluator comments. Filter by period or leave blank for all terms.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Period <span className="text-slate-400 font-normal">(optional)</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">All periods</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* Student Evaluation Responses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-2">
                <BarChart3 size={18} className="text-slate-400" />
                Student Evaluation Responses
              </h2>
              <p className="text-[13px] text-slate-400 font-medium">
                All student evaluation responses. Each response shows scores by category and criterion, overall average, and evaluator comments. Filter by period or leave blank for all terms.
              </p>
            </div>
            
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-xs font-bold text-slate-700 mb-2">Period <span className="text-slate-400 font-normal">(optional)</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                  <option value="">All periods</option>
                </select>
              </div>
              <div className="flex items-center gap-3 ml-auto pt-4 md:pt-0">
                <button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Download size={16} className="text-slate-400" />
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
