"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";

interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  students: string[];
}

const mockParents: Parent[] = [];

export default function ParentsPage() {
  const [loading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const columns: Column<Parent>[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: 80,
      render: (p) => (
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'P')}&background=random&color=fff&rounded=true`} 
          alt={p.full_name} 
          className="w-8 h-8 rounded-full shadow-sm" 
        />
      ),
    },
    {
      key: "first_name",
      label: "FirstName",
      render: (p) => (p.full_name || "Unknown").split(" ")[0],
    },
    {
      key: "last_name",
      label: "LastName",
      render: (p) => {
        const parts = (p.full_name || "Unknown").split(" ");
        return parts.slice(1).join(" ") || "—";
      },
    },
    {
      key: "email",
      label: "Email",
      render: (p) => p.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (p) => p.phone,
    },
    {
      key: "students",
      label: "Students",
      render: (p) => (
        <div className="flex flex-wrap gap-1.5">
          {p.students.map((student) => (
            <span key={student} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
              {student}
            </span>
          ))}
        </div>
      ),
    },
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
        <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
        <button onClick={() => setModalOpen(true)} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition-colors">
          Add Parents
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockParents}
        loading={loading}
        emptyMessage="No parents found."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Parent"
        maxWidth={850}
      >
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">Single Admission</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700 font-semibold text-sm">Bulk Admission</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }} className="space-y-4">
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
                <label className="mb-1 block text-xs text-gray-500">Title</label>
                <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-600">
                  <option></option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">First name</label>
                <input placeholder="First Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Last name</label>
                <input placeholder="Last Name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Surname</label>
                <input placeholder="Surname" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Date Of Birth</label>
                <input type="date" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none text-gray-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Age</label>
                <input placeholder="Age" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-gray-50" readOnly />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Student(s)</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-400">
                <option>Select Student(s)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Relationship to student</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">National ID/Passport</label>
              <input placeholder="Identification" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Occupation</label>
              <input placeholder="Occupation" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Status</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Address</label>
              <input placeholder="Address" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Gender</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Preferred Contact Method</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Parent Role</label>
              <div className="flex items-center gap-2 h-9">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Is Admin?</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nationality</label>
              <input defaultValue="Kenyan" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Religion</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white"><option></option></select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Parent status</label>
              <div className="flex items-center gap-2 h-9">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm">Is Active?</span>
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
                <input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="Email" className="w-full rounded-md border border-gray-200 pl-9 pr-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-gray-500">Password</label>
                <button type="button" onClick={() => setForm({...form, password: Math.floor(100000 + Math.random() * 900000).toString()})} className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">Generate</button>
              </div>
              <div className="relative">
                <input type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} placeholder="Password" title="Digits only" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Department(s)</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none bg-white text-gray-400">
                <option>Select Department(s)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Additional Info</label>
              <textarea placeholder="Additional info about the parent" rows={2} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none resize-none"></textarea>
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
