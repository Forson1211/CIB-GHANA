import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ProfilePlaceholder } from '../ui/ProfilePlaceholder';

interface LeadershipQuoteSpotlightProps {
  onSelectSpeaker?: (speaker: any) => void;
}

const DEFAULT_PRESIDENT_PHOTO = '/dr-ellen-ohene-afoakwa.png';

export const LeadershipQuoteSpotlight: React.FC<LeadershipQuoteSpotlightProps> = ({
  onSelectSpeaker,
}) => {
  const { speakers } = useApp();

  // Find Dr. Ellen Ohene-Afoakwa from the live speakers context, using her authentic portrait
  const leader = React.useMemo(() => {
    const found = (speakers || []).find((s) =>
      s.name?.toLowerCase().includes('ohene-afoakwa') ||
      s.name?.toLowerCase().includes('ellen')
    );
    return {
      name: found?.name || 'Dr. Ellen Ohene-Afoakwa',
      position: found?.position || 'President',
      organization: found?.organization || 'CIB Ghana',
      photo_url: found?.photo_url || DEFAULT_PRESIDENT_PHOTO,
      rawSpeaker: found,
    };
  }, [speakers]);

  return (
    <section className="w-full bg-[#0D3A21] text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden select-none border-b border-white/10">
      {/* Ambient decorative warm and emerald glows matching user reference */}
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-gradient-to-tr from-amber-500/15 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-[360px] h-[360px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Natural Portrait Photograph (Bigger & tighter spacing) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-start"
          >
            <div
              onClick={() => leader.rawSpeaker && onSelectSpeaker?.(leader.rawSpeaker)}
              className="relative w-[280px] sm:w-full max-w-[480px] aspect-[4/5] bg-slate-950 border border-white/15 shadow-2xl overflow-hidden group cursor-pointer"
            >
              {leader.photo_url ? (
                <img
                  src={leader.photo_url}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top brightness-100 contrast-105 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <ProfilePlaceholder className="w-full h-full" />
              )}

              {/* Subtle glass vignette border */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <span className="text-xs font-black uppercase tracking-wider bg-[#FFE500] text-slate-950 px-3 py-1 rounded-none shadow">
                  View Full Profile &bull; CIB Ghana President
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Keynote Quote with Left Gold Accent Bar */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-7 text-left"
          >
            <div className="border-l-[3px] border-[#FFE500] pl-5 sm:pl-6 space-y-6 sm:space-y-8">
              {/* Quote text matching layout & tone */}
              <p className="text-white/90 text-base sm:text-lg lg:text-[19px] font-normal leading-relaxed text-justify">
                Our expanding banking and financial technology ecosystem has brought
                innovative solutions, greater convenience, and wider access to retail and
                corporate institutions across Ghana. The National Banking and Ethics Conference
                is our shared journey of ethical leadership and governance. As we shape the
                future of banking with AI, digital currencies, and new regulatory standards,
                we can only progress by walking this journey of innovation and collaboration together.
              </p>

              {/* Attribution */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#FFE500] tracking-tight font-display">
                  {leader.name}
                </h3>
                <p className="text-sm sm:text-base font-semibold text-white/95 leading-snug">
                  {leader.position}
                </p>
                <p className="text-xs sm:text-sm font-medium text-white/75">
                  {leader.organization}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
