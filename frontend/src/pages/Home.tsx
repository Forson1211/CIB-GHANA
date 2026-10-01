import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  FileText,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { useApp, isPurgedMockSpeaker } from '../context/AppContext';
import { Speaker } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { FeaturedSpeakersSlider } from '../components/events/FeaturedSpeakersSlider';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { GalleryLightbox } from '../components/events/GalleryLightbox';
import { EventHighlightMarquee } from '../components/events/EventHighlightMarquee';
import { GhanaBanksSponsorsMarquee } from '../components/home/GhanaBanksSponsorsMarquee';
import { CoreConferenceThemes } from '../components/home/CoreConferenceThemes';
import { LeadershipQuoteSpotlight } from '../components/home/LeadershipQuoteSpotlight';
import { SecurePlaceCtaBanner } from '../components/home/SecurePlaceCtaBanner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { events, speakers, refreshSpeakers, registeredUserEmail } = useApp();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  // Guarantee that refreshing on the Home screen resets scroll position to the top
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  // Sync live speakers from Supabase on mount
  useEffect(() => {
    if (refreshSpeakers) {
      refreshSpeakers();
    }
  }, [refreshSpeakers]);

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Critical properties for instant autoplay and smooth loop
    v.defaultMuted = true;
    v.muted = true;
    v.volume = 0;
    v.playbackRate = 1.0;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('autoplay', '');
    v.setAttribute('loop', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', 'true');
    v.setAttribute('x5-playsinline', 'true');

    const ensurePlaying = () => {
      if (v.paused) {
        v.play().catch(() => {});
      }
    };

    // Seamless loop: seamlessly reset to start right before EOF to prevent browser EOF buffering pause
    const handleTimeUpdate = () => {
      if (v.duration && v.currentTime >= v.duration - 0.25) {
        v.currentTime = 0.01;
        ensurePlaying();
      }
    };

    const handleEnded = () => {
      v.currentTime = 0;
      ensurePlaying();
    };

    const handlePause = () => {
      // Never stop: resume immediately if paused
      ensurePlaying();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        ensurePlaying();
      }
    };

    v.addEventListener('timeupdate', handleTimeUpdate);
    v.addEventListener('ended', handleEnded);
    v.addEventListener('pause', handlePause);
    v.addEventListener('stalled', ensurePlaying);
    v.addEventListener('waiting', ensurePlaying);
    v.addEventListener('canplay', ensurePlaying);
    v.addEventListener('loadeddata', ensurePlaying);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial play attempts
    ensurePlaying();

    // Heartbeat watchdog: checks every 500ms to guarantee it is NEVER stopped
    const watchdog = setInterval(() => {
      if (v.paused) {
        ensurePlaying();
      }
    }, 500);

    // Interaction fallback for strict battery saver or low power mode
    const unlockEvents = ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'];
    const handleUnlock = () => {
      ensurePlaying();
      unlockEvents.forEach((evt) => window.removeEventListener(evt, handleUnlock));
    };
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, handleUnlock, { passive: true, once: true });
    });

    return () => {
      clearInterval(watchdog);
      v.removeEventListener('timeupdate', handleTimeUpdate);
      v.removeEventListener('ended', handleEnded);
      v.removeEventListener('pause', handlePause);
      v.removeEventListener('stalled', ensurePlaying);
      v.removeEventListener('waiting', ensurePlaying);
      v.removeEventListener('canplay', ensurePlaying);
      v.removeEventListener('loadeddata', ensurePlaying);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUnlock);
      });
    };
  }, []);

  // Only featured/keynote speakers appear on the homepage slider
  const featuredSpeakers = useMemo(() => {
    const valid = speakers.filter((s) => !isPurgedMockSpeaker(s));
    const keynotes = valid.filter((s) => s.is_keynote);
    return keynotes.length > 0 ? keynotes : valid;
  }, [speakers]);



  // Primary featured event
  const featuredEvent = events.find((e) => e.is_featured && !e.is_past) || events[0];

  // Past events
  const pastEvents = events.filter((e) => e.is_past);

  // Gallery items aggregated from featured & past events
  const galleryItems = [
    ...(featuredEvent?.gallery || []),
    ...(pastEvents[0]?.gallery || []),
  ].slice(0, 8);

  // WordPress-style smooth scroll entrance variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const cardVariant: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="flex flex-col">
      {/* 1. CINEMATIC HERO SECTION (In Official CIB Ghana Green #0D3A21) */}
      <section id="hero-section" className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-[#072113] text-white pt-24 sm:pt-28 pb-16 px-4">
        {/* Full-width Ambient Background Video (Auto-looping, Muted, 100% Full Section Cover) */}
        {/* Full 100% section video — vmax trick ensures no gap regardless of aspect ratio */}
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-[#072113]"
          style={{
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            onEnded={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => {});
              }
            }}
            onPause={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            }}
            onCanPlay={() => {
              if (videoRef.current && videoRef.current.paused) {
                videoRef.current.play().catch(() => {});
              }
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate3d(-50%, -50%, 0)',
              WebkitTransform: 'translate3d(-50%, -50%, 0)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              width: '100.5%',
              height: '100.5%',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              pointerEvents: 'none',
            }}
          >
            <source src="/the-pan-african-bank.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Brand green overlay: rich green presence across the entire background */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(7, 33, 19, 0.72) 0%, rgba(13, 58, 33, 0.55) 45%, rgba(13, 58, 33, 0.48) 100%)',
          }}
        />

        {/* Perfectly balanced bottom gradient fade — solid dark base behind counter that smoothly feathers into video */}
        <div
          className="absolute bottom-0 left-0 right-0 h-44 sm:h-52 z-[2] pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, #072113 0%, rgba(7, 33, 19, 0.92) 35%, rgba(7, 33, 19, 0.6) 65%, transparent 100%)',
          }}
        />

        {/* Hero Content: Centered in the middle on mobile matching reference, clean on desktop */}
        <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col items-center md:items-start justify-center space-y-6 sm:space-y-7 w-full my-auto">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-2 text-center md:text-left mx-auto md:mx-0 max-w-4xl"
          >
            <h1 className="text-[34px] xs:text-[40px] sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[72px] font-extrabold text-white tracking-tight leading-[1.12] text-center md:text-left font-display">
              30th National Banking <br className="hidden sm:block" />
              &amp; Ethics Conference
            </h1>
          </motion.div>

          {/* Subtitle / Date & Location in Blocks with Dividing Line */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-left mx-auto md:mx-0"
          >
            {/* Date Block (On One Line) */}
            <div className="flex items-center text-left font-black select-none whitespace-nowrap">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                9 - 10 NOV, 2026
              </span>
            </div>

            {/* Vertical Dividing Line */}
            <div className="w-[1.5px] sm:w-[2px] h-9 sm:h-12 bg-white/40 shrink-0" />

            {/* Location Block */}
            <div className="flex flex-col text-left justify-center">
              <span className="text-base sm:text-lg md:text-xl font-bold text-white tracking-wide leading-tight">
                Aqua Safari Resort
              </span>
              <span className="text-xs sm:text-sm md:text-base text-white/90 font-medium tracking-wide mt-0.5">
                Volta River in Big Ada
              </span>
            </div>
          </motion.div>


          {/* Two Action Buttons: Stacked full-width & centered on mobile, inline on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5 sm:gap-4 pt-3 sm:pt-4 w-full sm:w-auto mx-auto md:mx-0"
          >
            {/* First Button: Full Green */}
            <Link
              to={
                registeredUserEmail
                  ? '/my-portal'
                  : `/events/${featuredEvent?.slug || '30th-national-banking-ethics-conference-2026'}/register`
              }
              className="w-full max-w-sm sm:max-w-none sm:w-auto px-8 sm:px-10 py-4 sm:py-3.5 bg-[#008129] hover:bg-[#006e22] active:scale-95 text-white font-black uppercase text-sm sm:text-[14px] tracking-wider rounded-none shadow-2xl transition-all duration-200 text-center whitespace-nowrap"
            >
              {registeredUserEmail ? 'ACCESS EVENT PASS' : 'REGISTER NOW'}
            </Link>

            {/* Second Button: Full Yellow */}
            <Link
              to={`/events/${featuredEvent?.slug || '30th-national-banking-ethics-conference-2026'}`}
              className="w-full max-w-sm sm:max-w-none sm:w-auto px-8 sm:px-10 py-4 sm:py-3.5 bg-[#FFE500] hover:bg-[#ebd300] active:scale-95 text-slate-950 font-black uppercase text-sm sm:text-[14px] tracking-wider rounded-none shadow-2xl transition-all duration-200 text-center whitespace-nowrap"
            >
              ABOUT EVENT
            </Link>
          </motion.div>
        </div>

        {/* Countdown Bar pinned to the very bottom of the hero — floating naturally over the bottom gradient with no hard box or border */}
        <div className="absolute bottom-0 left-0 right-0 z-20 w-full pb-5 pt-3">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/90 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] animate-pulse" />
              <span className="uppercase tracking-widest font-black text-[#FFE500] text-xs sm:text-sm drop-shadow-md">Official Event Countdown</span>
            </div>
            <CountdownTimer
              targetDateStr={featuredEvent?.start_date || '2026-11-09T08:30:00Z'}
              endDateStr={featuredEvent?.end_date || '2026-11-10T17:30:00Z'}
              variant="gold"
              className="scale-90 sm:scale-95 origin-center sm:origin-right"
            />
          </div>
        </div>
      </section>

      {/* CORE CONFERENCE THEMES (Matching Reference Design Image 2 with 5 Themes from Image 1) */}
      <div id="themes" className="scroll-mt-24">
        <CoreConferenceThemes />
      </div>

      {/* 6. FEATURED SPEAKERS SECTION (Matching User Reference Layout in Brand Colors) */}
      <div id="speakers" className="scroll-mt-24">
        <FeaturedSpeakersSlider
          speakers={featuredSpeakers}
          onSelectSpeaker={(spk) => setSelectedSpeaker(spk)}
        />
      </div>

      {/* 2026 SPONSORS - GHANA COMMERCIAL BANKS MARQUEE */}
      <GhanaBanksSponsorsMarquee />

      {/* LEADERSHIP PRESIDENTIAL SPOTLIGHT (Dr. Ellen Ohene-Afoakwa - President, CIB Ghana) */}
      <div id="leadership" className="scroll-mt-24">
        <LeadershipQuoteSpotlight onSelectSpeaker={(spk) => setSelectedSpeaker(spk)} />
      </div>

      {/* SECURE YOUR PLACE CTA BANNER (With Brand Green & Vibrant Yellow Button) */}
      <div id="register-cta" className="scroll-mt-24">
        <SecurePlaceCtaBanner />
      </div>

      {/* 5. WHY ATTEND SECTION (Requirement #11 - Updated to Brand Green #0D3A21) */}
      <section id="why-attend" className="bg-[#0D3A21] py-16 sm:py-20 text-white overflow-hidden relative border-b border-white/10 scroll-mt-24">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-left max-w-3xl space-y-2.5"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display uppercase tracking-tight">
              Why Attend?
            </h2>
            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-medium">
              Gain practical industry knowledge, meet banking leaders, and advance your career.
            </p>
            <div className="w-16 h-1 bg-[#FFE500] rounded-none mt-2" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: 'CONNECT',
                subtitle: 'Network & Partnerships',
                icon: Users,
                color: 'text-[#008129]',
                border: 'hover:border-[#008129]/40',
              },
              {
                title: 'LEARN',
                subtitle: 'Knowledge & Masterclasses',
                icon: BookOpen,
                color: 'text-amber-500',
                border: 'hover:border-amber-400/40',
              },
              {
                title: 'LEAD',
                subtitle: 'Policy & Governance',
                icon: Shield,
                color: 'text-[#008129]',
                border: 'hover:border-[#008129]/40',
              },
              {
                title: 'GROW',
                subtitle: 'CPD & Career Mastery',
                icon: TrendingUp,
                color: 'text-emerald-600',
                border: 'hover:border-emerald-400/40',
              },
            ].map((block, idx) => {
              const Icon = block.icon;
              return (
                <motion.div
                  key={idx}
                  variants={cardVariant}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                  className={`bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center justify-center space-y-4 group cursor-pointer ${block.border}`}
                >
                  {/* Clean Icon without background shape - nicely enlarged */}
                  <div className="flex items-center justify-center py-2 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-14 h-14 sm:w-16 sm:h-16 ${block.color} stroke-[2.2]`} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight group-hover:text-[#008129] transition-colors">
                      {block.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">
                      {block.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 8. VENUE HIGHLIGHTS & PHOTO STREAM (3-Row Infinite Marquee - Brand Green #0D3A21) */}
      <section id="venue-highlights" className="w-full bg-[#0D3A21] text-white overflow-hidden space-y-6 sm:space-y-8 py-16 sm:py-20 relative border-b border-white/10 scroll-mt-24">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-left max-w-[1380px] mx-auto space-y-2 px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <span className="text-xs font-black uppercase tracking-widest text-[#FFE500]">
            EXPLORE IMAGES &amp; ARCHIVE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display text-left tracking-tight">
            VENUE HIGHLIGHTS
          </h2>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl text-left font-normal leading-relaxed">
            Experience the scenic surroundings, waterfront amenities, and executive ambiance of Aqua Safari Resort, Ada.
          </p>
        </motion.div>

        {/* 3-Row Continuous Swiping Photo Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <EventHighlightMarquee />
        </motion.div>
      </section>

      {/* 9. THE VENUE: AQUA SAFARI, ADA (Brand Green #0D3A21) */}
      <section id="the-venue" className="w-full bg-[#0D3A21] text-white py-16 sm:py-20 relative overflow-hidden border-b border-white/10 scroll-mt-24">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 text-left relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-left space-y-2 max-w-2xl"
          >
            <span className="text-xs font-black uppercase tracking-widest text-[#FFE500]">
              THE VENUE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display text-left tracking-tight">
              Aqua Safari, Ada
            </h2>
            <div className="w-16 h-1 bg-[#FFE500] rounded-none mt-2" />
          </motion.div>

          {/* Venue Showcase Card - Left aligned and container-width in line with logo */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="relative rounded-none overflow-hidden border border-white/15 shadow-2xl group w-full"
          >
            <div className="relative h-[340px] sm:h-[440px] w-full overflow-hidden">
              <img
                src="/aqua-safari-deck.jpg"
                alt="Aqua Safari Resort, Ada"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Overlaid Badges & Buttons */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 bg-[#FFE500] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                  OFFICIAL LOCATION
                </span>
                <a
                  href="https://maps.google.com/?q=Aqua+Safari+Resort+Ada+Foah+Ghana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#008129]" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. EARLY BIRD PACKAGE (Book Early & Save) */}
      <section id="early-bird" className="w-full bg-[#008129] py-16 sm:py-20 text-white scroll-mt-24">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Description, and Amounts */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="space-y-3 max-w-xl text-left">
                <span className="inline-block px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#FFE500] bg-white/10">
                  BOOK EARLY &amp; SAVE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight text-left">
                  Early Bird Package
                </h2>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed text-left">
                  Accommodation for two nights, conference and masterclass fee, dinner for two nights and other complimentary activities.
                </p>
              </div>

              {/* Amounts (Single & Double Occupancy Cards - No Strokes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {/* Single Occupancy */}
                <div className="p-6 bg-black/15 transition-all text-left space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#FFE500] block text-left">
                    SINGLE OCCUPANCY
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-display text-white text-left">
                    GHS 5,600
                  </div>
                  <p className="text-xs text-white/80 font-medium text-left">Early bird rate</p>
                </div>

                {/* Double Occupancy */}
                <div className="p-6 bg-black/15 transition-all text-left space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#FFE500] block text-left">
                    DOUBLE OCCUPANCY
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-display text-white text-left">
                    GHS 4,000
                  </div>
                  <p className="text-xs text-white/80 font-medium text-left">Early bird rate, per person</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Timer on Top, Register Underneath (Aligned with navbar register button on right) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              className="lg:col-span-5 flex flex-col justify-center lg:items-end space-y-6 text-left lg:text-right"
            >
              {/* Top Box: Deadline & Countdown Timer */}
              <div className="space-y-3 text-left lg:text-right flex flex-col lg:items-end">
                <p className="text-xs sm:text-sm text-white/90">
                  Book before <strong className="text-[#FFE500] font-bold">20th October 2026</strong> to lock in this rate
                </p>
                <div className="flex justify-start lg:justify-end w-full">
                  <CountdownTimer
                    targetDateStr="2026-10-20T23:59:59Z"
                    variant="circular"
                    className="justify-start lg:justify-end"
                  />
                </div>
              </div>

              {/* Bottom Box: Register Button & Post-Deadline Rates */}
              <div className="space-y-3 text-left lg:text-right flex flex-col lg:items-end">
                <div>
                  {registeredUserEmail ? (
                    <Link
                      to="/my-portal"
                      className="inline-flex items-center justify-center px-8 py-3.5 bg-[#F5A623] hover:bg-[#e09618] active:scale-95 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl"
                    >
                      <span>Access Event</span>
                    </Link>
                  ) : (
                    <Link
                      to="/events/30th-national-banking-ethics-conference-2026/register"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#F5A623] hover:bg-[#e09618] active:scale-95 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <p className="text-[11px] text-white/70">
                  Standard rate after the deadline is GHS 6,200 single / GHS 4,500 double
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Speaker Modal */}
      <SpeakerModal
        speaker={selectedSpeaker}
        isOpen={selectedSpeaker !== null}
        onClose={() => setSelectedSpeaker(null)}
        eventTitle={featuredEvent?.title}
      />
    </div>
  );
};
