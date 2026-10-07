"use client";

import { User, Mail, Phone, MapPin, Hash, Calendar, Star, ShieldCheck, UserCog, MailOpen } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 shadow-lg relative">
        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-white/20 bg-indigo-400 flex items-center justify-center shadow-inner">
            <span className="text-4xl font-bold text-white tracking-widest">YK</span>
          </div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        {/* Info */}
        <div className="flex flex-col text-white pt-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-3">User Profile</h1>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm">
              <Star size={12} className="text-yellow-300 fill-yellow-300" />
              Admin
            </span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              Admin
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              Male
            </span>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              Ethiopian
            </span>
          </div>
          
          <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-100 text-sm">
            <MailOpen size={14} />
            user@example.com
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-pink-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <User size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">Personal Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">First Name</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Last Name</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Gender</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Nationality</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Date of Birth</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Identification */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-sky-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <Hash size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">Contact & Identification</h2>
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
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Phone</span>
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
            <div className="flex items-start gap-3">
              <Hash size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[100px]">Identification</span>
                <span className="font-semibold text-slate-800"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden md:col-span-2">
          <div className="bg-yellow-50 px-5 py-3 flex items-center gap-2 border-b border-slate-50">
            <UserCog size={16} className="text-slate-600" />
            <h2 className="text-[13px] font-bold text-slate-800">Account Details</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex gap-2 text-sm items-center">
                  <span className="text-slate-500 min-w-[110px]">Role</span>
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">Admin</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 min-w-[110px]">Created By</span>
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
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex gap-2 text-sm items-center">
                  <span className="text-slate-500 min-w-[110px]">Admin</span>
                  <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">Yes</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-500 min-w-[110px]">Member Since</span>
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
    </div>
  );
}
