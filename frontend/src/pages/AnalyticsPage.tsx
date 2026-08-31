import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Flame,
  Award,
  PlayCircle,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';
import api from '../services/api';
import type { UserStatsAnalytics } from '../types/analytics';
import { useAuthStore } from '../stores/useAuthStore';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<UserStatsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get<UserStatsAnalytics>('/analytics/me');
        setData(res.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Please login to view your personal performance dashboard.');
        } else {
          setError('Failed to load performance analytics.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0e1422] border border-slate-800 rounded-2xl p-8 text-center flex flex-col gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Trader Analytics</h2>
          <p className="text-sm text-slate-400">
            Sign in to track your attempt distribution histograms, score growth charts, bull/bear accuracy rates, and game replays.
          </p>
          <Link
            to="/auth"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <UserIcon className="w-4 h-4" />
            <span>Login to Access Analytics</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <span>{error || 'No analytics data available yet.'}</span>
        </div>
      </div>
    );
  }

  const accuracyPieData = [
    { name: 'Bulls (Exact)', value: data.bull_accuracy_rate || 20, color: '#10b981' },
    { name: 'Bears (Displaced)', value: data.bear_accuracy_rate || 35, color: '#f59e0b' },
    { name: 'Misses', value: Math.max(0, 100 - (data.bull_accuracy_rate || 0) - (data.bear_accuracy_rate || 0)), color: '#334155' },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0e1422] to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-emerald-500/20">
            {data.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{data.username}</h1>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold">{data.rank_title}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Total Score: {data.total_score.toLocaleString()} PTS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Best Score: </span>
            <span className="text-emerald-400 font-bold">{data.best_score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>WIN RATE</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{data.win_rate}%</div>
          <div className="text-[10px] text-slate-500 font-mono">{data.games_won}/{data.games_played} Games</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>CURR STREAK</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-400">{data.current_streak}</div>
          <div className="text-[10px] text-slate-500 font-mono">Max: {data.max_streak}</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>AVG SOLVE</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{data.average_solve_time}s</div>
          <div className="text-[10px] text-slate-500 font-mono">Fastest: {data.fastest_win_seconds}s</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>AVG GUESSES</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{data.average_attempts || 0}</div>
          <div className="text-[10px] text-slate-500 font-mono">Out of 6 max</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span>AVG SCORE</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{data.average_score.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-mono">Per Match</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>BULL ACCURACY</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{data.bull_accuracy_rate}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Hit Precision</div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guess Distribution Histogram */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Guess Attempt Distribution</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">Wins Only</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.guess_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="attempt_number" stroke="#64748b" tickFormatter={(v) => `${v} Guesses`} />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} Wins (${item.payload.percentage}%)`, 'Count']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Trajectory Growth Line Chart */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Score Trajectory (Recent Games)</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">Last 30 Matches</span>
          </div>

          <div className="h-64 w-full">
            {data.recent_history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.recent_history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="game_number" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} PTS`, 'Final Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                Play more games to generate trajectory curves.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accuracy & Recent History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accuracy Breakdown Donut */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400" />
            <span>Accuracy Breakdown</span>
          </h2>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={accuracyPieData} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {accuracyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-mono pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Bulls ({data.bull_accuracy_rate}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Bears ({data.bear_accuracy_rate}%)</span>
            </div>
          </div>
        </div>

        {/* Recent Matches & Replay Viewer */}
        <div className="lg:col-span-2 bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Recent Match History & Replays</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">Step-by-step reviews</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Attempts</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.recent_history.map((match) => (
                  <tr key={match.game_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400">{match.date}</td>
                    <td className="py-3 px-3 uppercase font-bold text-slate-200">{match.mode}</td>
                    <td className="py-3 px-3">
                      {match.is_win ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          WON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                          LOST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">{match.attempts} / 6</td>
                    <td className="py-3 px-3">{match.time_seconds}s</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      +{match.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/replay/${match.game_id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold hover:text-white transition-colors"
                      >
                        Replay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
