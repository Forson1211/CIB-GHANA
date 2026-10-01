import React, { useState, useEffect } from 'react';
import { Speaker } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { MapPin, Building, Globe, ArrowUpRight } from 'lucide-react';
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
        {/* Top Header Grid */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-cib-gold-300 bg-slate-100 flex items-center justify-center">
            {hasPhoto ? (
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <ProfilePlaceholder className="w-full h-full" />
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-cib-charcoal-900 font-display">
                {speaker.name}
              </h3>
              {(speaker.speaker_type === 'KEYNOTE' || speaker.is_keynote) ? (
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  ★ Keynote Speaker
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-[#006B22] border border-emerald-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  Panels
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-cib-green-800">
              {speaker.position}
            </p>
            <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {speaker.organization}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {speaker.country}
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              {speaker.linkedin_url && (
                <a
                  href={speaker.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-cib-green-50 text-slate-600 hover:text-cib-green-800 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
                  </svg>
                </a>
              )}
              {speaker.twitter_url && (
                <a
                  href={speaker.twitter_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-cib-green-50 text-slate-600 hover:text-cib-green-800 transition-colors"
                  aria-label="Twitter / X Profile"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Biography */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Biography
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {speaker.biography}
          </p>
        </div>

        {/* Expertise Tags */}
        {speaker.expertise && speaker.expertise.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Areas of Expertise
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {speaker.expertise.map((item, idx) => (
                <Badge key={idx} variant="green" size="sm">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Speaking Session Affiliation */}
        {eventTitle && (
          <div className="p-3.5 rounded-xl bg-cib-green-50/60 border border-cib-green-100">
            <p className="text-[11px] uppercase tracking-wider font-bold text-cib-green-900">
              Speaking at:
            </p>
            <p className="text-xs font-bold text-cib-charcoal-900 mt-0.5">
              {eventTitle}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
