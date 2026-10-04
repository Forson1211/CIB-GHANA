import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp, isPurgedMockSpeaker } from '../context/AppContext';
import { formatDateRange, formatGHS } from '../lib/utils';
import {
  MapPin,
  Users,
  Award,
  CheckCircle2,
  ExternalLink,
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Navigation,
  Copy,
  Check,
  KeyRound,
  X,
  Ticket
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SpeakerCard } from '../components/events/SpeakerCard';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { AgendaTimeline } from '../components/events/AgendaTimeline';
import { GalleryLightbox } from '../components/events/GalleryLightbox';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { VenueImageSlider } from '../components/home/VenueImageSlider';
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
        total_amount: event.registration_fee || 6000,
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

  // Clean deduplicated display location
  const displayLocation = useMemo(() => {
    if (!event) return '';
    const v = event.venue?.includes('Kempinski') ? 'Aqua Safari, Ada' : (event.venue || '');
    const l = event.venue?.includes('Kempinski') ? 'Ada, Ghana' : (event.location || '');
    if (!l) return v;
    if (!v) return l;
    if (v.toLowerCase().includes(l.toLowerCase())) return v;
    if (l.toLowerCase().includes(v.toLowerCase())) return l;
    return `${v}, ${l}`;
  }, [event]);

  // Main conference detection and structured hero labels matching Home screen
  const isMainConference = useMemo(() => {
    return (
      event?.slug?.includes('30th-national-banking') ||
      event?.title?.toLowerCase().includes('banking') ||
      event?.title?.toLowerCase().includes('30th')
    );
  }, [event]);

  const heroDate = useMemo(() => {
    if (isMainConference) return '9 – 10 NOV, 2026';
    return formatDateRange(event?.start_date, event?.end_date).toUpperCase();
  }, [isMainConference, event]);

  const heroVenue = useMemo(() => {
    if (isMainConference) {
      return {
        title: 'Aqua Safari Resort',
        subtitle: 'Volta River in Big Ada',
      };
    }
    const venueParts = (event?.venue || 'Aqua Safari Resort').split(',');
    return {
      title: venueParts[0]?.trim() || 'Aqua Safari Resort',
      subtitle: event?.location || 'Ada, Ghana',
    };
  }, [isMainConference, event]);

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

  // Ensure rich 3-day conference itinerary is always fully restored & rendered
  const defaultAgenda = MOCK_EVENTS.find((m) => m.id === event?.id)?.agenda || fallbackEvent?.agenda || [];
  const hasLatestSchedule = event?.agenda && event.agenda.some((s) => s.id?.includes('ag-d0-1') || s.title?.includes('Till Mama Calls') || s.title?.includes('Arrival of participants'));

  const effectiveAgenda = (event?.agenda && event.agenda.length > 0 && hasLatestSchedule)
    ? event.agenda
    : defaultAgenda.map((s) => ({ ...s, event_id: event?.id || 'evt-1' }));

  const handleCopyBadge = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D3A21] text-white space-y-16 sm:space-y-24 pb-20">
      {/* 1. CINEMATIC EVENT HERO (Simple & Neat without gradients) */}
      <section className="relative min-h-[70vh] sm:min-h-[600px] flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white py-16 sm:py-24 px-4">
        {/* Background Visual - Aqua Safari Resort Banner (Clean & Natural, No Gradients) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/aqua-safari-night.jpg"
            alt={event.title}
            className="w-full h-full object-cover brightness-[0.65] contrast-105"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Hero Content: Centered on mobile & desktop matching Home reference */}
        <div className="relative z-10 max-w-[1380px] mx-auto px-2 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-7 w-full my-auto">
          {/* Main Title */}
          <div className="space-y-2 text-center mx-auto max-w-4xl">
            <h1 className="text-[28px] xs:text-[34px] sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[72px] font-black text-white tracking-tight leading-[1.15] text-center font-display">
              {isMainConference ? (
                <>
                  30th National Banking <br />
                  &amp; Ethics Conference
                </>
              ) : (
                event.title
              )}
            </h1>
          </div>

          {/* Subtitle / Date & Location in Blocks with Dividing Line (Always side-by-side on all devices) */}
          <div className="flex flex-nowrap items-center justify-center gap-2.5 xs:gap-3.5 sm:gap-6 text-left mx-auto max-w-full px-1">
            {/* Date Block */}
            <div className="flex items-center text-left font-black select-none whitespace-nowrap shrink-0">
              <span className="text-[15px] xs:text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {heroDate}
              </span>
            </div>

            {/* Vertical Dividing Line */}
            <div className="w-[1.5px] sm:w-[2px] h-8 sm:h-12 bg-white/40 shrink-0" />

            {/* Location Block */}
            <div className="flex flex-col text-left justify-center shrink-0">
              <span className="text-[13px] xs:text-base sm:text-lg md:text-xl font-bold text-white tracking-wide leading-tight whitespace-nowrap">
                {heroVenue.title}
              </span>
              <span className="text-[10px] xs:text-xs sm:text-sm md:text-base text-white/90 font-medium tracking-wide mt-0.5 whitespace-nowrap">
                {heroVenue.subtitle}
              </span>
            </div>
          </div>

          {/* Two Action Buttons: Stacked full-width on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full max-w-[320px] xs:max-w-[360px] sm:max-w-none sm:w-auto mx-auto">
            {/* First Button: Full Green */}
            {isUserRegistered ? (
              <button
                type="button"
                onClick={() => navigate(ticketUrl)}
                className="w-full sm:w-auto px-6 sm:px-10 py-3.5 bg-[#008129] hover:bg-[#006e22] active:scale-95 text-white font-black uppercase text-sm sm:text-[14px] tracking-wider rounded-none shadow-2xl transition-all duration-200 text-center whitespace-nowrap cursor-pointer"
              >
                ACCESS EVENT PASS
              </button>
            ) : (
              <Link
                to={`/events/${event.slug}/register`}
                className="w-full sm:w-auto px-6 sm:px-10 py-3.5 bg-[#008129] hover:bg-[#006e22] active:scale-95 text-white font-black uppercase text-sm sm:text-[14px] tracking-wider rounded-none shadow-2xl transition-all duration-200 text-center whitespace-nowrap"
              >
                REGISTER NOW
              </Link>
            )}

            {/* Second Button: Full Yellow */}
            <a
              href="#agenda"
              className="w-full sm:w-auto px-6 sm:px-10 py-3.5 bg-[#FFE500] hover:bg-[#ebd300] active:scale-95 text-slate-950 font-black uppercase text-sm sm:text-[14px] tracking-wider rounded-none shadow-2xl transition-all duration-200 text-center whitespace-nowrap"
            >
              PROGRAM OUTLINE
            </a>
          </div>

          {/* Subtle Unlock / Credential indicator underneath buttons */}
          {isUserRegistered ? (
            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-white/80">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>
                Accredited Pass:{' '}
                <strong className="font-mono text-[#FFE500]">
                  {userRegistration?.registration_number || effectiveRegNumber}
                </strong>
              </span>
            </div>
          ) : (
            isRegistrationOpen && (
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-white/80 hover:text-white pt-1 font-medium tracking-wide transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#FFE500]" />
                <span className="underline underline-offset-4 decoration-white/40 hover:decoration-white">
                  Already Registered? Unlock Ticket
                </span>
              </button>
            )
          )}
        </div>
      </section>

      {/* 2. ABOUT THE EVENT */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFE500]">
                OVERVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
                ABOUT THE EVENT
              </h2>
            </div>

            <div className="max-w-none text-white/85 leading-relaxed space-y-4">
              {(event?.description || '').split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* KEY THEMES (Requirement #16 - Matching Reference Design Image 2) */}
            {event.themes && event.themes.length > 0 && (
              <div className="pt-8 space-y-5">
                <div className="bg-[#072113] text-white p-6 sm:p-8 rounded-none border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-1 pb-4 border-b border-white/10 text-left">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#FFE500]">
                      INSIGHTS. ACTIONS. OUTCOMES.
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                      Core Conference Themes
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Trust, Technology and Transformation &bull; 30th National Banking &amp; Ethics Conference
                    </p>
                  </div>

                  <div className="divide-y divide-white/10 mt-2 text-left">
                    {event.themes.map((theme, idx) => {
                      const icons = [
                        {
                          cat: 'Technology Rewiring',
                          desc: 'Scaling technology, ethical AI & fraud detection',
                          badge: (
                            <svg viewBox="0 0 48 48" className="w-10 h-10 shrink-0" fill="none">
                              <rect x="10" y="10" width="28" height="28" rx="6" fill="#831843" stroke="#EC4899" strokeWidth="1.5" />
                              <rect x="16" y="16" width="16" height="16" rx="3" fill="#072113" stroke="#06B6D4" strokeWidth="1.5" />
                              <circle cx="24" cy="24" r="3" fill="#FACC15" />
                              <path d="M16 10V4M24 10V4M32 10V4M16 44V38M24 44V38M32 44V38M10 16H4M10 24H4M10 32H4M44 16H38M44 24H38M44 32H38" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          ),
                        },
                        {
                          cat: 'Policy Rewiring',
                          desc: 'Aligning ethical culture & boardroom accountability',
                          badge: (
                            <svg viewBox="0 0 48 48" className="w-10 h-10 shrink-0" fill="none">
                              <rect x="12" y="8" width="22" height="14" rx="3" transform="rotate(35 24 16)" fill="#EC4899" stroke="#38BDF8" strokeWidth="1.5" />
                              <path d="M24 22L8 38" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
                              <rect x="28" y="34" width="16" height="8" rx="2" fill="#1E293B" stroke="#A855F7" strokeWidth="1.5" />
                            </svg>
                          ),
                        },
                        {
                          cat: 'Geoeconomic Rewiring',
                          desc: 'Building cross-border payments & AfCFTA trade corridors',
                          badge: (
                            <svg viewBox="0 0 48 48" className="w-10 h-10 shrink-0" fill="none">
                              <circle cx="24" cy="24" r="16" fill="#0F766E" stroke="#38BDF8" strokeWidth="1.5" />
                              <ellipse cx="24" cy="24" rx="8" ry="16" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="2 2" />
                              <line x1="8" y1="24" x2="40" y2="24" stroke="#FBBF24" strokeWidth="1.5" />
                            </svg>
                          ),
                        },
                        {
                          cat: 'Capital Rewiring',
                          desc: 'Rebuilding investment priorities & balance sheet resilience',
                          badge: (
                            <svg viewBox="0 0 48 48" className="w-10 h-10 shrink-0" fill="none">
                              <circle cx="24" cy="24" r="15" stroke="#F59E0B" strokeWidth="2.5" fill="#0A2F1B" />
                              <circle cx="24" cy="24" r="5" fill="#EC4899" />
                              <line x1="24" y1="9" x2="24" y2="19" stroke="#38BDF8" strokeWidth="2" />
                              <line x1="24" y1="29" x2="24" y2="39" stroke="#38BDF8" strokeWidth="2" />
                              <line x1="9" y1="24" x2="19" y2="24" stroke="#38BDF8" strokeWidth="2" />
                              <line x1="29" y1="24" x2="39" y2="24" stroke="#38BDF8" strokeWidth="2" />
                            </svg>
                          ),
                        },
                        {
                          cat: 'Sustainability Rewiring',
                          desc: 'Mobilizing ESG & green finance frameworks for African banks',
                          badge: (
                            <svg viewBox="0 0 48 48" className="w-10 h-10 shrink-0" fill="none">
                              <circle cx="24" cy="24" r="16" fill="#052E16" stroke="#10B981" strokeWidth="1.5" />
                              <path d="M24 12C24 12 32 18 32 26C32 32 28 36 22 36C16 36 14 32 14 26C14 18 24 12 24 12Z" fill="#10B981" />
                              <path d="M24 16V34" stroke="#FFE500" strokeWidth="1.5" />
                            </svg>
                          ),
                        },
                      ];
                      const meta = icons[idx % icons.length];
                      return (
                        <div key={idx} className="py-3.5 sm:py-4 flex items-center gap-3.5 group">
                          <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
                            {meta.badge}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                              {meta.cat}
                            </h4>
                            <p className="text-xs text-slate-300 font-normal leading-snug mt-0.5">
                              {meta.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Registration / Registered Delegate Sidebar Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-none border border-slate-200/90 shadow-card space-y-6">
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
                      className="w-full inline-flex flex-row items-center justify-center gap-2 py-2.5 px-4 rounded-none bg-[#008B2E] hover:bg-[#007326] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer whitespace-nowrap"
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
                        className="w-full rounded-none"
                        showArrow
                        onClick={() => navigate(`/events/${event.slug}/register`)}
                      >
                        Register for Event
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowUnlockModal(true)}
                        className="w-full py-2.5 px-3 rounded-none border border-emerald-200 hover:border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Already Registered? Unlock with Email</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-none text-center text-xs font-bold">
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
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-left max-w-3xl space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FFE500]">
              PROGRAMME ITINERARY
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display uppercase tracking-tight">
              CONFERENCE AGENDA
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl font-medium">
              Explore keynotes, regulatory addresses, masterclasses, mentorship sessions, and executive networking scheduled across Sunday Arrival, Day One, and Day Two.
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
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-left space-y-2 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-widest text-[#FFE500]">
            THE VENUE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display text-left tracking-tight">
            Aqua Safari, Ada
          </h2>
        </div>

        {/* Venue Showcase Slider */}
        <VenueImageSlider />
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
