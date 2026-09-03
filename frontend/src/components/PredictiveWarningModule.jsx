import React from "react";
import { AlertTriangle, TrendingDown, Eye, ShieldAlert } from "lucide-react";

export default function PredictiveWarningModule({ onTriggerPredictive }) {
  return (
    <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 backdrop-blur shadow-xl">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">Predictive Warning</h3>
            <p className="text-[10px] text-slate-400">Proactive pre-failure optical power drift anomaly detection</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
          PRE-FAILURE ALERT
        </span>
      </div>

      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-bold">ER-MUM-01 · Optical Ingress Link</span>
          <span className="text-amber-400">-22.4 dBm (Decay -0.8/hr)</span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans">
          "Optical power is degrading toward the failure cutoff threshold (-23.0 dBm). Estimated hard failure in ~85 minutes."
        </p>

        {/* Visual degradation curve */}
        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Normal: -18.4 dBm</span>
          <span className="text-amber-400 font-bold">Current: -22.4 dBm</span>
          <span className="text-rose-400">Cutoff: -23.0 dBm</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-2 rounded-full" style={{ width: "88%" }} />
        </div>
      </div>
    </div>
  );
}