import React, { useState, useEffect } from "react";
import { Activity, Radio, RefreshCw, Sun, Moon, Clock, ShieldCheck } from "lucide-react";

export default function NocNavbar({ systemState, isConnected, onReset, isDarkMode, onToggleTheme }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }) + " IST");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/40">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              BHARATNET AIOps NOC COMMANDER
            </h1>
            <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Autonomous Core
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Mumbai Metro Core Circle · Physical Layer & Routing Control Plane
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live IST Clock */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{timeStr}</span>
        </div>

        {/* State Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold ${
          ["STORM", "CORRELATING", "ROOT_CAUSE"].includes(systemState)
            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
            : systemState === "PREDICTIVE"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        }`}>
          <Radio className="w-3.5 h-3.5" />
          <span>STATE: {systemState}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Toggle Dark / Light Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-300" />}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          title="Reset Incidents & Trackers"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
}