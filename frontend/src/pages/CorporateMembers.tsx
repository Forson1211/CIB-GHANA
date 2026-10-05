import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovingBankLogosMarquee } from '../components/home/GhanaBanksSponsorsMarquee';

export const CorporateMembers: React.FC = () => {
  const { sponsors } = useApp();

  // Only show corporate members (same filter as marquee)
  const membersList = sponsors.filter(
    (s) => s.type === 'CORPORATE_MEMBER' || (s.type as any) === 'PARTNER'
  );

  return (
    <div className="min-h-screen bg-[#0D3A21] pb-24 text-white">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative pt-20 pb-28 sm:pt-24 sm:pb-36 bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white overflow-hidden shadow-sm">
        {/* Background Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="/cib-conference-hall-2.jpg"
            alt="CIB Ghana Conference Hall"
            className="w-full h-full object-cover object-center brightness-75 scale-105 filter blur-[0.5px] opacity-25 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#088d01]/90 via-[#72ac00]/85 to-[#dccb00]/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase"
          >
            Corporate Members
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-white/95 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Licensed CIB Ghana member institutions committed to professional excellence and ethical banking.
          </motion.p>
        </div>

        {/* Bottom Curved Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-10 sm:h-14 text-[#0D3A21] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,30 C360,70 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* 2. LOGO SHOWCASE GRID */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-12">
        {/* Action Header Card */}
        <div className="bg-white p-6 sm:p-7 rounded-none border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#008129] block">
              MEMBER INSTITUTIONS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Distinguished Corporate Banking Members
            </h2>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-none bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Membership Inquiries</span>
          </Link>
        </div>

        {/* Moving Bank Logos Marquee (Moving smoothly like the sponsors on the homepage) */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-2">
          <MovingBankLogosMarquee items={membersList} />
        </div>
      </div>
    </div>
  );
};
