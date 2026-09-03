import React from 'react';
import { Flame, AlertTriangle, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function ScenarioBar({ onTriggerFiberCut, onTriggerPredictive, onTriggerNormal, isStorming }) {
  return (
    <div className="bg-slate-900/70 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Sparkles className="w-4 h-4 text-sky-400" />
        <span>Live Hackathon Simulation Scenarios:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Scenario 1: Fiber Cut Storm */}
        <button
          onClick={onTriggerFiberCut}
          disabled={isStorming}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition shadow-lg ${
            isStorming
              ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50 cursor-not-allowed animate-pulse'
              : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/25 active:scale-95'
          }`}
        >
          <Flame className={`w-4 h-4 ${isStorming ? 'animate-bounce' : ''}`} />
          <span>{isStorming ? 'Simulating Fiber Shearing Cascade...' : '💥 SIMULATE: Mumbai Dark Fiber Cut (P0 Outage)'}</span>
        </button>

        {/* Scenario 2: Predictive Anomaly */}
        <button
          onClick={onTriggerPredictive}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wide bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg shadow-amber-600/25 active:scale-95 transition"
        >
          <AlertTriangle className="w-4 h-4 text-amber-200" />
          <span>⚠️ SIMULATE: Optical Power Drift (Pre-Failure)</span>
        </button>

        {/* Scenario 3: Normal Stream */}
        <button
          onClick={onTriggerNormal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Normal Telemetry Noise</span>
        </button>
      </div>
    </div>
  );
}