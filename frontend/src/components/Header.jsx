import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Radio, RefreshCw, Cpu, Database } from 'lucide-react';

export default function Header({ systemMode, isConnected, onReset, activeIncidentsCount }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/40">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-transparent">
              BHARATNET AIOps NOC COMMANDER
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Autonomous v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            National Telecom Infrastructure • West Zone & Mumbai Metro Core Circle
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          <span className="text-slate-300 font-medium">
            {isConnected ? 'Telemetry Stream Live' : 'Connecting...'}
          </span>
        </div>

        {/* Operational Mode Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold ${
          systemMode === 'STORM' 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
            : systemMode === 'PREDICTIVE'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          <Radio className="w-3.5 h-3.5" />
          <span>MODE: {systemMode}</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{timeStr}</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700 text-xs font-medium transition"
          title="Reset Incidents & Metrics to Pristine Baseline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
}