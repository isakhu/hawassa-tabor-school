"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  name: string;
  amount: string;
}

interface Fee {
  id: string;
  period: string;
  grade: string;
  categories: Category[];
  totalAmount: string;
}

interface PaidFee {
  id: string;
  period: string;
  studentName: string;
  grade: string;
  totalAmount: string;
  status: string;
}

const mockFees: Fee[] = [];

const mockPaidFees: PaidFee[] = [];

function CategoriesCell({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col min-w-[250px] py-1">
      <button 
        onClick={() => setOpen(!open)} 
        className="flex items-center gap-2 text-[13px] text-slate-700 font-semibold mb-3 hover:text-slate-900"
      >
        {categories.length} categories {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      
      {open && (
        <div className="space-y-2.5">
          {categories.map((cat, i) => (
            <div key={i} className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">{cat.name}</span>
              <span className="text-green-500 font-semibold">{cat.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import Modal from "@/components/Modal";

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState("Fees");
  const [addFeeOpen, setAddFeeOpen] = useState(false);

  const columns: Column<Fee>[] = [
    { key: "period", label: "Period", render: (f) => <span className="text-slate-700 text-[13px]">{f.period}</span> },
    { key: "grade", label: "Grades", render: (f) => (
      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-500 text-[11px] font-semibold">
        {f.grade}
      </span>
    ) },
    { key: "categories", label: "Categories", render: (f) => <CategoriesCell categories={f.categories} /> },
    { key: "totalAmount", label: "Total Amount", render: (f) => <span className="text-slate-900 text-[13px]">{f.totalAmount}</span> },
    {
      key: "actions",
      label: "Action",
      width: 80,
      render: () => (
        <button className="text-slate-400 hover:text-slate-600 flex justify-center w-full">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      ),
    },
  ];

  const paidFeesColumns: Column<PaidFee>[] = [
    { key: "period", label: "Period", render: (f) => <span className="text-slate-700 text-[13px]">{f.period}</span> },
    { key: "studentName", label: "Student Name", render: (f) => <span className="text-slate-700 text-[13px]">{f.studentName}</span> },
    { key: "grade", label: "Grade", render: (f) => <span className="text-slate-700 text-[13px]">{f.grade}</span> },
    { key: "totalAmount", label: "Total Amount", render: (f) => <span className="text-slate-700 text-[13px]">{f.totalAmount}</span> },
    { key: "status", label: "Status", render: (f) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f0fdf4] text-[#22c55e]">
          {f.status}
        </span>
    ) },
    { key: "view", label: "View", render: () => (
        <button className="bg-[#2563eb] text-white rounded-lg px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:bg-blue-700">
          View
        </button>
    ) },
    { key: "pay", label: "Pay", render: () => (
        <button className="bg-[#2563eb] text-white rounded-lg px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:bg-blue-700">
          Pay
        </button>
    ) },
    {
      key: "actions",
      label: "Actions",
      width: 80,
      render: () => (
        <button className="text-slate-400 hover:text-slate-600 flex justify-center w-full">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold text-slate-900">Fees</h1>
        <button 
          onClick={() => setAddFeeOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Fee
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 px-2 mt-4">
        <button 
          onClick={() => setActiveTab("Fees")}
          className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "Fees" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          Fees
          {activeTab === "Fees" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button 
          onClick={() => setActiveTab("Paid Fees")}
          className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "Paid Fees" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          Paid Fees
          {activeTab === "Paid Fees" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "Fees" ? (
          <DataTable
            columns={columns}
            data={mockFees}
          />
        ) : (
          <DataTable
            columns={paidFeesColumns}
            data={mockPaidFees}
          />
        )}
      </div>

      {/* Add Fee Modal */}
      <Modal open={addFeeOpen} onClose={() => setAddFeeOpen(false)} title="Add Fee" maxWidth={700}>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period *</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grades</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                <option value="">Select Grade(s)</option>
              </select>
            </div>
          </div>

          <div className="text-center font-semibold text-slate-500 text-sm">
            Fee Categories
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Categories *</label>
            <div className="border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Category Title</label>
                <input type="text" placeholder="Enter category title (e.g., Tuition Fee)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 placeholder-slate-400" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Amount (KSH)</label>
                <input type="text" defaultValue="0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-[11px] font-medium text-slate-500">Optional (can be excluded during payment)</span>
                </label>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            + Add Category
          </button>

          <div className="flex justify-between items-center bg-blue-50 rounded-xl p-4 border border-blue-100">
            <span className="font-bold text-slate-700 text-sm">Total Amount</span>
            <span className="font-extrabold text-blue-600">KSH 0</span>
          </div>

          <div className="pt-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
