"use client";

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { API_BASE_URL } from '@/lib/constants';

interface SubjectStat {
  subject: string;
  average: number;
}

export default function SubjectAveragesChart({ token }: { token: string }) {
  const [data, setData] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/grades/stats/subject-averages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Failed to fetch stats", err));
  }, [token]);

  if (loading) return <div style={{ color: '#D4AF37', padding: '20px' }}>Loading Statistics...</div>;

  return (
    <div style={{ 
      backgroundColor: '#111', 
      padding: '24px', 
      borderRadius: '8px', 
      border: '1px solid #D4AF37',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
    }}>
      <h3 style={{ 
        color: '#D4AF37', 
        marginBottom: '24px', 
        fontSize: '16px', 
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Average Performance per Subject
      </h3>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis 
              dataKey="subject" 
              stroke="#666" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#666" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #D4AF37', borderRadius: '4px' }}
              itemStyle={{ color: '#D4AF37' }}
              cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
            />
            <Bar dataKey="average" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#D4AF37' : '#8B7500'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}