import React, { useState } from "react";
import { BookOpen, Zap, Lock, Terminal, CheckCircle2, ThumbsUp, ThumbsDown, ArrowRight, ShieldCheck, Activity, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function RunbookEngine({ incident, onExecuteAction, onSubmitFeedback, isResolved }) {
  const [activeStep, setActiveStep] = useState(3);
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    "[T+00:00:02] Autonomous Runbook RB-014 matched (91% Confidence)",
    "[T+00:00:04] Step 1: Optical diagnostic SFP28 loopback self-test ... [PASSED]",
    "[T+00:00:06] Step 2: BGP soft-reconfiguration refresh ... [PASSED]"
  ]);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const steps = [
    { num: 1, title: "Verify optical transceiver & uplink status", status: "DONE" },
    { num: 2, title: "Confirm BGP & OSPF neighbor adjacency", status: "DONE" },
    { num: 3, title: "Autonomous optical ring failover to CS-MUM-02", status: isResolved ? "DONE" : "ACTIVE" },
    { num: 4, title: "Verify downstream VoLTE & UPI traffic clearance", status: isResolved ? "DONE" : "PENDING" }
  ];

  const handleAutoExecuteTier1 = async () => {
    setIsExecuting(true);
    setTerminalLogs(prev => [
      ...prev,
      `[T+${new Date().toLocaleTimeString()}] Executing Tier-1 Safe Action: diagnostic port bounce & flap reset...`,
      `[T+${new Date().toLocaleTimeString()}] ReturnCode=0, Status=HEALTHY. Telemetry verified.`
    ]);
    if (incident && incident.runbook?.tier1_actions?.[0]) {
      await onExecuteAction(incident.incident_id, incident.runbook.tier1_actions[0].id, true);
    }
    setIsExecuting(false);
  };

  const handleApproveTier2 = async () => {
    setIsExecuting(true);
    setTerminalLogs(prev => [
      ...prev,
      `[T+${new Date().toLocaleTimeString()}] Engineer Approval Granted. Initiating Ring B Reroute...`,
      `[T+${new Date().toLocaleTimeString()}] Committing MPLS Fast-Reroute via CS-MUM-02...`,
      `[T+${new Date().toLocaleTimeString()}] Optical Carrier Synchronized! Network Recovered 100%.`
    ]);
    setActiveStep(4);
    if (incident && incident.runbook?.tier2_actions?.[0]) {
      await onExecuteAction(incident.incident_id, incident.runbook.tier2_actions[0].id, false);
    }
    setIsExecuting(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  const handleFeedback = (rating) => {
    setFeedbackGiven(rating);
    if (onSubmitFeedback && incident) {
      onSubmitFeedback(incident.incident_id, "RB-014", rating);
    }
  };

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 backdrop-blur flex flex-col h-full ${
      isResolved
        ? "bg-emerald-950/20 border-emerald-500/40"
        : "bg-slate-900/90 border-slate-800 shadow-2xl"
    }`}>
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-sky-400">RUNBOOK RB-014</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Uplink & BGP Recovery
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
              RECOMMENDED ACTION: Mumbai Fiber Shearing Response
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-right font-mono">
          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
            isResolved
              ? "bg-emerald-500 text-slate-950"
              : isExecuting
              ? "bg-amber-500 text-slate-950 animate-pulse"
              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
          }`}>
            {isResolved ? "RUNBOOK COMPLETE ✓" : isExecuting ? "RUNBOOK IN PROGRESS..." : "READY TO EXECUTE"}
          </span>
        </div>
      </div>

      {/* 2. 4-Step Remediation Progress */}
      <div className="mt-4 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Remediation Procedure Steps:
        </div>
        {steps.map((step) => {
          const isDone = step.status === "DONE";
          const isActive = step.status === "ACTIVE" && !isResolved;
          return (
            <div
              key={step.num}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                isDone
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : isActive
                  ? "bg-sky-950/30 border-sky-500/40 text-white ring-1 ring-sky-500/30"
                  : "bg-slate-950/40 border-slate-800/80 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                  isDone ? "bg-emerald-500 text-slate-950" : isActive ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}>
                  {isDone ? "✓" : step.num}
                </span>
                <span className="font-semibold">{step.title}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {isDone ? "VERIFIED" : isActive ? "IN PROGRESS" : "QUEUED"}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Action Execution Buttons */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleAutoExecuteTier1}
          disabled={isResolved || isExecuting}
          className={`p-3 rounded-lg font-bold text-xs tracking-wide transition active:scale-95 flex items-center justify-center gap-2 ${
            isResolved
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-sky-500/20"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>AUTO-EXECUTE SAFE STEPS</span>
        </button>

        <button
          onClick={handleApproveTier2}
          disabled={isResolved || isExecuting}
          className={`p-3 rounded-lg font-bold text-xs tracking-wide transition active:scale-95 flex items-center justify-center gap-2 ${
            isResolved
              ? "bg-emerald-600 text-white font-bold cursor-default"
              : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{isResolved ? "✓ FAILOVER COMMITTED" : "REQUEST / APPROVE FAILOVER"}</span>
        </button>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 text-center font-sans">
        Safe diagnostic actions can run automatically. Network-changing actions require human approval.
      </div>

      {/* 4. Live CLI Execution Logs */}
      <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 font-mono text-[10px] text-sky-400 space-y-1 overflow-y-auto max-h-24">
        <div className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Terminal Execution Stream:</div>
        {terminalLogs.map((log, i) => (
          <div key={i} className="leading-tight text-slate-300">
            {log}
          </div>
        ))}
      </div>

      {/* 5. Feedback Loop */}
      <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">Was this runbook accurate?</span>
        <div className="flex items-center gap-2">
          {feedbackGiven ? (
            <span className="text-emerald-400 font-medium text-[11px]">✓ Feedback logged</span>
          ) : (
            <>
              <button
                onClick={() => handleFeedback("thumbs_up")}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback("thumbs_down")}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
