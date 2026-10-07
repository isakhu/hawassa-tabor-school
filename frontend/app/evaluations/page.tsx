"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

interface Evaluation {
  id: string;
  name: string;
  period: string;
  type: string;
}

const mockEvaluations: Evaluation[] = [];

export default function EvaluationsPage() {
  const [addEvalOpen, setAddEvalOpen] = useState(false);

  const columns: Column<Evaluation>[] = [
    { key: "name", label: "Evaluation Name", render: (e) => <span className="text-slate-700 text-[13px]">{e.name}</span> },
    { key: "period", label: "Period", render: (e) => <span className="text-slate-700 text-[13px]">{e.period}</span> },
    { key: "type", label: "Type", render: (e) => <span className="text-slate-700 text-[13px]">{e.type}</span> },
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Evaluations</h1>
        <button 
          onClick={() => setAddEvalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Evaluation
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockEvaluations}
      />

      {/* Create Evaluation Modal */}
      <Modal open={addEvalOpen} onClose={() => setAddEvalOpen(false)} title="Create Evaluation" maxWidth={700}>
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] text-slate-700 mb-1.5">Evaluation Name</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-[13px] text-slate-700 mb-1.5">Period</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-700">
              <option value=""></option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] text-slate-700 mb-1.5">For Teachers</label>
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400 py-2.5 rounded-lg text-xs font-semibold transition-colors mt-2">
            + Add Category
          </button>

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
