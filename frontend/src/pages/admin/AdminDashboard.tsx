import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  QrCode,
  Plus,
  BarChart3,
  Clock,
  CreditCard,
  Award,
  Mic,
  MapPin,
  Star,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatGHS } from '../../lib/utils';

type EventTab = 'All' | 'Upcoming' | 'Ongoing' | 'Completed';
type ChartRange = 'Weekly' | 'Monthly' | 'Yearly';

/* ──────────────────────────────────────────
   SVG Line Chart Component
────────────────────────────────────────── */
const LineChart: React.FC<{ data: number[]; labels: string[]; color?: string }> = ({
  data,
  labels,
  color = '#008B2E',
}) => {
  const W = 500;
  const H = 120;
  const pad = { top: 10, right: 20, bottom: 24, left: 32 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...data, 1);

  const px = (i: number) => pad.left + (i / (data.length - 1)) * innerW;
  const py = (v: number) => pad.top + innerH - (v / maxVal) * innerH;

  const pathD = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(v)}`)
    .join(' ');

  const areaD = [
    `M ${px(0)} ${py(data[0])}`,
    ...data.slice(1).map((v, i) => `L ${px(i + 1)} ${py(v)}`),
    `L ${px(data.length - 1)} ${pad.top + innerH}`,
    `L ${px(0)} ${pad.top + innerH}`,
    'Z',
  ].join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) =>
    Math.round(pct * maxVal)
  );

  const labelStep = Math.max(1, Math.floor(labels.length / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridLines.map((val) => (
        <g key={val}>
          <line
            x1={pad.left} y1={py(val)} x2={pad.left + innerW} y2={py(val)}
            stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4"
          />
          <text x={pad.left - 6} y={py(val)} textAnchor="end" dy="4"
            fontSize="9" fill="#94A3B8" fontFamily="Inter, sans-serif">
            {val}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#area-grad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r="3.5" fill="white" stroke={color} strokeWidth="2" />
      ))}

      {/* X-axis labels */}
      {labels.map((lbl, i) =>
        i % labelStep === 0 ? (
          <text key={i} x={px(i)} y={H - 4} textAnchor="middle"
            fontSize="9" fill="#94A3B8" fontFamily="Inter, sans-serif">
            {lbl}
          </text>
        ) : null
      )}
    </svg>
  );
};

/* ──────────────────────────────────────────
   SVG Donut Chart Component
────────────────────────────────────────── */
const DonutChart: React.FC<{ segments: { label: string; pct: number; color: string }[] }> = ({
  segments,
}) => {
  const R = 62;
  const cx = 80;
  const cy = 80;
  const stroke = 22;
  const circ = 2 * Math.PI * R;

  let cumPct = 0;
  const slices = segments.map((s) => {
    const dash = (s.pct / 100) * circ;
    const offset = circ - cumPct * circ / 100;
    cumPct += s.pct;
    return { ...s, dash, offset };
  });

  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44">
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={s.color}
          strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={s.offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
        />
      ))}
      <circle cx={cx} cy={cy} r={R - stroke / 2 - 3} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="17" fontWeight="900" fill="#0F172A" fontFamily="Inter, sans-serif">
        {segments[0]?.pct}%
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="Inter, sans-serif">
        {segments[0]?.label}
      </text>
    </svg>
  );
};

/* ──────────────────────────────────────────
   Main Dashboard
────────────────────────────────────────── */
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { events, registrations, speakers, sponsors, currentUser, refreshAll, isLiveSyncing, lastSyncedAt } = useApp();
  const [eventTab, setEventTab] = useState<EventTab>('All');
  const [chartRange, setChartRange] = useState<ChartRange>('Monthly');
  const [donutRange, setDonutRange] = useState<'This month' | 'This year'>('This month');

  // KPIs
  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => !e.is_past && e.status !== 'DRAFT').length;
  const completedEvents = events.filter((e) => e.is_past).length;
  const totalRegistrations = registrations.length;
  const checkedInCount = registrations.filter((r) => r.check_in_status === 'CHECKED_IN').length;
  const totalRevenue = registrations.reduce((acc, r) => acc + (r.total_amount || 0), 0);
  const pendingPayments = registrations.filter((r) => r.payment_status === 'PENDING').length;
  const successfulPayments = registrations.filter((r) => r.payment_status === 'SUCCESSFUL').length;
  const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

  // Filtered events
  const filteredEvents = events.filter((e) => {
    if (eventTab === 'Upcoming') return !e.is_past && e.status !== 'DRAFT';
    if (eventTab === 'Ongoing') return !e.is_past && (e.status === 'IN_PROGRESS' || e.status === 'OPEN_FOR_REGISTRATION');
    if (eventTab === 'Completed') return e.is_past;
    return true;
  });

  // Generate registration trend data (spread over months/weeks)
  const now = new Date();
  const chartData = (() => {
    if (chartRange === 'Weekly') {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - 6 + i);
        return d;
      });
      return {
        labels: days.map((d) => d.toLocaleDateString('en-GH', { weekday: 'short' })),
        data: days.map((d) =>
          registrations.filter((r) => {
            try { return new Date(r.created_at).toDateString() === d.toDateString(); }
            catch { return false; }
          }).length
        ),
      };
    }
    if (chartRange === 'Monthly') {
      const months = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1);
        return d;
      });
      return {
        labels: months.map((d) => d.toLocaleDateString('en-GH', { month: 'short' })),
        data: months.map((d) =>
          registrations.filter((r) => {
            try {
              const rd = new Date(r.created_at);
              return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
            } catch { return false; }
          }).length
        ),
      };
    }
    // Yearly — show actual count spread as a visual
    return {
      labels: Array.from({ length: 12 }, (_, i) =>
        new Date(now.getFullYear(), i, 1).toLocaleDateString('en-GH', { month: 'short' })
      ),
      data: Array.from({ length: 12 }, (_, i) =>
        registrations.filter((r) => {
          try { return new Date(r.created_at).getMonth() === i; }
          catch { return false; }
        }).length
      ),
    };
  })();

  // Membership category tracking — the 4 selections from the registration form
  const membershipCategories = [
    { label: 'ACIB', sub: 'Associate Member', color: '#008B2E' },
    { label: 'FCIB', sub: 'Fellow', color: '#3B82F6' },
    { label: 'Student', sub: 'Student Member', color: '#D4AF37' },
    { label: 'Non-Member', sub: 'Not yet a member', color: '#F97316' },
  ];
  const totalRegs = registrations.length || 1;
  const donutSegments = membershipCategories.map((cat) => {
    const count = registrations.filter((r) => r.membership_category === cat.label).length;
    return { label: cat.label, pct: Math.round((count / totalRegs) * 100), color: cat.color, count };
  });
  const topSegment = donutSegments.reduce((a, b) => (a.count > b.count ? a : b), donutSegments[0]);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <AdminLayout
      title=""
      subtitle=""
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-[#008B2E]' : ''}`} />}
            onClick={() => refreshAll()}
            disabled={isLiveSyncing}
            className="px-2.5 sm:px-3 text-xs"
          >
            <span className="hidden sm:inline">{isLiveSyncing ? 'Syncing...' : 'Sync Live Data'}</span>
            <span className="sm:hidden">{isLiveSyncing ? '...' : 'Sync'}</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/events/create')}
            className="px-2.5 sm:px-3 text-xs"
          >
            <span className="hidden sm:inline">Create New Event</span>
            <span className="sm:hidden">New Event</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Greeting ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
              {greeting}, Admin
            </h1>
            <p className="text-sm text-slate-500 mt-1">Here's your CIB Ghana live events dashboard at a glance.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800">
                Live Data Active
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
              <Clock className="w-4 h-4 text-[#007A27]" />
              <span className="text-xs font-semibold text-slate-600">
                {new Date().toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Events', value: totalEvents, sub: `${upcomingEvents} active · ${completedEvents} done`,
              icon: Calendar, grad: 'from-[#008B2E] to-[#0E7A48]', text: 'emerald',
            },
            {
              label: 'Registrations', value: totalRegistrations, sub: `${successfulPayments} paid · ${pendingPayments} pending`,
              icon: Users, grad: 'from-[#1D4ED8] to-[#2563EB]', text: 'blue',
            },
            {
              label: 'Checked-In', value: checkedInCount, sub: `${checkInRate}% check-in rate`,
              icon: CheckCircle2, grad: 'from-[#B45309] to-[#D97706]', text: 'amber',
            },
            {
              label: 'Revenue', value: formatGHS(totalRevenue), sub: 'Access WebPay & bank receipts',
              icon: TrendingUp, grad: 'from-[#7C3AED] to-[#9333EA]', text: 'purple', small: true,
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white shadow-lg bg-gradient-to-br ${card.grad}`}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-5 -left-5 w-14 h-14 bg-white/10 rounded-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80">{card.label}</span>
                  <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg sm:rounded-xl">
                    <card.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <p className={`font-black font-display ${card.small ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-5xl'}`}>
                  {card.value}
                </p>
                <p className="text-[10px] sm:text-[11px] opacity-75 mt-1 font-semibold truncate">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Events Table + Revenue Split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Events Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Event Programmes</h3>
                <p className="text-xs text-slate-500">All CIB Ghana conferences & masterclasses</p>
              </div>
              <Link to="/admin/events" className="text-xs font-bold text-[#006B22] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 px-6 pb-3">
              {(['All', 'Upcoming', 'Ongoing', 'Completed'] as EventTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEventTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    eventTab === tab ? 'bg-[#008B2E] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {filteredEvents.slice(0, 5).length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400 font-semibold">No events in this category</div>
              ) : (
                filteredEvents.slice(0, 5).map((evt) => {
                  const delegateCount = registrations.filter((r) => r.event_id === evt.id).length;
                  const statusLabel = evt.is_past ? 'Completed' : evt.status;
                  const statusColor = evt.is_past
                    ? 'bg-slate-100 text-slate-500'
                    : evt.status === 'IN_PROGRESS' || evt.status === 'OPEN_FOR_REGISTRATION'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700';
                  return (
                    <div key={evt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-[#E6F5EC] text-[#006B22] flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{evt.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {evt.venue && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="w-3 h-3" /> {evt.venue}
                            </span>
                          )}
                          {evt.start_date && (
                            <span className="text-[11px] text-slate-400">
                              {new Date(evt.start_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center hidden sm:block flex-shrink-0">
                        <p className="text-sm font-black text-slate-900">{delegateCount}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Delegates</p>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Revenue Split */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Revenue Split</h3>
                <p className="text-xs text-slate-500">By delegate category</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                {(['This month', 'This year'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDonutRange(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      donutRange === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Donut + Legend side by side on desktop, stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <div className="shrink-0 flex justify-center w-full sm:w-auto">
                <DonutChart segments={donutSegments} />
              </div>
              <div className="w-full sm:flex-1 space-y-2.5 sm:space-y-3">
                {donutSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-base font-black text-slate-900 truncate">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-slate-400">({seg.count})</span>
                      <span className="text-base font-black text-slate-900">{seg.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-semibold">Total Collected</span>
              <span className="text-base font-black text-slate-900">{formatGHS(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* ── Row 3: Quick Actions ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct shortcuts to primary management consoles</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                to: '/admin/check-in',
                label: 'Check-In Counter',
                sub: 'QR scanner & accreditation desk',
                icon: QrCode,
                color: 'text-cib-green-700',
                bgColor: 'bg-emerald-100/70',
              },
              {
                to: '/admin/registrations',
                label: 'Registrations',
                sub: 'Delegate ledger & search',
                icon: Users,
                color: 'text-blue-700',
                bgColor: 'bg-blue-100/70',
              },
              {
                to: '/admin/payments',
                label: 'Payments',
                sub: 'Ledger & reconciliation',
                icon: CreditCard,
                color: 'text-indigo-700',
                bgColor: 'bg-indigo-100/70',
              },
              {
                to: '/admin/certificates',
                label: 'Certificates',
                sub: 'Generate & issue passes',
                icon: Award,
                color: 'text-amber-700',
                bgColor: 'bg-amber-100/70',
              },
              {
                to: '/admin/speakers',
                label: 'Speakers',
                sub: `${speakers.length} confirmed faculty`,
                icon: Mic,
                color: 'text-purple-700',
                bgColor: 'bg-purple-100/70',
              },
              {
                to: '/admin/analytics',
                label: 'Analytics',
                sub: 'Reports & insights',
                icon: BarChart3,
                color: 'text-rose-700',
                bgColor: 'bg-rose-100/70',
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex flex-col items-center justify-center text-center p-5 sm:p-7 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 active:scale-[0.98] border-0 outline-none transition-all group cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-xl ${action.bgColor} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-black text-slate-900 leading-tight group-hover:text-cib-green-800 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-1">
                    {action.sub}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Row 4: Recent Registrations Feed ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">Recent Registrations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live feed of incoming delegate passes</p>
            </div>
            <Link to="/admin/registrations" className="text-xs font-bold text-[#006B22] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {registrations.slice(0, 6).map((reg, idx) => {
              const initials = `${reg.first_name?.[0] ?? ''}${reg.last_name?.[0] ?? ''}`.toUpperCase();
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
              return (
                <div key={reg.id || reg.registration_number}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className={`w-9 h-9 flex-shrink-0 rounded-full ${colors[idx % colors.length]} flex items-center justify-center text-white text-xs font-black`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">{reg.first_name} {reg.last_name}</p>
                      {reg.membership_category && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                          reg.membership_category === 'ACIB'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : reg.membership_category === 'FCIB'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : reg.membership_category === 'Student'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {reg.membership_category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{reg.registration_number} · {reg.organization || 'Individual'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-900">{formatGHS(reg.total_amount)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      reg.payment_status === 'SUCCESSFUL' ? 'bg-emerald-100 text-emerald-700' :
                      reg.payment_status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {reg.payment_status === 'SUCCESSFUL' ? 'Paid' : reg.payment_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

