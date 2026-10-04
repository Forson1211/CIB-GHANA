import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EventGalleryItem } from '../../types';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryLightboxProps {
  items: EventGalleryItem[];
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ items }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  // Keyboard navigation & scroll lock when lightbox is active
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedIndex, items.length]);

  return (
    <div>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-slate-100 border border-slate-200 shadow-sm"
          >
            <img
              src={item.image_url}
              alt={item.caption}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
            {/* Hover Caption Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
              <span className="text-white text-xs font-semibold leading-snug">
                {item.caption}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-cib-gold-400 font-bold">
                <ZoomIn className="w-3.5 h-3.5" /> Click to enlarge
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal (Teleported to document.body so it is never trapped by ancestor transforms) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedIndex !== null && (
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
                    Photo {selectedIndex + 1} of {items.length}
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
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-[#008129] border border-white/20 text-white transition-all z-20 shadow-xl active:scale-95 cursor-pointer backdrop-blur-md"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </button>
                )}

                {/* Right Next Arrow */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-[#008129] border border-white/20 text-white transition-all z-20 shadow-xl active:scale-95 cursor-pointer backdrop-blur-md"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </button>
                )}

                {/* Center Image + Caption Card (Caption directly attached under the photo) */}
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 flex flex-col items-center max-w-4xl max-h-[85vh] px-2 sm:px-4"
                >
                  <img
                    src={items[selectedIndex].image_url}
                    alt={items[selectedIndex].caption}
                    className="max-h-[58vh] sm:max-h-[66vh] md:max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/15"
                  />

                  {/* Caption directly underneath the photo */}
                  <div className="mt-3.5 sm:mt-4 text-center px-4 max-w-2xl space-y-1">
                    <p className="text-white font-bold text-sm sm:text-base md:text-lg leading-snug">
                      {items[selectedIndex].caption}
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
