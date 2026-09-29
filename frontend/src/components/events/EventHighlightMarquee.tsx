import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string;
  category?: string;
}

// 24 authentic Aqua Safari Resort venue, leisure, and CIB Ghana conference photos
const ROW_1_PHOTOS: GalleryPhoto[] = [
  {
    id: 'r1-1',
    image_url: '/aqua-safari-lawn-night.jpg',
    caption: 'Aqua Safari Conference Lawns & Illuminated Evening Grounds',
    category: 'Venue & Grounds'
  },
  {
    id: 'r1-2',
    image_url: '/aqua-safari-drone.jpg',
    caption: 'Aerial Panorama of Aqua Safari Resort Peninsula on the Volta River',
    category: 'Official Aerial'
  },
  {
    id: 'r1-3',
    image_url: '/aqua-safari-pool-river.png',
    caption: 'Lagoon Swimming Pool Overlooking Volta River Estuary',
    category: 'Resort Amenities'
  },
  {
    id: 'r1-4',
    image_url: '/cib-conference-hall.jpg',
    caption: 'CIB Ghana Delegates in Plenary Session at the Grand Hall',
    category: 'Conference Hall'
  },
  {
    id: 'r1-5',
    image_url: '/aqua-safari-deck.jpg',
    caption: 'Waterfront Wooden Pool Promenade & Twilight Sun Loungers',
    category: 'Resort Deck'
  },
  {
    id: 'r1-6',
    image_url: '/aqua-safari-waterfront.jpg',
    caption: 'Waterfront Luxury Chalets & Manicured Tropical Gardens',
    category: 'Resort Grounds'
  },
  {
    id: 'r1-7',
    image_url: '/aqua-safari-kayak.jpg',
    caption: 'Volta River Kayaking & Complimentary Leisure Sports',
    category: 'Leisure Activities'
  },
  {
    id: 'r1-8',
    image_url: '/cib-conference-hall-2.jpg',
    caption: 'Keynote Address & Policy Discourse at National Banking Summit',
    category: 'Keynote Session'
  }
];

const ROW_2_PHOTOS: GalleryPhoto[] = [
  {
    id: 'r2-1',
    image_url: '/aqua-safari-aerial-beach.png',
    caption: 'Private Sandy Beach & Waterfront Chalets at Aqua Safari',
    category: 'Waterfront Beach'
  },
  {
    id: 'r2-2',
    image_url: '/aqua-safari-night.jpg',
    caption: 'Twilight Pool Illumination & Executive Clubhouse at Dusk',
    category: 'Night Ambiance'
  },
  {
    id: 'r2-3',
    image_url: '/aqua-safari-chalets.jpg',
    caption: 'Executive Waterfront Lodges & Safari Architecture',
    category: 'Accommodations'
  },
  {
    id: 'r2-4',
    image_url: '/aqua-safari-balcony-palms.png',
    caption: 'Balcony View Across Tropical Palms & Chalets',
    category: 'Resort Views'
  },
  {
    id: 'r2-5',
    image_url: '/aqua-safari-suite.jpg',
    caption: 'Luxury Suite Interior & Executive Accommodations',
    category: 'Executive Living'
  },
  {
    id: 'r2-6',
    image_url: '/aqua-safari-pool-promenade.png',
    caption: 'Aqua Safari Resort Poolside Terrace & Architectural Clubhouse',
    category: 'Poolside Terrace'
  },
  {
    id: 'r2-7',
    image_url: '/cib-conference-hall.jpg',
    caption: 'Plenary Deliberations & Executive Networking',
    category: 'Executive Network'
  },
  {
    id: 'r2-8',
    image_url: '/aqua-safari-drone.jpg',
    caption: 'The Pristine Natural Setting of Ada Foah, Ghana',
    category: 'Scenic Location'
  }
];

const ROW_3_PHOTOS: GalleryPhoto[] = [
  {
    id: 'r3-1',
    image_url: '/aqua-safari-pool-promenade.png',
    caption: 'Sun-drenched Pool Promenade & Tropical Relaxation',
    category: 'Promenade'
  },
  {
    id: 'r3-2',
    image_url: '/aqua-safari-waterfront.jpg',
    caption: 'Morning Stroll along the Ada Estuary Waterfront',
    category: 'Waterfront'
  },
  {
    id: 'r3-3',
    image_url: '/aqua-safari-lawn-night.jpg',
    caption: 'Evening Dinner Reception Grounds by the Pool',
    category: 'Evening Gala'
  },
  {
    id: 'r3-4',
    image_url: '/aqua-safari-deck.jpg',
    caption: 'Sunset Deck Overlooking the Calm River Waters',
    category: 'Sunset Lounge'
  },
  {
    id: 'r3-5',
    image_url: '/aqua-safari-balcony-palms.png',
    caption: 'Tropical Palm Gardens & Peaceful Executive Retreat',
    category: 'Resort Gardens'
  },
  {
    id: 'r3-6',
    image_url: '/aqua-safari-kayak.jpg',
    caption: 'River Adventures & Executive Leisure Excursions',
    category: 'River Leisure'
  },
  {
    id: 'r3-7',
    image_url: '/aqua-safari-night.jpg',
    caption: 'Architectural Night Illumination at Aqua Safari Resort',
    category: 'Night View'
  },
  {
    id: 'r3-8',
    image_url: '/aqua-safari-aerial-beach.png',
    caption: 'Exclusive Ada Foah Island & Riverfront Retreat',
    category: 'Panoramic Retreat'
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
