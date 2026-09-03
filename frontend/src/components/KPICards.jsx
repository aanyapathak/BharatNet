import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, Clock, ShieldAlert, TrendingDown, ArrowDownRight, Layers } from 'lucide-react';

export default function KPICards({ metrics, activeIncidents, totalAlertsCount, suppressedCount }) {
  const [lossCounter, setLossCounter] = useState(0);

  // Compute live cumulative loss for active open incidents
  useEffect(() => {
    const activeOpen = activeIncidents.filter(i => i.status !== 'RESOLVED');
    if (activeOpen.length === 0) {
      const resolvedLoss = activeIncidents.reduce((acc, i) => acc + (i.accumulated_loss_inr || 0), 0);
      setLossCounter(resolvedLoss);
      return;
    }

    const timer = setInterval(() => {
      const currentTotal = activeIncidents.reduce((acc, inc) => {
        if (inc.status === 'RESOLVED') {
          return acc + (inc.accumulated_loss_inr || 0);
        }
        const now = Date.now() / 1000;
        const dur = now - (inc.created_at || now);
        return acc + (dur * (inc.revenue_loss_rate_inr_per_sec || 0));
      }, 0);
      setLossCounter(currentTotal);
    }, 200);

    return () => clearInterval(timer);
  }, [activeIncidents]);

  const hasActiveIncidents = activeIncidents.some(i => i.status !== 'RESOLVED');
  const totalBurnRate = activeIncidents
    .filter(i => i.status !== 'RESOLVED')
    .reduce((acc, i) => acc + (i.revenue_loss_rate_inr_per_sec || 0), 0);

  const noiseReductionPct = totalAlertsCount > 0
    ? ((suppressedCount / totalAlertsCount) * 100).toFixed(1)
    : '68.4';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
      {/* 1. Live Revenue Impact Ticker */}
      <div className={`p-4 rounded-xl border backdrop-blur transition-all duration-300 ${
        hasActiveIncidents 
          ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30' 
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className={`w-4 h-4 ${hasActiveIncidents ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            Live Revenue Loss Ticker
          </span>
          {hasActiveIncidents ? (
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-mono animate-pulse">
              -₹{Math.round(totalBurnRate).toLocaleString('en-IN')}/sec
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono">
              FROZEN (STABILIZED)
            </span>
          )}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
            ₹{Math.round(lossCounter).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Manual Projected: ₹3.08 Cr</span>
          <span className="text-emerald-400 font-semibold font-mono">Saved: {metrics?.total_savings_cr_str || '₹ 2.52 Cr'}</span>
        </div>
      </div>

      {/* 2. Mean Time To Detect (MTTD) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sky-400" />
            Autonomous MTTD
          </span>
          <span className="text-emerald-400 font-mono text-xs flex items-center gap-0.5">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {metrics?.mttd_reduction_pct || 96.2}% Speedup
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-sky-400">
            {metrics?.mttd_ai_sec ? `${metrics.mttd_ai_sec}s` : '42s'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            vs {metrics?.mttd_manual_min || 18.5}m manual
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '96%' }} />
        </div>
      </div>

      {/* 3. Mean Time To Resolve (MTTR) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            Autonomous MTTR
          </span>
          <span className="text-emerald-400 font-mono text-xs flex items-center gap-0.5">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {metrics?.mttr_reduction_pct || 92.0}% Speedup
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-indigo-400">
            {metrics?.mttr_ai_min ? `${metrics.mttr_ai_min} min` : '4.6 min'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            vs {metrics?.mttr_manual_min || 58.0}m legacy
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '92%' }} />
        </div>
      </div>

      {/* 4. Noise Suppression Ratio */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Noise Reduction Ratio
          </span>
          <span className="text-emerald-400 font-mono text-xs">
            {noiseReductionPct}% Filtered
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">
            {suppressedCount} <span className="text-sm font-normal text-slate-400">suppressed</span>
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Total Stream: {totalAlertsCount} alerts</span>
          <span className="text-sky-400 font-medium">1 Root Cause Identified</span>
        </div>
      </div>
    </div>
  );
}