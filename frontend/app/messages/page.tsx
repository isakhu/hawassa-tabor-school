"use client";

import DataTable, { Column } from "@/components/DataTable";

interface MessageItem {
  id: string;
  member: string;
  lastMessage: string;
  date: string;
}

import { useState } from "react";
import Modal from "@/components/Modal";
import { Search } from "lucide-react";

interface MessageItem {
  id: string;
  member: string;
  lastMessage: string;
  date: string;
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

const mockMessages: MessageItem[] = [];

const mockUsers: UserItem[] = [];

export default function MessagesPage() {
  const [newChatOpen, setNewChatOpen] = useState(false);
  const columns: Column<MessageItem>[] = [
    { key: "member", label: "Member", render: (m) => <span className="text-slate-700 text-[13px]">{m.member}</span> },
    { key: "lastMessage", label: "Last Message", render: (m) => <span className="text-slate-700 text-[13px]">{m.lastMessage}</span> },
    { key: "date", label: "Date", render: (m) => <span className="text-slate-700 text-[13px]">{m.date}</span> },
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
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <button 
          onClick={() => setNewChatOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          New Conversation
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockMessages}
        emptyMessage="No messages found."
      />

      {/* New Conversation Modal */}
      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="Start New Conversation" maxWidth={950}>
        <div className="space-y-4">
          <div className="relative mb-4 w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input type="text" placeholder="Search..." className="w-full border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500" />
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border-t border-slate-100 -mx-6 px-6 pt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 w-16">Avatar</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500">FirstName</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500">LastName</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500">Role</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500">Email</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500">Phone</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                        <img src={u.avatarUrl} alt={u.firstName} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-600">{u.firstName}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-600">{u.lastName}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-600">{u.role}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-600">{u.phone}</td>
                    <td className="px-4 py-3">
                      <button className="bg-[#14b8a6] hover:bg-teal-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm transition-colors">
                        Start Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
