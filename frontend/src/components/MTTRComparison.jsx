import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, Zap } from 'lucide-react';

export default function MTTRComparison({ metrics }) {
  const chartData = [
    {
      stage: 'Incident Detection',
      Manual: 18.5,
      AIOps: 0.7,
    },
    {
      stage: 'Correlation & RCA',
      Manual: 22.0,
      AIOps: 0.8,
    },
    {
      stage: 'Runbook Lookup',
      Manual: 15.0,
      AIOps: 0.5,
    },
    {
      stage: 'Remediation Exec',
      Manual: 25.0,
      AIOps: 2.6,
    },
    {
      stage: 'Total MTTR',
      Manual: 58.0,
      AIOps: 4.6,
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            MTTD & MTTR Reduction: Manual Baseline vs Autonomous AIOps (Minutes)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
          ↓ 92.0% Faster Resolution
        </span>
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="Manual" name="Manual Telecom Ops (Min)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="AIOps" name="AIOps NOC Commander (Min)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}