"use client";

import { Edit, Star, MapPin, Building2, AlignLeft, Flag, Mail, Phone, Hash, Calendar, User, Clock, ShieldCheck, FileText } from "lucide-react";
import Image from "next/image";

export default function SchoolProfilePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Banner */}
      <div className="bg-[#1e40af] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative shadow-lg">
        {/* Logo container */}
        <div className="bg-[#4c6cdb] rounded-2xl w-32 h-32 flex items-center justify-center shrink-0 border-4 border-white/10 shadow-inner overflow-hidden">
          {/* Placeholder for the logo. In the real app, use an img/Image tag here. */}
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
        <button className="sm:absolute sm:top-8 sm:right-8 flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
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
    </div>
  );
}
