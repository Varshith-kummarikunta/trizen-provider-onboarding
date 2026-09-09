import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Loader2, Key } from 'lucide-react';

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill helper for assignment evaluation convenience
  const fillDemoAdmin = () => {
    setEmail('admin@trizen.com');
    setPassword('AdminPassword@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide admin credentials.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role !== 'admin') {
          setError('Access denied. This account does not possess administrator privileges.');
          return;
        }
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err?.message || 'Admin authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-purple-900/10 border border-purple-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider mb-1">
              Internal Staff Only
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin Verification Portal
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage provider applications and compliance
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between">
          <div className="text-xs text-purple-950">
            <p className="font-semibold">Demo Evaluation Credentials</p>
            <p className="text-purple-700 font-mono text-[11px] mt-0.5">
              admin@trizen.com
            </p>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Key className="w-3 h-3" />
            Auto-Fill
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trizen.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 shadow-md shadow-purple-700/25 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign in to Admin Console <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
          >
            &larr; Return to Partner Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
