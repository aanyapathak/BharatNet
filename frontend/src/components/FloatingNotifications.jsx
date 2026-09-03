import React from "react";
import { AlertOctagon, CheckCircle2, BookOpen, ShieldAlert, X } from "lucide-react";

export default function FloatingNotifications({ notifications = [], onDismiss }) {
  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-auto">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur flex items-start justify-between gap-3 text-xs transition-all duration-300 animate-slide-in ${
            notif.type === "RECOVERY"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : notif.type === "ROOT_CAUSE"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-slate-900/90 border-sky-500/50 text-slate-100"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notif.type === "RECOVERY" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : notif.type === "ROOT_CAUSE" ? (
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <BookOpen className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-white text-[12px]">{notif.title}</div>
              <p className="text-[11px] text-slate-300 mt-0.5">{notif.message}</p>
            </div>
          </div>

          <button
            onClick={() => onDismiss(notif.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}