"use client";

import { Home, Search, LayoutGrid, List as ListIcon, Folder, Download, Eye, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/DataTable";

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  created: string;
}

const mockFiles: FileItem[] = [];

export default function FolderViewPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"All" | "Folders" | "Documents">("All");

  const columns: Column<FileItem>[] = [
    { 
      key: "name", 
      label: "DOCUMENT", 
      render: (f) => (
        <div className="flex items-center gap-2">
          {f.type === "PDF" ? (
            <FileText size={16} className="text-red-500" />
          ) : (
            <ImageIcon size={16} className="text-teal-500" />
          )}
          <span className="text-slate-800 font-medium text-[13px]">{f.name}</span>
        </div>
      ) 
    },
    { key: "size", label: "SIZE", render: (f) => <span className="text-slate-600 text-[13px]">{f.size}</span> },
    { 
      key: "type", 
      label: "TYPE", 
      render: (f) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          f.type === "PDF" ? "bg-red-50 text-red-500" : "bg-teal-50 text-teal-500"
        }`}>
          {f.type}
        </span>
      ) 
    },
    { key: "created", label: "CREATED", render: (f) => <span className="text-slate-600 text-[13px]">{f.created}</span> },
    {
      key: "actions",
      label: "ACTIONS",
      width: 120,
      render: () => (
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-slate-600 transition-colors"><Download size={15} strokeWidth={2} /></button>
          <button className="hover:text-slate-600 transition-colors"><Eye size={15} strokeWidth={2} /></button>
          <button className="hover:text-red-500 transition-colors"><Trash2 size={15} strokeWidth={2} className="text-red-400" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2 text-slate-900">
          <Link href="/file-manager" className="text-blue-500 flex items-center gap-1.5 hover:underline">
            <Home size={18} />
            <span className="font-semibold">File Manager</span>
          </Link>
          <span className="text-slate-400">/</span>
          <div className="flex items-center gap-1.5">
            <Folder size={18} className="text-slate-700" />
            <h1 className="text-xl font-bold">Main Folder</h1>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
          Add New
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm outline-none focus:border-blue-500"
          />
          <div className="absolute right-3 top-2.5 text-slate-400">
            <Search size={16} />
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
            {(["All", "Folders", "Documents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid/List */}
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
            <button className="p-1.5 text-slate-600 bg-slate-100 rounded-md">
              <LayoutGrid size={16} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600">
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Section */}
      <div className="px-2 pt-4">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Folders - 2</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Folder Card 1 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-blue-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            </div>
            <div className="flex flex-col pt-1">
              <span className="font-bold text-[14px] text-slate-900 leading-tight">Sub 1</span>
              <span className="text-[12px] text-slate-400 font-medium mt-0.5">4 item(s)</span>
            </div>
          </div>
          {/* Folder Card 2 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-blue-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            </div>
            <div className="flex flex-col pt-1">
              <span className="font-bold text-[14px] text-slate-900 leading-tight">Sub 2</span>
              <span className="text-[12px] text-slate-400 font-medium mt-0.5">0 item(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="px-2 pt-6">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Files - 2</h2>
        
        <DataTable
          columns={columns}
          data={mockFiles}
        />
      </div>
    </div>
  );
}
