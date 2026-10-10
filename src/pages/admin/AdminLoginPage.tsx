import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, loginAsDemoAdmin, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@salalakartzone.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  if (isAuthenticated && isAdmin) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      // Role will be updated in context
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid admin credentials or insufficient privileges.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl text-white space-y-6">
        <div className="text-center space-y-3">
          <div className="bg-white/95 p-3 rounded-2xl inline-block shadow-md">
            <BrandLogo size="md" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-wider">
              Staff Portal
            </span>
            <h1 className="font-brand font-black text-2xl text-white mt-2">
              Staff & Admin Authentication
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized personnel only. Access is monitored and logged.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-900/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@salalakartzone.com"
                className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-900 border border-slate-700 focus:outline-pink-500 text-white placeholder-slate-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-900 border border-slate-700 focus:outline-pink-500 text-white placeholder-slate-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? <span>Authenticating...</span> : <span>Enter Admin Dashboard</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Admin Button */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Evaluation Access
          </p>
          <button
            type="button"
            onClick={() => {
              loginAsDemoAdmin();
              navigate('/admin/dashboard', { replace: true });
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Instant Login as Demo Admin</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
