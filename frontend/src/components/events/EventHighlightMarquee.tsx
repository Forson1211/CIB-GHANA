import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string;
  category?: string;
}

// 15 authentic CIB Ghana previous event, summit, and conference photos from PREVIOUS EVENTS archive
const ROW_1_PHOTOS: GalleryPhoto[] = [
  {
    id: 'pe-1',
    image_url: '/previous-events/event-1.jpg',
    caption: 'CIB Ghana Executive Leadership Summit & Strategic Plenary',
    category: 'Leadership Summit'
  },
  {
    id: 'pe-2',
    image_url: '/previous-events/event-2.jpg',
    caption: 'Delegates & Banking Leaders at the Annual National Conference',
    category: 'Conference Plenary'
  },
  {
    id: 'pe-3',
    image_url: '/previous-events/event-3.jpg',
    caption: 'CIB Ghana Delegation at DC Fintech Week — Global Financial Dialogues',
    category: 'International Delegation'
  },
  {
    id: 'pe-4',
    image_url: '/previous-events/event-4.jpg',
    caption: 'CIB Ghana at DC Fintech Week — Shaping Global Banking Innovation',
    category: 'Fintech Leadership'
  },
  {
    id: 'pe-5',
    image_url: '/previous-events/event-5.jpg',
    caption: 'Executive Panel on Virtual Assets, Ethics & Banking Transformation',
    category: 'Policy Discourse'
  }
];

const ROW_2_PHOTOS: GalleryPhoto[] = [
  {
    id: 'pe-6',
    image_url: '/previous-events/event-6.jpg',
    caption: 'Strategic Roundtables & Global Industry Partnerships at DC Fintech Week',
    category: 'Global Partnerships'
  },
  {
    id: 'pe-7',
    image_url: '/previous-events/event-7.jpg',
    caption: 'CIB Ghana Annual Graduation & Induction Ceremony of Chartered Bankers',
    category: 'Charter Induction'
  },
  {
    id: 'pe-8',
    image_url: '/previous-events/event-8.jpg',
    caption: 'Chartered Bankers Forum — Professional Standards & Ethical Excellence',
    category: 'Professional Forum'
  },
  {
    id: 'pe-9',
    image_url: '/previous-events/event-9.jpg',
    caption: 'Keynote Address on the Future of Financial Regulation & Integrity',
    category: 'Keynote Session'
  },
  {
    id: 'pe-10',
    image_url: '/previous-events/event-10.jpg',
    caption: 'Fellowship Conferment & Celebrating Banking Excellence in Ghana',
    category: 'Fellowship Awards'
  }
];

const ROW_3_PHOTOS: GalleryPhoto[] = [
  {
    id: 'pe-11',
    image_url: '/previous-events/event-11.jpg',
    caption: 'Annual Banking Conference Plenary Session with Industry Luminaries',
    category: 'Annual Conference'
  },
  {
    id: 'pe-12',
    image_url: '/previous-events/event-12.jpg',
    caption: 'CIB Ghana Governing Council Address & Institutional Roadmap',
    category: 'Governing Council'
  },
  {
    id: 'pe-13',
    image_url: '/previous-events/event-13.jpg',
    caption: 'Presentation of Charters & Celebrating New Chartered Bankers',
    category: 'Charter Presentation'
  },
  {
    id: 'pe-14',
    image_url: '/previous-events/event-14.jpg',
    caption: 'Distinguished Delegates & Financial Sector Stakeholders Gathering',
    category: 'Delegates Assembly'
  },
  {
    id: 'pe-15',
    image_url: '/previous-events/event-15.jpg',
    caption: 'CIB Ghana Honors, Excellence in Banking & Professional Awards Ceremony',
    category: 'Awards & Honors'
  }
];

// All photos combined for lightbox navigation
const ALL_PHOTOS: GalleryPhoto[] = [
  ...ROW_1_PHOTOS,
  ...ROW_2_PHOTOS,
  ...ROW_3_PHOTOS
];

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

  return (
    <div className="relative w-full overflow-hidden py-4 space-y-4 sm:space-y-6">
      {/* ROW 1: SWIPES TO RIGHT */}
      <div className="marquee-container overflow-hidden flex select-none">
        <div className="animate-marquee-right flex gap-3 sm:gap-4">
          {[...ROW_1_PHOTOS, ...ROW_1_PHOTOS].map((photo, idx) => (
            <div
              key={`r1-${idx}`}
              onClick={() => openLightbox(photo)}
              className="w-64 sm:w-80 md:w-96 h-44 sm:h-56 shrink-0 rounded-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900 border border-white/10 hover:border-emerald-400/50 group relative"
            >
              <img
                src={photo.image_url}
                alt={photo.caption}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
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
        <div className="animate-marquee-left flex gap-3 sm:gap-4">
          {[...ROW_2_PHOTOS, ...ROW_2_PHOTOS].map((photo, idx) => (
            <div
              key={`r2-${idx}`}
              onClick={() => openLightbox(photo)}
              className="w-48 sm:w-60 md:w-72 h-60 sm:h-[300px] md:h-[360px] aspect-[4/5] shrink-0 rounded-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900 border border-white/10 hover:border-emerald-400/50 group relative"
            >
              <img
                src={photo.image_url}
                alt={photo.caption}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
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
        <div className="animate-marquee-right flex gap-3 sm:gap-4">
          {[...ROW_3_PHOTOS, ...ROW_3_PHOTOS].map((photo, idx) => (
            <div
              key={`r3-${idx}`}
              onClick={() => openLightbox(photo)}
              className="w-64 sm:w-80 md:w-96 h-44 sm:h-56 shrink-0 rounded-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900 border border-white/10 hover:border-emerald-400/50 group relative"
            >
              <img
                src={photo.image_url}
                alt={photo.caption}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Prev Arrow */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Next Arrow */}
            <button
              onClick={nextPhoto}
              className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Lightbox Image & Caption */}
            <motion.div
              key={selectedPhoto.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center z-10"
            >
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.caption}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="mt-4 text-center px-4">
                <p className="text-white font-bold text-base sm:text-lg">
                  {selectedPhoto.caption}
                </p>
                <p className="text-xs text-[#F5A623] font-semibold mt-1">
                  Photo {currentIndex + 1} of {ALL_PHOTOS.length} &bull; CIB Ghana Archive
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
