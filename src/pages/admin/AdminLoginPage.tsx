import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const {
    adminLogin,
    resetPassword,
    isAdmin,
    isAuthenticated,
    user,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // Requirement 3: Strictly clear email, password, and visibility state upon route entry / logout
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError(null);
  }, [location.pathname, location.key]);

  // If already authenticated with verified admin role, redirect into dashboard
  if (isAuthenticated && isAdmin) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Invalid admin email or password.');
      setPassword('');
      return;
    }

    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);

    if (res.success) {
      // Clear password field immediately after successful authentication
      setPassword('');
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid admin email or password.');
      // Clear entered password on authentication failure for security
      setPassword('');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered admin email.');
      return;
    }

    setResetLoading(true);
    const res = await resetPassword(resetEmail);
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(
        `Password reset instructions have been sent to ${resetEmail}. Please check your inbox and spam folder.`
      );
    } else {
      setResetError(res.error || 'Failed to dispatch reset email. Please verify the email address.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-white space-y-6">
        {/* Brand & Portal Header */}
        <div className="text-center space-y-3">
          <div className="bg-white/95 p-3 rounded-2xl inline-block shadow-md">
            <BrandLogo size="md" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Staff & Admin Control Center</span>
            </div>
            <h1 className="font-brand font-black text-2xl text-white mt-2">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized personnel only. Sessions and access attempts are monitored and logged.
            </p>
          </div>
        </div>


        {/* Warning if logged in as normal customer */}
        {isAuthenticated && !isAdmin && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Customer Account Detected</p>
                <p className="text-[11px] text-amber-300/80">
                  You are signed in as <strong>{user?.email}</strong>. Ordinary customer accounts do not have access to the admin portal.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Sign Out from Customer Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-slate-500 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Admin Password</label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsForgotModalOpen(true);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full text-xs p-3 pl-10 pr-12 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-slate-500 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validating Admin Credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Return to Customer Storefront */}
        <div className="text-center pt-1">
          <Link
            to="/"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-brand font-bold text-lg text-white">Reset Admin Password</h2>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetSuccess(null);
                  setResetError(null);
                }}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your registered administrator email address. A password recovery link will be dispatched via Supabase Auth.
            </p>

            {resetSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetSuccess(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Return to Login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
