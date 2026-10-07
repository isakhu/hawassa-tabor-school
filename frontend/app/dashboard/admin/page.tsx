"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { MoreHorizontal } from "lucide-react";

const studentData = [
  { name: 'Boys', value: 60, color: '#a5f3fc' },
  { name: 'Girls', value: 40, color: '#fde047' }
];

const attendanceData = [
  { name: 'Mon', present: 0, absent: 0 },
  { name: 'Tue', present: 1, absent: 0 },
  { name: 'Wed', present: 0, absent: 0 },
  { name: 'Thu', present: 0, absent: 0 },
  { name: 'Fri', present: 0, absent: 0 },
];

const financeData = [
  { name: 'Jan', paid: 0, outstanding: 0 },
  { name: 'Feb', paid: 0, outstanding: 0 },
  { name: 'Mar', paid: 0, outstanding: 0 },
  { name: 'Apr', paid: 0, outstanding: 0 },
  { name: 'May', paid: 0, outstanding: 0 },
  { name: 'Jun', paid: 0, outstanding: 0 },
  { name: 'Jul', paid: 0, outstanding: 0 },
  { name: 'Aug', paid: 0, outstanding: 0 },
  { name: 'Sep', paid: 0, outstanding: 0 },
  { name: 'Oct', paid: 1, outstanding: 0 },
  { name: 'Nov', paid: 0, outstanding: 0 },
  { name: 'Dec', paid: 0, outstanding: 0 },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([get<any[]>("/students"), get<any[]>("/teachers"), get<any[]>("/classes")])
      .then(([students, teachers, classes]) => {
        if (!active) return;
        setCounts({
          students: Array.isArray(students) ? students.length : 0,
          teachers: Array.isArray(teachers) ? teachers.length : 0,
          classes: Array.isArray(classes) ? classes.length : 0,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="h-full overflow-y-auto pb-10">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#fce7e7] rounded-2xl p-5 relative shadow-sm h-32 flex flex-col justify-center">
          <MoreHorizontal className="absolute top-4 right-4 text-slate-300" size={20} />
          <div className="text-3xl font-black text-slate-800">{loading ? '-' : counts.students}</div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Students</div>
        </div>
        <div className="bg-[#e4f5e9] rounded-2xl p-5 relative shadow-sm h-32 flex flex-col justify-center">
          <MoreHorizontal className="absolute top-4 right-4 text-slate-300" size={20} />
          <div className="text-3xl font-black text-slate-800">{loading ? '-' : counts.teachers}</div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Teachers</div>
        </div>
        <div className="bg-[#e0f2fe] rounded-2xl p-5 relative shadow-sm h-32 flex flex-col justify-center">
          <MoreHorizontal className="absolute top-4 right-4 text-slate-300" size={20} />
          <div className="text-3xl font-black text-slate-800">5</div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Parents</div>
        </div>
        <div className="bg-[#f3e8ff] rounded-2xl p-5 relative shadow-sm h-32 flex flex-col justify-center">
          <MoreHorizontal className="absolute top-4 right-4 text-slate-300" size={20} />
          <div className="text-3xl font-black text-slate-800">5</div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Staff</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        
        {/* Left Column (Charts) */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students Donut */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
              <MoreHorizontal className="absolute top-5 right-5 text-slate-400" size={20} />
              <h2 className="text-lg font-bold text-slate-800 mb-2">Students</h2>
              <div className="h-[220px] flex items-center justify-center relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentData}
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {studentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Inner Icon Placeholder */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex gap-1 text-slate-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5f3fc" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2"><path d="M18 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                 </div>
              </div>
              <div className="flex justify-around mt-2">
                 <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-[#a5f3fc] mx-auto mb-1"></div>
                    <div className="text-sm font-bold text-slate-700">6</div>
                    <div className="text-xs text-slate-500 font-semibold">Boys (60.00%)</div>
                 </div>
                 <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-[#fde047] mx-auto mb-1"></div>
                    <div className="text-sm font-bold text-slate-700">4</div>
                    <div className="text-xs text-slate-500 font-semibold">Girls (40.00%)</div>
                 </div>
              </div>
            </div>

            {/* Attendance Bar Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
              <MoreHorizontal className="absolute top-5 right-5 text-slate-400" size={20} />
              <h2 className="text-lg font-bold text-slate-800 mb-4">Attendance</h2>
              <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-slate-400">
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#fde047]"></div> present</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#a5f3fc]"></div> absent</div>
              </div>
              <div className="h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} ticks={[0, 0.25, 0.5, 0.75, 1]} />
                       <Bar dataKey="present" fill="#fde047" radius={[4, 4, 4, 4]} barSize={12} />
                       <Bar dataKey="absent" fill="#a5f3fc" radius={[4, 4, 4, 4]} barSize={12} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Finance Line Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
            <MoreHorizontal className="absolute top-5 right-5 text-slate-400" size={20} />
            <h2 className="text-lg font-bold text-slate-800 mb-6">Finance Fees Payment</h2>
            
            <div className="flex justify-center items-center gap-6 mb-4 text-xs font-semibold text-[#a5f3fc]">
               <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#a5f3fc]"></div> paid</div>
               <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#e2e8f0]"></div> outstanding</div>
            </div>

            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} ticks={[0, 0.25, 0.5, 0.75, 1]} />
                     <Line type="monotone" dataKey="paid" stroke="#a5f3fc" strokeWidth={3} dot={{ r: 4, fill: '#a5f3fc', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="outstanding" stroke="#e2e8f0" strokeWidth={2} dot={false} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
          
          {/* Calendar Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <select className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 bg-white"><option>2026</option></select>
                <select className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-semibold text-blue-500 bg-white"><option>Oct</option></select>
                <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden">
                   <button className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 border-r border-slate-200">Month</button>
                   <button className="px-3 py-1 text-sm font-semibold text-slate-500 bg-white">Year</button>
                </div>
             </div>
             <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-xs font-bold text-slate-500">{d}</div>)}
             </div>
             <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-700">
                <div className="p-1 text-slate-300">27</div><div className="p-1 text-slate-300">28</div><div className="p-1 text-slate-300">29</div><div className="p-1 text-slate-300">30</div><div className="p-1">01</div><div className="p-1">02</div><div className="p-1">03</div>
                <div className="p-1">04</div><div className="p-1">05</div><div className="p-1">06</div><div className="p-1 bg-blue-500 text-white rounded-lg shadow-sm shadow-blue-500/30">07</div><div className="p-1">08</div><div className="p-1">09</div><div className="p-1">10</div>
                <div className="p-1">11</div><div className="p-1">12</div><div className="p-1">13</div><div className="p-1">14</div><div className="p-1">15</div><div className="p-1">16</div><div className="p-1">17</div>
                <div className="p-1">18</div><div className="p-1">19</div><div className="p-1">20</div><div className="p-1">21</div><div className="p-1">22</div><div className="p-1">23</div><div className="p-1">24</div>
                <div className="p-1">25</div><div className="p-1">26</div><div className="p-1">27</div><div className="p-1">28</div><div className="p-1">29</div><div className="p-1">30</div><div className="p-1">31</div>
                <div className="p-1 text-slate-300">01</div><div className="p-1 text-slate-300">02</div><div className="p-1 text-slate-300">03</div><div className="p-1 text-slate-300">04</div><div className="p-1 text-slate-300">05</div><div className="p-1 text-slate-300">06</div><div className="p-1 text-slate-300">07</div>
             </div>
          </div>

          {/* Events Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
             <MoreHorizontal className="absolute top-5 right-5 text-slate-400" size={20} />
             <h2 className="text-lg font-bold text-slate-800 mb-4">Events</h2>
             
             <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc]">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">Science Fair</h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">2026-11-16: 08:00:00 - 16:00:00</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-3">An event to showcase your projects and upcoming technology advancements.</p>
                   <span className="inline-block px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold">Sciences & Technology</span>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc]">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">Parents Day</h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">2026-10-08: 08:00:00 - 12:00:00</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-3">Parents come with your children.</p>
                   <span className="inline-block px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">Entire School</span>
                </div>
             </div>
          </div>

          {/* Announcements Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
             <MoreHorizontal className="absolute top-5 right-5 text-slate-400" size={20} />
             <h2 className="text-lg font-bold text-slate-800 mb-4">Announcements</h2>
             
             <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-[#e0f2fe]/30">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">Parents Meeting PP1 North</h3>
                      <span className="text-[10px] font-semibold text-slate-500">2026-10-05</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-3">Meeting with the class teacher!!</p>
                   <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">PP1 - North</span>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-100 bg-[#f3e8ff]/30">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">Art Competition</h3>
                      <span className="text-[10px] font-semibold text-slate-500">2026-09-25</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-1">There will be a competition for art drawing and a prize re...</p>
                   <span className="inline-block px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">Art and Creativity</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-[#fef9c3]/30">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">Closing Day Third Term</h3>
                      <span className="text-[10px] font-semibold text-slate-500">2026-09-28</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-1">We will be closing the school on 24/11/2026. Parents ens...</p>
                   <span className="inline-block px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">Entire School</span>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

