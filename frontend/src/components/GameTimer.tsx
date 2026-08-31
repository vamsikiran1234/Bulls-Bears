import React, { useEffect } from 'react';
import { Clock, AlertTriangle, Infinity } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';

export const GameTimer: React.FC = () => {
  const { session, timeRemaining, timerActive, tickTimer } = useGameStore();

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, tickTimer]);

  if (!session) return null;

  if (session.mode === 'zen') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-blue-400">
        <Infinity className="w-4 h-4" />
        <span>Zen Mode (Untimed)</span>
      </div>
    );
  }

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isDanger = timeRemaining <= 20 && timeRemaining > 0;
  const isExpired = timeRemaining === 0;

  const totalLimit = session.time_limit_seconds || 120;
  const percentLeft = Math.max(0, Math.min(100, (timeRemaining / totalLimit) * 100));

  let colorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
  let barColor = 'bg-emerald-500';

  if (isDanger) {
    colorClass = 'text-rose-400 border-rose-500/60 bg-rose-950/30 animate-pulse';
    barColor = 'bg-rose-500';
  } else if (timeRemaining <= 45) {
    colorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-1.5 px-4">
      <div className={`flex items-center justify-between px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-sm ${colorClass}`}>
        <div className="flex items-center gap-1.5">
          {isDanger ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span>TIME REMAINING</span>
        </div>
        <span className="text-sm tracking-wider">{isExpired ? 'EXPIRED' : formatted}</span>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${barColor}`}
          style={{ width: `${percentLeft}%` }}
        />
      </div>
    </div>
  );
};
