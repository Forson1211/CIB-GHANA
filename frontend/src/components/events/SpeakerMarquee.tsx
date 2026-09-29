import React, { useRef } from 'react';
import { Speaker } from '../../types';
import { SpeakerCard } from './SpeakerCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SpeakerMarqueeProps {
  speakers: Speaker[];
  onSelectSpeaker: (speaker: Speaker) => void;
}

export const SpeakerMarquee: React.FC<SpeakerMarqueeProps> = ({ speakers, onSelectSpeaker }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!speakers || speakers.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If there are 4 or fewer speakers, display a clean static grid
  if (speakers.length <= 4) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {speakers.map((speaker) => (
          <SpeakerCard
            key={speaker.id}
            speaker={speaker}
            onSelect={onSelectSpeaker}
            className="h-full"
          />
        ))}
      </div>
    );
  }

  // When more speakers exist, display a continuous moving track with pause-on-hover & manual arrows
  return (
    <div className="relative w-full overflow-hidden group">
      {/* Manual Scroll Buttons (visible on hover) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => scroll('left')}
          className="w-10 h-10 rounded-none bg-slate-900/90 hover:bg-[#008129] text-white flex items-center justify-center shadow-xl transition-all active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => scroll('right')}
          className="w-10 h-10 rounded-none bg-slate-900/90 hover:bg-[#008129] text-white flex items-center justify-center shadow-xl transition-all active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Moving Track Container */}
      <div
        ref={scrollContainerRef}
        className="marquee-container overflow-x-auto scrollbar-none flex select-none py-3"
      >
        <div className="animate-marquee-speakers flex gap-5 sm:gap-6 items-stretch">
          {[...speakers, ...speakers].map((speaker, idx) => (
            <SpeakerCard
              key={`${speaker.id}-${idx}`}
              speaker={speaker}
              onSelect={onSelectSpeaker}
              className="w-52 sm:w-60 md:w-64 shrink-0 h-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
