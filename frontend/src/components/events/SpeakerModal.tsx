import React, { useState, useEffect } from 'react';
import { Speaker } from '../../types';
import { Modal } from '../ui/Modal';
import { MapPin, Building } from 'lucide-react';
import { ProfilePlaceholder } from '../ui/ProfilePlaceholder';

interface SpeakerModalProps {
  speaker: Speaker | null;
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
}

export const SpeakerModal: React.FC<SpeakerModalProps> = ({
  speaker,
  isOpen,
  onClose,
  eventTitle,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [speaker?.photo_url]);

  if (!speaker) return null;

  const hasPhoto = Boolean(speaker.photo_url && speaker.photo_url.trim() !== '' && !imgError);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Speaker Dossier" maxWidth="2xl">
      <div className="space-y-6">
        {/* Top Header Grid: Professional, clean, and executive hierarchy */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-6 border-b border-slate-100">
          {/* Speaker Portrait: Sharp corners with gold stroke border */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 overflow-hidden shrink-0 border-2 border-cib-gold-300 bg-slate-100 rounded-none flex items-center justify-center shadow-sm">
            {hasPhoto ? (
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-top rounded-none"
              />
            ) : (
              <ProfilePlaceholder className="w-full h-full rounded-none" />
            )}
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1 w-full">
            {/* Designation / Role Badge (No stroke) */}
            <div className="flex items-center justify-center sm:justify-start">
              {(speaker.speaker_type === 'KEYNOTE' || speaker.is_keynote) ? (
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100/90 text-amber-900 px-3 py-1 rounded-none inline-flex items-center gap-1.5 shadow-none border-0">
                  ★ Keynote Speaker
                </span>
              ) : (
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100/90 text-[#006B22] px-3 py-1 rounded-none inline-flex items-center gap-1.5 shadow-none border-0">
                  Panel Speaker
                </span>
              )}
            </div>

            {/* Speaker Full Name */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight leading-tight">
              {speaker.name}
            </h3>

            {/* Official Position */}
            <p className="text-sm sm:text-base font-bold text-[#008129] leading-snug">
              {speaker.position}
            </p>

            {/* Organization & Location Meta */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
              {speaker.organization && (
                <span className="inline-flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{speaker.organization}</span>
                </span>
              )}
              {speaker.country && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{speaker.country}</span>
                </span>
              )}
            </div>

            {/* Professional Social Links */}
            {(speaker.linkedin_url || speaker.twitter_url) && (
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                {speaker.linkedin_url && (
                  <a
                    href={speaker.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#008129] hover:text-white text-slate-700 text-xs font-semibold rounded-none transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                )}
                {speaker.twitter_url && (
                  <a
                    href={speaker.twitter_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#008129] hover:text-white text-slate-700 text-xs font-semibold rounded-none transition-colors"
                    aria-label="Twitter / X Profile"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Biography */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Biography
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {speaker.biography?.replace(/\(CIB\),?\s*/g, '')}
          </p>
        </div>

        {/* Expertise Tags (No stroke) */}
        {speaker.expertise && speaker.expertise.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Areas of Expertise
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {speaker.expertise.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-900 text-xs font-semibold rounded-none border-0"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Speaking Session Affiliation (No stroke) */}
        {eventTitle && (
          <div className="p-3.5 rounded-none bg-emerald-50/70 border-0">
            <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-900">
              Speaking at:
            </p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              {eventTitle}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
