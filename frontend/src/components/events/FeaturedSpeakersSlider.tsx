import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Speaker } from '../../types';
import { isPurgedMockSpeaker } from '../../context/AppContext';
import { ProfilePlaceholder } from '../ui/ProfilePlaceholder';

interface FeaturedSpeakersSliderProps {
  speakers: Speaker[];
  onSelectSpeaker?: (speaker: Speaker) => void;
}

export const FeaturedSpeakersSlider: React.FC<FeaturedSpeakersSliderProps> = ({
  speakers: inputSpeakers,
  onSelectSpeaker,
}) => {
  const speakers = React.useMemo(() => {
    const valid = (inputSpeakers || []).filter((s) => !isPurgedMockSpeaker(s));
    const keynotes = valid.filter((s) => s.is_keynote);
    return keynotes.length > 0 ? keynotes : valid;
  }, [inputSpeakers]);

  if (!speakers || speakers.length === 0) {
    return null;
  }

  const total = speakers.length;
  // Initialize in the middle set of a 3x extended array for seamless two-way looping
  const [currentIndex, setCurrentIndex] = useState(total);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isHovered, setIsHovered] = useState(false);

  const extendedSpeakers = [...speakers, ...speakers, ...speakers];
  const currentSpeaker = speakers[currentIndex % total];
  const prevSpeaker = speakers[(currentIndex - 1 + total) % total];
  const nextSpeaker = speakers[(currentIndex + 1) % total];

  const handlePrev = () => {
    setDirection('right');
    setCurrentIndex((prev) => {
      const nextVal = prev - 1;
      if (nextVal < total * 0.5) {
        return nextVal + total;
      }
      return nextVal;
    });
  };

  const handleNext = () => {
    setDirection('left');
    setCurrentIndex((prev) => {
      const nextVal = prev + 1;
      if (nextVal >= total * 2) {
        return nextVal - total;
      }
      return nextVal;
    });
  };

  // Continuous auto-advancing from one speaker to the other every 2 seconds (paused on user hover / interaction)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      handleNext();
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered, total]);

  return (
    <section
      className="w-full bg-[#0D3A21] pt-10 sm:pt-14 lg:pt-16 pb-4 sm:pb-6 text-white overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Section Title & View More Speakers Button */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight text-center sm:text-left">
            Featured Speakers
          </h2>
          <Link
            to="/speakers"
            onClick={() => {
              sessionStorage.setItem('cib_home_section', 'speakers');
              sessionStorage.setItem('cib_active_section', 'speakers');
              sessionStorage.setItem('cib_last_home_scroll', String(window.scrollY));
            }}
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-[#008129] hover:bg-[#006e23] border border-emerald-400/30 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-none transition-all duration-150 shadow-md text-center shrink-0 self-center sm:self-auto cursor-pointer"
          >
            VIEW MORE SPEAKERS
          </Link>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 1. MOBILE & TABLET LAYOUT (< lg) Matching Reference */}
        {/* ---------------------------------------------------- */}
        <div className="lg:hidden space-y-6">
          {/* Pure Green Brand Card Container (Sharp Edges) */}
          <div className="bg-[#008129] border border-[#006e23] rounded-none p-5 sm:p-7 shadow-xl space-y-5 sm:space-y-6 overflow-hidden text-white">
            {/* Top Speaker Details - Stable height prevents card from jumping/resizing */}
            <div className="text-center sm:text-left min-h-[120px] sm:min-h-[135px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSpeaker.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center sm:items-start justify-center sm:justify-start space-y-1.5"
                >
                  <h3 className="text-lg sm:text-2xl font-black font-display text-white tracking-tight leading-tight line-clamp-2 text-center sm:text-left">
                    {currentSpeaker.name}
                  </h3>
                  <p className="text-sm sm:text-base font-bold text-white/95 leading-snug line-clamp-2 text-center sm:text-left">
                    {currentSpeaker.position}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-white/80 line-clamp-2 text-center sm:text-left">
                    {currentSpeaker.organization}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Middle: Edge-to-Edge 3-Photo Sliding Carousel (Square Center Image, Sharp Edges) */}
            <div className="-mx-5 sm:-mx-7 relative w-[calc(100%+2.5rem)] sm:w-[calc(100%+3.5rem)] flex items-stretch justify-center gap-2 sm:gap-3 overflow-hidden select-none py-1">
              {/* Left Peeking Photo (Previous Speaker - Dimmed) */}
              <div
                onClick={handlePrev}
                className="flex-1 min-w-0 overflow-hidden cursor-pointer opacity-40 brightness-[0.35] grayscale hover:opacity-75 transition-all z-0 rounded-none bg-slate-800 flex items-center justify-center"
                title={`Previous: ${prevSpeaker.name}`}
              >
                {prevSpeaker.photo_url ? (
                  <img
                    src={prevSpeaker.photo_url}
                    alt={prevSpeaker.name}
                    className="w-full h-full object-cover object-center rounded-none"
                  />
                ) : (
                  <ProfilePlaceholder className="w-full h-full" />
                )}
              </div>

              {/* Center Active Photo (Square Image sliding to left) */}
              <div className="relative z-10 w-[72%] max-w-[280px] aspect-square shrink-0 overflow-hidden shadow-2xl rounded-none bg-white flex items-center justify-center">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={currentSpeaker.id}
                    custom={direction}
                    variants={{
                      enter: (dir: 'left' | 'right') => ({
                        x: dir === 'left' ? '100%' : '-100%',
                        opacity: 0.5,
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                      },
                      exit: (dir: 'left' | 'right') => ({
                        x: dir === 'left' ? '-100%' : '100%',
                        opacity: 0.5,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_e, { offset, velocity }: PanInfo) => {
                      if (offset.x < -30 || velocity.x < -300) {
                        handleNext();
                      } else if (offset.x > 30 || velocity.x > 300) {
                        handlePrev();
                      }
                    }}
                    onClick={() => onSelectSpeaker?.(currentSpeaker)}
                    className="w-full h-full cursor-pointer relative rounded-none flex items-center justify-center"
                    title={`View ${currentSpeaker.name}`}
                  >
                    {currentSpeaker.photo_url ? (
                      <img
                        src={currentSpeaker.photo_url}
                        alt={currentSpeaker.name}
                        className="w-full h-full object-cover object-top brightness-100 contrast-105 rounded-none"
                      />
                    ) : (
                      <ProfilePlaceholder className="w-full h-full" />
                    )}

                    {/* Tap overlay indicator */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 active:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFE500] text-slate-950 px-2 py-0.5 rounded-none">
                        View Bio
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Peeking Photo (Next Speaker - Dimmed) */}
              <div
                onClick={handleNext}
                className="flex-1 min-w-0 overflow-hidden cursor-pointer opacity-40 brightness-[0.35] grayscale hover:opacity-75 transition-all z-0 rounded-none bg-slate-800 flex items-center justify-center"
                title={`Next: ${nextSpeaker.name}`}
              >
                {nextSpeaker.photo_url ? (
                  <img
                    src={nextSpeaker.photo_url}
                    alt={nextSpeaker.name}
                    className="w-full h-full object-cover object-center rounded-none"
                  />
                ) : (
                  <ProfilePlaceholder className="w-full h-full" />
                )}
              </div>
            </div>

            {/* Bottom Centered Yellow Arrow Buttons (Sharp Edges) */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous speaker"
                className="w-12 h-12 rounded-none bg-[#FFE500] hover:bg-[#f5dc00] active:scale-90 text-slate-950 flex items-center justify-center font-black transition-all shadow-md cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next speaker"
                className="w-12 h-12 rounded-none bg-[#FFE500] hover:bg-[#f5dc00] active:scale-90 text-slate-950 flex items-center justify-center font-black transition-all shadow-md cursor-pointer shrink-0"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. DESKTOP LAYOUT (lg and above) - Perfectly on line with site */}
        {/* ---------------------------------------------------- */}
        <div className="hidden lg:block w-full overflow-hidden">
          <div className="flex gap-5 items-stretch w-full">
            {/* Card 1: Pure Green Info Box (Sharp Edges, Seamless No Stroke) */}
            <div
              style={{ width: 'calc((100% - 3 * 1.25rem) / 4)' }}
              className="shrink-0 bg-[#008129] rounded-none p-6 xl:p-8 flex flex-col justify-between h-[390px] xl:h-[405px] shadow-xl relative overflow-hidden select-none text-white z-20"
            >
              {/* Top Navigation Arrow Buttons (Yellow & Sharp Edges) */}
              <div className="flex items-center gap-2.5 z-10">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous speaker"
                  className="w-11 h-11 rounded-none bg-[#FFE500] hover:bg-[#f5dc00] active:scale-95 text-slate-950 flex items-center justify-center font-black transition-all shadow-md cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next speaker"
                  className="w-11 h-11 rounded-none bg-[#FFE500] hover:bg-[#f5dc00] active:scale-95 text-slate-950 flex items-center justify-center font-black transition-all shadow-md cursor-pointer shrink-0"
                >
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Bottom Content Area - Always reliably visible */}
              <div className="space-y-3 z-10 mt-auto">
                <div
                  key={currentSpeaker.id}
                  className="space-y-1.5 text-left"
                >
                  <h3 className="text-2xl xl:text-3xl font-black font-display text-white tracking-tight leading-snug">
                    {currentSpeaker.name}
                  </h3>
                  <p className="text-sm xl:text-base font-semibold text-white/95 leading-snug">
                    {currentSpeaker.position}
                  </p>
                  <p className="text-xs xl:text-sm font-medium text-white/80">
                    {currentSpeaker.organization}
                  </p>
                </div>

                {onSelectSpeaker && (
                  <button
                    type="button"
                    onClick={() => onSelectSpeaker(currentSpeaker)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFE500] hover:underline cursor-pointer pt-2 group"
                  >
                    <span>View Dossier &amp; Bio</span>
                    <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>

              {/* Subtle ambient highlight in corner */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Cards 2, 3, 4: Sliding Photos Carousel Window (No Strokes Around Pictures) */}
            <div className="flex-1 overflow-hidden relative h-[390px] xl:h-[405px]">
              <motion.div
                className="flex gap-5 h-full"
                animate={{
                  x: `calc(-${currentIndex} * ((100% - 2 * 1.25rem) / 3 + 1.25rem))`,
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                {extendedSpeakers.map((spk, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <div
                      key={`${spk.id}-${idx}`}
                      onClick={() => {
                        if (isActive) {
                          onSelectSpeaker?.(spk);
                        } else {
                          setCurrentIndex(idx);
                        }
                      }}
                      style={{
                        width: 'calc((100% - 2 * 1.25rem) / 3)',
                      }}
                      className={`h-full shrink-0 relative bg-white rounded-none overflow-hidden cursor-pointer select-none transition-all duration-500 ${
                        isActive
                          ? 'brightness-100 contrast-105 shadow-2xl z-10'
                          : 'brightness-[0.38] grayscale hover:brightness-85 hover:grayscale-0 shadow-md'
                      }`}
                      title={isActive ? `View ${spk.name}` : `Switch to ${spk.name}`}
                    >
                      {spk.photo_url ? (
                        <img
                          src={spk.photo_url}
                          alt={spk.name}
                          className="w-full h-full object-cover object-top rounded-none"
                        />
                      ) : (
                        <ProfilePlaceholder className="w-full h-full" />
                      )}

                      {/* Active Profile Indicator */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-[#FFE500] text-slate-950 px-2.5 py-1 rounded-none shadow">
                            VIEW PROFILE
                          </span>
                        </div>
                      )}

                      {/* Hover Preview for adjacent speakers */}
                      {!isActive && (
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm p-2 rounded-none text-left">
                          <p className="text-xs font-bold text-white truncate">{spk.name}</p>
                          <p className="text-[11px] text-slate-300 truncate">{spk.organization}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Section Separation Line Indicator */}
        <div className="pt-6 sm:pt-10 w-full flex items-center justify-center">
          <div className="w-full h-px bg-white/15 relative flex items-center justify-center">
            <span className="h-1 w-20 bg-[#008129] rounded-none absolute" />
          </div>
        </div>
      </div>
    </section>
  );
};
