import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatGHS } from '../../lib/utils';
import { Registration } from '../../types';
import { ApiClient } from '../../lib/api';

export const AdminRegistrations: React.FC = () => {
  const { registrations, events, refreshAll, isLiveSyncing, lastSyncedAt, checkInAttendee } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = useState<{ id: string; success: boolean; message: string } | null>(null);

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
    await refreshAll();
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
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLiveSyncing ? 'animate-spin text-cib-green-700' : ''}`} />}
            onClick={handleRefresh}
            disabled={isLiveSyncing}
          >
            {isLiveSyncing ? 'Syncing...' : 'Sync Live'}
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Registrations
              </span>
              <span className="text-2xl sm:text-3xl font-black text-cib-charcoal-900 font-display mt-0.5 block">
                {totalDelegates}
              </span>
              <span className="text-[11px] font-semibold text-cib-green-700">
                Across all scheduled events
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cib-green-50 text-cib-green-800 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Paid &amp; Confirmed
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-display mt-0.5 block">
                {paidDelegates.length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                100% verified credentials
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Checked-In Attendees
              </span>
              <span className="text-2xl sm:text-3xl font-black text-cib-charcoal-900 font-display mt-0.5 block">
                {checkedInDelegates}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {checkInRate}% attendance rate
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Revenue
              </span>
              <span className="text-xl sm:text-2xl font-black text-cib-charcoal-900 font-display mt-0.5 block">
                {formatGHS(totalRevenue)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                Settled via Access WebPay
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Membership Category Tracking Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              key: 'ACIB',
              label: 'ACIB Associate',
              sub: 'Chartered Associates',
              count: registrations.filter((r) => r.membership_category === 'ACIB').length,
              color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
              badge: 'bg-[#008B2E] text-white',
            },
            {
              key: 'FCIB',
              label: 'FCIB Fellow',
              sub: 'Fellow Chartered Members',
              count: registrations.filter((r) => r.membership_category === 'FCIB').length,
              color: 'border-blue-200 bg-blue-50/60 text-blue-900',
              badge: 'bg-blue-600 text-white',
            },
            {
              key: 'Student',
              label: 'Student Associates',
              sub: 'Accredited Students',
              count: registrations.filter((r) => r.membership_category === 'Student').length,
              color: 'border-amber-200 bg-amber-50/60 text-amber-900',
              badge: 'bg-amber-600 text-white',
            },
            {
              key: 'Non-Member',
              label: 'Non-Members',
              sub: 'Industry Professionals',
              count: registrations.filter((r) => r.membership_category === 'Non-Member').length,
              color: 'border-orange-200 bg-orange-50/60 text-orange-900',
              badge: 'bg-orange-500 text-white',
            },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat.key ? 'ALL' : cat.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all hover:shadow-sm ${cat.color} ${
                selectedCategory === cat.key ? 'ring-2 ring-cib-green-600 shadow-sm' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${cat.badge}`}>
                  {cat.count}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{cat.sub}</p>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by delegate name, email, ref ID, organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-cib-green-600"
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
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-cib-green-600"
              >
                <option value="ALL">All Check-In Status</option>
                <option value="REGISTERED">Registered</option>
                <option value="CHECKED_IN">Checked In</option>
              </select>

              {/* Payment Status */}
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-cib-green-600"
              >
                <option value="ALL">All Payments</option>
                <option value="SUCCESSFUL">Paid / Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>

              {/* Membership Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-cib-green-600"
              >
                <option value="ALL">All Categories (4)</option>
                <option value="ACIB">ACIB (Associate)</option>
                <option value="FCIB">FCIB (Fellow)</option>
                <option value="Student">Student Member</option>
                <option value="Non-Member">Non-Member</option>
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
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{totalDelegates}</strong> registered delegates
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed Synced
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Delegate</th>
                  <th className="py-3.5 px-4">Registration Ref</th>
                  <th className="py-3.5 px-4">Organization &amp; Title</th>
                  <th className="py-3.5 px-4">Event &amp; Tier</th>
                  <th className="py-3.5 px-4">Payment</th>
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
                        <p className="font-semibold text-slate-600">No delegate registrations found</p>
                        <p className="text-[11px] text-slate-400">
                          Try adjusting your search query or event filter criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => {
                    const recent = isRecent(reg.created_at);
                    const eventSlug = getEventSlug(reg.event_id);

                    return (
                      <tr key={reg.id || reg.registration_number} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Delegate Info (Name First) */}
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block text-xs font-bold">
                            {reg.first_name} {reg.last_name}
                          </strong>
                          <span className="text-[11px] text-slate-500 block truncate">{reg.email}</span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {reg.membership_category && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border-0 ${
                                  reg.membership_category === 'ACIB'
                                    ? 'bg-[#E5F5EB] text-[#1B7E3E]'
                                    : reg.membership_category === 'FCIB'
                                    ? 'bg-blue-50 text-blue-700'
                                    : reg.membership_category === 'Student'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-orange-50 text-orange-700'
                                }`}
                              >
                                {reg.membership_category}
                              </span>
                            )}
                            {reg.cib_member_id && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border-0 font-mono">
                                {reg.cib_member_id}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. Registration Ref */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1B7E3E] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{reg.registration_number}</span>
                            {recent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal font-sans block mt-0.5">
                            {new Date(reg.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        {/* 3. Organization & Title */}
                        <td className="py-3.5 px-4 max-w-[190px]">
                          <span className="font-semibold text-slate-800 block truncate">
                            {reg.organization || 'Individual Delegate'}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {reg.job_title || 'Conference Delegate'}
                          </span>
                        </td>

                        {/* 4. Event & Tier */}
                        <td className="py-3.5 px-4 max-w-[210px]">
                          <span className="font-semibold text-slate-800 block truncate" title={reg.event_title}>
                            {reg.event_title}
                          </span>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border-0">
                            {reg.registration_type_name || 'Delegate Pass'}
                          </span>
                        </td>

                        {/* 5. Payment */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <strong className="text-slate-900 block font-bold">
                            {formatGHS(reg.total_amount)}
                          </strong>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                reg.payment_status === 'SUCCESSFUL'
                                  ? 'text-[#1B7E3E]'
                                  : reg.payment_status === 'PENDING'
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {reg.payment_status}
                            </span>
                            {reg.payment_method && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                ({reg.payment_method.replace('ACCESS_', '').replace('WEBPAY_', '').replace('PAYSTACK_', '')})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Accreditation */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border-0 ${
                              reg.check_in_status === 'CHECKED_IN'
                                ? 'bg-[#E5F5EB] text-[#1B7E3E]'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {reg.check_in_status === 'CHECKED_IN' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[#1B7E3E]" />
                                <span>Checked In ✓</span>
                              </>
                            ) : (
                              <span>Registered</span>
                            )}
                          </span>
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={resendingId === reg.registration_number}
                              onClick={() => handleAdminResendEmail(reg.registration_number)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold inline-flex items-center gap-1 transition-colors border-0 cursor-pointer disabled:opacity-50"
                              title="Resend Payment Confirmation & Pass Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>
                                {resendingId === reg.registration_number
                                  ? '...'
                                  : resendFeedback?.id === reg.registration_number
                                  ? 'Sent ✓'
                                  : 'Email'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedRegistration(reg)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1 transition-colors border-0 cursor-pointer"
                              title="View Full Registration Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            <Link
                              to={`/events/${eventSlug}/ticket/${reg.registration_number}`}
                              target="_blank"
                              className="px-2.5 py-1.5 rounded-lg bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold inline-flex items-center gap-1 shadow-sm transition-all active:scale-95 border-0 cursor-pointer"
                              title="Open Digital Pass Ticket"
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
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5F5EB] text-[#1B7E3E]">
                      {selectedRegistration.payment_status}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Payment Method</label>
                    <span className="font-semibold mt-0.5 block">
                      {selectedRegistration.payment_method || 'Access Bank WebPay'}
                    </span>
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
