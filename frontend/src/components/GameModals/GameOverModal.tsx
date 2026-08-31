import React, { useState } from 'react';
import { Trophy, TrendingDown, RefreshCw, Share2, Check, ArrowRight, Award, Zap } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Link } from 'react-router-dom';

export const GameOverModal: React.FC = () => {
  const { session, isGameOverModalOpen, setGameOverModalOpen, startNewGame, activeMode } = useGameStore();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  if (!isGameOverModalOpen || !session || session.status === 'in_progress') return null;

  const isWin = session.status === 'won';
  const scoreBreakdown = session.score_breakdown;

  // Generate Shareable Emoji Grid
  const handleShare = () => {
    let shareText = `🐂 BULLS & BEARS #${session.daily_date || 'PUZZLE'}\n`;
    shareText += `Mode: ${session.mode.toUpperCase()} | Score: ${session.final_score.toLocaleString()}\n`;
    shareText += `Result: ${isWin ? `Won in ${session.attempts_used}/${session.max_attempts}` : 'Unsolved'}\n\n`;

    session.moves.forEach((m) => {
      m.feedback.forEach((fb) => {
        if (fb.status === 'BULL') shareText += '🟩';
        else if (fb.status === 'BEAR') shareText += '🟨';
        else shareText += '⬛';
      });
      shareText += '\n';
    });

    shareText += '\nPlay Bulls & Bears: Modern Word Puzzle Platform';

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0e1422] border border-slate-700/80 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10 flex flex-col gap-5 text-center relative overflow-hidden">
        {/* Glow Header Background */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isWin ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isWin
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-rose-500/30'
            }`}
          >
            {isWin ? <Trophy className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isWin ? 'BULL MARKET RALLY!' : 'BEARISH CRASH!'}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {isWin
              ? `Target word successfully cracked in ${session.attempts_used} attempts!`
              : 'Max attempts exhausted or timer expired.'}
          </p>
        </div>

        {/* Target Word Showcase */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1 items-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            TARGET WORD WAS
          </span>
          <span className="text-2xl font-black tracking-widest text-emerald-400 font-mono">
            {session.target_word || '*****'}
          </span>
        </div>

        {/* Financial Score Breakdown */}
        {scoreBreakdown && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-left flex flex-col gap-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1.5 font-sans font-bold">
              <span>FINANCIAL SCORE SHEET</span>
              <span className="text-emerald-400">TOTAL: {session.final_score.toLocaleString()} PTS</span>
            </div>

            {isWin && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span>Base Dividend:</span>
                  <span className="text-white">+{scoreBreakdown.base_points}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Attempt Efficiency:</span>
                  <span className="text-emerald-400">+{scoreBreakdown.attempt_bonus}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Time Alpha Bonus:</span>
                  <span className="text-emerald-400">+{scoreBreakdown.time_bonus}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-slate-300">
              <span>Accuracy Bonus:</span>
              <span className="text-amber-400">+{scoreBreakdown.accuracy_bonus}</span>
            </div>

            {scoreBreakdown.streak_multiplier > 1 && (
              <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                <span>Streak Multiplier:</span>
                <span>{scoreBreakdown.streak_multiplier}x</span>
              </div>
            )}
          </div>
        )}

        {/* Guest conversion banner if not logged in */}
        {!user && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-center justify-between gap-2">
            <span>Login or register to save your score to the global leaderboard!</span>
            <Link
              to="/auth"
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shrink-0"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Actions Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied Grid!' : 'Share Result'}</span>
          </button>

          <button
            onClick={() => startNewGame(activeMode)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Next Puzzle</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setGameOverModalOpen(false)}
          className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors"
        >
          Review Board
        </button>
      </div>
    </div>
  );
};
