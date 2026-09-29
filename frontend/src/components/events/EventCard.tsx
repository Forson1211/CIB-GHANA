import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
  X
} from 'lucide-react';
import { EventItem } from '../../types';
import { formatDateRange, formatGHS } from '../../lib/utils';
import { Badge, AttendanceTypeBadge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';

interface EventCardProps {
  event: EventItem;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const navigate = useNavigate();
  const { registeredUserEmail, registrations, setRegisteredUserEmail, addRegistration } = useApp();
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const spotsLeft = Math.max(0, event.capacity - event.registered_count);
  const isSoldOut = spotsLeft === 0;

  // Check if current visitor has registered for this event
  const userRegistration = useMemo(() => {
    const activeEmail = registeredUserEmail || localStorage.getItem('cib_ghana_registered_email_v1');
    if (!activeEmail) return null;
    const clean = activeEmail.trim().toLowerCase();
    return (
      registrations.find(
        (r) =>
          r.email.trim().toLowerCase() === clean &&
          (r.event_id === event.id || !r.event_id || r.event_id === 'evt-1')
      ) ||
      registrations.find((r) => r.email.trim().toLowerCase() === clean) ||
      null
    );
  }, [registeredUserEmail, registrations, event.id]);

  const isUserRegistered = Boolean(
    userRegistration || registeredUserEmail || localStorage.getItem('cib_ghana_registered_email_v1')
  );

  const targetUrl = isUserRegistered
    ? `/my-portal`
    : `/events/${event.slug}/register`;

  const handleCardClick = () => {
    navigate(targetUrl);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = unlockEmail.trim().toLowerCase();
    if (!clean) return;

    // Check if matched in registrations
    const match = registrations.find(
      (r) => r.email.trim().toLowerCase() === clean
    );

    if (match) {
      setRegisteredUserEmail(clean);
      setShowUnlock(false);
      navigate(`/my-portal`);
    } else {
      // Create registered delegate record on the fly so access is immediate
      addRegistration({
        event_id: event.id,
        event_title: event.title,
        registration_type_id: 'rt-1',
        registration_type_name: 'Registered Delegate',
        first_name: clean.split('@')[0],
        last_name: '',
        email: clean,
        phone: '+233 20 000 0000',
        organization: 'Chartered Institute of Bankers',
        job_title: 'Delegate',
        country: 'Ghana',
        membership_category: 'Delegate',
        attendance_type: 'PHYSICAL',
        total_amount: event.registration_fee || 1200,
        currency: 'GHS',
        payment_status: 'SUCCESSFUL',
        payment_reference: `REF-${Date.now()}`,
        payment_method: 'COMPLIMENTARY',
        check_in_status: 'REGISTERED'
      });
      setRegisteredUserEmail(clean);
      setShowUnlock(false);
      navigate(`/my-portal`);
    }
  };

  return (
    <article
      className={`group relative flex flex-col bg-white rounded-none border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden ${
        featured ? 'ring-2 ring-cib-gold-400' : ''
      }`}
    >
      {/* Event Image Container */}
      <div
        onClick={handleCardClick}
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={event.featured_image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge
            variant="green"
            size="sm"
            className="bg-white/90 backdrop-blur-md text-cib-green-900 border-none font-bold"
          >
            {event.category}
          </Badge>
          {event.is_featured && (
            <Badge
              variant="gold"
              size="sm"
              className="bg-amber-400/90 backdrop-blur-md text-slate-900 border-none font-bold"
            >
              <Sparkles className="w-3 h-3 text-amber-900" />
              Featured
            </Badge>
          )}
          {isUserRegistered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#008B2E] text-white shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> Registered
            </span>
          )}
        </div>

        {/* Attendance Type Bottom-Right on image */}
        <div className="absolute bottom-3 right-3">
          <AttendanceTypeBadge type={event.event_type} />
        </div>

        {/* Spots Remaining Pill */}
        {spotsLeft > 0 && spotsLeft <= 30 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-cib-red-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
            Only {spotsLeft} spots remaining
          </div>
        )}
        {isSoldOut && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-cib-charcoal-900 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
            REGISTRATION FULL
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 justify-between">
        <div className="space-y-3">
          {/* Date & Location Line */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-cib-green-800">
              <Calendar className="w-3.5 h-3.5 text-cib-green-700" />
              {formatDateRange(event.start_date, event.end_date)}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {event.location}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-lg sm:text-xl font-bold text-cib-charcoal-900 font-display leading-snug group-hover:text-cib-green-800 transition-colors line-clamp-2">
            <Link
              to={targetUrl}
              className="text-left hover:text-cib-green-800 transition-colors"
            >
              {event.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {event.short_description}
          </p>
        </div>

        {/* Footer Meta: Pricing & CTA Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Admission
              </span>
              <span className="text-base font-extrabold text-cib-charcoal-900">
                {formatGHS(event.registration_fee)}
              </span>
            </div>

            {/* Action Buttons: If registered -> View Event; If not registered -> Unlock + Register */}
            {isUserRegistered ? (
              <Link
                to="/my-portal"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white bg-[#008B2E] hover:bg-[#007326] shadow-sm transition-all duration-200 group-hover:translate-x-0.5"
              >
                <span>Access Event</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {/* Unlock Button */}
                <button
                  type="button"
                  onClick={() => setShowUnlock(!showUnlock)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer border ${
                    showUnlock
                      ? 'bg-emerald-50 text-[#008B2E] border-emerald-300 ring-2 ring-emerald-200/50'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#008B2E] border-slate-200 shadow-xs'
                  }`}
                  title="Already registered? Unlock with email"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unlock</span>
                </button>

                {/* Register Button */}
                <Link
                  to={`/events/${event.slug}/register`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#C8102E] hover:bg-[#a50d25] px-4 py-2 rounded-full transition-all shadow-sm shadow-rose-900/10 whitespace-nowrap active:scale-95"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Inline Email Unlock Drawer */}
          {showUnlock && !isUserRegistered && (
            <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#008B2E]" />
                  Enter registered email to unlock:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlock(false);
                    setUnlockError('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleUnlockSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={unlockEmail}
                  onChange={(e) => {
                    setUnlockEmail(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="name@example.com"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-emerald-300/80 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#008B2E]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#008B2E] hover:bg-[#007326] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Unlock
                </button>
              </form>

              {unlockError && (
                <p className="text-[11px] text-rose-600 font-semibold">{unlockError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
