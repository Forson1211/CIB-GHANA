import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CIB_LOGO_URL } from '../../data/mockData';
import { Lock, Shield, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, isAdminAuthenticated } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAdminAuthenticated) {
      const stateFrom = (location.state as any)?.from?.pathname;
      const destination = (stateFrom && stateFrom.startsWith('/admin') && stateFrom !== '/admin/login')
        ? stateFrom
        : '/admin/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAdminAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await adminLogin(password);
      if (success) {
        const stateFrom = (location.state as any)?.from?.pathname;
        const destination = (stateFrom && stateFrom.startsWith('/admin') && stateFrom !== '/admin/login')
          ? stateFrom
          : '/admin/dashboard';
        navigate(destination, { replace: true });
      } else {
        setError('Incorrect administrator password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Authentication failed. Please verify credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-[#1B7E3E] overflow-hidden">
      {/* Background Ambience - Actual CIB Green */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B7E3E] via-[#166E36] to-[#12582B] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Main Authentication Card - No round edges, no strokes */}
        <div className="bg-white rounded-none shadow-[0_25px_60px_rgba(0,0,0,0.35)] p-8 sm:p-10 space-y-7 border-0">
          {/* Header */}
          <div className="text-center space-y-3">
            {/* Logo without box/shape around it, showing clearly */}
            <div className="flex justify-center pb-1">
              <img
                src={CIB_LOGO_URL}
                alt="Chartered Institute of Bankers Ghana"
                className="h-20 w-auto object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1B7E3E] block">
                CIB GHANA &bull; EXECUTIVE SUITE
              </span>
              <h1 className="text-2xl font-black text-slate-900 font-display mt-0.5">
                Admin Center
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter the master password to access event management, registrations, and accreditation desks.
              </p>
            </div>
          </div>

          {/* Error Banner - No round edges, no strokes */}
          {error && (
            <div className="p-3.5 rounded-none bg-rose-50 border-0 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Administrator Password
              </label>
              {/* Flat grey input container with no round edge and no stroke */}
              <div className="relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7E3E]">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter admin password..."
                  className="w-full bg-transparent border-0 outline-none text-base sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 shrink-0 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Clear green button with no round edge and no strokes */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-4 px-6 rounded-none bg-[#1B7E3E] hover:bg-[#166632] active:scale-[0.99] text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Authenticate &amp; Enter</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Return Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-bold text-white/90 hover:text-white transition-colors inline-flex items-center gap-1.5 drop-shadow-sm"
          >
            <span>&larr; Return to Public Platform</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
