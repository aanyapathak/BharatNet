import React from "react";
import { AlertOctagon, CheckCircle2, ShieldAlert, Cpu, Sparkles, DollarSign, Users, Clock, ArrowRight, Zap, Target } from "lucide-react";

export default function IncidentCommandPanel({ incident, onAcknowledge, isResolved }) {
  if (!incident) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400 backdrop-blur h-full">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
        <h3 className="text-base font-bold text-slate-100">National Core Network Normal</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          No active high-severity telecom incidents. Autonomous noise reduction and self-healing hold active.
        </p>
      </div>
    );
  }

  const root = incident.root_cause || {
    root_device_id: "ER-MUM-01",
    root_device_name: "Mumbai Gateway Edge Router 01",
    hypothesis: "Physical Dark Fiber Shearing on GigabitEthernet0/0/1",
    confidence_pct: 89,
    evidence: [
      "Carrier loss & optical Rx dark signal on ER-MUM-01",
      "BGP session dropped with peer AS 64512 within 2.5s",
      "OSPF dead interval expired on transit trunk to CS-MUM-01",
      "6 downstream datacenter services experiencing packet starvation"
    ]
  };

  const evidenceItems = [
    { label: "LINK DOWN", detail: "GigabitEthernet0/0/1 Carrier Loss (T+0s)" },
    { label: "OSPF LOST", detail: "Neighbor 10.50.1.1 Dead Timer Expired (T+1.2s)" },
    { label: "BGP DROPPED", detail: "AS 64512 Peering Session Terminated (T+2.5s)" },
    { label: "PACKET LOSS", detail: "Downstream Aggregation Loss > 98.4% (T+7.0s)" },
    { label: "TOPOLOGY GRAPH", detail: "Root Ancestor Ingress Traversal Confirmed" }
  ];

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 backdrop-blur flex flex-col gap-4 ${
      isResolved
        ? "bg-emerald-950/20 border-emerald-500/40"
        : "bg-slate-900/90 border-rose-500/40 shadow-2xl shadow-rose-950/40 ring-1 ring-rose-500/30"
    }`}>
      {/* 1. Header & Severity Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isResolved ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400 animate-pulse"}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-sky-400">{incident.incident_id || "INC-2024-0001"}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                isResolved ? "bg-emerald-500 text-slate-950" : "bg-rose-600 text-white animate-pulse"
              }`}>
                {isResolved ? "RESOLVED & RECOVERED" : "SEV-1 · NETWORK OUTAGE"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              MUMBAI FIBER CUT — CORE TRANSIT FAILURE
            </h2>
          </div>
        </div>

        {/* Acknowledge Button */}
        {!isResolved && incident.status !== "ACKNOWLEDGED" && (
          <button
            onClick={() => onAcknowledge && onAcknowledge(incident.incident_id)}
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            Acknowledge Incident
          </button>
        )}
      </div>

      {/* 2. Structured Telecom Answer Grid (What? Where? Why? Impact?) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Root Cause</div>
          <div className="font-bold text-rose-400 font-mono text-sm mt-1">{root.root_device_id}</div>
          <div className="text-[11px] text-slate-300 mt-0.5">Uplink Failure</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Confidence</div>
          <div className="font-bold text-emerald-400 font-mono text-sm mt-1">{root.confidence_pct}%</div>
          <div className="text-[11px] text-slate-300 mt-0.5">High Certainty</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Blast Radius</div>
          <div className="font-bold text-amber-400 font-mono text-sm mt-1">11 Devices</div>
          <div className="text-[11px] text-slate-300 mt-0.5">120,500 5G Subs</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Business Impact</div>
          <div className="font-bold text-rose-400 font-mono text-sm mt-1">₹8,547 / sec</div>
          <div className="text-[11px] text-slate-300 mt-0.5">UPI & VoLTE Loss</div>
        </div>
      </div>

      {/* 3. Root Cause Evidence Convergence Box */}
      <div className="p-3.5 rounded-lg bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 border border-rose-500/30 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
            <Target className="w-4 h-4" />
            <span>Root Cause Evidence Convergence</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            AI Correlation Engine Verified
          </span>
        </div>

        <p className="text-slate-200 font-semibold mb-2">
          {root.root_device_name} ({root.root_device_id}) — <span className="text-rose-400 font-normal">{root.hypothesis}</span>
        </p>

        {/* Converging Evidence Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
          {evidenceItems.map((ev, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-sky-400">{ev.label}</span>
              <span className="text-slate-300 truncate max-w-[190px]">{ev.detail}</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            </div>
          ))}
        </div>

        <div className="mt-2.5 p-2 rounded bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 font-sans">
          <strong>Explainable Inference:</strong> Multiple downstream symptoms originated from the same upstream optical shear at ER-MUM-01. Downstream child alarms have been de-noised.
        </div>
      </div>
    </div>
  );
}
