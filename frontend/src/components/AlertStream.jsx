import React, { useState } from 'react';
import { Radio, Filter, ShieldAlert, CheckCircle, Clock, ArrowRight, BellOff } from 'lucide-react';

export default function AlertStream({ alerts, onSelectAlert }) {
  const [filter, setFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'SUPPRESSED') return ['DEDUPED', 'FLAPPING_SUPPRESSED', 'SELF_HEALING_HOLD'].includes(a.status);
    if (filter === 'CORRELATED') return a.status === 'CORRELATED';
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    return true;
  });

  const getStatusBadge = (alert) => {
    switch (alert.status) {
      case 'DEDUPED':
        return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700">🔇 DEDUPED (30s)</span>;
      case 'FLAPPING_SUPPRESSED':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20">⚡ FLAP DAMPENED</span>;
      case 'SELF_HEALING_HOLD':
        return <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">⏳ AUTO-HEAL HOLD</span>;
      case 'CORRELATED':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/30">🔴 CORRELATED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">✓ NORMALIZED</span>;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">P0 CRIT</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">P1 HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">P2 MED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold text-[10px]">INFO</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col h-[740px] overflow-hidden backdrop-blur">
      {/* Header & Filter bar */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Raw Telemetry Stream ({alerts.length})
          </h2>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-1">
          {['ALL', 'CORRELATED', 'SUPPRESSED', 'CRITICAL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                filter === tab
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1.5 font-sans">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs text-center p-4">
            <BellOff className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <span>No alerts matching filter</span>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => (
            <div
              key={alert.alert_id + idx}
              onClick={() => onSelectAlert && onSelectAlert(alert)}
              className={`p-2.5 rounded-lg border transition text-xs cursor-pointer ${
                alert.status === 'CORRELATED'
                  ? 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/40'
                  : alert.status === 'FLAPPING_SUPPRESSED' || alert.status === 'DEDUPED'
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-100'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {getSeverityBadge(alert.severity)}
                  <span className="font-mono font-bold text-slate-200 text-[11px]">{alert.device_id}</span>
                  <span className="text-[10px] text-slate-500">{alert.source_protocol}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusBadge(alert)}
                  <span className="font-mono text-[10px] text-slate-400">{alert.formatted_time}</span>
                </div>
              </div>

              <p className="text-slate-300 text-[11px] font-mono leading-relaxed line-clamp-2">
                {alert.description}
              </p>

              {alert.suppression_reason && (
                <div className="mt-1.5 pt-1 border-t border-slate-800/60 text-[10px] text-amber-400/90 font-mono italic">
                  ↳ {alert.suppression_reason}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}