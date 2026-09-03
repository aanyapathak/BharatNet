import React from "react";
import { Activity, ShieldCheck, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function NetworkHealthMatrix({ systemState = "NORMAL", isResolved }) {
  const isHealthy = isResolved || systemState === "NORMAL" || systemState === "HEALTHY";

  const layers = [
    { name: "PHYSICAL FIBER", status: isHealthy ? "HEALTHY" : "CRITICAL", detail: isHealthy ? "100 Gbps Dark Fiber Intact" : "Dark Fiber Shearing on ER-MUM-01" },
    { name: "CORE ROUTING & SWITCHING", status: isHealthy ? "HEALTHY" : "CRITICAL", detail: isHealthy ? "BGP/OSPF Established" : "BGP Dropped, OSPF Dead Timer Expired" },
    { name: "ACCESS / 5G RAN", status: isHealthy ? "HEALTHY" : "IMPACTED", detail: isHealthy ? "4 BTS Hubs Online" : "120,500 Subs VoLTE Starvation" },
    { name: "TELECOM SERVICES", status: isHealthy ? "HEALTHY" : "DEGRADED", detail: isHealthy ? "UPI & AAA Latency 12ms" : "UPI 504 Timeout, AAA Auth Backpressure" },
    { name: "CUSTOMER REVENUE IMPACT", status: isHealthy ? "STABILIZED" : "BREACH RISK", detail: isHealthy ? "₹0 / sec Loss" : "₹8,547 / sec Active Revenue Burn" }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Network Health Matrix</h3>
            <p className="text-[10px] text-slate-400">Incident propagation status across the 5 telecom network layers</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {layers.map((layer, idx) => {
          const isOk = layer.status === "HEALTHY" || layer.status === "STABILIZED";
          return (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 text-[11px] font-mono">{layer.name}</div>
                <div className="text-[10px] text-slate-400 font-sans">{layer.detail}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                isOk
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : layer.status === "CRITICAL"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {layer.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}