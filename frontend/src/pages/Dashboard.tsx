import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Award,
  User,
  ExternalLink,
  ShieldCheck,
  Download,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDateRange, formatGHS } from '../lib/utils';
import { DEMO_USERS } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { currentUser, setCurrentUser, registrations, events } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tickets' | 'events' | 'profile'>('tickets');

  // Filter registrations for current user or show all demo registrations
  const userRegistrations = registrations.filter(
    (r) => r.email.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'SUPER_ADMIN'
  );

  return (
    <div className="space-y-8 sm:space-y-10 pb-20">
      {/* Sleek Banner for Dashboard (Green to Yellow Gradient & Left-aligned) */}
      <section className="w-full bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white py-10 sm:py-14 relative overflow-hidden shadow-sm">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-left space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white uppercase">
                Welcome, {currentUser.first_name} {currentUser.last_name}
              </h1>
              <p className="text-xs sm:text-sm text-white/95 font-medium">
                {currentUser.organization || 'Banking Professional'} &bull; {currentUser.cib_member_id ? `PIN: ${currentUser.cib_member_id}` : 'General Attendee'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.role === 'SUPER_ADMIN' && (
                <Button
                  variant="outline"
                  size="md"
                  className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Admin Dashboard
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                className="bg-white text-slate-950 font-bold border-white hover:bg-slate-100"
                onClick={() => navigate('/events')}
              >
                Register for New Event
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Content */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'tickets', label: 'My Tickets & Passes', icon: Ticket, count: userRegistrations.length },
          { id: 'events', label: 'Recommended Events', icon: Calendar, count: events.length },
          { id: 'profile', label: 'Delegate Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cib-green-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {userRegistrations.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-cib-charcoal-900">No Tickets Yet</h3>
              <p className="text-xs text-slate-500">
                You have not registered for any upcoming events.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/events')}>
                Browse Calendar
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between space-y-4 hover:border-cib-green-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cib-green-800 bg-cib-green-50 px-2.5 py-1 rounded-md border border-cib-green-200">
                        {reg.registration_number}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          reg.check_in_status === 'CHECKED_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {reg.check_in_status === 'CHECKED_IN' ? 'Checked In ✓' : 'Confirmed Pass'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                      {reg.event_title}
                    </h3>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Tier:</strong> {reg.registration_type_name}</p>
                      <p><strong>Attendance Mode:</strong> {reg.attendance_type}</p>
                      <p><strong>Paid:</strong> {formatGHS(reg.total_amount)} ({reg.payment_method || 'Verified'})</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Issued: {new Date(reg.created_at).toLocaleDateString()}
                    </span>

                    <Link
                      to={`/events/30th-national-banking-ethics-conference-2026/ticket/${reg.registration_number}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cib-green-700 hover:bg-cib-green-800 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Pass & QR</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVENTS */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((evt) => (
            <div key={evt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-cib-green-700">{evt.category}</span>
              <h4 className="font-bold text-cib-charcoal-900 font-display line-clamp-2">{evt.title}</h4>
              <p className="text-xs text-slate-500">{formatDateRange(evt.start_date, evt.end_date)} &bull; {evt.venue}</p>
              <div className="pt-2">
                <Link
                  to={`/events/${evt.slug}`}
                  className="text-xs font-bold text-cib-green-700 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
            Delegate Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Full Name</span>
              <strong className="text-sm text-cib-charcoal-900">{currentUser.first_name} {currentUser.last_name}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Email</span>
              <strong className="text-sm text-cib-charcoal-900">{currentUser.email}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Organization</span>
              <strong className="text-sm text-cib-charcoal-900">{currentUser.organization || 'Not Specified'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">CIB Member PIN</span>
              <strong className="text-sm text-cib-green-800">{currentUser.cib_member_id || 'N/A'}</strong>
            </div>
          </div>

          <div className="p-4 bg-cib-green-50 border border-cib-green-200 rounded-xl text-xs text-cib-green-900">
            <p><strong>Member Status:</strong> Accredited with CIB Ghana. To update your chartered registration or verify examination qualifications, please login to the <a href="https://mis.cibgh.org" target="_blank" rel="noreferrer" className="underline font-bold">CIB Member MIS</a>.</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
