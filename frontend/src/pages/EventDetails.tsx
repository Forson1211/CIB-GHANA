import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDateRange, formatGHS } from '../lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  FileDown,
  ExternalLink,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, AttendanceTypeBadge, EventStatusBadge } from '../components/ui/Badge';
import { SpeakerCard } from '../components/events/SpeakerCard';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { AgendaTimeline } from '../components/events/AgendaTimeline';
import { GalleryLightbox } from '../components/events/GalleryLightbox';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { Speaker } from '../types';
import { MOCK_EVENTS } from '../data/mockData';

export const EventDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, speakers } = useApp();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const event = slug ? getEventBySlug(slug) : undefined;

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-bold text-cib-charcoal-900 font-display">
          Event Not Found
        </h2>
        <p className="text-slate-600">
          The event you are looking for may have been removed or is no longer available.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/events')}>
          Back to All Events
        </Button>
      </div>
    );
  }

  const spotsLeft = Math.max(0, event.capacity - event.registered_count);
  const isRegistrationOpen = event.status === 'OPEN_FOR_REGISTRATION';

  // Ensure rich 2-day conference itinerary is always fully restored & rendered
  const defaultAgenda = MOCK_EVENTS[0]?.agenda || [];
  const effectiveAgenda = (event.agenda && event.agenda.length > 0)
    ? (event.agenda.some((s) => s.day_number === 2)
        ? event.agenda
        : [
            ...event.agenda,
            ...defaultAgenda
              .filter((s) => s.day_number === 2)
              .map((s) => ({ ...s, id: `${s.id}-${event.id}`, event_id: event.id })),
          ])
    : defaultAgenda.map((s) => ({ ...s, id: `${s.id}-${event.id}`, event_id: event.id }));

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

          {/* Hero Action Row */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {isRegistrationOpen && (
              <Button
                variant="accent"
                size="xl"
                showArrow
                onClick={() => navigate(`/events/${event.slug}/register`)}
              >
                Register Now &bull; {formatGHS(event.registration_fee)}
              </Button>
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
              {event.description.split('\n\n').map((paragraph, idx) => (
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

          {/* Quick Registration Sidebar Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
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
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  showArrow
                  onClick={() => navigate(`/events/${event.slug}/register`)}
                >
                  Register for Event
                </Button>
              ) : (
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-center text-xs font-bold">
                  Registration is currently closed
                </div>
              )}

              <p className="text-[11px] text-center text-slate-400">
                Member verification and instant digital ticket issuance upon checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY ATTEND (Requirement #16) */}
      {event.why_attend && event.why_attend.length > 0 && (
        <section className="bg-[#C8102E] py-16 text-white overflow-hidden shadow-inner">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFE500]">
                BENEFITS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display uppercase tracking-tight">
                WHY YOU SHOULD ATTEND
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {event.why_attend.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-cib-green-100 flex items-center justify-center text-cib-green-800 font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <h4 className="text-base font-bold text-cib-charcoal-900 font-display">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. SPEAKERS SECTION */}
      {event.speakers && event.speakers.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cib-green-700">
                CONFERENCE FACULTY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-cib-charcoal-900 font-display">
                FEATURED SPEAKERS
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {event.speakers.map((spk) => (
              <SpeakerCard
                key={spk.id}
                speaker={spk}
                onSelect={(speaker) => setSelectedSpeaker(speaker)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. INTERACTIVE AGENDA SECTION (Full-width Brand Red-to-Yellow Gradient Background matching Homepage) */}
      <section id="agenda" className="w-full bg-gradient-to-r from-[#F20300] via-[#F86400] to-[#FFC400] py-10 sm:py-14 text-white scroll-mt-24 shadow-inner">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-left max-w-3xl space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-200">
              PROGRAMME ITINERARY
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display uppercase tracking-tight">
              CONFERENCE AGENDA
            </h2>
            <p className="text-white/95 text-xs sm:text-sm max-w-2xl font-medium">
              Explore keynotes, regulatory addresses, CEO panel debates, and executive sessions scheduled across Day One and Day Two.
            </p>
          </div>

          <div className="w-full">
            <AgendaTimeline
              sessions={effectiveAgenda}
              speakers={event.speakers && event.speakers.length > 0 ? event.speakers : speakers}
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

      {/* 7. EVENT RESOURCES (Requirement #16 & #27) */}
      {event.resources && event.resources.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cib-green-700">
              COLLATERAL & DOWNLOADS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-cib-charcoal-900 font-display">
              EVENT RESOURCES
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event.resources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cib-green-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cib-green-50 text-cib-green-800">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-cib-charcoal-900">{res.title}</h5>
                    <p className="text-xs text-slate-500">{res.file_type} &bull; {res.file_size}</p>
                  </div>
                </div>

                <a
                  href={res.file_url}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-cib-green-50 text-slate-600 hover:text-cib-green-800 text-xs font-bold transition-colors"
                  download
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* Sticky Mobile Registration Bar (Requirement #55) */}
      {isRegistrationOpen && (
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
      )}

      {/* Speaker Dossier Modal */}
      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={selectedSpeaker !== null}
        onClose={() => setSelectedSpeaker(null)}
        eventTitle={event.title}
      />
    </div>
  );
};
