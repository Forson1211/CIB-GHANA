import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-[#0D3A21] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 shadow-2xl space-y-6 rounded-none text-slate-900">
        <div className="w-20 h-20 rounded-none bg-emerald-50 text-[#008129] flex items-center justify-center mx-auto border border-emerald-100">
          <Search className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#008129]">
            ERROR 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display uppercase tracking-tight">
            We Couldn't Find That Page
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The event or page you are looking for may have concluded, been rescheduled, or is no longer available.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/events"
            className="px-6 py-3 bg-[#008129] hover:bg-[#007024] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-none shadow-md transition-all cursor-pointer inline-flex items-center"
          >
            Browse Events Calendar
          </Link>
          <Link
            to="/"
            className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-none transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
