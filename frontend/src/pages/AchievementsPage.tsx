import React, { useEffect, useState } from 'react';
import {
  Award,
  Bell,
  TrendingUp,
  Crown,
  Zap,
  Target,
  Crosshair,
  ShieldAlert,
  Calendar,
  DollarSign,
  Clock,
  Shuffle,
  Flame,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import type { Achievement } from '../types/achievement';
import { useAuthStore } from '../stores/useAuthStore';

const ICON_MAP: Record<string, React.ReactNode> = {
  Bell: <Bell className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Crosshair: <Crosshair className="w-6 h-6" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  DollarSign: <DollarSign className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
  Shuffle: <Shuffle className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
};

export const AchievementsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await api.get<Achievement[]>('/achievements');
        setAchievements(res.data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [user]);

  const categories = ['all', 'milestone', 'streak', 'speed', 'accuracy', 'score'];

  const filtered = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Header Showcase */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0e1422] to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Trader Achievements</h1>
            <p className="text-xs text-slate-400 font-mono">
              Milestone badges, streak trophies, and precision solver honors.
            </p>
          </div>
        </div>

        {/* Progress Metric */}
        <div className="w-full sm:w-64 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Completion:</span>
            <span className="text-amber-400 font-bold">{unlockedCount} / {achievements.length} Badges ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => {
            const isUnlocked = ach.unlocked;
            return (
              <div
                key={ach.code}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#0e1422] to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {ICON_MAP[ach.icon_name] || <Award className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white leading-tight">{ach.title}</h3>
                      {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] font-mono">
                  <span className="text-amber-400 font-bold">+{ach.points} Points</span>
                  {isUnlocked ? (
                    <span className="text-emerald-400">Unlocked</span>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
