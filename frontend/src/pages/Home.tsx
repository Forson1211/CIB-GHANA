import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Shield,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  MessageSquare,
  FileText,
  ExternalLink,
  Navigation,
  Star,
  Landmark,
  ShieldCheck,
  Scale,
  Zap,
  GraduationCap
} from 'lucide-react';
import { useApp, isPurgedMockSpeaker } from '../context/AppContext';
import { Speaker } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { FeaturedSpeakersSlider } from '../components/events/FeaturedSpeakersSlider';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { GalleryLightbox } from '../components/events/GalleryLightbox';
import { EventHighlightMarquee } from '../components/events/EventHighlightMarquee';
import { GhanaBanksSponsorsMarquee } from '../components/home/GhanaBanksSponsorsMarquee';
interface AudienceItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  backBg: string;
  borderColor: string;
  accentColor: string;
  iconBg: string;
}

const AudienceFlipCard: React.FC<{ item: AudienceItem }> = ({ item }) => {
  const [flipped, setFlipped] = useState(false);
  const Icon = item.icon;

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="relative h-[220px] sm:h-[240px] w-full cursor-pointer [perspective:1000px] select-none group"
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front of Card (Solid Color) */}
        <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] ${item.bgColor} p-6 rounded-2xl flex flex-col items-center justify-center text-center text-white shadow-lg border border-white/20 group-hover:shadow-2xl group-hover:scale-[1.02] transition-all`}>
          <div className={`p-3.5 rounded-xl ${item.iconBg} ${item.accentColor} mb-3 shadow-inner`}>
            <Icon className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-white px-2">
            {item.title}
          </h3>
          <span className={`text-[11px] font-semibold ${item.accentColor} mt-3 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity`}>
            <span>Tap to flip</span>
            <span>↻</span>
          </span>
        </div>

        {/* Back of Card (Description) */}
        <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] ${item.backBg} p-6 rounded-2xl flex flex-col items-center justify-center text-center text-white shadow-xl border-2 ${item.borderColor}`}>
          <p className="text-sm sm:text-base font-medium leading-relaxed text-white/95 px-2">
            {item.description}
          </p>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${item.accentColor} mt-4 flex items-center gap-1`}>
            <span>Tap to return</span>
            <span>↺</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { events, speakers, registeredUserEmail } = useApp();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  // Only featured/keynote speakers appear on the homepage slider
  const featuredSpeakers = useMemo(() => {
    const valid = speakers.filter((s) => !isPurgedMockSpeaker(s));
    const keynotes = valid.filter((s) => s.is_keynote);
    return keynotes.length > 0 ? keynotes : valid;
  }, [speakers]);

  // Background photos for cinematic hero with smooth zoom & lag-free crossfade (venue images first)
  const heroBackgrounds = [
    '/aqua-safari-night.jpg',
    '/aqua-safari-deck.jpg',
    '/cib-conference-hall.jpg',
    '/cib-conference-hall-2.jpg',
  ];
  const [bgIndex, setBgIndex] = useState(0);
  const [prevBgIndex, setPrevBgIndex] = useState<number | null>(null);
  const [animKeys, setAnimKeys] = useState<number[]>([1, 0, 0, 0]);

  // Preload all hero backgrounds into browser cache immediately so no decode pauses or blank gaps occur
  useEffect(() => {
    heroBackgrounds.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((current) => {
        const next = (current + 1) % heroBackgrounds.length;
        setPrevBgIndex(current);
        setAnimKeys((keys) => {
          const updated = [...keys];
          updated[next] = Date.now();
          return updated;
        });
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [heroBackgrounds.length]);

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
    <div className="space-y-16 sm:space-y-24">
      {/* 1. CINEMATIC HERO SECTION (Matching User's Reference Screenshot) */}
      <section className="relative min-h-[92vh] flex items-center justify-start overflow-hidden bg-[#032616] text-white">
        {/* Full-width authentic conference banquet hall background images with smooth Ken Burns zoom & zero blank background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {heroBackgrounds.map((src, index) => {
            const isActive = index === bgIndex;
            return (
              <motion.div
                key={src}
                className="absolute inset-0 w-full h-full"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 2 : 1,
                }}
                transition={{
                  opacity: { duration: 1.8, ease: 'easeInOut' },
                }}
              >
                <motion.img
                  src={src}
                  alt="Chartered Institute of Bankers Ghana Conference Hall"
                  initial={false}
                  animate={{
                    scale: isActive ? 1.12 : 1.04,
                  }}
                  transition={{
                    scale: { duration: 7.0, ease: 'easeOut' },
                  }}
                  className="w-full h-full object-cover object-center brightness-[0.72] contrast-105"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Soft dark green tint on the left to ensure text legibility while letting the hall image show through clearly */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#032616]/65 via-[#032616]/30 via-35% to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#021a0f]/25 via-transparent to-transparent pointer-events-none" />

          {/* Connected Constellation Network Overlay matching the screenshot */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Constellation Nodes & Connecting Lines */}
            <g stroke="#22c55e" strokeWidth="0.75" fill="none">
              <line x1="15%" y1="20%" x2="28%" y2="28%" strokeDasharray="3 3" />
              <line x1="28%" y1="28%" x2="42%" y2="18%" />
              <line x1="42%" y1="18%" x2="58%" y2="25%" strokeDasharray="2 2" />
              <line x1="58%" y1="25%" x2="72%" y2="15%" />
              <line x1="72%" y1="15%" x2="88%" y2="24%" />
              <line x1="88%" y1="24%" x2="94%" y2="40%" />
              <line x1="28%" y1="28%" x2="22%" y2="45%" />
              <line x1="42%" y1="18%" x2="38%" y2="38%" />
              <line x1="58%" y1="25%" x2="62%" y2="48%" />
              <line x1="72%" y1="15%" x2="78%" y2="34%" />
              <line x1="78%" y1="34%" x2="88%" y2="52%" strokeDasharray="3 3" />
              <line x1="22%" y1="45%" x2="15%" y2="60%" />
              <line x1="38%" y1="38%" x2="48%" y2="55%" />
              <line x1="62%" y1="48%" x2="75%" y2="62%" />
              <line x1="88%" y1="52%" x2="95%" y2="68%" />
            </g>

            {/* Glowing Node Dots */}
            <g fill="#D4AF37">
              <circle cx="15%" cy="20%" r="3" className="animate-pulse" />
              <circle cx="28%" cy="28%" r="3.5" />
              <circle cx="42%" cy="18%" r="3" />
              <circle cx="58%" cy="25%" r="4" className="animate-ping opacity-75" />
              <circle cx="58%" cy="25%" r="3.5" />
              <circle cx="72%" cy="15%" r="3" />
              <circle cx="88%" cy="24%" r="4" />
              <circle cx="94%" cy="40%" r="3" />
              <circle cx="22%" cy="45%" r="3.5" />
              <circle cx="38%" cy="38%" r="3" />
              <circle cx="62%" cy="48%" r="4" />
              <circle cx="78%" cy="34%" r="3.5" />
              <circle cx="88%" cy="52%" r="3" />
              <circle cx="15%" cy="60%" r="3" />
              <circle cx="48%" cy="55%" r="3.5" />
              <circle cx="75%" cy="62%" r="3" />
              <circle cx="95%" cy="68%" r="3.5" />
            </g>
          </svg>

        {/* Hero Content aligned left with expanded widescreen breathing room */}
        {/* Hero Content with 2-column layout: Left (Title/CTAs) & Right (Countdown Timer) */}
        <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Title, Badge, Theme & Buttons (Left aligned on all screens) */}
            <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start w-full">
              {/* Top Date & Location Pill Badge (Left-aligned on mobile & desktop) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl sm:rounded-full bg-[#008129] backdrop-blur-md text-xs sm:text-sm font-semibold text-white shadow-2xl mx-0 max-w-full"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-1.5 sm:gap-4 text-left">
                  <span className="flex items-center justify-start gap-1.5 text-white">
                    <Calendar className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>8–10 November 2026</span>
                  </span>
                  <span className="hidden sm:block h-3 w-px bg-white/30" />
                  <span className="flex items-center justify-start gap-1.5 text-white">
                    <MapPin className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>Aqua Safari, Ada</span>
                  </span>
                </div>
              </motion.div>

              {/* Bold Headline (Left-aligned) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-1 w-full text-left"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] font-black font-display uppercase tracking-tight text-white leading-tight sm:leading-[1.03] text-left">
                  30TH NATIONAL <br className="hidden sm:inline" />
                  BANKING & ETHICS <br className="hidden sm:inline" />
                  CONFERENCE
                </h1>
              </motion.div>

              {/* Theme Text (Left-aligned) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed text-left mx-0"
              >
                <span className="font-extrabold text-[#F5A623] mr-2">Theme:</span>
                <span>
                  Banking on the Future — Trust, Technology and Transformation
                </span>
              </motion.div>

              {/* Two Action Buttons (Left-aligned, compact natural width) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-row flex-wrap items-center justify-start gap-3 sm:gap-4 pt-2 sm:pt-4"
              >
                {/* Left Gradient Button: Register Now / Access Event */}
                {registeredUserEmail ? (
                  <Link
                    to="/my-portal"
                    className="w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-none bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] hover:brightness-105 active:scale-95 text-white font-extrabold text-sm sm:text-base transition-all duration-200 shadow-xl text-center whitespace-nowrap"
                  >
                    <span>Access Event</span>
                  </Link>
                ) : (
                  <Link
                    to={`/events/${featuredEvent.slug}/register`}
                    className="w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-none bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] hover:brightness-105 active:scale-95 text-white font-extrabold text-sm sm:text-base transition-all duration-200 shadow-xl text-center whitespace-nowrap"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                )}

                {/* Right White Button: Sponsor / Exhibit */}
                <Link
                  to="/contact"
                  className="w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-none bg-white hover:bg-slate-100 text-cib-charcoal-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-xl active:scale-95 text-center whitespace-nowrap"
                >
                  <span>Sponsor / Exhibit</span>
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Countdown Timer Widget with Glassmorphic Background */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5 flex justify-start lg:justify-end w-full mt-4 lg:mt-0"
            >
              <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-7 rounded-none shadow-2xl flex flex-col items-center justify-center space-y-3 w-full max-w-sm sm:max-w-md mx-0 lg:mx-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] animate-ping" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#FFE500]">
                    Official Countdown
                  </span>
                </div>
                <CountdownTimer
                  targetDateStr={featuredEvent.start_date}
                  endDateStr={featuredEvent.end_date}
                  variant="gold"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. KEY STATS BANNER */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { label: 'EDITION', num: 30, suffix: 'th', icon: Award },
            { label: 'DAYS IN ADA', num: 2, suffix: '', icon: Calendar },
            { label: 'SPEAKERS & DIGNITARIES', num: 15, suffix: '+', icon: Users },
            { label: 'BIG CONVERSATION', num: 1, suffix: '', icon: MessageSquare },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariant}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#008129]/30 transition-all duration-300 flex items-center gap-4 group cursor-default"
              >
                <div className="p-3 rounded-xl bg-cib-green-50 text-cib-green-800 group-hover:bg-[#008129] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-cib-charcoal-900 font-display">
                    <AnimatedCounter to={stat.num} suffix={stat.suffix} />
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 4. ABOUT THE CONFERENCE SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Left Column: Heading and Narrative */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#008129]">
              ABOUT THE CONFERENCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cib-charcoal-900 font-display tracking-tight leading-tight text-left">
              Sixty years of shaping the banking profession
            </h2>
            <div className="space-y-4 text-slate-800 text-justify text-sm sm:text-base leading-relaxed sm:leading-7 pt-2">
              <p className="text-justify">
                For six decades, the National Banking &amp; Ethics Conference has brought together regulators, bank executives, and industry leaders shaping Ghana's financial sector.
              </p>
              <p className="text-justify">
                As artificial intelligence and digital assets redefine banking, <strong className="font-black text-slate-950">Trust, Technology and Transformation</strong> convenes professionals in Ada for boardroom-level keynotes, masterclasses, and strategic dialogue on the future of ethical finance.
              </p>
            </div>
          </div>

          {/* Right Column: Conference Photo with Quote Card */}
          <div className="lg:col-span-5 space-y-4 pt-1">
            {/* Conference Photo */}
            <div className="relative rounded-2xl overflow-hidden shadow-md h-[250px] sm:h-[280px] w-full group">
              <img
                src="/cib-conference-hall.jpg"
                alt="National Banking &amp; Ethics Conference"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#008129] text-white text-[10px] font-black uppercase tracking-wider">
                  30th Edition &bull; Ada
                </span>
                <span className="text-[11px] font-bold text-white/90">
                  8–10 Nov 2026
                </span>
              </div>
            </div>

            {/* Quote Card - Green Background with White Text, No Italics */}
            <div className="bg-[#008129] p-5 sm:p-6 rounded-2xl text-white shadow-md space-y-3 text-left">
              <Star className="w-5 h-5 text-[#FFE500] fill-[#FFE500]" />
              <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed">
                &ldquo;Chartered Institute of Bankers, Ghana (CIB Ghana) is mandated to promote the study of banking and regulate the practice of the banking profession in the country, under CIB Ghana Act 2019, Act 991.&rdquo;
              </p>
              <div className="pt-2 border-t border-white/20">
                <h5 className="font-bold text-white text-xs">
                  Chartered Institute of Bankers, Ghana
                </h5>
                <p className="text-[11px] text-white/80 font-medium">
                  Host of the 3T Conference
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2026 SPONSORS - GHANA COMMERCIAL BANKS MARQUEE */}
      <GhanaBanksSponsorsMarquee />

      {/* 5. WHY ATTEND SECTION (Requirement #11) */}
      <section className="bg-[#C8102E] py-16 sm:py-20 text-white overflow-hidden relative shadow-inner">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
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
            <div className="w-16 h-1 bg-[#F5A623] rounded-none mt-2" />
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
                border: 'hover:border-[#F20300]/30',
              },
              {
                title: 'LEARN',
                subtitle: 'Knowledge & Masterclasses',
                icon: BookOpen,
                color: 'text-amber-600',
                border: 'hover:border-[#F20300]/30',
              },
              {
                title: 'LEAD',
                subtitle: 'Policy & Governance',
                icon: Shield,
                color: 'text-[#F20300]',
                border: 'hover:border-[#F20300]/30',
              },
              {
                title: 'GROW',
                subtitle: 'CPD & Career Mastery',
                icon: TrendingUp,
                color: 'text-emerald-700',
                border: 'hover:border-[#F20300]/30',
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
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight group-hover:text-[#F20300] transition-colors">
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

      {/* 6. FEATURED SPEAKERS SECTION (Matching User Reference Layout in Brand Colors) */}
      <FeaturedSpeakersSlider
        speakers={featuredSpeakers}
        onSelectSpeaker={(spk) => setSelectedSpeaker(spk)}
      />

      {/* 6.5 WHO IT'S FOR SECTION (Interactive 3D Flip Cards in Brand Green) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-left space-y-2 max-w-3xl"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#008129]">
            WHO IT&apos;S FOR
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cib-charcoal-900 font-display tracking-tight text-left">
            Built for everyone shaping the banking sector
          </h2>
          <div className="w-16 h-1 bg-[#F5A623] rounded-none mt-2" />
        </motion.div>

        {/* 6 Interactive Flip Cards with Solid Brand Colors (No Gradients, No Blue) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Bank Executives & Senior Managers',
              description: 'Leaders setting strategy for the institutions navigating this transformation.',
              icon: Landmark,
              bgColor: 'bg-[#008129]',
              backBg: 'bg-[#023e16]',
              borderColor: 'border-[#008129]',
              accentColor: 'text-[#FFE500]',
              iconBg: 'bg-white/20',
            },
            {
              title: 'Compliance, Risk & Ethics Officers',
              description: 'Professionals holding the line on trust as new risks emerge.',
              icon: ShieldCheck,
              bgColor: 'bg-[#C8102E]',
              backBg: 'bg-[#500710]',
              borderColor: 'border-[#C8102E]',
              accentColor: 'text-[#FFD166]',
              iconBg: 'bg-white/20',
            },
            {
              title: 'Regulators & Policy Makers',
              description: 'Shaping the frameworks that keep pace with digital finance.',
              icon: Scale,
              bgColor: 'bg-[#D97706]',
              backBg: 'bg-[#451a03]',
              borderColor: 'border-[#D97706]',
              accentColor: 'text-[#FEF08A]',
              iconBg: 'bg-white/20',
            },
            {
              title: 'Fintech & Digital Banking Innovators',
              description: 'Builders working at the edge of AI, virtual assets and stablecoins.',
              icon: Zap,
              bgColor: 'bg-[#EA580C]',
              backBg: 'bg-[#431407]',
              borderColor: 'border-[#EA580C]',
              accentColor: 'text-[#FFEDD5]',
              iconBg: 'bg-white/20',
            },
            {
              title: 'Chartered Bankers',
              description: 'ACIB and FCIB members continuing their professional development.',
              icon: GraduationCap,
              bgColor: 'bg-[#16A34A]',
              backBg: 'bg-[#052e16]',
              borderColor: 'border-[#16A34A]',
              accentColor: 'text-[#DCFCE7]',
              iconBg: 'bg-white/20',
            },
            {
              title: 'Early-Career Professionals',
              description: 'The next generation of bankers, building their network early.',
              icon: Users,
              bgColor: 'bg-[#064E3B]',
              backBg: 'bg-[#021f17]',
              borderColor: 'border-[#10B981]',
              accentColor: 'text-[#6EE7B7]',
              iconBg: 'bg-white/20',
            },
          ].map((item, idx) => (
            <motion.div key={idx} variants={cardVariant}>
              <AudienceFlipCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </section>



      {/* 8. VENUE HIGHLIGHTS & PHOTO STREAM (3-Row Infinite Marquee) */}
      <section className="w-full overflow-hidden space-y-6 sm:space-y-8 py-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-left max-w-[1360px] mx-auto space-y-2 px-4 sm:px-6 lg:px-8"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#008129]">
            EXPLORE IMAGES & ARCHIVE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-cib-charcoal-900 font-display text-left">
            VENUE HIGHLIGHTS
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl text-left">
            Experience the scenic surroundings, waterfront amenities, and executive ambiance of Aqua Safari Resort, Ada.
          </p>
        </motion.div>

        {/* 3-Row Continuous Swiping Photo Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
        >
          <EventHighlightMarquee />
        </motion.div>
      </section>

      {/* 9. THE VENUE: AQUA SAFARI, ADA */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-left space-y-2 max-w-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#008129]">
            THE VENUE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-cib-charcoal-900 font-display text-left">
            Aqua Safari, Ada
          </h2>
          <div className="w-12 h-1 bg-[#008129] rounded-none" />
        </motion.div>

        {/* Venue Showcase Card - Left aligned and container-width in line with logo */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="relative rounded-none overflow-hidden border border-slate-200 shadow-xl group w-full"
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
        </motion.div>
      </section>

      {/* 10. EARLY BIRD PACKAGE (Book Early & Save) */}
      <section className="w-full bg-[#008129] py-16 sm:py-20 text-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 text-left">
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
                  Book before <strong className="text-white font-bold underline decoration-[#FFE500]">20th October 2026</strong> to lock in this rate
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
