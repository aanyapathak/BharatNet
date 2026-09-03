import React from "react";
import { GitCommit, CheckCircle2, PhoneCall, ShieldAlert, ArrowDown } from "lucide-react";

export default function EscalationTimelineView({ isResolved, systemState }) {
  const steps = [
    { title: "DETECTED", desc: "T+00s · LinkDown on ER-MUM-01 Ingress", done: true },
    { title: "CORRELATED", desc: "T+18s · 23 alerts grouped, downstream noise filtered", done: true },
    { title: "ROOT CAUSE", desc: "T+35s · ER-MUM-01 Uplink Identified (89% Confidence)", done: true },
    { title: "SEV-1 ALERT", desc: "T+40s · P0 Incident formed & blast radius mapped", done: true },
    { title: "ENGINEER NOTIFIED", desc: "T+45s · PagerDuty, Slack & SMS dispatched to On-Call", done: true },
    { title: "REMEDIATION", desc: "T+90s · RB-014 Tier 1 & Tier 2 Failover Executed", done: isResolved || systemState === "RECOVERING" },
    { title: "RESOLVED", desc: "T+120s · Network Recovered & Traffic Verified 100%", done: isResolved }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Escalation Timeline</h3>
            <p className="text-[10px] text-slate-400">How the incident moves from detection to notification & recovery</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-center justify-between text-xs">
            <span className={`absolute -left-4 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
              step.done ? "bg-emerald-400" : "bg-slate-700"
            }`} />
            <div>
              <div className={`font-bold font-mono text-[11px] ${step.done ? "text-slate-200" : "text-slate-500"}`}>
                {step.title}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{step.desc}</div>
            </div>
            <span className={`text-[10px] font-mono font-semibold ${step.done ? "text-emerald-400" : "text-slate-600"}`}>
              {step.done ? "✓ DONE" : "PENDING"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}