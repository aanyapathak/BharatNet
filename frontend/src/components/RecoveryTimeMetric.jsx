import React from "react";
import { Clock, TrendingDown, Zap } from "lucide-react";

export default function RecoveryTimeMetric({ metrics }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Recovery Time (MTTR)</h3>
            <p className="text-[10px] text-slate-400">Autonomous correlation & runbooks reduce diagnosis & repair time</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">
          38 min faster recovery (81% reduction)
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <div className="flex justify-between text-slate-400 text-[11px] font-mono mb-1">
            <span>Traditional Manual Response:</span>
            <span className="text-rose-400 font-bold">47 min</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: "95%" }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 text-[11px] font-mono mb-1">
            <span>AIOps NOC Commander (AI-Assisted):</span>
            <span className="text-sky-400 font-bold">9 min</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-sky-400 h-2.5 rounded-full" style={{ width: "19%" }} />
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-sans pt-1">
          Correlation and guided remediation eliminate manual alarm triage and automate safe restoration steps.
        </p>
      </div>
    </div>
  );
}