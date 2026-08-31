import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Award, Flame, Zap, Shield, Save, Check, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const AVATAR_OPTIONS = [
  { id: 'bull-1', label: 'Emerald Bull', emoji: '🐂', color: 'from-emerald-500 to-teal-500' },
  { id: 'bear-1', label: 'Golden Bear', emoji: '🐻', color: 'from-amber-500 to-orange-500' },
  { id: 'bull-2', label: 'Cyber Bull', emoji: '🚀', color: 'from-cyan-500 to-blue-500' },
  { id: 'trader-1', label: 'Floor Trader', emoji: '📈', color: 'from-purple-500 to-indigo-500' },
  { id: 'titan-1', label: 'Wall Street Titan', emoji: '👑', color: 'from-yellow-400 to-amber-600' },
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_seed || 'bull-1');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(displayName, selectedAvatar);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Rank progression targets
  const rankLevels = [
    { title: 'Novice Trader', minScore: 0 },
    { title: 'Junior Analyst', minScore: 2000 },
    { title: 'Floor Trader', minScore: 5000 },
    { title: 'Senior Portfolio Manager', minScore: 10000 },
    { title: 'Hedge Fund Titan', minScore: 25000 },
    { title: 'Market Maker', minScore: 50000 },
  ];

  const currentScore = user.total_score || 0;
  const nextRank = rankLevels.find((r) => r.minScore > currentScore) || rankLevels[rankLevels.length - 1];
  const prevRank = [...rankLevels].reverse().find((r) => r.minScore <= currentScore) || rankLevels[0];
  const rankProgress = nextRank.minScore === prevRank.minScore
    ? 100
    : Math.min(100, Math.round(((currentScore - prevRank.minScore) / (nextRank.minScore - prevRank.minScore)) * 100));

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0e1422] to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
            {AVATAR_OPTIONS.find((a) => a.id === user.avatar_seed)?.emoji || '🐂'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user.username}</h1>
            <div className="text-xs font-mono text-emerald-400 font-bold">{user.rank_title}</div>
            <div className="text-[11px] font-mono text-slate-500">{user.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-mono transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Rank Progression Bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">Current Rank: <strong className="text-emerald-400">{user.rank_title}</strong></span>
          <span className="text-slate-400">Next Target: <strong className="text-amber-400">{nextRank.title} ({nextRank.minScore.toLocaleString()} PTS)</strong></span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${rankProgress}%` }}
          />
        </div>
        <div className="text-right text-[10px] font-mono text-slate-500">
          {currentScore.toLocaleString()} / {nextRank.minScore.toLocaleString()} PTS ({rankProgress}%)
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            TOTAL SCORE
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">{user.total_score.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            BEST STREAK
          </span>
          <span className="text-xl font-black text-orange-400 font-mono">{user.max_streak} Wins</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            FASTEST SOLVE
          </span>
          <span className="text-xl font-black text-blue-400 font-mono">{user.fastest_win_seconds || 0}s</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            WIN RATE
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono">{user.win_rate}%</span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <h2 className="text-base font-bold text-white">Customization & Profile Settings</h2>

        {/* Display Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-slate-400">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. WallStreetWolf"
            maxLength={30}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Avatar Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-slate-400">Trader Avatar Seed</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {AVATAR_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setSelectedAvatar(opt.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedAvatar === opt.id
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[10px] font-mono text-slate-300">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Profile Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
