import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import {
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/account', { replace: true });
    return null;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow numeric digits only
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPhone(digitsOnly);
    if (error && (error.includes('10 digits') || error.includes('phone') || error.includes('Phone'))) {
      setError(null);
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    // Extract numeric digits only from clipboard
    const digitsOnly = pastedText.replace(/\D/g, '');
    // Do not silently truncate invalid numbers: preserve all pasted digits so validation can inform user
    setPhone(digitsOnly);
    if (digitsOnly.length < 10) {
      setError('Phone number must be exactly 10 digits.');
    } else if (digitsOnly.length > 10) {
      setError('Phone number cannot exceed 10 digits.');
    } else {
      if (error && (error.includes('10 digits') || error.includes('phone') || error.includes('Phone'))) {
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent duplicate signup submissions while already processing
    if (loading) return;

    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Validate phone number: must be exactly 10 digits
    if (phone.length !== 10) {
      if (phone.length === 0) {
        setError('Please enter your 10-digit phone number.');
      } else if (phone.length < 10) {
        setError('Phone number must be exactly 10 digits.');
      } else {
        setError('Phone number cannot exceed 10 digits.');
      }
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(email, password, fullName, phone);
      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setSuccessMsg(res.message || 'Account created! Please check your email to verify your account.');
        } else {
          navigate('/account');
        }
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo size="lg" />
          <h1 className="font-brand font-bold text-2xl text-slate-900 pt-3">
            Create Your Customer Account
          </h1>
          <p className="text-xs text-slate-500">
            Join thousands of happy families shopping at SALALAKART ZONE
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (For Delivery SMS)</label>
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter your 10-digit phone number"
                value={phone}
                onChange={handlePhoneChange}
                onPaste={handlePhonePaste}
                className="w-full text-xs p-3 pl-10 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 pr-10 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 pr-10 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 text-slate-800 placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            By signing up, you agree to our{' '}
            <Link to="/terms-and-conditions" className="text-pink-600 underline">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-pink-600 underline">
              Privacy Policy
            </Link>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-pink-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
