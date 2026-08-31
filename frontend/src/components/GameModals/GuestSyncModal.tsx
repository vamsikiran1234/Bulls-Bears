import React from 'react';
import { X, UserPlus, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../../stores/useGameStore';
import { useAuthStore } from '../../stores/useAuthStore';

export const GuestSyncModal: React.FC = () => {
  const { isGuestSyncModalOpen, setGuestSyncModalOpen } = useGameStore();
  const { guestGames } = useAuthStore();

  if (!isGuestSyncModalOpen) return null;

  const totalGuestScore = guestGames.reduce((sum, g) => sum + g.final_score, 0);
  const totalGuestWins = guestGames.filter((g) => g.status === 'won').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0e1422] border border-amber-500/50 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 flex flex-col gap-5 text-center relative">
        <button
          onClick={() => setGuestSyncModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white">Save Your Trader Progress</h2>
          <p className="text-xs text-slate-400">
            You've played <strong className="text-white">{guestGames.length} games</strong> as a Guest with <strong className="text-amber-400">{totalGuestWins} wins</strong> and <strong className="text-emerald-400">{totalGuestScore.toLocaleString()} score points</strong>!
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono text-left flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Accumulated Score:</span>
            <span className="text-emerald-400 font-bold">+{totalGuestScore.toLocaleString()} PTS</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Completed Games:</span>
            <span className="text-white font-bold">{guestGames.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to="/auth"
            onClick={() => setGuestSyncModalOpen(false)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account & Claim Stats</span>
          </Link>
          <button
            onClick={() => setGuestSyncModalOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-400 font-mono"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
