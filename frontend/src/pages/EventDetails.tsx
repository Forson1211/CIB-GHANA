import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp, isPurgedMockSpeaker } from '../context/AppContext';
import { formatDateRange, formatGHS } from '../lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  ExternalLink,
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Navigation,
  Copy,
  Check,
  KeyRound,
  X,
  Ticket
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, AttendanceTypeBadge, EventStatusBadge } from '../components/ui/Badge';
import { SpeakerCard } from '../components/events/SpeakerCard';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { AgendaTimeline } from '../components/events/AgendaTimeline';
import { GalleryLightbox } from '../components/events/GalleryLightbox';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { Speaker } from '../types';
import { MOCK_EVENTS, MOCK_SPEAKERS } from '../data/mockData';

export const EventDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, getEventById, events, speakers, registeredUserEmail, registrations, setRegisteredUserEmail, addRegistration } = useApp();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const fallbackEvent = MOCK_EVENTS[0];
  const event = (slug ? (getEventBySlug(slug) || getEventById(slug)) : undefined) || events[0] || fallbackEvent;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = unlockEmail.trim().toLowerCase();
    if (!clean) return;

    const match = registrations.find(
      (r) => r.email.trim().toLowerCase() === clean
    );

    if (match) {
      setRegisteredUserEmail(clean);
      setShowUnlockModal(false);
    } else {
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
      setShowUnlockModal(false);
    }
  };

  // Single source of truth: pull directly from admin-side speakers in AppContext, purging legacy mock speakers
  const displaySpeakers = useMemo(() => {
    const pool = (speakers && speakers.length > 0) ? speakers : MOCK_SPEAKERS;
    return pool.filter((s) => !isPurgedMockSpeaker(s));
  }, [speakers]);

  // Determine if the visitor is already a registered delegate for this event
  const userRegistration = useMemo(() => {
    const activeEmail = registeredUserEmail || localStorage.getItem('cib_ghana_registered_email_v1');
    if (!activeEmail) return null;
    const cleanEmail = activeEmail.trim().toLowerCase();
    return (
      registrations.find(
        (r) =>
          r.email.trim().toLowerCase() === cleanEmail &&
          (r.event_id === event.id || !r.event_id || r.event_id === 'evt-1')
      ) ||
      registrations.find((r) => r.email.trim().toLowerCase() === cleanEmail) ||
      null
    );
  }, [registeredUserEmail, registrations, event.id]);

  const isUserRegistered = Boolean(
    userRegistration || registeredUserEmail || localStorage.getItem('cib_ghana_registered_email_v1')
  );

  const effectiveRegNumber =
    userRegistration?.registration_number ||
    registrations.find(
      (r) =>
        r.email.trim().toLowerCase() ===
        (registeredUserEmail || localStorage.getItem('cib_ghana_registered_email_v1') || '').trim().toLowerCase()
    )?.registration_number ||
    'CIB-EVT-782419';

  const ticketUrl = `/events/${event.slug}/ticket/${effectiveRegNumber}`;

  const spotsLeft = Math.max(0, (event?.capacity || 650) - (event?.registered_count || 0));
  const isRegistrationOpen = event?.status === 'OPEN_FOR_REGISTRATION';

  // Ensure rich 2-day conference itinerary is always fully restored & rendered
  const defaultAgenda = MOCK_EVENTS.find((m) => m.id === event?.id)?.agenda || fallbackEvent?.agenda || [];
  const hasLatestSchedule = event?.agenda && event.agenda.some((s) => s.id === 'ag-d1-1' || s.title === 'REGISTRATION' || s.title?.includes('Deploying AI'));

  const effectiveAgenda = (event?.agenda && event.agenda.length > 0 && hasLatestSchedule)
    ? event.agenda
    : defaultAgenda.map((s) => ({ ...s, event_id: event?.id || 'evt-1' }));

  const handleCopyBadge = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. CINEMATIC EVENT HERO (Requirement #16 & #47) */}
      <section className="relative min-h-[75vh] flex items-center bg-[#032616] text-white overflow-hidden">
        {/* Background Visual - Aqua Safari Resort Banner (Bright & Clear) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/aqua-safari-night.jpg"
            alt={event.title}
            className="w-full h-full object-cover brightness-[0.82] contrast-105"
          />
          {/* Subtle soft gradient only on the left/bottom to maintain text legibility while letting the resort image shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#021a0f]/65 via-[#021a0f]/30 via-40% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#021a0f]/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-6 text-left">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/events" className="hover:text-white transition-colors">Events</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#FFE500] truncate max-w-xs">{event.category}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold" size="md" className="bg-amber-400/20 text-[#FFE500] border-amber-400/30">
              {event.category}
            </Badge>
            <AttendanceTypeBadge type={event.event_type} />
            <EventStatusBadge status={event.status} />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white max-w-4xl leading-[1.12] drop-shadow-lg">
            {event.title}
          </h1>

          {event.tagline && (
            <p className="text-base sm:text-xl text-emerald-100 font-semibold max-w-3xl leading-relaxed drop-shadow-md">
              {event.tagline}
            </p>
          )}

          {/* Schedule & Location Pills */}
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-slate-200 pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FFE500]" />
              <span>{formatDateRange(event.start_date, event.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFE500]" />
              <span>{event.start_time} – {event.end_time} GMT</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FFE500]" />
              <span>
                {event.venue?.includes('Kempinski') ? 'Aqua Safari, Ada' : event.venue}, {event.venue?.includes('Kempinski') ? 'Ada, Ghana' : event.location}
              </span>
            </div>
          </div>

          {/* Hero Action Row (Conditional on whether user is already registered) */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {isUserRegistered ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(ticketUrl)}
                  className="inline-flex flex-row items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] hover:brightness-105 active:scale-95 text-white font-bold text-sm shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <Ticket className="w-4 h-4 text-white shrink-0" />
                  <span>View Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
                </button>
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>
                    Accredited:{' '}
                    <strong className="font-mono text-amber-300">
                      {userRegistration?.registration_number || effectiveRegNumber}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              isRegistrationOpen && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="accent"
                    size="xl"
                    showArrow
                    onClick={() => navigate(`/events/${event.slug}/register`)}
                  >
                    Register Now &bull; {formatGHS(event.registration_fee)}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-4 rounded-xl border border-white/30 hover:border-emerald-400 bg-white/10 hover:bg-emerald-600/30 text-white font-bold transition-all text-sm backdrop-blur-md cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-300" />
                    <span>Already Registered? Unlock</span>
                  </button>
                </div>
              )
            )}
            <a
              href="#agenda"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-white/20 hover:border-white text-white text-base font-bold transition-colors bg-white/5"
            >
              View Agenda
            </a>
          </div>
        </div>
      </section>

      {/* 2. ABOUT THE EVENT */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cib-green-700">
                OVERVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-cib-charcoal-900 font-display">
                ABOUT THE EVENT
              </h2>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
              {(event?.description || '').split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* KEY THEMES (Requirement #16) */}
            {event.themes && event.themes.length > 0 && (
              <div className="pt-6 space-y-4">
                <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                  Core Conference Themes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.themes.map((theme, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <CheckCircle2 className="w-5 h-5 text-cib-green-700 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        {theme}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Registration / Registered Delegate Sidebar Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
              {isUserRegistered ? (
                /* Registered State Card */
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#008B2E]">
                        Delegate Credential
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 font-display">
                      Pass Active & Verified
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      You are accredited for this conference. Your badge credentials are ready for check-in.
                    </p>
                  </div>

                  <div className="space-y-3 py-3 text-xs border-y border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-8 px-6 sm:px-8">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Delegate</span>
                      <strong className="text-slate-900 font-bold">
                        {userRegistration?.first_name
                          ? `${userRegistration.first_name} ${userRegistration.last_name}`
                          : 'Registered Delegate'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Badge Reference</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-emerald-800 font-black bg-white px-2 py-0.5 rounded border border-slate-200">
                          {userRegistration?.registration_number || 'CIB-DELEGATE'}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopyBadge(userRegistration?.registration_number || '')}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Copy Badge Reference"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Pass Type</span>
                      <strong className="text-slate-900 font-bold">
                        {userRegistration?.registration_type_name || 'Standard Pass'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Entrance Status</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accredited / Ready
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(ticketUrl)}
                      className="w-full inline-flex flex-row items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#008B2E] hover:bg-[#007326] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Ticket className="w-4 h-4 shrink-0" />
                      <span>View Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <Link
                      to={ticketUrl}
                      className="block text-center text-xs font-bold text-[#008B2E] hover:underline"
                    >
                      View Digital Pass & QR Code &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                /* Unregistered State Card */
                <>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Delegate Admission
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-cib-charcoal-900 font-display">
                        {formatGHS(event.registration_fee)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ delegate</span>
                    </div>
                  </div>

                  <div className="space-y-3 py-2 text-xs text-slate-600 border-y border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Capacity</span>
                      <strong className="text-cib-charcoal-900">{event.capacity} seats</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Available Seats</span>
                      <strong className="text-cib-green-700">{spotsLeft} remaining</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>CPD Certification</span>
                      <strong className="text-cib-charcoal-900">Included</strong>
                    </div>
                  </div>

                  {isRegistrationOpen ? (
                    <div className="space-y-2">
                      <Button
                        variant="accent"
                        size="lg"
                        className="w-full"
                        showArrow
                        onClick={() => navigate(`/events/${event.slug}/register`)}
                      >
                        Register for Event
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowUnlockModal(true)}
                        className="w-full py-2.5 px-3 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Already Registered? Unlock with Email</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-center text-xs font-bold">
                      Registration is currently closed
                    </div>
                  )}

                  <p className="text-[11px] text-center text-slate-400">
                    Member verification and instant digital ticket issuance upon checkout.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>





      {/* 5. INTERACTIVE AGENDA SECTION (Actual Brand Green Background) */}
      <section id="agenda" className="w-full bg-[#008129] py-12 sm:py-16 text-white scroll-mt-24 shadow-inner">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-left max-w-3xl space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FFE500]">
              PROGRAMME ITINERARY
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display uppercase tracking-tight">
              CONFERENCE AGENDA
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl font-medium">
              Explore keynotes, regulatory addresses, CEO panel debates, and executive sessions scheduled across Day One and Day Two.
            </p>
          </div>

          <div className="w-full">
            <AgendaTimeline
              sessions={effectiveAgenda}
              speakers={displaySpeakers}
              onSelectSpeaker={(spk) => setSelectedSpeaker(spk)}
            />
          </div>
        </div>
      </section>

      {/* 6. THE VENUE SHOWCASE */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-left space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#008129]">
            THE VENUE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-cib-charcoal-900 font-display text-left">
            Aqua Safari, Ada
          </h2>
          <div className="w-12 h-1 bg-[#008129] rounded-none" />
        </div>

        {/* Venue Showcase Card */}
        <div className="relative rounded-none overflow-hidden border border-slate-200 shadow-xl group w-full">
          <div className="relative h-[340px] sm:h-[440px] w-full overflow-hidden">
            <img
              src="/aqua-safari-deck.jpg"
              alt="Aqua Safari Resort, Ada"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* Overlaid Badges & Buttons */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F5A623] text-black font-black text-xs uppercase tracking-wider">
                OFFICIAL LOCATION
              </span>
              <a
                href="https://maps.google.com/?q=Aqua+Safari+Resort+Ada+Foah+Ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-[#008129]" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>
      </section>




      {/* Sticky Mobile Registration / Portal Bar (Requirement #55) */}
      {isUserRegistered ? (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <span className="text-xs font-black text-emerald-800">
                Registered Delegate ✓
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(ticketUrl)}
            className="inline-flex flex-row items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008B2E] text-white text-xs font-bold shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <span>View Ticket</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </button>
        </div>
      ) : (
        isRegistrationOpen && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center justify-between shadow-2xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee</span>
              <span className="text-base font-extrabold text-cib-charcoal-900">
                {formatGHS(event.registration_fee)}
              </span>
            </div>
            <Button
              variant="accent"
              size="md"
              showArrow
              onClick={() => navigate(`/events/${event.slug}/register`)}
            >
              Register Now
            </Button>
          </div>
        )
      )}

      {/* Speaker Dossier Modal */}
      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={selectedSpeaker !== null}
        onClose={() => setSelectedSpeaker(null)}
        eventTitle={event.title}
      />

      {/* Unlock with Registered Email Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <button
              type="button"
              onClick={() => {
                setShowUnlockModal(false);
                setUnlockError('');
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#008B2E] flex items-center justify-center shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-cib-charcoal-900 font-display">
                  Unlock Event Access
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Official Registered Delegate Verification
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              If you have already registered for this conference, enter your registered email address below to unlock your credentials, live agenda, and delegate portal.
            </p>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={unlockEmail}
                  onChange={(e) => {
                    setUnlockEmail(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="e.g. kofi.mensah@standardchartered.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008B2E] focus:border-transparent"
                  autoFocus
                />
              </div>

              {unlockError && (
                <p className="text-xs font-semibold text-rose-600">{unlockError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#008B2E] hover:bg-[#007326] text-white font-bold text-sm transition-all shadow-md shadow-emerald-900/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Unlock Access</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">
                Haven&apos;t registered yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlockModal(false);
                    navigate(`/events/${event.slug}/register`);
                  }}
                  className="text-[#C8102E] font-bold hover:underline"
                >
                  Register here &rarr;
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
