import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, Cpu, Sparkles, ChevronRight, Layers, DollarSign, Users } from 'lucide-react';

export default function IncidentCard({ incident, onAcknowledge }) {
  if (!incident) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center backdrop-blur h-full">
        <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mb-3" />
        <h3 className="text-base font-bold text-slate-200">NOC Core Network All Clear</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          No active high-severity incidents detected. Telemetry de-noising and baseline self-healing active across all metro rings.
        </p>
      </div>
    );
  }

  const isResolved = incident.status === 'RESOLVED';
  const root = incident.root_cause;

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 ${
      isResolved 
        ? 'bg-emerald-950/20 border-emerald-500/40' 
        : 'bg-slate-900/80 border-rose-500/40 shadow-xl shadow-rose-950/30 ring-1 ring-rose-500/30'
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isResolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-sky-400">{incident.incident_id}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isResolved ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white animate-pulse'
              }`}>
                {isResolved ? 'RESOLVED & STABILIZED' : `${incident.severity} OUTAGE`}
              </span>
              <span className="text-xs text-slate-400 font-mono">T+{incident.formatted_created_at}</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">{incident.title}</h2>
          </div>
        </div>

        {/* Action button */}
        {!isResolved && incident.status !== 'ACKNOWLEDGED' && (
          <button
            onClick={() => onAcknowledge(incident.incident_id)}
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            Acknowledge Incident
          </button>
        )}
      </div>

      {/* 1. Explainable AI Correlation Reasoning */}
      <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase tracking-wider text-[11px] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable Alert Correlation (AI Reasoning)</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          {incident.correlation_reasoning}
        </p>
      </div>

      {/* 2. Root Cause Hypothesis & Evidence */}
      {root && (
        <div className="mt-3 p-3.5 rounded-lg bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/30 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Probable Root Cause Hypothesis
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 text-[11px]">Confidence:</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                {root.confidence_pct}% HIGH MATCH
              </span>
            </div>
          </div>

          <div className="font-semibold text-slate-100 text-sm mb-1.5">
            {root.root_device_name} ({root.root_device_id}) — <span className="text-rose-400">{root.hypothesis}</span>
          </div>

          {/* Evidence checklist */}
          <div className="space-y-1 mt-2 text-[11px] font-mono">
            {root.evidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Affected Services & Blast Radius stats */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Impact Radius</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Downstream Nodes:</span>
              <span className="font-bold font-mono text-white">{incident.blast_radius_devices.length} devices</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Mobile 5G Subscribers:</span>
              <span className="font-bold font-mono text-rose-400">{incident.total_subscribers_impacted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Correlated Alerts:</span>
              <span className="font-bold font-mono text-sky-400">{incident.correlated_alerts_count}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mission-Critical Services Affected</span>
          </div>
          <div className="space-y-1 text-[11px]">
            {incident.affected_services.slice(0, 3).map((svc, i) => (
              <div key={i} className="flex justify-between text-slate-300">
                <span className="truncate max-w-[170px]">{svc.name}</span>
                <span className="font-mono text-rose-400 font-semibold">₹{svc.revenue_loss_per_sec_inr}/s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}