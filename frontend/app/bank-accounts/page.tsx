"use client";

import DataTable, { Column } from "@/components/DataTable";

interface BankAccount {
  id: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  swiftCode: string;
}

const mockBankAccounts: BankAccount[] = [];

import { useState } from "react";
import Modal from "@/components/Modal";

export default function BankAccountsPage() {
  const [addBankOpen, setAddBankOpen] = useState(false);
  const columns: Column<BankAccount>[] = [
    { key: "bankName", label: "Bank Name", render: (b) => <span className="text-slate-700 text-[13px]">{b.bankName}</span> },
    { key: "branchName", label: "Branch Name", render: (b) => <span className="text-slate-700 text-[13px]">{b.branchName}</span> },
    { key: "accountNumber", label: "Account Number", render: (b) => <span className="text-slate-700 text-[13px]">{b.accountNumber}</span> },
    { key: "accountName", label: "Account Name", render: (b) => <span className="text-slate-700 text-[13px]">{b.accountName}</span> },
    { key: "currency", label: "Currency", render: (b) => <span className="text-slate-700 text-[13px]">{b.currency}</span> },
    { key: "swiftCode", label: "Swift Code", render: (b) => <span className="text-slate-700 text-[13px]">{b.swiftCode}</span> },
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
        <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
        <button 
          onClick={() => setAddBankOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Bank Account
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockBankAccounts}
      />

      {/* Add Bank Account Modal */}
      <Modal open={addBankOpen} onClose={() => setAddBankOpen(false)} title="Add Bank Account" maxWidth={700}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank Name</label>
              <input type="text" placeholder="Bank Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch Name</label>
              <input type="text" placeholder="Branch Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Name</label>
              <input type="text" placeholder="Account Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Number</label>
              <input type="text" placeholder="Account Number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Currency</label>
              <input type="text" placeholder="Currency" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Swift Code</label>
              <input type="text" placeholder="Swift Code" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
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
