import React from "react";
import { ListFilter, Clock, AlertTriangle, CheckCircle, ArrowRight, Zap } from "lucide-react";

export default function NetworkEventLog({ events = [] }) {
  const defaultEvents = [
    { time: "20:41:08", type: "LINK DOWN", desc: "ER-MUM-01 line protocol DOWN (Carrier loss / optical dark)", sev: "CRIT" },
    { time: "20:41:09", type: "OSPF LOST", desc: "OSPF-5-ADJCHANGE: Nbr 10.50.1.1 Dead timer expired", sev: "CRIT" },
    { time: "20:41:13", type: "BGP DROPPED", desc: "BGP-5-ADJCHANGE: Neighbor 103.45.12.2 (AS 64512) Down", sev: "CRIT" },
    { time: "20:41:21", type: "ROOT CAUSE", desc: "AI Engine identified ER-MUM-01 physical uplink with 89% confidence", sev: "INFO" },
    { time: "20:41:35", type: "RUNBOOK READY", desc: "Matched RB-014 (BGP & Optical Recovery Playbook)", sev: "INFO" },
    { time: "20:41:50", type: "REMEDIATION", desc: "Autonomous Optical Ring B Failover Committed", sev: "SUCCESS" }
  ];

  const logList = events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur flex flex-col h-[320px]">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Network Event Log</h3>
            <p className="text-[10px] text-slate-400">Live timeline of important network events during incident</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">STREAM LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/50">
        {logList.map((ev, i) => (
          <div key={i} className="pt-2 flex items-start gap-2.5 text-xs">
            <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">{ev.time}</span>
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] shrink-0 ${
              ev.sev === "CRIT" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
              ev.sev === "SUCCESS" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
              "bg-sky-500/20 text-sky-300 border border-sky-500/30"
            }`}>
              {ev.type}
            </span>
            <span className="text-slate-300 text-[11px] font-mono leading-tight">{ev.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}