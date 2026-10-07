"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Download, Eye, Trash2, FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  docType: string;
  size: string;
  type: string;
  created: string;
}

const mockDocuments: DocumentItem[] = [];

export default function DocumentsPage() {
  const columns: Column<DocumentItem>[] = [
    { 
      key: "name", 
      label: "Document", 
      render: (d) => (
        <div className="flex items-center gap-2">
          {d.type === "PDF" && <FileText size={16} className="text-red-500" />}
          {d.type === "JPG" && <ImageIcon size={16} className="text-teal-500" />}
          {d.type === "XLSX" && <FileSpreadsheet size={16} className="text-green-500" />}
          <span className="text-slate-800 font-medium text-[13px]">{d.name}</span>
        </div>
      ) 
    },
    { key: "docType", label: "Document Type", render: (d) => <span className="text-slate-600 text-[13px]">{d.docType}</span> },
    { key: "size", label: "Size", render: (d) => <span className="text-slate-600 text-[13px]">{d.size}</span> },
    { 
      key: "type", 
      label: "Type", 
      render: (d) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          d.type === "PDF" ? "bg-red-50 text-red-500" : 
          d.type === "JPG" ? "bg-teal-50 text-teal-500" :
          "bg-green-50 text-green-500"
        }`}>
          {d.type}
        </span>
      ) 
    },
    { key: "created", label: "Created", render: (d) => <span className="text-slate-600 text-[13px]">{d.created}</span> },
    {
      key: "actions",
      label: "Actions",
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
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
      </div>

      <DataTable
        columns={columns}
        data={mockDocuments}
      />
    </div>
  );
}
