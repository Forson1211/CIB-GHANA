import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Building,
  RefreshCw,
  Users,
  UserCheck,
  Award,
  Sparkles,
  Copy,
  Check,
  Filter,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Registration } from '../../types';

export const AdminCheckIn: React.FC = () => {
  const { registrations, checkInAttendee } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rosterFilter, setRosterFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [rosterSearch, setRosterSearch] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'already_checked_in' | 'not_found';
    message: string;
    timestamp?: string;
  }>({ status: 'idle', message: '' });

  // Metrics calculations
  const totalCount = registrations.length;
  const checkedInCount = useMemo(
    () => registrations.filter((r) => r.check_in_status === 'CHECKED_IN').length,
    [registrations]
  );
  const pendingCount = totalCount - checkedInCount;
  const percentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  const charteredCount = useMemo(
    () =>
      registrations.filter(
        (r) => r.membership_category === 'FCIB' || r.membership_category === 'ACIB'
      ).length,
    [registrations]
  );

  const handleLookup = (regNumber: string) => {
    const cleanNumber = regNumber.trim().toUpperCase();
    if (!cleanNumber) return;

    const found = registrations.find(
      (r) =>
        r.registration_number.toUpperCase() === cleanNumber ||
        r.email.toLowerCase() === cleanNumber.toLowerCase() ||
        (r.first_name + ' ' + r.last_name).toLowerCase().includes(cleanNumber.toLowerCase())
    );

    if (found) {
      setActiveRegistration(found);
      setScanResult({ status: 'idle', message: '' });
    } else {
      setActiveRegistration(null);
      setScanResult({
        status: 'not_found',
        message: `Registration record "${cleanNumber}" was not found in the delegate roster.`,
      });
    }
  };

  const handleConfirmCheckIn = (reg?: Registration) => {
    const target = reg || activeRegistration;
    if (!target) return;

    const result = checkInAttendee(target.registration_number);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (result.success) {
      setScanResult({
        status: 'success',
        message: `ACCREDITED & CHECKED IN ✓ (${nowTime})`,
        timestamp: nowTime,
      });
      if (result.registration) {
        setActiveRegistration(result.registration);
      } else {
        setActiveRegistration({
          ...target,
          check_in_status: 'CHECKED_IN',
          check_in_time: new Date().toISOString(),
        });
      }
    } else {
      setScanResult({
        status: 'already_checked_in',
        message: result.message,
      });
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setActiveRegistration(null);
    setScanResult({ status: 'idle', message: '' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered roster list
  const filteredRoster = useMemo(() => {
    return registrations.filter((r) => {
      const matchesTab =
        rosterFilter === 'ALL' ||
        (rosterFilter === 'CHECKED_IN' && r.check_in_status === 'CHECKED_IN') ||
        (rosterFilter === 'PENDING' && r.check_in_status !== 'CHECKED_IN');

      const q = rosterSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.registration_number.toLowerCase().includes(q) ||
        (r.first_name + ' ' + r.last_name).toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [registrations, rosterFilter, rosterSearch]);

  return (
    <AdminLayout
      title="Accreditation & Check-In Desk"
      subtitle="Verify delegate badge credentials and manage real-time entrance status."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Clear Terminal
          </Button>
        </div>
      }
    >
      <div className="w-full space-y-6">
        {/* ─── 1. TOP EXECUTIVE KPI METRICS BAR (Full Width) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Enrolled */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Total Enrolled
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {totalCount}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Registered delegates</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Accredited / Checked In */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block mb-1">
                Checked In
              </span>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-black text-[#008B2E] font-display">
                  {checkedInCount}
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {percentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Accredited on-site</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E6F5EC] flex items-center justify-center text-[#008B2E]">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Pending Arrival */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 block mb-1">
                Pending Arrival
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 font-display">
                {pendingCount}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Expected delegates</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Chartered Fellows & Members */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] block mb-1">
                Chartered Members
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {charteredCount}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">FCIB & ACIB Luminaries</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50/80 flex items-center justify-center text-amber-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ─── 2. MAIN ENTRANCE DESK WORKSPACE (Two-Column Layout) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ─── LEFT COLUMN: Scanner & Accreditation Verification Console (5 cols) ─── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Terminal Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6F5EC] text-[#008B2E] flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-display">
                      Badge Scanner & Lookup
                    </h3>
                    <p className="text-xs text-slate-400">
                      Scan digital QR badge or enter reference ID
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-50 text-[#008B2E] border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Terminal Live
                </span>
              </div>

              {/* Input Form with Inline Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup(searchInput);
                }}
                className="space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="E.G. CIB-EVT-782419 OR EMAIL..."
                      className="w-full pl-11 pr-20 py-3 rounded-2xl border border-slate-200 text-sm font-mono uppercase tracking-wide focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20 bg-slate-50/50 hover:bg-white transition-colors"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => setSearchInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="sm:w-auto px-6 justify-center bg-gradient-to-r from-[#008B2E] to-[#8FA200] hover:from-[#007326] hover:to-[#7B8B00] text-white font-bold shadow-md shadow-emerald-700/15"
                  >
                    Find Attendee
                  </Button>
                </div>
              </form>

              {/* Quick Scan Simulation Tags */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  QUICK SCAN SIMULATION:
                </span>
                <div className="flex flex-wrap gap-2">
                  {registrations.slice(0, 6).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSearchInput(r.registration_number);
                        handleLookup(r.registration_number);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#E6F5EC] text-slate-700 hover:text-[#008B2E] font-mono text-xs font-semibold border border-slate-200 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs"
                    >
                      <span className="font-bold">{r.registration_number}</span>
                      <span className="text-[11px] text-slate-400">({r.first_name})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scan Error Feedback */}
            {scanResult.status === 'not_found' && (
              <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black">Delegate Not Found</p>
                  <p className="text-xs text-rose-700 mt-0.5">{scanResult.message}</p>
                </div>
              </div>
            )}

            {/* ATTENDEE VERIFIED / FOUND CARD */}
            {activeRegistration ? (
              <div className="bg-white rounded-3xl border-2 border-[#008B2E] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#006B22] to-[#008B2E] text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-black uppercase tracking-widest text-amber-200 font-display">
                      Credentials Verified
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeRegistration.registration_number)}
                    className="flex items-center gap-1 text-xs font-mono bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <span>{activeRegistration.registration_number}</span>
                    {copiedId === activeRegistration.registration_number ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="p-6 sm:p-7 space-y-6">
                  {/* Attendee Profile Row */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#008B2E] to-[#D4AF37] text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                      {activeRegistration.first_name?.[0]}
                      {activeRegistration.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-slate-900 truncate">
                        {activeRegistration.first_name} {activeRegistration.last_name}
                      </h4>
                      <p className="text-xs font-bold text-[#008B2E] truncate mt-0.5">
                        {activeRegistration.job_title}
                      </p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        {activeRegistration.organization}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Pass Category
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {activeRegistration.registration_type_name}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Membership
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          activeRegistration.membership_category === 'FCIB'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : activeRegistration.membership_category === 'ACIB'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {activeRegistration.membership_category || 'Non-Member'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Attendance Mode
                      </span>
                      <span className="font-semibold text-slate-800">
                        {activeRegistration.attendance_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Current Status
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          activeRegistration.check_in_status === 'CHECKED_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {activeRegistration.check_in_status === 'CHECKED_IN'
                          ? 'Accredited'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Success Banner */}
                  {scanResult.status === 'success' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-sm font-black font-display">ACCREDITED & CHECKED IN ✓</p>
                          <p className="text-xs text-emerald-700">Timestamp: {scanResult.timestamp}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                        Badge Active
                      </span>
                    </div>
                  )}

                  {/* Duplicate Entry Banner */}
                  {scanResult.status === 'already_checked_in' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-900 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black uppercase">Already Accredited</p>
                        <p className="text-xs text-amber-700 mt-0.5">{scanResult.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <Button variant="ghost" size="md" onClick={handleReset}>
                      Clear
                    </Button>

                    {activeRegistration.check_in_status !== 'CHECKED_IN' ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1 justify-center bg-gradient-to-r from-[#008B2E] to-[#00A838] shadow-lg shadow-emerald-600/20"
                        leftIcon={<CheckCircle2 className="w-5 h-5" />}
                        onClick={() => handleConfirmCheckIn()}
                      >
                        Accredit & Check In
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 px-3 py-2 rounded-xl bg-emerald-50">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delegate Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Ready State Placeholder */
              <div className="p-8 rounded-3xl border border-dashed border-slate-300 bg-white/60 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Terminal Ready for Delegate</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Scan a QR badge or select an attendee from the roster on the right to review credentials and record entry.
                </p>
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN: Live Entrance Roster Table (7 cols) ─── */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Live Delegate Roster
                </h3>
                <p className="text-xs text-slate-400">
                  {filteredRoster.length} attendee records available for instant accreditation
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setRosterFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rosterFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setRosterFilter('CHECKED_IN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rosterFilter === 'CHECKED_IN'
                      ? 'bg-[#008B2E] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Accredited ({checkedInCount})
                </button>
                <button
                  onClick={() => setRosterFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rosterFilter === 'PENDING'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
              </div>
            </div>

            {/* Quick Search inside Roster */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search delegate name, reference ID, company or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#008B2E] focus:outline-none focus:ring-2 focus:ring-[#008B2E]/20"
              />
            </div>

            {/* Delegate List / Table */}
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white shadow-xs z-10">
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/80">
                    <th className="py-3 px-3">Delegate</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map((r) => {
                    const isCheckedIn = r.check_in_status === 'CHECKED_IN';
                    const isSelected = activeRegistration?.id === r.id;

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        {/* Delegate Name & Org */}
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {r.first_name?.[0]}
                              {r.last_name?.[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {r.first_name} {r.last_name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {r.organization || r.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Reference ID */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {r.registration_number}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              r.membership_category === 'FCIB'
                                ? 'bg-amber-100 text-amber-900'
                                : r.membership_category === 'ACIB'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.membership_category || 'Delegate'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isCheckedIn ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Accredited
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 pl-3 text-right whitespace-nowrap">
                          {isCheckedIn ? (
                            <button
                              onClick={() => {
                                setActiveRegistration(r);
                                setSearchInput(r.registration_number);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-[#008B2E] hover:bg-slate-100 transition-colors"
                            >
                              View Card
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveRegistration(r);
                                setSearchInput(r.registration_number);
                                handleConfirmCheckIn(r);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-[#008B2E] hover:bg-[#006B22] text-white transition-colors shadow-sm"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-medium">No delegate records found matching this filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
