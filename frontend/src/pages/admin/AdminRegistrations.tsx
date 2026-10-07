import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Link } from 'react-router-dom';
import {
  Search,
  Download,
  Ticket,
  CheckCircle2,
  QrCode,
  RefreshCw,
  X,
  Eye,
  Mail,
  Phone,
  Building,
  Award,
  UserCheck,
  Clock,
  Users,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatGHS } from '../../lib/utils';
import { Registration } from '../../types';
import { ApiClient } from '../../lib/api';
import { PaymentChannelBadge } from '../../components/payment/PaymentChannelBadge';

export const AdminRegistrations: React.FC = () => {
  const { registrations, events, refreshAll, refreshRegistrations, isLiveSyncing, lastSyncedAt, checkInAttendee, updatePaymentStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const [countdown, setCountdown] = useState(5);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Auto-sync registrations on mount, on 5-second interval, and whenever admin tab is focused/visible (silently)
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

  const handleAdminResendEmail = async (regNumber: string) => {
    setResendingId(regNumber);
    try {
      await ApiClient.resendConfirmationEmail(regNumber);
      setResendFeedback({ id: regNumber, success: true, message: 'Receipt email dispatched!' });
      setTimeout(() => setResendFeedback(null), 4000);
    } catch {
      setResendFeedback({ id: regNumber, success: false, message: 'Failed to send' });
      setTimeout(() => setResendFeedback(null), 4000);
    } finally {
      setResendingId(null);
    }
  };

  const handleRefresh = async () => {
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

  const filtered = registrations.filter((r) => {
    const matchesEvent = selectedEventId === 'ALL' || r.event_id === selectedEventId;
    const matchesStatus = selectedStatus === 'ALL' || r.check_in_status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'ALL' || r.payment_status === selectedPaymentStatus;
    const matchesCategory = selectedCategory === 'ALL' || r.membership_category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      searchQuery === '' ||
      r.registration_number.toLowerCase().includes(q) ||
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.organization && r.organization.toLowerCase().includes(q)) ||
      (r.job_title && r.job_title.toLowerCase().includes(q)) ||
      (r.cib_member_id && r.cib_member_id.toLowerCase().includes(q)) ||
      (r.membership_category && r.membership_category.toLowerCase().includes(q)) ||
      (r.payment_reference && r.payment_reference.toLowerCase().includes(q));
    return matchesEvent && matchesStatus && matchesPayment && matchesCategory && matchesQuery;
  });

  // Calculate summary statistics
  const totalDelegates = registrations.length;
  const paidDelegates = registrations.filter((r) => r.payment_status === 'SUCCESSFUL');
  const totalRevenue = paidDelegates.reduce((acc, r) => acc + (r.total_amount || 0), 0);
  const checkedInDelegates = registrations.filter((r) => r.check_in_status === 'CHECKED_IN').length;
  const checkInRate = totalDelegates > 0 ? Math.round((checkedInDelegates / totalDelegates) * 100) : 0;

  // Check if registration was created recently (within past 24 hours or today)
  const isRecent = (createdAt: string) => {
    try {
      const regTime = new Date(createdAt).getTime();
      const now = new Date().getTime();
      return now - regTime < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  // Helper to get event slug
  const getEventSlug = (eventId: string) => {
    const found = events.find((e) => e.id === eventId);
    return found?.slug || '30th-national-banking-ethics-conference-2026';
  };

  const getInitials = (first?: string, last?: string) => {
    const f = (first || '').trim().charAt(0).toUpperCase();
    const l = (last || '').trim().charAt(0).toUpperCase();
    return (f + l).slice(0, 2) || 'D';
  };

  const getTierBadge = (tierName?: string) => {
    const name = tierName || 'Standard Pass';
    if (name.toLowerCase().includes('single')) {
      return { label: 'Single Occupancy', color: 'bg-emerald-50 text-emerald-800' };
    }
    if (name.toLowerCase().includes('double')) {
      return { label: 'Double Occupancy', color: 'bg-blue-50 text-blue-800' };
    }
    if (name.toLowerCase().includes('non') || name.toLowerCase().includes('residence')) {
      return { label: 'Non-Residence Pass', color: 'bg-purple-50 text-purple-800' };
    }
    return { label: name, color: 'bg-slate-100 text-slate-700' };
  };

  const exportCSV = () => {
    const headers = [
      'Reg Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Organization',
      'Job Title',
      'Country',
      'CIB Member ID',
      'Event Title',
      'Tier',
      'Attendance Type',
      'Special Assistance / Masterclass',
      'Dietary Requirements',
      'Amount (GHS)',
      'Payment Status',
      'Payment Ref',
      'Payment Method',
      'Check-In Status',
      'Check-In Time',
      'Registration Date'
    ];
    const rows = filtered.map((r) => [
      r.registration_number,
      `"${r.first_name}"`,
      `"${r.last_name}"`,
      r.email,
      r.phone || '',
      `"${r.organization || ''}"`,
      `"${r.job_title || ''}"`,
      `"${r.country || 'Ghana'}"`,
      r.cib_member_id || '',
      `"${r.event_title}"`,
      `"${r.registration_type_name}"`,
      r.attendance_type,
      `"${r.special_assistance || ''}"`,
      `"${r.dietary_requirements || ''}"`,
      r.total_amount,
      r.payment_status,
      r.payment_reference || '',
      r.payment_method || '',
      r.check_in_status,
      r.check_in_time || '',
      r.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CIB_Ghana_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title="Delegate Registrations Ledger"
      subtitle="Complete real-time roster of registered conference attendees, payment receipts, and check-in audits."
      actions={
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-cib-green-800 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Sync ({countdown}s)
          </span>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin text-cib-green-700' : 'text-slate-600'}`} />}
            onClick={handleRefresh}
            disabled={isManualSyncing}
            className="min-w-[95px] justify-center"
          >
            {isManualSyncing ? 'Syncing...' : 'Sync Live'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={exportCSV}
          >
            Export to CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Metric Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-slate-300 transition-all">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Registrations
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1 block tracking-tight">
                {totalDelegates}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                Across all scheduled events
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-slate-300 transition-all">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Paid &amp; Confirmed
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-display mt-1 block tracking-tight">
                {paidDelegates.length}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mt-1">
                100% verified credentials
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-slate-300 transition-all">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Checked-In Attendees
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1 block tracking-tight">
                {checkedInDelegates}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 mt-1">
                {checkInRate}% attendance rate
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-slate-300 transition-all">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Revenue
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1 block tracking-tight">
                {formatGHS(totalRevenue)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 mt-1">
                Settled via Access WebPay
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Unified Filter and Category Control Center */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          {/* Membership Category Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'All Delegates', count: totalDelegates },
              {
                key: 'Non-Member',
                label: 'Non-Members',
                count: registrations.filter((r) => r.membership_category === 'Non-Member').length,
              },
              {
                key: 'ACIB',
                label: 'ACIB Associate',
                count: registrations.filter((r) => r.membership_category === 'ACIB').length,
              },
              {
                key: 'FCIB',
                label: 'FCIB Fellow',
                count: registrations.filter((r) => r.membership_category === 'FCIB').length,
              },
              {
                key: 'Student',
                label: 'Student Associates',
                count: registrations.filter((r) => r.membership_category === 'Student').length,
              },
            ].map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cib-green-800 text-white shadow-sm ring-1 ring-cib-green-800'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Dropdowns Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by delegate name, email, ref ID, organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 hover:bg-white placeholder:text-slate-400 focus:bg-white focus:border-cib-green-700 focus:outline-none focus:ring-2 focus:ring-cib-green-700/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Event Filter */}
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 hover:bg-white focus:outline-none focus:border-cib-green-700 transition-colors cursor-pointer"
              >
                <option value="ALL">All Events ({events.length})</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>

              {/* Check-In Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 hover:bg-white focus:outline-none focus:border-cib-green-700 transition-colors cursor-pointer"
              >
                <option value="ALL">All Check-In Status</option>
                <option value="REGISTERED">Registered</option>
                <option value="CHECKED_IN">Checked In</option>
              </select>

              {/* Payment Status */}
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 hover:bg-white focus:outline-none focus:border-cib-green-700 transition-colors cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="SUCCESSFUL">Paid / Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>

              {(searchQuery || selectedEventId !== 'ALL' || selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL' || selectedCategory !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedEventId('ALL');
                    setSelectedStatus('ALL');
                    setSelectedPaymentStatus('ALL');
                    setSelectedCategory('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-rose-200/60"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Counter and Live Sync Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Showing <strong className="text-slate-900 font-bold">{filtered.length}</strong> of{' '}
                <strong className="text-slate-900 font-bold">{totalDelegates}</strong> registered delegates
              </span>
              {selectedCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cib-green-50 text-cib-green-800 font-semibold text-[11px] border border-cib-green-200/60">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('ALL')} className="hover:text-cib-green-950 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px] shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed Synced
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Delegate</th>
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Organization &amp; Role</th>
                  <th className="py-3.5 px-4">Package Tier</th>
                  <th className="py-3.5 px-4">Payment &amp; Channel</th>
                  <th className="py-3.5 px-4">Accreditation</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700">No delegate registrations found</p>
                        <p className="text-[11px] text-slate-400">
                          Try adjusting your search query or category filter criteria.
                        </p>
                        {(searchQuery || selectedEventId !== 'ALL' || selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL' || selectedCategory !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedEventId('ALL');
                              setSelectedStatus('ALL');
                              setSelectedPaymentStatus('ALL');
                              setSelectedCategory('ALL');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-cib-green-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors mt-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => {
                    const recent = isRecent(reg.created_at);
                    const eventSlug = getEventSlug(reg.event_id);
                    const initials = getInitials(reg.first_name, reg.last_name);
                    const tierInfo = getTierBadge(reg.registration_type_name);

                    return (
                      <tr
                        key={reg.id || reg.registration_number}
                        onClick={() => setSelectedRegistration(reg)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* 1. Delegate Info with Initials Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/70 group-hover:bg-[#E5F5EB] group-hover:text-[#1B7E3E] transition-colors">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <span className="text-slate-900 font-bold text-xs block truncate group-hover:text-[#1B7E3E] transition-colors">
                                {reg.first_name} {reg.last_name}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {reg.email}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    reg.membership_category === 'ACIB'
                                      ? 'bg-emerald-50 text-[#1B7E3E]'
                                      : reg.membership_category === 'FCIB'
                                      ? 'bg-blue-50 text-blue-700'
                                      : reg.membership_category === 'Student'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {reg.membership_category || 'Non-Member'}
                                </span>
                                {reg.cib_member_id && (
                                  <span className="text-[9px] font-mono text-slate-400">
                                    #{reg.cib_member_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Registration Ref & Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#1B7E3E] bg-[#E5F5EB]/50 px-2 py-0.5 rounded border border-emerald-200/40">
                              {reg.registration_number}
                            </span>
                            {recent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(reg.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        {/* 3. Organization & Role */}
                        <td className="py-3.5 px-4 max-w-[170px]">
                          <span className="font-medium text-slate-800 block truncate text-xs">
                            {reg.organization || 'Individual Delegate'}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {reg.job_title || 'Delegate'}
                          </span>
                        </td>

                        {/* 4. Tier / Package */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${tierInfo.color}`}>
                            {tierInfo.label}
                          </span>
                        </td>

                        {/* 5. Payment & Method */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-bold text-xs">
                              {formatGHS(reg.total_amount)}
                            </strong>
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                reg.payment_status === 'SUCCESSFUL'
                                  ? 'text-emerald-700'
                                  : reg.payment_status === 'PENDING'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {reg.payment_status}
                            </span>
                            {reg.payment_status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await updatePaymentStatus(reg.registration_number, 'SUCCESSFUL');
                                }}
                                className="text-[9px] font-bold text-[#1B7E3E] hover:underline px-1 py-0.2 rounded bg-emerald-50 border border-emerald-200 cursor-pointer"
                                title="Approve payment as SUCCESSFUL"
                              >
                                Approve ✓
                              </button>
                            )}
                          </div>
                          <div className="mt-1">
                            <PaymentChannelBadge
                              paymentMethod={reg.payment_method}
                              phone={reg.phone}
                              paymentStatus={reg.payment_status}
                            />
                          </div>
                        </td>

                        {/* 6. Accreditation */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {reg.check_in_status === 'CHECKED_IN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Registered</span>
                            </span>
                          )}
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedRegistration(reg)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="View dossier details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={resendingId === reg.registration_number}
                              onClick={() => handleAdminResendEmail(reg.registration_number)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="Resend payment confirmation email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/events/${eventSlug}/ticket/${reg.registration_number}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded-md bg-[#1B7E3E] hover:bg-[#166632] text-white font-semibold text-xs inline-flex items-center gap-1 shadow-2xs transition-all active:scale-95 ml-0.5"
                              title="Open ticket pass"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>Pass</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delegate Profile Slide-Over / Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1B7E3E] p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                    DELEGATE DOSSIER
                  </span>
                  <span className="font-mono text-xs text-white/85">
                    {selectedRegistration.registration_number}
                  </span>
                </div>
                <h3 className="text-xl font-black font-display text-white mt-1.5">
                  {selectedRegistration.first_name} {selectedRegistration.last_name}
                </h3>
                <p className="text-xs text-white/85">
                  {selectedRegistration.job_title} &bull; {selectedRegistration.organization}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Section 1: Event & Accreditation */}
              <div className="bg-[#F1F3F5] p-5 rounded-2xl border-0 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Conference Programme &amp; Package
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block">Event Title</label>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedRegistration.event_title}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Tier / Package</label>
                    <p className="font-bold text-cib-gold-700 text-sm mt-0.5">
                      {selectedRegistration.registration_type_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Attendance Format</label>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedRegistration.attendance_type}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Check-In Status</label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedRegistration.check_in_status === 'CHECKED_IN'
                            ? 'bg-[#E5F5EB] text-[#1B7E3E]'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {selectedRegistration.check_in_status === 'CHECKED_IN' ? 'Checked In ✓' : 'Registered'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const res = checkInAttendee(selectedRegistration.registration_number);
                          if (res.registration) {
                            setSelectedRegistration(res.registration);
                          }
                        }}
                        className="text-[11px] font-bold text-[#1B7E3E] hover:underline cursor-pointer"
                      >
                        {selectedRegistration.check_in_status === 'CHECKED_IN' ? 'Undo Check-In' : 'Mark as Checked In'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F1F3F5] p-5 rounded-2xl border-0 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Contact Information
                  </span>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedRegistration.email}</span>
                    </div>
                    {selectedRegistration.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedRegistration.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedRegistration.country || 'Ghana'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F1F3F5] p-5 rounded-2xl border-0 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Institutional Affiliation
                  </span>
                  <div className="space-y-1.5 text-slate-700">
                    <p>
                      <strong>Organization:</strong> {selectedRegistration.organization || 'N/A'}
                    </p>
                    <p>
                      <strong>Job Title:</strong> {selectedRegistration.job_title || 'N/A'}
                    </p>
                    {selectedRegistration.membership_category && (
                      <p className="flex items-center gap-2">
                        <strong>Category:</strong>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            selectedRegistration.membership_category === 'ACIB'
                              ? 'bg-[#E5F5EB] text-[#1B7E3E]'
                              : selectedRegistration.membership_category === 'FCIB'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedRegistration.membership_category === 'Student'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {selectedRegistration.membership_category}
                        </span>
                      </p>
                    )}
                    {selectedRegistration.cib_member_id && (
                      <p>
                        <strong>CIB Member ID:</strong>{' '}
                        <span className="font-mono font-bold text-[#1B7E3E]">
                          {selectedRegistration.cib_member_id}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Preferences & Masterclass */}
              {(selectedRegistration.special_assistance || selectedRegistration.dietary_requirements) && (
                <div className="bg-[#F1F3F5] p-5 rounded-2xl border-0 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Selected Preferences &amp; Masterclass Track
                  </span>
                  {selectedRegistration.special_assistance && (
                    <p className="text-slate-800">
                      <strong>Executive Track:</strong> {selectedRegistration.special_assistance}
                    </p>
                  )}
                  {selectedRegistration.dietary_requirements && (
                    <p className="text-slate-800">
                      <strong>Dietary Requirements:</strong> {selectedRegistration.dietary_requirements}
                    </p>
                  )}
                </div>
              )}

              {/* Section 4: Financial & Payment Receipt */}
              <div className="bg-[#F1F3F5] p-5 rounded-2xl border-0 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Audit &amp; Settlement
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block">Amount Paid</label>
                    <strong className="text-base font-black text-cib-charcoal-900">
                      {formatGHS(selectedRegistration.total_amount)}
                    </strong>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Status</label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedRegistration.payment_status === 'SUCCESSFUL'
                            ? 'bg-[#E5F5EB] text-[#1B7E3E]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedRegistration.payment_status}
                      </span>
                      {selectedRegistration.payment_status !== 'SUCCESSFUL' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await updatePaymentStatus(selectedRegistration.registration_number, 'SUCCESSFUL');
                            setSelectedRegistration({
                              ...selectedRegistration,
                              payment_status: 'SUCCESSFUL',
                            });
                          }}
                          className="text-[11px] font-bold text-[#1B7E3E] hover:underline cursor-pointer"
                        >
                          Mark Paid ✓
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Payment Channel &amp; Network</label>
                    <div className="mt-1">
                      <PaymentChannelBadge
                        paymentMethod={selectedRegistration.payment_method}
                        phone={selectedRegistration.phone}
                        paymentStatus={selectedRegistration.payment_status}
                        showDetails={true}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Payment Ref</label>
                    <span className="font-mono text-[11px] mt-0.5 block truncate text-slate-600">
                      {selectedRegistration.payment_reference || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-0 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors border-0 cursor-pointer"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={resendingId === selectedRegistration.registration_number}
                  onClick={() => handleAdminResendEmail(selectedRegistration.registration_number)}
                  className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {resendingId === selectedRegistration.registration_number
                      ? 'Dispatching...'
                      : resendFeedback?.id === selectedRegistration.registration_number
                      ? 'Receipt Sent ✓'
                      : 'Resend Payment Receipt'}
                  </span>
                </button>

                <Link
                  to={`/events/${getEventSlug(selectedRegistration.event_id)}/ticket/${selectedRegistration.registration_number}`}
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Launch Digital Badge &amp; Pass</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
