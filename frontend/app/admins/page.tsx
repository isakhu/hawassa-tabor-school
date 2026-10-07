"use client";

import DataTable, { Column } from "@/components/DataTable";

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
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
          Add Admin
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockAdmins}
      />
    </div>
  );
}
