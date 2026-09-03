import React from 'react';
import { PhoneCall, ShieldAlert, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react';

export default function EscalationChain({ incident }) {
  if (!incident || !incident.escalation_log) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Autonomous Notification Chain & On-Call Escalation
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Step {incident.current_escalation_step} of 3 Triggered
        </span>
      </div>

      <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {incident.escalation_log.map((notif, idx) => (
          <div key={idx} className="relative text-xs">
            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-slate-900" />
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-slate-200">
                  Step {notif.step}: {notif.role} ({notif.contact})
                </span>
                <span className="text-[10px] font-mono text-slate-400">{notif.formatted_time}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                {notif.action_required}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {notif.channels.map((ch, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 text-[10px] font-mono border border-slate-700">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}