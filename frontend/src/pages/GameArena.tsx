import React, { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { GameBoard } from '../components/GameBoard';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { GameTimer } from '../components/GameTimer';
import { GameOverModal } from '../components/GameModals/GameOverModal';
import { RulesModal } from '../components/GameModals/RulesModal';
import { GuestSyncModal } from '../components/GameModals/GuestSyncModal';
import { RefreshCw, Flag, AlertCircle, Layers, Calendar, Zap, Sparkles } from 'lucide-react';
import type { GameMode } from '../types/game';

export const GameArena: React.FC = () => {
  const {
    session,
    startNewGame,
    abandonGame,
    activeMode,
    setMode,
    errorMessage,
    isSubmitting,
    isRevealing,
  } = useGameStore();

  useEffect(() => {
    if (!session) {
      startNewGame(activeMode);
    }
  }, [session, activeMode, startNewGame]);

  const handleModeSwitch = (mode: GameMode) => {
    setMode(mode);
    startNewGame(mode);
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full px-2 sm:px-4 py-3">
      {/* Mobile Mode Switcher */}
      <div className="flex md:hidden items-center justify-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 gap-1 text-[11px] font-semibold mb-2">
        <button
          onClick={() => handleModeSwitch('classic')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            activeMode === 'classic'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-400'
          }`}
        >
          <Layers className="w-3 h-3" />
          Classic
        </button>
        <button
          onClick={() => handleModeSwitch('daily')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            activeMode === 'daily'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-slate-400'
          }`}
        >
          <Calendar className="w-3 h-3" />
          Daily
        </button>
        <button
          onClick={() => handleModeSwitch('blitz')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            activeMode === 'blitz'
              ? 'bg-red-600 text-white font-bold'
              : 'text-slate-400'
          }`}
        >
          <Zap className="w-3 h-3" />
          Blitz
        </button>
        <button
          onClick={() => handleModeSwitch('zen')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            activeMode === 'zen'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Zen
        </button>
      </div>

      {/* Timer Bar */}
      <GameTimer />

      {/* Error Message Toast / Alert */}
      <div className="h-6 flex items-center justify-center my-1">
        {errorMessage && (
          <div className="animate-shake flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold shadow-lg shadow-rose-950/50">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Interactive 5x6 Matrix Board */}
      <div className="flex-1 flex items-center justify-center">
        <GameBoard />
      </div>

      {/* Surrender / Reset Controls */}
      {session && session.status === 'in_progress' && (
        <div className="flex items-center justify-center gap-4 py-1">
          <button
            onClick={abandonGame}
            disabled={isSubmitting || isRevealing}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-40"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Forfeit Match</span>
          </button>

          <button
            onClick={() => startNewGame(activeMode)}
            disabled={isSubmitting || isRevealing}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-emerald-400 transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Word</span>
          </button>
        </div>
      )}

      {/* Virtual On-Screen Keyboard */}
      <VirtualKeyboard />

      {/* Modals */}
      <GameOverModal />
      <RulesModal />
      <GuestSyncModal />
    </div>
  );
};
