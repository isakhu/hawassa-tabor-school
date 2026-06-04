"use client";

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants';

interface SummaryData {
  total_students: number;
  active_teachers: number;
}

export default function DashboardSummaryCards({ token }: { token: string }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Failed to fetch dashboard summary", err));
  }, [token]);

  if (loading) return <div style={{ color: '#D4AF37' }}>Loading summary...</div>;

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111',
    border: '1px solid #D4AF37',
    borderRadius: '8px',
    padding: '24px',
    flex: '1',
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  };

  const labelStyle: React.CSSProperties = {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  };

  const valueStyle: React.CSSProperties = {
    color: '#D4AF37',
    fontSize: '36px',
    fontWeight: '800',
    textShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%', marginBottom: '32px' }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Total Students</div>
        <div style={valueStyle}>
          {data?.total_students.toLocaleString()}
        </div>
        <div style={{ color: '#444', fontSize: '10px', marginTop: '4px' }}>
          Enrolled in Tabor
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Active Teachers</div>
        <div style={valueStyle}>
          {data?.active_teachers.toLocaleString()}
        </div>
        <div style={{ color: '#444', fontSize: '10px', marginTop: '4px' }}>
          Verified Faculty
        </div>
      </div>
    </div>
  );
}