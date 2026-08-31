import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  BarChart2,
  Award,
  User as UserIcon,
  LogOut,
  Zap,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSoundStore } from '../stores/useSoundStore';
import { useGameStore } from '../stores/useGameStore';
import type { GameMode } from '../types/game';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { soundEnabled, toggleSound } = useSoundStore();
  const { activeMode, setMode, startNewGame, setRulesModalOpen } = useGameStore();

  const handleModeChange = (mode: GameMode) => {
    setMode(mode);
    startNewGame(mode);
  };

  const isGamePage = location.pathname === '/';

  return (
    <header className="w-full bg-[#0a0e17]/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      {/* Live Financial Ticker Bar */}
      <div className="bg-[#05080f] border-b border-slate-800/80 px-4 py-1 overflow-hidden text-xs font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-300 font-semibold uppercase tracking-wider">MARKET LIVE</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-3/4">
          <div className="ticker-scroll flex items-center gap-8">
            <span className="text-emerald-400">🐂 BULLS: +14.8% (EXACT HIT)</span>
            <span className="text-amber-400">🐻 BEARS: +6.2% (DISPLACED)</span>
            <span className="text-slate-400">INDEX: 5-LETTER VOCABULARY</span>
            <span className="text-emerald-400">DAILY DIVIDEND: 75 PTS</span>
            <span className="text-amber-400">SPEED BONUS: UP TO +1,500 PTS</span>
            <span className="text-emerald-400">TOP STREAK: 20x MULTIPLIER</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center font-black text-lg tracking-tighter">
              <span className="text-emerald-400">B</span>
              <span className="text-amber-400">&</span>
              <span className="text-emerald-400">B</span>
            </div>
          </div>
          <div>
            <div className="font-extrabold tracking-wide text-base sm:text-lg flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
                BULLS & BEARS
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">
              Word Puzzle Terminal
            </div>
          </div>
        </Link>

        {/* Game Mode Selector (Visible on Game Arena) */}
        {isGamePage && (
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 text-xs font-semibold">
            <button
              onClick={() => handleModeChange('classic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'classic'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Classic
            </button>
            <button
              onClick={() => handleModeChange('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'daily'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Daily Market
            </button>
            <button
              onClick={() => handleModeChange('blitz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'blitz'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Blitz (90s)
            </button>
            <button
              onClick={() => handleModeChange('zen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'zen'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Zen
            </button>
          </div>
        )}

        {/* Right Action Icons & User Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Links */}
          <Link
            to="/leaderboard"
            className={`p-2 rounded-lg border transition-colors ${
              location.pathname === '/leaderboard'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </Link>

          <Link
            to="/analytics"
            className={`p-2 rounded-lg border transition-colors ${
              location.pathname === '/analytics'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Performance Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </Link>

          <Link
            to="/achievements"
            className={`p-2 rounded-lg border transition-colors ${
              location.pathname === '/achievements'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Achievements"
          >
            <Award className="w-4 h-4" />
          </Link>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Rules / Help */}
          <button
            onClick={() => setRulesModalOpen(true)}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-none">{user.username}</div>
                  <div className="text-[10px] font-mono text-emerald-400 leading-tight">{user.rank_title}</div>
                </div>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
