import React from 'react';
import { X, HelpCircle, TrendingUp, TrendingDown, Target, Zap, Trophy, ShieldCheck } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';

export const RulesModal: React.FC = () => {
  const { isRulesModalOpen, setRulesModalOpen } = useGameStore();

  if (!isRulesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0e1422] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>How to Play Bulls & Bears</span>
          </div>
          <button
            onClick={() => setRulesModalOpen(false)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Objective */}
        <div className="flex flex-col gap-1.5 text-sm">
          <h3 className="text-white font-bold text-base flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>The Objective</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Identify the hidden <strong className="text-white">5-letter secret word</strong> in 6 attempts or fewer before the timer expires. Every valid guess provides real-time market feedback.
          </p>
        </div>

        {/* Feedback Rules */}
        <div className="flex flex-col gap-3 text-sm">
          <h3 className="text-white font-bold text-base">Market Feedback Rules</h3>

          {/* Bull Example */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 border border-emerald-500 font-black text-white text-xl flex items-center justify-center shrink-0">
              T
            </div>
            <div>
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <span>🐂 BULL (Exact Hit)</span>
              </div>
              <p className="text-xs text-slate-400">
                The letter <strong className="text-white">T</strong> is in the target word and in the <strong className="text-emerald-400">exact correct spot</strong>.
              </p>
            </div>
          </div>

          {/* Bear Example */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600 border border-amber-500 font-black text-white text-xl flex items-center justify-center shrink-0">
              R
            </div>
            <div>
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <span>🐻 BEAR (Displaced)</span>
              </div>
              <p className="text-xs text-slate-400">
                The letter <strong className="text-white">R</strong> exists in the target word, but is in the <strong className="text-amber-400">wrong position</strong>.
              </p>
            </div>
          </div>

          {/* Miss Example */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 font-black text-slate-400 text-xl flex items-center justify-center shrink-0">
              X
            </div>
            <div>
              <div className="font-bold text-slate-400">
                <span>MISS (Off-Market)</span>
              </div>
              <p className="text-xs text-slate-400">
                The letter <strong className="text-white">X</strong> is not in the target word at any unused position.
              </p>
            </div>
          </div>
        </div>

        {/* Duplicate Letters Rule */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex flex-col gap-1">
          <span className="font-bold text-slate-200 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Duplicate Letter Handling
          </span>
          <p>
            If the target word has one 'E' (e.g. CRANE) and your guess has two 'E's (e.g. SPEED), only one 'E' will be marked as Bull/Bear. The other is marked as a Miss to prevent false counts!
          </p>
        </div>

        {/* Financial Scoring */}
        <div className="flex flex-col gap-2 text-sm">
          <h3 className="text-white font-bold text-base flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Scoring & Multipliers</span>
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-400 flex flex-col gap-1">
            <li><strong className="text-white">Base Win Dividend:</strong> 1,000 Points</li>
            <li><strong className="text-white">Attempt Efficiency:</strong> +250 Points per unused attempt</li>
            <li><strong className="text-white">Time Alpha Bonus:</strong> +15 Points per remaining second</li>
            <li><strong className="text-white">Streak Multiplier:</strong> +5% score bonus per game streak (up to 2.0x!)</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setRulesModalOpen(false)}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20"
        >
          Got It, Start Trading!
        </button>
      </div>
    </div>
  );
};
