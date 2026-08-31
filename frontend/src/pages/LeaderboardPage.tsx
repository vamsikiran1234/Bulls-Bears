import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Target, TrendingUp, Search, Crown } from 'lucide-react';
import api from '../services/api';
import type { LeaderboardResponse } from '../types/leaderboard';
import { useAuthStore } from '../stores/useAuthStore';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [period, setPeriod] = useState<string>('all_time');
  const [sortBy, setSortBy] = useState<string>('total_score');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get<LeaderboardResponse>(`/leaderboard?period=${period}&sort_by=${sortBy}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period, sortBy, user]);

  const filteredEntries = data?.entries.filter((entry) =>
    entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.display_name && entry.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0e1422] to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Global Leaderboard</h1>
            <p className="text-xs text-slate-400 font-mono">
              The Wall Street Hall of Fame. Top traders and solver prodigies.
            </p>
          </div>
        </div>

        {/* User Rank Chip if ranked */}
        {data?.user_rank && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Your Global Rank: #{data.user_rank}</span>
          </div>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Period Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono font-bold">
          {['all_time', 'weekly', 'daily'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg uppercase transition-all ${
                period === p
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search trader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Metric Sorting */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Rank By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="total_score">Total Score</option>
            <option value="win_rate">Win Rate (%)</option>
            <option value="current_streak">Current Streak</option>
            <option value="best_score">Best Score</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500">
            No traders found on the leaderboard yet. Play games to claim the #1 spot!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Trader</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-right">Best Score</th>
                  <th className="py-3 px-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredEntries.map((entry) => {
                  const isCurrentUser = user && user.id === entry.user_id;
                  return (
                    <tr
                      key={entry.user_id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrentUser ? 'bg-emerald-950/20 border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 font-bold">
                        {entry.rank === 1 ? (
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-black font-black">
                            1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-black font-black">
                            2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-2">#{entry.rank}</span>
                        )}
                      </td>

                      {/* Trader Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white uppercase">
                            {entry.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{entry.username}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                            {entry.display_name && (
                              <div className="text-[10px] text-slate-500">{entry.display_name}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rank Title */}
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-semibold">{entry.rank_title}</span>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={entry.win_rate >= 70 ? 'text-emerald-400' : 'text-slate-300'}>
                          {entry.win_rate}%
                        </span>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {entry.games_won}/{entry.games_played}
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-400 font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{entry.current_streak}</span>
                        </div>
                      </td>

                      {/* Best Score */}
                      <td className="py-3.5 px-4 text-right text-slate-300">
                        {entry.best_score.toLocaleString()}
                      </td>

                      {/* Total Score */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-black text-amber-400">
                          {entry.total_score.toLocaleString()} PTS
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
