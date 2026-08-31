import React from 'react';
import type { FeedbackStatus } from '../types/game';
import { useThemeStore } from '../stores/useThemeStore';

interface TileProps {
  letter?: string;
  status?: FeedbackStatus | null;
  isCurrent?: boolean;
  revealIndex?: number;
  isRevealing?: boolean;
}

export const Tile: React.FC<TileProps> = ({
  letter = '',
  status = null,
  isCurrent = false,
  revealIndex = 0,
  isRevealing = false,
}) => {
  const { highContrast } = useThemeStore();

  const hasLetter = letter.trim().length > 0;

  // Base styling
  let bgClass = 'bg-[#0f172a]/60';
  let borderClass = 'border-slate-700/60 text-slate-100';
  let animationClass = '';
  let style: React.CSSProperties = {};

  if (isRevealing && status) {
    // When flipping row
    style = { animationDelay: `${revealIndex * 280}ms` };
    if (status === 'BULL') animationClass = 'animate-flip-bull';
    else if (status === 'BEAR') animationClass = 'animate-flip-bear';
    else animationClass = 'animate-flip-miss';
  } else if (status === 'BULL') {
    bgClass = highContrast ? 'bg-orange-600' : 'bg-emerald-600';
    borderClass = highContrast ? 'border-orange-500 text-white shadow-lg shadow-orange-500/30' : 'border-emerald-500 text-white shadow-lg shadow-emerald-500/30';
  } else if (status === 'BEAR') {
    bgClass = highContrast ? 'bg-sky-600' : 'bg-amber-600';
    borderClass = highContrast ? 'border-sky-500 text-white shadow-lg shadow-sky-500/30' : 'border-amber-500 text-white shadow-lg shadow-amber-500/30';
  } else if (status === 'MISS') {
    bgClass = 'bg-slate-800/80';
    borderClass = 'border-slate-700 text-slate-400';
  } else if (hasLetter && isCurrent) {
    bgClass = 'bg-slate-800/50';
    borderClass = 'border-emerald-500/80 text-white';
    animationClass = 'animate-pop';
  }

  return (
    <div
      style={style}
      className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border-2 font-black text-xl sm:text-2xl md:text-3xl flex items-center justify-center transition-colors uppercase select-none ${bgClass} ${borderClass} ${animationClass}`}
    >
      {letter}
    </div>
  );
};
