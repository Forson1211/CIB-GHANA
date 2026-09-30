import React, { useState, useEffect } from 'react';
import { Speaker } from '../../types';
import { ArrowRight } from 'lucide-react';
import { ProfilePlaceholder } from '../ui/ProfilePlaceholder';

interface SpeakerCardProps {
  speaker: Speaker;
  onSelect: (speaker: Speaker) => void;
  className?: string;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker, onSelect, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [speaker.photo_url]);

  const hasPhoto = Boolean(speaker.photo_url && speaker.photo_url.trim() !== '' && !imgError);

  return (
    <div
      onClick={() => onSelect(speaker)}
      className={`group cursor-pointer flex flex-col h-full bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#008129] transition-all duration-300 overflow-hidden rounded-none ${className}`}
    >
      {/* Photo Frame - Square aspect ratio for balanced, executive headshots */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center">
        {hasPhoto ? (
          <img
            src={speaker.photo_url}
            alt={speaker.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ProfilePlaceholder className="w-full h-full" />
        )}

        {/* Subtle vignette gradient at bottom of photo */}
        {hasPhoto && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
        )}
      </div>

      {/* Info Block - Clean, tight professional executive typography */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-white">
        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 font-display line-clamp-2 group-hover:text-[#008129] transition-colors leading-snug tracking-tight">
            {speaker.name}
          </h4>
          <p className="text-xs sm:text-[13px] font-bold text-[#008129] line-clamp-2 leading-snug">
            {speaker.position}
          </p>
          <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-snug">
            {speaker.organization}
          </p>
        </div>

        {/* View Profile CTA - Solid green button with hover arrow pinned to bottom */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <span className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#008129] group-hover:bg-[#006e22] text-white text-xs font-bold transition-all duration-200 shadow-sm rounded-none">
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
};
