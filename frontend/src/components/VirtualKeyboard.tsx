import React, { useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { useThemeStore } from '../stores/useThemeStore';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const VirtualKeyboard: React.FC = () => {
  const { session, addLetter, removeLetter, submitGuess, isSubmitting, isRevealing } = useGameStore();
  const { highContrast } = useThemeStore();

  const keyboardStatus = session?.keyboard_status || {};

  const handleKeyClick = useCallback((key: string) => {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else {
      addLetter(key);
    }
  }, [addLetter, removeLetter, submitGuess]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on an input element (e.g. login form)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        addLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addLetter, removeLetter, submitGuess]);

  const getKeyClass = (key: string) => {
    const status = keyboardStatus[key];
    const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

    let bgClass = 'bg-slate-800/90 text-slate-100 hover:bg-slate-700 active:bg-slate-600';
    let borderClass = 'border-slate-700/80';

    if (status === 'BULL') {
      bgClass = highContrast
        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
        : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30';
      borderClass = highContrast ? 'border-orange-500' : 'border-emerald-500';
    } else if (status === 'BEAR') {
      bgClass = highContrast
        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
        : 'bg-amber-600 text-white shadow-md shadow-amber-600/30';
      borderClass = highContrast ? 'border-sky-500' : 'border-amber-500';
    } else if (status === 'MISS') {
      bgClass = 'bg-slate-900/90 text-slate-500 opacity-60';
      borderClass = 'border-slate-800';
    }

    const widthClass = isSpecial ? 'px-2 sm:px-4 text-xs font-bold' : 'w-8 sm:w-10 md:w-12 text-sm sm:text-base font-bold';

    return `h-11 sm:h-12 md:h-14 rounded-lg border transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${bgClass} ${borderClass} ${widthClass}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 flex flex-col gap-1.5 sm:gap-2 pb-6">
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={`kb-row-${rIdx}`} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => (
            <button
              key={`key-${key}`}
              onClick={() => handleKeyClick(key)}
              disabled={isSubmitting || isRevealing || session?.status !== 'in_progress'}
              className={getKeyClass(key)}
            >
              {key === 'BACKSPACE' ? (
                <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : key === 'ENTER' ? (
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ENTER</span>
                </span>
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
