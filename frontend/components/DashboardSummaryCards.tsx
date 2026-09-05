"use client";

import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";

interface SummaryData {
  total_students: number;
  active_teachers: number;
  total_classes: number;
}

export default function DashboardSummaryCards({ token }: { token: string }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard summary", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="py-6 text-xs font-semibold text-[#64748b]">Loading summary…</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="stat-card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Total Students</p>
        <p className="mt-2 text-3xl font-black text-[#1267e8]">
          {data?.total_students?.toLocaleString() ?? 0}
        </p>
      </div>

      <div className="stat-card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Active Teachers</p>
        <p className="mt-2 text-3xl font-black text-[#059669]">
          {data?.active_teachers?.toLocaleString() ?? 0}
        </p>
      </div>

      <div className="stat-card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Total Classes</p>
        <p className="mt-2 text-3xl font-black text-[#d97706]">
          {data?.total_classes?.toLocaleString() ?? 0}
        </p>
      </div>
    </div>
  );
}