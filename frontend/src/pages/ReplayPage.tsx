import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Trophy, TrendingDown, Clock, Target } from 'lucide-react';
import api from '../services/api';
import type { GameReplay } from '../types/analytics';
import { Tile } from '../components/Tile';

export const ReplayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [replay, setReplay] = useState<GameReplay | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReplay = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const res = await api.get<GameReplay>(`/analytics/replay/${sessionId}`);
        setReplay(res.data);
        setCurrentStep(res.data.moves.length); // Start at final state
      } catch (err: any) {
        setError('Failed to load game replay.');
      } finally {
        setLoading(false);
      }
    };

    fetchReplay();
  }, [sessionId]);

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && replay) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= replay.moves.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replay]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !replay) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-rose-400 font-mono">{error || 'Replay not found.'}</div>
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-mono text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
        </button>
      </div>
    );
  }

  const isWin = replay.status === 'won';
  const visibleMoves = replay.moves.slice(0, currentStep);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Target Word:</span>
          <span className="text-emerald-400 font-black text-sm tracking-widest bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            {replay.target_word}
          </span>
        </div>
      </div>

      {/* Match Outcome Card */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isWin
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {isWin ? <Trophy className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isWin ? 'Cracked Successfully' : 'Unsolved Match'}
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>{replay.mode.toUpperCase()} MODE</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">+{replay.final_score.toLocaleString()} PTS</span>
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          <div>Step {currentStep} of {replay.moves.length}</div>
          <div className="text-[11px] text-slate-500">Duration: {replay.time_elapsed_seconds}s</div>
        </div>
      </div>

      {/* Replay Board Matrix */}
      <div className="flex flex-col gap-2 items-center justify-center py-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-6">
        {Array.from({ length: 6 }).map((_, rIdx) => {
          if (rIdx < visibleMoves.length) {
            const m = visibleMoves[rIdx];
            return (
              <div key={`replay-row-${rIdx}`} className="flex items-center gap-3">
                <div className="flex gap-2">
                  {m.feedback.map((fb, cIdx) => (
                    <Tile key={`replay-tile-${rIdx}-${cIdx}`} letter={fb.letter} status={fb.status} />
                  ))}
                </div>
                <div className="w-20 text-[10px] font-mono flex flex-col pl-2">
                  <span className="text-emerald-400 font-bold">🐂 {m.bulls_count} Bull</span>
                  <span className="text-amber-400 font-bold">🐻 {m.bears_count} Bear</span>
                </div>
              </div>
            );
          } else {
            return (
              <div key={`replay-row-empty-${rIdx}`} className="flex items-center gap-3 opacity-30">
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((cIdx) => (
                    <Tile key={`replay-empty-${rIdx}-${cIdx}`} letter="" />
                  ))}
                </div>
                <div className="w-20 text-[10px] font-mono text-slate-700 pl-2">
                  Row #{rIdx + 1}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Playback Controls Scrubber */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(0)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Reset to beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(replay.moves.length, prev + 1))}
            disabled={currentStep >= replay.moves.length}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Move {currentStep} / {replay.moves.length}
        </div>
      </div>
    </div>
  );
};
