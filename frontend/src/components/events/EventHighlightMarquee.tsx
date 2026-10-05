import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  image_url: string;
  thumb_url?: string;
  caption: string;
  category?: string;
}

// Vite dynamic asset loader for full display photos placed in src/assets/PE
const peImageModules = import.meta.glob<{ default: string }>(
  '../../assets/PE/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
  { eager: true }
);

// Vite dynamic asset loader for lightweight 640px thumbnail photos for smooth 60fps marquee
const peThumbModules = import.meta.glob<{ default: string }>(
  '../../assets/PE/thumbs/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
  { eager: true }
);

// Build quick lookup map by base filename
const peThumbMap: Record<string, string> = {};
for (const [thumbPath, mod] of Object.entries(peThumbModules)) {
  const thumbFilename = thumbPath.split('/').pop();
  if (thumbFilename) {
    peThumbMap[thumbFilename] = mod.default;
  }
}

const formatPhotoDetails = (filename: string): { caption: string; category: string } => {
  const clean = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  if (/CIB@60/i.test(clean)) {
    return {
      caption: 'CIB Ghana 60th Anniversary Gala & Executive Luncheon',
      category: '60th Anniversary',
    };
  }
  if (/CIBGD/i.test(clean)) {
    return {
      caption: 'CIB Ghana Governance & Digital Banking Summit',
      category: 'Digital Banking',
    };
  }
  if (/CIB_Con/i.test(clean)) {
    return {
      caption: 'Annual National Banking Conference Plenary & Deliberations',
      category: 'Annual Conference',
    };
  }
  if (/IMG_BL/i.test(clean)) {
    return {
      caption: 'Chartered Bankers Leadership Forum & Executive Networking',
      category: 'Leadership Forum',
    };
  }
  if (/CIBGAM/i.test(clean)) {
    return {
      caption: 'CIB Ghana Annual General Meeting & Strategic Session',
      category: 'General Meeting',
    };
  }
  if (/imgcgr/i.test(clean)) {
    return {
      caption: 'Banking Ethics, Compliance & Regulatory Dialogue',
      category: 'Ethics & Compliance',
    };
  }
  if (/IE6A/i.test(clean)) {
    return {
      caption: 'Executive Leadership Keynotes & Strategic Banking Panels',
      category: 'Executive Plenary',
    };
  }
  return {
    caption: 'Distinguished Delegates & Banking Industry Assembly',
    category: 'Conference Archive',
  };
};

// 15 authentic CIB Ghana previous event, summit, and conference photos from PREVIOUS EVENTS archive
const BASE_ARCHIVE_PHOTOS: GalleryPhoto[] = [
  {
    id: 'pe-1',
    image_url: '/previous-events/event-1.jpg',
    thumb_url: '/previous-events/thumbs/event-1.jpg',
    caption: 'CIB Ghana Executive Leadership Summit & Strategic Plenary',
    category: 'Leadership Summit',
  },
  {
    id: 'pe-2',
    image_url: '/previous-events/event-2.jpg',
    thumb_url: '/previous-events/thumbs/event-2.jpg',
    caption: 'Delegates & Banking Leaders at the Annual National Conference',
    category: 'Conference Plenary',
  },
  {
    id: 'pe-3',
    image_url: '/previous-events/event-3.jpg',
    thumb_url: '/previous-events/thumbs/event-3.jpg',
    caption: 'CIB Ghana Delegation at DC Fintech Week — Global Financial Dialogues',
    category: 'International Delegation',
  },
  {
    id: 'pe-4',
    image_url: '/previous-events/event-4.jpg',
    thumb_url: '/previous-events/thumbs/event-4.jpg',
    caption: 'CIB Ghana at DC Fintech Week — Shaping Global Banking Innovation',
    category: 'Fintech Leadership',
  },
  {
    id: 'pe-5',
    image_url: '/previous-events/event-5.jpg',
    thumb_url: '/previous-events/thumbs/event-5.jpg',
    caption: 'Executive Panel on Virtual Assets, Ethics & Banking Transformation',
    category: 'Policy Discourse',
  },
  {
    id: 'pe-6',
    image_url: '/previous-events/event-6.jpg',
    thumb_url: '/previous-events/thumbs/event-6.jpg',
    caption: 'Strategic Roundtables & Global Industry Partnerships at DC Fintech Week',
    category: 'Global Partnerships',
  },
  {
    id: 'pe-7',
    image_url: '/previous-events/event-7.jpg',
    thumb_url: '/previous-events/thumbs/event-7.jpg',
    caption: 'CIB Ghana Annual Graduation & Induction Ceremony of Chartered Bankers',
    category: 'Charter Induction',
  },
  {
    id: 'pe-8',
    image_url: '/previous-events/event-8.jpg',
    thumb_url: '/previous-events/thumbs/event-8.jpg',
    caption: 'Chartered Bankers Forum — Professional Standards & Ethical Excellence',
    category: 'Professional Forum',
  },
  {
    id: 'pe-9',
    image_url: '/previous-events/event-9.jpg',
    thumb_url: '/previous-events/thumbs/event-9.jpg',
    caption: 'Keynote Address on the Future of Financial Regulation & Integrity',
    category: 'Keynote Session',
  },
  {
    id: 'pe-10',
    image_url: '/previous-events/event-10.jpg',
    thumb_url: '/previous-events/thumbs/event-10.jpg',
    caption: 'Fellowship Conferment & Celebrating Banking Excellence in Ghana',
    category: 'Fellowship Awards',
  },
  {
    id: 'pe-11',
    image_url: '/previous-events/event-11.jpg',
    thumb_url: '/previous-events/thumbs/event-11.jpg',
    caption: 'Annual Banking Conference Plenary Session with Industry Luminaries',
    category: 'Annual Conference',
  },
  {
    id: 'pe-12',
    image_url: '/previous-events/event-12.jpg',
    thumb_url: '/previous-events/thumbs/event-12.jpg',
    caption: 'CIB Ghana Governing Council Address & Institutional Roadmap',
    category: 'Governing Council',
  },
  {
    id: 'pe-13',
    image_url: '/previous-events/event-13.jpg',
    thumb_url: '/previous-events/thumbs/event-13.jpg',
    caption: 'Presentation of Charters & Celebrating New Chartered Bankers',
    category: 'Charter Presentation',
  },
  {
    id: 'pe-14',
    image_url: '/previous-events/event-14.jpg',
    thumb_url: '/previous-events/thumbs/event-14.jpg',
    caption: 'Distinguished Delegates & Financial Sector Stakeholders Gathering',
    category: 'Delegates Assembly',
  },
  {
    id: 'pe-15',
    image_url: '/previous-events/event-15.jpg',
    thumb_url: '/previous-events/thumbs/event-15.jpg',
    caption: 'CIB Ghana Honors, Excellence in Banking & Professional Awards Ceremony',
    category: 'Awards & Honors',
  },
];

// 42 dynamic photos loaded from src/assets/PE with lightweight thumbnail fallback
const PE_ASSET_PHOTOS: GalleryPhoto[] = Object.entries(peImageModules).map(([path, mod], idx) => {
  const filename = path.split('/').pop() || `photo-${idx}`;
  const details = formatPhotoDetails(filename);
  return {
    id: `pe-asset-${idx + 1}`,
    image_url: mod.default,
    thumb_url: peThumbMap[filename] || mod.default,
    caption: details.caption,
    category: details.category,
  };
});

// All 57+ photos combined for lightbox navigation & balanced 3-tier marquee distribution
export const ALL_PHOTOS: GalleryPhoto[] = [...BASE_ARCHIVE_PHOTOS, ...PE_ASSET_PHOTOS];

// Evenly interleaved across 3 rows
const ROW_1_PHOTOS: GalleryPhoto[] = ALL_PHOTOS.filter((_, idx) => idx % 3 === 0);
const ROW_2_PHOTOS: GalleryPhoto[] = ALL_PHOTOS.filter((_, idx) => idx % 3 === 1);
const ROW_3_PHOTOS: GalleryPhoto[] = ALL_PHOTOS.filter((_, idx) => idx % 3 === 2);

export const EventHighlightMarquee: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const openLightbox = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const currentIndex = selectedPhoto
    ? ALL_PHOTOS.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const prevPhoto = () => {
    if (currentIndex === -1) return;
    const newIdx = (currentIndex - 1 + ALL_PHOTOS.length) % ALL_PHOTOS.length;
    setSelectedPhoto(ALL_PHOTOS[newIdx]);
  };

  const nextPhoto = () => {
    if (currentIndex === -1) return;
    const newIdx = (currentIndex + 1) % ALL_PHOTOS.length;
    setSelectedPhoto(ALL_PHOTOS[newIdx]);
  };

  // Keyboard navigation & scroll lock when lightbox is active
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedPhoto, currentIndex]);

  return (
    <div className="relative w-full overflow-hidden py-4 space-y-4 sm:space-y-6">
      {/* ROW 1: SWIPES TO RIGHT */}
      <div className="marquee-container overflow-hidden flex select-none">
        <div className="animate-marquee-right flex gap-3 sm:gap-4" style={{ animationDuration: '90s' }}>
          {[...ROW_1_PHOTOS, ...ROW_1_PHOTOS].map((photo, idx) => (
            <div
              key={`r1-${idx}`}
              onClick={() => openLightbox(photo)}
              className="w-64 sm:w-80 md:w-96 h-44 sm:h-56 shrink-0 rounded-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900 border-0 sm:border border-white/10 hover:border-emerald-400/50 group relative"
            >
              <img
                src={photo.thumb_url || photo.image_url}
                alt={photo.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                {photo.category && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFE500] mb-0.5">
                    {photo.category}
                  </span>
                )}
                <span className="text-white text-xs sm:text-sm font-bold line-clamp-2">
                  {photo.caption}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[11px] text-[#FFE500] font-extrabold">
                  <ZoomIn className="w-3.5 h-3.5" /> Click to enlarge
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 2: SWIPES TO LEFT (Instagram Portrait 4:5 Size matching user reference) */}
      <div className="marquee-container overflow-hidden flex select-none">
        <div className="animate-marquee-left flex gap-3 sm:gap-4" style={{ animationDuration: '95s' }}>
          {[...ROW_2_PHOTOS, ...ROW_2_PHOTOS].map((photo, idx) => (
            <div
              key={`r2-${idx}`}
              onClick={() => openLightbox(photo)}
              className="w-48 sm:w-60 md:w-72 h-60 sm:h-[300px] md:h-[360px] aspect-[4/5] shrink-0 rounded-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900 border-0 sm:border border-white/10 hover:border-emerald-400/50 group relative"
            >
              <img
                src={photo.thumb_url || photo.image_url}
                alt={photo.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                {photo.category && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFE500] mb-0.5">
                    {photo.category}
                  </span>
                )}
                <span className="text-white text-xs sm:text-sm font-bold line-clamp-2">
                  {photo.caption}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[11px] text-[#FFE500] font-extrabold">
                  <ZoomIn className="w-3.5 h-3.5" /> Click to enlarge
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 3: SWIPES TO RIGHT */}
      <div className="marquee-container overflow-hidden flex select-none">
        <div className="animate-marquee-right flex gap-3 sm:gap-4" style={{ animationDuration: '88s' }}>
          {[...ROW_3_PHOTOS, ...ROW_3_PHOTOS].map((photo, idx) => (
            <div
              key={`r3-${idx}`}
              onClick={() => openLightbox(photo)}
              className="w-64 sm:w-80 md:w-96 h-44 sm:h-56 shrink-0 rounded-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900 border-0 sm:border border-white/10 hover:border-emerald-400/50 group relative"
            >
              <img
                src={photo.thumb_url || photo.image_url}
                alt={photo.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                {photo.category && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFE500] mb-0.5">
                    {photo.category}
                  </span>
                )}
                <span className="text-white text-xs sm:text-sm font-bold line-clamp-2">
                  {photo.caption}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[11px] text-[#FFE500] font-extrabold">
                  <ZoomIn className="w-3.5 h-3.5" /> Click to enlarge
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal (Teleported to document.body so it is never trapped by ancestor transforms) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedPhoto && (
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) closeLightbox();
                }}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0D3A21]/98 backdrop-blur-2xl select-none"
              >
                {/* Subtle ambient brand lighting matching the site */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header Row with Counter & Prominent Close Button */}
                <div className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-8 flex items-center justify-between z-30 pointer-events-none">
                  <span className="pointer-events-auto text-xs sm:text-sm font-bold text-white/90 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                    Photo {currentIndex + 1} of {ALL_PHOTOS.length}
                  </span>

                  {/* Close Button - Highly visible on both mobile & desktop */}
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-[#FFE500] hover:text-slate-950 font-black text-xs sm:text-sm shadow-2xl transition-all active:scale-95 cursor-pointer border border-white"
                    aria-label="Close Lightbox"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    <span>Close</span>
                  </button>
                </div>

                {/* Left Prev Arrow */}
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-2 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-[#008129] border border-white/20 text-white transition-all z-20 shadow-xl active:scale-95 cursor-pointer backdrop-blur-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                </button>

                {/* Right Next Arrow */}
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-2 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-[#008129] border border-white/20 text-white transition-all z-20 shadow-xl active:scale-95 cursor-pointer backdrop-blur-md"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                </button>

                {/* Center Image + Caption Card (Caption directly attached under the photo) */}
                <motion.div
                  key={selectedPhoto.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 flex flex-col items-center max-w-4xl max-h-[85vh] px-2 sm:px-4"
                >
                  <img
                    src={selectedPhoto.image_url}
                    alt={selectedPhoto.caption}
                    className="max-h-[58vh] sm:max-h-[66vh] md:max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/15"
                  />

                  {/* Caption directly underneath the photo */}
                  <div className="mt-3.5 sm:mt-4 text-center px-4 max-w-2xl space-y-1.5">
                    {selectedPhoto.category && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-[#008129] text-white">
                        {selectedPhoto.category}
                      </span>
                    )}
                    <p className="text-white font-bold text-sm sm:text-base md:text-lg leading-snug">
                      {selectedPhoto.caption}
                    </p>
                    <p className="text-xs text-[#FFE500] font-bold">
                      CIB Ghana Official Archive &bull; Ada, Ghana
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
