import React, { useState } from 'react';
import { BookOpen, Zap, Lock, Terminal, CheckCircle2, ThumbsUp, ThumbsDown, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RunbookPanel({ incident, onExecuteAction, onSubmitFeedback }) {
  const [activeTab, setActiveTab] = useState('ACTIONS'); // ACTIONS, LOGS
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!incident || !incident.runbook) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500 text-xs h-full">
        <BookOpen className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
        <span>Runbook matching active. Select an active incident to view recommended remediation playbooks.</span>
      </div>
    );
  }

  const rb = incident.runbook;
  const isResolved = incident.status === 'RESOLVED';

  const handleExecute = async (actionId, isTier1) => {
    setIsExecuting(true);
    await onExecuteAction(incident.incident_id, actionId, isTier1);
    setIsExecuting(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleFeedback = (rating) => {
    setFeedbackGiven(rating);
    onSubmitFeedback(incident.incident_id, rb.runbook_id, rating);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col h-full backdrop-blur">
      {/* Title & Confidence Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-sky-400">{rb.runbook_id}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {rb.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">{rb.title}</h3>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 font-mono">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Runbook Match</div>
            <div className="text-sm font-bold text-emerald-400">{rb.confidence_pct}% Match</div>
          </div>
        </div>
      </div>

      {/* Match reasoning */}
      <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
        <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
          Match Reasoning:
        </div>
        {rb.match_reasons.map((r, i) => (
          <div key={i} className="flex items-start gap-1.5 text-slate-300 font-mono">
            <span className="text-sky-400">↳</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* Action Tiers */}
      <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
        {/* Tier 1: Autonomous Safe Actions */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              Tier 1: Autonomous Remediation (Zero-Touch)
            </span>
            <span className="text-[10px] text-slate-500">Auto-Executable</span>
          </div>

          <div className="space-y-2">
            {rb.tier1_actions.map((act) => {
              const done = act.status === 'COMPLETED';
              return (
                <div
                  key={act.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                    done
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{act.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Command: <code className="text-sky-300">{act.command}</code> (~{act.est_seconds}s)
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecute(act.id, true)}
                    disabled={done || isExecuting}
                    className={`px-3 py-1.5 rounded-md font-bold text-xs tracking-wide transition active:scale-95 ${
                      done
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                    }`}
                  >
                    {done ? '✓ Executed' : '⚡ Auto-Execute'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Human-in-the-Loop Gated Approval */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Tier 2: Gated Failover (Human-In-The-Loop)
            </span>
            <span className="text-[10px] text-amber-500/80">Approval Required</span>
          </div>

          <div className="space-y-2">
            {rb.tier2_actions.map((act) => {
              const done = act.status === 'COMPLETED';
              return (
                <div
                  key={act.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                    done
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-slate-200 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-amber-200">{act.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Command: <code className="text-amber-300">{act.command}</code> (~{act.est_seconds}s)
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecute(act.id, false)}
                    disabled={done || isExecuting}
                    className={`px-3 py-1.5 rounded-md font-bold text-xs tracking-wide transition active:scale-95 ${
                      done
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {done ? '✓ Approved & Run' : '🔐 Approve & Execute'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operator Thumbs Up / Thumbs Down Feedback Loop */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Was this runbook recommendation accurate?</span>
        <div className="flex items-center gap-2">
          {feedbackGiven ? (
            <span className="text-emerald-400 font-medium text-[11px]">
              ✓ Feedback logged to tune ML weights
            </span>
          ) : (
            <>
              <button
                onClick={() => handleFeedback('thumbs_up')}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
                title="Helpful recommendation"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback('thumbs_down')}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition"
                title="Not helpful / inaccurate"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}