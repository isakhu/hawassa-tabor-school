"use client";

import { Home, Search, LayoutGrid, List as ListIcon, Folder } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function FileManagerPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Folders" | "Documents">("All");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2 text-slate-900">
          <Home size={20} className="text-slate-700" />
          <h1 className="text-xl font-bold">File Manager</h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
          Create Root folder
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
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Folders - 1</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Folder Card */}
          <Link href="/file-manager/1" className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-blue-500">
              {/* Custom SVG for solid folder to match screenshot */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            </div>
            <div className="flex flex-col pt-1">
              <span className="font-bold text-[14px] text-slate-900 leading-tight">Main Folder</span>
              <span className="text-[12px] text-slate-400 font-medium mt-0.5">2 item(s)</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
