"use client";

import DataTable, { Column } from "@/components/DataTable";

interface Announcement {
  id: string;
  title: string;
  date: string;
  target?: {
    name: string;
    type: "department" | "grade";
  };
  entireSchool: boolean;
}

const mockAnnouncements: Announcement[] = [];

import { useState } from "react";
import Modal from "@/components/Modal";

export default function AnnouncementsPage() {
  const [addAnnouncementOpen, setAddAnnouncementOpen] = useState(false);
  const columns: Column<Announcement>[] = [
    { key: "title", label: "Title", render: (a) => <span className="text-slate-700 text-[13px]">{a.title}</span> },
    { key: "date", label: "Date", render: (a) => <span className="text-slate-700 text-[13px]">{a.date}</span> },
    { 
      key: "target", 
      label: "Grades / Departments", 
      render: (a) => {
        if (!a.target) return null;
        if (a.target.type === "department") {
          return (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-500">
              {a.target.name}
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-500">
            {a.target.name}
          </span>
        );
      } 
    },
    { 
      key: "entireSchool", 
      label: "Entire School", 
      render: (a) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
          a.entireSchool 
            ? "bg-[#f0fdf4] text-[#22c55e]" 
            : "bg-red-50 text-red-500"
        }`}>
          {a.entireSchool ? "Yes" : "No"}
        </span>
      ) 
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
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <button 
          onClick={() => setAddAnnouncementOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Add Announcement
        </button>
      </div>

      <DataTable
        columns={columns}
        data={mockAnnouncements}
      />

      {/* Add Announcement Modal */}
      <Modal open={addAnnouncementOpen} onClose={() => setAddAnnouncementOpen(false)} title="Add Announcement" maxWidth={700}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title</label>
              <input type="text" placeholder="Title" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date Of Announcement</label>
              <input type="text" placeholder="Select date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2 items-end">
            <div>
              <div className="inline-block bg-[#cbd5e1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">Departments</div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Announcement for the entire school</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Entire School?</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grades</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 appearance-none bg-white text-slate-400">
                <option value="">Select Grade(s)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 mt-2">Additional Info</label>
            <textarea 
              placeholder="Additional Info about the Announcement" 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none h-24"
            ></textarea>
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
