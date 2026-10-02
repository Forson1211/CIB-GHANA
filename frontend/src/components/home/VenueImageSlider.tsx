import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Navigation, ChevronLeft, ChevronRight } from 'lucide-react';

export interface VenueSlideItem {
  url: string;
  alt: string;
  title?: string;
  location?: string;
}

const VENUE_SLIDES: VenueSlideItem[] = [
  {
    url: '/aqua-safari-lawn-night.jpg',
    alt: 'Aqua Safari Lawns & Evening Grounds',
    title: 'Aqua Safari Lawns & Evening Grounds',
    location: 'Ada Foah, Greater Accra Region',
  },
  {
    url: '/aqua-safari-register-banner.webp',
    alt: 'Aqua Safari Waterfront Promenade',
    title: 'Waterfront Promenade & Conference Facilities',
    location: 'Ada Foah, Volta River Waterfront',
  },
  {
    url: '/aqua-safari-ticket-bg.jpg',
    alt: 'Aqua Safari Riverfront Chalets & Luxury Grounds',
    title: 'Riverfront Chalets & Executive Suites',
    location: 'Ada Foah, Eco-Luxury Resort',
  },
];

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 280, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 280, damping: 30 },
      opacity: { duration: 0.35 },
    },
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface VenueImageSliderProps {
  className?: string;
}

export const VenueImageSlider: React.FC<VenueImageSliderProps> = ({ className = '' }) => {
  const [[page, direction], setPage] = useState<[number, number]>([0, 1]);
  const [isHovered, setIsHovered] = useState(false);
  const slideCount = VENUE_SLIDES.length;
  const currentSlideIndex = ((page % slideCount) + slideCount) % slideCount;

  // Preload all 3 images immediately
  useEffect(() => {
    VENUE_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.url;
    });
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  const goToSlide = (targetIndex: number) => {
    if (targetIndex === currentSlideIndex) return;
    const dir = targetIndex > currentSlideIndex ? 1 : -1;
    setPage([targetIndex, dir]);
  };

  // Continuous auto-swipe right-to-left every 4.5 seconds
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      // Swipe from right to left (direction = 1)
      paginate(1);
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, paginate]);

  const currentSlide = VENUE_SLIDES[currentSlideIndex];

  return (
    <div
      className={`relative w-full rounded-none overflow-hidden border border-white/15 shadow-2xl group select-none bg-black ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Aqua Safari Venue Images"
    >
      {/* Slider Viewport */}
      <div className="relative h-[340px] sm:h-[440px] lg:h-[480px] w-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold || offset.x < -60) {
                // Swiped left -> move forward (right to left motion)
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold || offset.x > 60) {
                // Swiped right -> move backward
                paginate(-1);
              }
            }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            <img
              src={currentSlide.url}
              alt={currentSlide.alt}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Dark Gradient Overlays for High Contrast Text & Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none z-10" />

        {/* Top Controls: Slide counter & Indicator dots */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 border border-white/15">
          <span className="text-[11px] font-bold text-white/90 tracking-widest uppercase">
            {currentSlideIndex + 1} / {slideCount}
          </span>
          <div className="flex items-center gap-1.5 ml-1">
            {VENUE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-none ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-[#FFE500]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Chevron Navigation Arrows */}
        <button
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => paginate(1)}
          aria-label="Next slide"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Overlaid Badges, Title & Buttons at Bottom */}
        <div className="absolute bottom-5 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center px-3.5 py-1.5 bg-[#FFE500] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                OFFICIAL LOCATION
              </span>
              <a
                href="https://maps.google.com/?q=Aqua+Safari+Resort+Ada+Foah+Ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-[#008129]" />
                <span>Get Directions</span>
              </a>
            </div>
            {currentSlide.title && (
              <p className="text-white/90 text-sm font-semibold drop-shadow-md hidden sm:block pt-1">
                {currentSlide.title}
              </p>
            )}
          </div>

          {/* Quick indicators for mobile */}
          <div className="flex items-center gap-1.5 sm:hidden self-start">
            {VENUE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 ${
                  idx === currentSlideIndex ? 'w-5 bg-[#FFE500]' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
