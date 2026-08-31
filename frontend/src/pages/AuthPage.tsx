import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, guestGames, user } = useAuthStore();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // If already logged in, redirect to game arena
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (!email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        await register(username, email, password, displayName || undefined);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const guestScore = guestGames.reduce((sum, g) => sum + g.final_score, 0);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e1422] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-xl font-black text-black shadow-lg shadow-emerald-500/20">
            🐂
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isLogin ? 'Trader Sign In' : 'Join the Trading Floor'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {isLogin ? 'Access your performance analytics & global rank' : 'Create an account & track your puzzle portfolio'}
          </p>
        </div>

        {/* Guest Progress Alert */}
        {guestGames.length > 0 && !isLogin && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-300 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
            <span>
              Your <strong className="text-white">{guestGames.length} guest games</strong> (+{guestScore.toLocaleString()} PTS) will be automatically claimed!
            </span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isLogin ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isLogin ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username / Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-slate-400">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'trader_pro / email' : 'bullish_solver'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Email (only on Register) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@wallstreet.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Display Name (Optional on Register) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-400">Display Name (Optional)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Market Maker"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-slate-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Terminal' : 'Create Trader Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
