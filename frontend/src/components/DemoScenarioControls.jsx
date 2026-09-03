import React from "react";
import { Flame, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

export default function DemoScenarioControls({ onTriggerFiberCut, onTriggerPredictive, onTriggerNormal, onReset, isStorming }) {
  return (
    <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Scenario Simulation Controls:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onTriggerFiberCut}
          disabled={isStorming}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs tracking-wide transition shadow-lg ${
            isStorming
              ? "bg-rose-950 text-rose-300 border border-rose-600/50 cursor-not-allowed animate-pulse"
              : "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/25 active:scale-95"
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${isStorming ? "animate-bounce" : ""}`} />
          <span>{isStorming ? "Cascade Running..." : "💥 SIMULATE MUMBAI FIBER CUT"}</span>
        </button>

        <button
          onClick={onTriggerPredictive}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white shadow-md shadow-amber-600/20 active:scale-95 transition"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
          <span>⚠️ SIMULATE PREDICTIVE FAILURE</span>
        </button>

        <button
          onClick={onTriggerNormal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NORMAL OPERATIONS</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>RESET INCIDENT</span>
        </button>
      </div>
    </div>
  );
}