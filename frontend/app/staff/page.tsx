"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Mail, EyeOff, Edit2 } from "lucide-react";
import Image from "next/image";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string;
}

const mockStaff: StaffMember[] = [];

export default function StaffPage() {
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  const columns: Column<StaffMember>[] = [
    {
      key: "avatar",
      label: "Avatar",
      width: 60,
      render: (s) => (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
          <img src={s.avatarUrl} alt={s.firstName} className="w-full h-full object-cover" />
        </div>
      ),
    },
    { key: "firstName", label: "FirstName", render: (s) => <span className="text-slate-600 text-sm">{s.firstName}</span> },
    { key: "lastName", label: "LastName", render: (s) => <span className="text-slate-600 text-sm">{s.lastName}</span> },
    { key: "email", label: "Email", render: (s) => <span className="text-slate-600 text-sm">{s.email}</span> },
    { key: "phone", label: "Phone", render: (s) => <span className="text-slate-600 text-sm">{s.phone}</span> },
    { key: "role", label: "Role", render: (s) => <span className="text-slate-600 text-sm">{s.role}</span> },
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
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
        <button 
          onClick={() => setAddStaffOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Staff
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockStaff}
      />

      {/* Add Staff Modal */}
      <Modal open={addStaffOpen} onClose={() => setAddStaffOpen(false)} title="" maxWidth={850}>
        <div className="space-y-4 text-slate-700 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-6 mb-2">
            {/* Left Column - Avatar */}
            <div className="w-40 shrink-0 flex flex-col items-center">
              <div className="w-36 h-40 bg-[#e2e8f0] rounded-2xl relative flex justify-center items-end overflow-hidden mb-2">
                <svg className="w-32 h-32 text-white absolute -bottom-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <button className="absolute top-2 right-2 bg-white rounded-md p-1.5 shadow-sm hover:bg-slate-50 transition-colors">
                  <Edit2 size={14} className="text-slate-600" />
                </button>
              </div>
            </div>
            
            {/* Right Column - Top fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                    <option value=""></option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First name</label>
                  <input type="text" placeholder="First Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last name</label>
                  <input type="text" placeholder="Last Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Surname</label>
                  <input type="text" placeholder="Surname" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date Of Birth</label>
                  <input type="text" placeholder="Select date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Age</label>
                  <input type="text" placeholder="Age" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none text-slate-400" readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Contact Method</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nationality</label>
              <input type="text" defaultValue="Kenyan" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Religion</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white">
                <option value=""></option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
              <input type="text" placeholder="Address" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Qualification</label>
              <input type="text" placeholder="Qualification" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Experience</label>
              <input type="text" placeholder="Experience" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Staff Role</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Is Admin?</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">National ID/Passport</label>
              <input type="text" placeholder="Identification" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Employee ID/Number</label>
              <input type="text" placeholder="Employee Identification" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Staff status</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Is Active?</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input type="email" placeholder="Email" className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1.5">
                Password
                <button className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">Generate</button>
              </label>
              <div className="relative">
                <input type="text" placeholder="Password" className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm outline-none focus:border-blue-500" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600">
                  <EyeOff size={16} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input type="text" placeholder="Phone" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <input type="text" placeholder="Role" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Specialization</label>
              <input type="text" placeholder="Specialization" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Additional Info</label>
            <textarea 
              placeholder="Additional Info about the student" 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none h-20"
            ></textarea>
          </div>
          
        </div>
      </Modal>
    </div>
  );
}
