import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Registration } from '../types';
import {
  CalendarDays,
  MapPin,
  Ticket,
  CheckCircle2,
  Clock,
  LogOut,
  ArrowRight,
  User,
  Building2,
  BadgeCheck,
} from 'lucide-react';

// Direct synchronous localStorage fallbacks to prevent flash on page refresh
const getStoredEmail = () =>
  localStorage.getItem('cib_ghana_registered_email_v1') || null;
const getStoredName = () =>
  localStorage.getItem('cib_ghana_registered_name_v1') || null;

export const MyPortal: React.FC = () => {
  const {
    registrations,
    registeredUserEmail: ctxEmail,
    registeredUserName: ctxName,
    setRegisteredUserEmail,
    setRegisteredUserName,
    getEventById,
  } = useApp();

  const navigate = useNavigate();

  // Active email from context or localStorage fallback
  const registeredUserEmail = ctxEmail ?? getStoredEmail();
  const registeredUserName = ctxName ?? getStoredName();

  // All registrations matching the user's email
  const rawRegistrations = useMemo(() => {
    if (!registeredUserEmail) return [];
    return registrations.filter(
      (r: Registration) => r.email.trim().toLowerCase() === registeredUserEmail.trim().toLowerCase()
    );
  }, [registrations, registeredUserEmail]);

  // Deduplicate registrations by event_id so each registered conference only appears ONCE
  // (picks the latest registration for each conference)
  const uniqueRegistrations = useMemo(() => {
    const map = new Map<string, typeof rawRegistrations[0]>();
    for (const reg of rawRegistrations) {
      const existing = map.get(reg.event_id);
      if (!existing || new Date(reg.created_at).getTime() > new Date(existing.created_at).getTime()) {
        map.set(reg.event_id, reg);
      }
    }
    return Array.from(map.values());
  }, [rawRegistrations]);

  // Resolve attendee's first name: context name -> localStorage -> from registration records
  const resolvedFirstName = useMemo(() => {
    if (
      registeredUserName &&
      registeredUserName.trim() &&
      registeredUserName.toLowerCase() !== 'delegate'
    ) {
      return registeredUserName.trim();
    }
    const foundReg = rawRegistrations.find(
      (r: Registration) => r.first_name && r.first_name.trim() && r.first_name.toLowerCase() !== 'delegate'
    );
    if (foundReg && foundReg.first_name.trim()) {
      return foundReg.first_name.trim();
    }
    return '';
  }, [registeredUserName, rawRegistrations]);

  // Synchronize the resolved first name to context & localStorage if previously empty
  useEffect(() => {
    if (resolvedFirstName && (!registeredUserName || registeredUserName.toLowerCase() === 'delegate')) {
      setRegisteredUserName(resolvedFirstName);
    }
  }, [resolvedFirstName, registeredUserName, setRegisteredUserName]);

  const handleLogout = () => {
    setRegisteredUserEmail(null);
    setRegisteredUserName(null);
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Capitalize first letter of first name
  const formattedFirstName = resolvedFirstName
    ? resolvedFirstName.charAt(0).toUpperCase() + resolvedFirstName.slice(1)
    : '';

  return (
    <div className="min-h-screen bg-[#0D3A21] text-white pb-24">
      {/* 1. Hero Banner - Aligned flush with site container max-w-[1360px] */}
      <div className="w-full bg-[#008129] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-8 top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-display">
                Welcome,{' '}
                <span className="text-[#FFE500]">
                  {formattedFirstName || 'Delegate'}
                </span>
                !
              </h1>
              {registeredUserEmail && (
                <p className="text-white/80 text-sm font-medium pt-0.5">{registeredUserEmail}</p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/30 text-white text-sm font-bold transition-all rounded-none shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stats Strip - Aligned with max-w-[1360px] */}
      {uniqueRegistrations.length > 0 && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-8">
            <div>
              <p className="text-2xl font-black text-[#008129]">{uniqueRegistrations.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Conference{uniqueRegistrations.length !== 1 ? 's' : ''} Registered
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-2xl font-black text-slate-800">
                {uniqueRegistrations.filter((r) => r.check_in_status === 'CHECKED_IN').length}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Checked In</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Area - Aligned flush with max-w-[1360px] */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {uniqueRegistrations.length === 0 ? (
          <div className="text-center py-20 space-y-4 bg-white border border-slate-200 p-8 shadow-sm rounded-none">
            <div className="w-16 h-16 bg-[#008129]/10 flex items-center justify-center mx-auto rounded-none">
              <Ticket className="w-8 h-8 text-[#008129]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">No Registrations Found</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">
              You have not registered for any events yet. Browse the conference schedule to register.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 mt-4 px-7 py-3 bg-[#008129] hover:bg-[#007024] text-white font-bold text-sm transition-all rounded-none uppercase tracking-wider"
            >
              <span>Browse Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-black text-white/80 uppercase tracking-widest">
              Your Registered Conference
            </h2>

            {uniqueRegistrations.map((reg) => {
              const event = getEventById(reg.event_id);
              const isCheckedIn = reg.check_in_status === 'CHECKED_IN';

              return (
                <div
                  key={reg.id}
                  className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-none"
                >
                  {/* Top brand accent bar */}
                  <div
                    className={`h-1.5 w-full ${
                      isCheckedIn
                        ? 'bg-[#008129]'
                        : 'bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00]'
                    }`}
                  />

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Left: Event Details */}
                      <div className="flex-1 space-y-4">
                        {/* Status badge */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-widest rounded-none ${
                              isCheckedIn
                                ? 'bg-[#008129] text-white'
                                : 'bg-[#008129]/10 text-[#008129]'
                            }`}
                          >
                            {isCheckedIn ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" /> Confirmed
                              </>
                            )}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {reg.attendance_type} ATTENDANCE
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight font-display">
                          {reg.event_title}
                        </h3>

                        {/* Date and Venue */}
                        {event && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-[#008129] shrink-0" />
                              <span>
                                {formatDate(event.start_date)}
                                {event.end_date !== event.start_date &&
                                  ` – ${formatDate(event.end_date)}`}
                              </span>
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#008129] shrink-0" />
                              <span>
                                {event.venue}, {event.location}
                              </span>
                            </span>
                          </div>
                        )}

                        {/* Attendee Details Grid */}
                        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <span className="flex items-center gap-2 text-slate-700">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold">
                              {reg.first_name} {reg.last_name}
                            </span>
                          </span>

                          {reg.organization && (
                            <span className="flex items-center gap-2 text-slate-600">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{reg.organization}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-2 text-slate-800 sm:col-span-2">
                            <BadgeCheck className="w-4 h-4 text-[#008129] shrink-0" />
                            <span>
                              Registration No:{' '}
                              <span className="font-black text-[#008129] tracking-wider text-base">
                                {reg.registration_number}
                              </span>
                            </span>
                          </span>

                          <span className="text-slate-500 sm:col-span-2 text-xs font-medium">
                            {reg.registration_type_name} &bull; GHS{' '}
                            {reg.total_amount?.toLocaleString() || '1,260'} &bull;{' '}
                            {reg.payment_method?.replace(/_/g, ' ') || 'PAYSTACK'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row sm:flex-col gap-3 sm:items-end shrink-0 pt-2 lg:pt-0">
                        {event && (
                          <Link
                            to={`/events/${event.slug}/ticket/${reg.registration_number}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#008129] hover:bg-[#007024] active:scale-95 text-white text-sm font-black transition-all shadow-md whitespace-nowrap rounded-none uppercase tracking-wider cursor-pointer"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>View Ticket</span>
                          </Link>
                        )}
                        {event && (
                          <Link
                            to={`/events/${event.slug}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all whitespace-nowrap rounded-none cursor-pointer"
                          >
                            <span>Event Details</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyPortal;
