"use client";

import { useState } from "react";
import { Edit, Star, MapPin, Building2, Flag, Mail, Phone, Hash, Calendar, User, FileText } from "lucide-react";
import Modal from "@/components/Modal";

export default function SchoolProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState(["+254794028543", "+254791042756", "+254710856734"]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-2">
      {/* Banner */}
      <div className="bg-[#1e40af] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative shadow-lg">
        {/* Logo container */}
        <div className="bg-[#4c6cdb] rounded-2xl w-32 h-32 flex items-center justify-center shrink-0 border-4 border-white/10 shadow-inner overflow-hidden">
          <div className="text-white text-[10px] text-center px-2">
            [School Logo Placeholder]
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col text-white pt-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2">School Profile</h1>
          <p className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-200 mb-4 text-sm font-medium italic">
            <Star size={14} fill="currentColor" />
            "School Motto"
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              School
            </span>
            <span className="flex items-center gap-1 bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              <MapPin size={12} />
              Location
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <button 
          onClick={() => setEditOpen(true)} 
          className="sm:absolute sm:top-8 sm:right-8 flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Edit size={16} />
          Edit
        </button>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* General Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-blue-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <Building2 size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">General Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">School Name</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Short Name</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Motto</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Flag size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Country</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Address</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-emerald-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <Phone size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">Contact Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Email</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-slate-500">Phone Numbers</span>
                <div className="flex flex-wrap gap-2">
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-amber-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <FileText size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">Registration</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Hash size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm items-center">
                <span className="text-slate-500 min-w-[120px]">Registration No.</span>
                <span className="font-bold text-[12px] text-blue-600"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[120px]">Registration Date</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Record Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-fuchsia-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <User size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">Record Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[110px]">Created By</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[110px]">Created At</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[110px]">Last Updated By</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[110px]">Last Updated</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit School" maxWidth={850}>
        <div className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Illustration Area */}
            <div className="w-full md:w-[260px] shrink-0 flex items-center justify-center relative">
              <div className="w-full aspect-square bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 p-4 shadow-sm relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-200 fill-current mb-2">
                  <path d="M50 10 L10 40 L90 40 Z" fill="#fcd34d" />
                  <rect x="20" y="40" width="60" height="50" fill="#fbbf24" />
                  <rect x="40" y="60" width="20" height="30" fill="#3b82f6" />
                </svg>
                <span className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest">School Illustration</span>
              </div>
              <button className="absolute top-2 right-2 bg-white rounded-md p-1.5 shadow hover:bg-slate-50 border border-slate-100 z-10">
                 <Edit size={14} className="text-slate-600" />
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">School name</label>
                <input defaultValue="Wahama Primary School" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">School Short name</label>
                <input defaultValue="Wahama" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Registration Number</label>
                <input defaultValue="SCT 212 7847293873" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Registration Date</label>
                <input type="date" defaultValue="2014-06-04" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white text-slate-600" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Country</label>
                <input defaultValue="Kenya" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Address</label>
                <input defaultValue="Mother Danila, Lower Kabele" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" />
              </div>
            </div>
          </div>

          {/* Bottom Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">School Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={14} className="text-slate-400" />
                </div>
                <input defaultValue="wahamaschool@gmail.com" className="w-full border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">School Phone Contacts</label>
              <div className="flex flex-wrap items-center gap-1.5 border border-slate-200 rounded-md p-1.5 min-h-[38px] cursor-text bg-white">
                {phoneNumbers.map((num, i) => (
                  <span key={i} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                    {num}
                    <button type="button" onClick={() => setPhoneNumbers(phoneNumbers.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-slate-600">×</button>
                  </span>
                ))}
                <input type="text" className="outline-none text-sm min-w-[50px] flex-1 bg-transparent" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Additional Info</label>
              <textarea defaultValue="We are accredited by the Ministry of Education as a primary school." className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none h-24 bg-white"></textarea>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">School Motto</label>
              <textarea defaultValue="Always Strive For Excellence." className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none h-24 bg-white"></textarea>
            </div>
          </div>

          <div className="pt-2">
            <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2 rounded-md text-sm font-bold transition-colors">
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
