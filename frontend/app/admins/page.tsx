"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

interface AdminMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

const mockAdmins: AdminMember[] = [];

export default function AdminsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const columns: Column<AdminMember>[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: 60,
      render: (a) => (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
          <img src={a.avatarUrl} alt={a.firstName} className="w-full h-full object-cover" />
        </div>
      ),
    },
    { key: "firstName", label: "FirstName", render: (a) => <span className="text-slate-600 text-sm">{a.firstName}</span> },
    { key: "lastName", label: "LastName", render: (a) => <span className="text-slate-600 text-sm">{a.lastName}</span> },
    { key: "email", label: "Email", render: (a) => <span className="text-slate-600 text-sm">{a.email}</span> },
    { key: "phone", label: "Phone", render: (a) => <span className="text-slate-600 text-sm">{a.phone}</span> },
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
        <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
        <button onClick={() => setModalOpen(true)} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition-colors">
          Add Admin
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockAdmins}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Admin" maxWidth={850}>
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }} className="space-y-4 pt-2">
          
          <div className="flex gap-6">
            <div className="w-40 flex-shrink-0">
              <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center relative">
                <svg className="w-24 h-24 text-white mt-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <button type="button" className="absolute top-2 right-2 bg-white rounded-md p-1.5 shadow hover:bg-gray-50">
                   <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 15V5"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">First name</label>
                <input placeholder="First Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Last name</label>
                <input placeholder="Last Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Date Of Birth</label>
                <input type="date" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none text-gray-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Gender</label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-600">
                  <option></option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nationality</label>
              <input defaultValue="Kenyan" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Address</label>
              <input placeholder="Address" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">National ID/Passport</label>
              <input placeholder="Identification" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Admin Role</label>
              <div className="flex items-center gap-2 h-9">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Is Admin?</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input type="email" placeholder="Email" className="w-full rounded-md border border-gray-200 pl-9 pr-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-gray-500">Password</label>
                <button type="button" className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">Generate</button>
              </div>
              <div className="relative">
                <input type="password" placeholder="Password" title="Digits only" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                   <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Phone</label>
              <input placeholder="Phone" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="flex pt-4">
             <button
               type="submit"
               className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md px-6 py-2 text-sm font-semibold transition-colors"
             >
               Submit
             </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
