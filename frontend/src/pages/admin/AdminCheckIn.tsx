import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Users,
  Award,
  X,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Building2,
  Camera,
  Printer,
  ChevronRight,
  Eye,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatGHS } from '../../lib/utils';
import { Registration } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

export const AdminCheckIn: React.FC = () => {
  const { registrations, refreshRegistrations, checkInAttendee, isLiveSyncing } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'CHECKED_IN'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FCIB' | 'ACIB' | 'Student' | 'Non-Member'>('ALL');
  const [selectedDelegate, setSelectedDelegate] = useState<Registration | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Toast confirmation feedback
  const [toast, setToast] = useState<{
    message: string;
    regNumber?: string;
    undoRegistration?: Registration;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Auto-sync registrations on mount, on 5-second interval, and on window focus (silently)
  useEffect(() => {
    refreshRegistrations({ silent: true }).catch(() => {});

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshRegistrations({ silent: true }).catch(() => {});
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    const onFocus = () => {
      setCountdown(5);
      refreshRegistrations({ silent: true }).catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refreshRegistrations]);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setCountdown(5);
    try {
      await refreshRegistrations({ silent: false });
    } finally {
      setTimeout(() => {
        setIsManualSyncing(false);
      }, 500);
    }
  };

  // Global keyboard shortcut: '/' to focus omnibar, 'Escape' to clear/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !selectedDelegate) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (selectedDelegate) {
          setSelectedDelegate(null);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, selectedDelegate]);

  // Handle camera video stream for QR scanning
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('[Camera Scanner] Access error:', err);
          setCameraError('Camera access unavailable. Please grant camera permission or use manual search.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  // Metrics
  const totalCount = registrations.length;
  const checkedInCount = useMemo(
    () => registrations.filter((r) => r.check_in_status === 'CHECKED_IN').length,
    [registrations]
  );
  const pendingCount = Math.max(0, totalCount - checkedInCount);
  const arrivalRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;
  const charteredCount = useMemo(
    () => registrations.filter((r) => r.membership_category === 'FCIB' || r.membership_category === 'ACIB').length,
    [registrations]
  );

  // Filtered Delegate Roster
  const filteredDelegates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return registrations.filter((r) => {
      // Tab filter
      if (statusTab === 'CHECKED_IN' && r.check_in_status !== 'CHECKED_IN') return false;
      if (statusTab === 'PENDING' && r.check_in_status === 'CHECKED_IN') return false;

      // Category filter
      if (categoryFilter !== 'ALL' && r.membership_category !== categoryFilter) return false;

      // Search query
      if (!q) return true;

      const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
      const regNum = (r.registration_number || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      const org = (r.organization || '').toLowerCase();
      const role = (r.job_title || '').toLowerCase();
      const memberId = (r.cib_member_id || '').toLowerCase();
      const ref = (r.payment_reference || '').toLowerCase();

      return (
        fullName.includes(q) ||
        regNum.includes(q) ||
        email.includes(q) ||
        org.includes(q) ||
        role.includes(q) ||
        memberId.includes(q) ||
        ref.includes(q)
      );
    });
  }, [registrations, statusTab, categoryFilter, searchQuery]);

  // Execute check in
  const handleCheckIn = (delegate: Registration) => {
    const res = checkInAttendee(delegate.registration_number, 'CHECKED_IN');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (res.success) {
      setToast({
        message: `${delegate.first_name} ${delegate.last_name} accredited (${nowTime})`,
        regNumber: delegate.registration_number,
        undoRegistration: delegate,
      });

      if (selectedDelegate?.id === delegate.id && res.registration) {
        setSelectedDelegate(res.registration);
      }
    } else {
      setToast({
        message: res.message,
        regNumber: delegate.registration_number,
      });
    }

    // Auto-dismiss toast
    setTimeout(() => {
      setToast((prev) => (prev?.regNumber === delegate.registration_number ? null : prev));
    }, 4500);
  };

  // Undo check in if clicked by mistake
  const handleUndoCheckIn = (delegate: Registration) => {
    const res = checkInAttendee(delegate.registration_number, 'REGISTERED');
    if (res.success) {
      setToast({
        message: `Check-in reversed for ${delegate.first_name} ${delegate.last_name}`,
      });
      if (selectedDelegate?.id === delegate.id && res.registration) {
        setSelectedDelegate(res.registration);
      }
    }
    setTimeout(() => setToast(null), 3500);
  };

  // Omnibar submit handler: if exactly 1 match, immediately accredit them!
  const handleOmnibarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (filteredDelegates.length === 1) {
      const match = filteredDelegates[0];
      if (match.check_in_status !== 'CHECKED_IN') {
        handleCheckIn(match);
      } else {
        setSelectedDelegate(match);
      }
    } else if (filteredDelegates.length > 0) {
      // Open inspection of the first match
      setSelectedDelegate(filteredDelegates[0]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const printBadge = () => {
    window.print();
  };

  return (
    <AdminLayout
      title="Accreditation & Check-In Desk"
      subtitle="Official on-site delegate credentials verification, badge check-in, and gate clearance."
      actions={
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0A5C36] border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Sync ({countdown}s)
          </span>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-[#0A5C36]' : 'text-slate-600'}`} />}
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className="min-w-[95px] justify-center"
          >
            {isManualSyncing ? 'Syncing...' : 'Sync Live'}
          </Button>
        </div>
      }
    >
      <div className="w-full space-y-6 max-w-7xl mx-auto pb-12">
        {/* ─── 1. EXECUTIVE KPI SUMMARY RIBBON ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Metric 1: Total Registered */}
            <div className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Total Enrolled
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 font-display">{totalCount}</p>
                  <span className="text-xs text-slate-400 font-medium truncate">Delegates</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Accredited / Checked In */}
            <div className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0A5C36] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block">
                  Accredited On-Site
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-[#0A5C36] font-display">{checkedInCount}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0A5C36]">
                    {arrivalRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3: Pending Arrival */}
            <div className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">
                  Awaiting Arrival
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 font-display">{pendingCount}</p>
                  <span className="text-xs text-slate-400 font-medium truncate">Expected</span>
                </div>
              </div>
            </div>

            {/* Metric 4: Chartered Members (FCIB / ACIB) */}
            <div className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50/80 flex items-center justify-center text-[#B8860B] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B8860B] block">
                  Chartered Members
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 font-display">{charteredCount}</p>
                  <span className="text-xs text-slate-400 font-medium truncate">FCIB & ACIB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1">
            <div
              className="bg-gradient-to-r from-[#0A5C36] to-emerald-500 h-1 transition-all duration-500 ease-out"
              style={{ width: `${arrivalRate}%` }}
            />
          </div>
        </div>

        {/* ─── 2. UNIFIED SEARCH & SCAN OMNIBAR ─── */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <form onSubmit={handleOmnibarSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan QR badge, or type delegate name, reference ID (e.g. CIB-MUY...), organization, email..."
                className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200/90 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A5C36] focus:ring-3 focus:ring-[#0A5C36]/10 bg-slate-50/50 hover:bg-white transition-all"
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isCameraActive
                      ? 'bg-emerald-50 text-[#0A5C36] border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle camera QR scanner"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isCameraActive ? 'Close Camera' : 'Camera QR'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Optional Camera Feed Modal / Accordion */}
          {isCameraActive && (
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
              <div className="w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center border border-slate-700">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 border-2 border-emerald-400/60 rounded-lg pointer-events-none m-6 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300">
                Position attendee QR badge in front of camera or point USB scanner at terminal.
              </p>
              {cameraError && <p className="text-xs text-rose-400">{cameraError}</p>}
            </div>
          )}

          {/* ─── 3. FILTER CONTROLS RIBBON ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Status Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStatusTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Delegates ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusTab === 'PENDING'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pending Arrival ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('CHECKED_IN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusTab === 'CHECKED_IN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Accredited ({checkedInCount})
              </button>
            </div>

            {/* Category Filter & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                aria-label="Filter delegates by membership category"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:border-[#0A5C36] cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="FCIB">FCIB (Fellow)</option>
                <option value="ACIB">ACIB (Associate)</option>
                <option value="Student">Student</option>
                <option value="Non-Member">Non-Member</option>
              </select>

              {(searchQuery || statusTab !== 'ALL' || categoryFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusTab('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── 4. EXECUTIVE DELEGATE ROSTER TABLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredDelegates.length}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{totalCount}</strong> delegates
            </span>
            <span className="text-[11px] text-slate-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">Enter</kbd> to accredit single search match
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Delegate</th>
                  <th className="py-3.5 px-4 font-semibold">Organization & Role</th>
                  <th className="py-3.5 px-4 font-semibold">Badge Ref</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Desk Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDelegates.map((delegate) => {
                  const isCheckedIn = delegate.check_in_status === 'CHECKED_IN';
                  const initials = `${delegate.first_name?.[0] || 'D'}${delegate.last_name?.[0] || ''}`.toUpperCase();
                  const isFCIB = delegate.membership_category === 'FCIB';
                  const isACIB = delegate.membership_category === 'ACIB';
                  const isStudent = delegate.membership_category === 'Student';

                  return (
                    <tr
                      key={delegate.id}
                      onClick={() => setSelectedDelegate(delegate)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Delegate Name & Avatar */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isFCIB
                                ? 'bg-amber-100 text-[#B8860B]'
                                : isACIB
                                ? 'bg-emerald-100 text-[#0A5C36]'
                                : isStudent
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#0A5C36] transition-colors">
                              {delegate.first_name} {delegate.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-normal truncate max-w-[180px]">
                              {delegate.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Organization & Role */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate text-xs">
                          {delegate.organization || 'Individual Delegate'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {delegate.job_title || 'Delegate'}
                        </p>
                      </td>

                      {/* 3. Badge Ref */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        <span className="font-bold text-[#0A5C36] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                          {delegate.registration_number}
                        </span>
                      </td>

                      {/* 4. Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isFCIB
                              ? 'bg-amber-50 text-[#B8860B] border border-amber-200/80'
                              : isACIB
                              ? 'bg-emerald-50 text-[#0A5C36] border border-emerald-200/80'
                              : isStudent
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {delegate.membership_category || 'Non-Member'}
                        </span>
                      </td>

                      {/* 5. Payment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 font-bold text-xs">
                            {formatGHS(delegate.total_amount)}
                          </strong>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              delegate.payment_status === 'SUCCESSFUL'
                                ? 'bg-emerald-50 text-[#0A5C36]'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {delegate.payment_status === 'SUCCESSFUL' ? 'Paid ✓' : 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Desk Status */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#0A5C36] border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Accredited
                            {delegate.check_in_time && (
                              <span className="text-[10px] text-emerald-700/80 font-normal">
                                · {new Date(delegate.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50/80 text-amber-800 border border-amber-200/60">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Awaiting
                          </span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isCheckedIn ? (
                            <button
                              type="button"
                              onClick={() => handleUndoCheckIn(delegate)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                              title="Revert check-in status"
                            >
                              Undo
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(delegate)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#084C2C] active:scale-98 transition-all shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Check In
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedDelegate(delegate)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Inspect delegate pass"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDelegates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700 text-sm">No delegate records found</p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your search query or reset the filter selection.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusTab('ALL');
                            setCategoryFilter('ALL');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A5C36] hover:underline pt-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── 5. EXECUTIVE ACCREDITATION PASS INSPECTION MODAL ─── */}
        {selectedDelegate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/90 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Official Header */}
              <div className="bg-gradient-to-r from-[#0A5C36] to-[#084C2C] text-white p-5 relative">
                <button
                  type="button"
                  onClick={() => setSelectedDelegate(null)}
                  className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Close pass"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  Chartered Institute of Bankers, Ghana
                </p>
                <h3 className="text-base font-bold text-white font-display mt-0.5">
                  Official Accreditation Pass
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  30th National Banking & Ethics Conference 2026
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Delegate Identity Bar */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A5C36] to-[#D4AF37] text-white flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
                    {selectedDelegate.first_name?.[0]}
                    {selectedDelegate.last_name?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-slate-900">
                        {selectedDelegate.first_name} {selectedDelegate.last_name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-[#B8860B] border border-amber-200/80">
                        {selectedDelegate.membership_category || 'Non-Member'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#0A5C36] mt-0.5 truncate">
                      {selectedDelegate.job_title || 'Delegate'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {selectedDelegate.organization || 'Individual Delegate'}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Badge Reference
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedDelegate.registration_number)}
                      className="font-mono font-bold text-slate-900 hover:text-[#0A5C36] flex items-center gap-1 mt-0.5"
                    >
                      <span>{selectedDelegate.registration_number}</span>
                      {copiedId === selectedDelegate.registration_number ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Payment Verification
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {formatGHS(selectedDelegate.total_amount)}{' '}
                      <span className="text-[10px] text-emerald-700 font-semibold">(Verified)</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Pass Tier
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                      {selectedDelegate.registration_type_name || 'Standard Pass'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Accreditation Status
                    </span>
                    <span
                      className={`inline-block font-bold text-xs mt-0.5 ${
                        selectedDelegate.check_in_status === 'CHECKED_IN'
                          ? 'text-[#0A5C36]'
                          : 'text-amber-700'
                      }`}
                    >
                      {selectedDelegate.check_in_status === 'CHECKED_IN' ? '✓ Accredited On-Site' : 'Awaiting Arrival'}
                    </span>
                  </div>
                </div>

                {/* QR Code Centerpiece */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 bg-white text-center space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
                    <QRCodeSVG
                      value={JSON.stringify({
                        ref: selectedDelegate.registration_number,
                        name: `${selectedDelegate.first_name} ${selectedDelegate.last_name}`,
                        event: 'CIB Ghana 2026',
                      })}
                      size={130}
                      level="M"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 font-semibold tracking-wider">
                    {selectedDelegate.registration_number}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Official CIB Security Hash · Valid for Aqua Safari Resort Convention Pavilion
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-1">
                  {selectedDelegate.check_in_status !== 'CHECKED_IN' ? (
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1 justify-center bg-[#0A5C36] hover:bg-[#084C2C] text-white font-bold"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleCheckIn(selectedDelegate)}
                    >
                      Accredit & Check In
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1 justify-center text-amber-700 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleUndoCheckIn(selectedDelegate)}
                    >
                      Undo Check-In
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={printBadge}
                  >
                    Print Badge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── 6. FLOATING CHECK-IN CONFIRMATION TOAST ─── */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900 text-white shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            {toast.undoRegistration && (
              <button
                type="button"
                onClick={() => {
                  if (toast.undoRegistration) {
                    handleUndoCheckIn(toast.undoRegistration);
                  }
                }}
                className="ml-1 text-emerald-300 hover:text-white underline font-bold"
              >
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
