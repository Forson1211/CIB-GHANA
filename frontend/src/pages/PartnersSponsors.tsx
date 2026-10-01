import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface EntityItem {
  id: string;
  name: string;
  categoryOrTier: string;
  website: string;
}

const INSTITUTIONAL_PARTNERS: EntityItem[] = [
  {
    id: 'bog',
    name: 'Bank of Ghana',
    categoryOrTier: 'Statutory Regulator',
    website: 'https://bog.gov.gh',
  },
  {
    id: 'ghipss',
    name: 'GhIPSS',
    categoryOrTier: 'National Payment Switch',
    website: 'https://ghipss.net',
  },
  {
    id: 'gab',
    name: 'Ghana Association of Banks',
    categoryOrTier: 'Industry Association',
    website: 'https://gab.com.gh',
  },
  {
    id: 'fic',
    name: 'Financial Intelligence Centre',
    categoryOrTier: 'Regulatory Intelligence',
    website: 'https://fic.gov.gh',
  },
  {
    id: 'sec',
    name: 'Securities and Exchange Commission',
    categoryOrTier: 'Capital Markets Regulator',
    website: 'https://sec.gov.gh',
  },
  {
    id: 'nibs',
    name: 'Nobel International Business School',
    categoryOrTier: 'Academic & Research Partner',
    website: 'https://nibs.edu.gh',
  },
];

const CORPORATE_SPONSORS: EntityItem[] = [
  {
    id: 'scb',
    name: 'Standard Chartered Bank',
    categoryOrTier: 'Platinum Sponsor',
    website: 'https://sc.com/gh',
  },
  {
    id: 'bog_sp',
    name: 'Bank of Ghana',
    categoryOrTier: 'Platinum Sponsor',
    website: 'https://bog.gov.gh',
  },
  {
    id: 'ecobank',
    name: 'Ecobank Ghana',
    categoryOrTier: 'Gold Sponsor',
    website: 'https://ecobank.com',
  },
  {
    id: 'gcb',
    name: 'GCB Bank PLC',
    categoryOrTier: 'Gold Sponsor',
    website: 'https://gcbbank.com.gh',
  },
  {
    id: 'ghib',
    name: 'Ghana International Bank (GHIB)',
    categoryOrTier: 'Silver Sponsor',
    website: 'https://ghib.co.uk',
  },
  {
    id: 'absa',
    name: 'Absa Bank Ghana',
    categoryOrTier: 'Silver Sponsor',
    website: 'https://absa.com.gh',
  },
  {
    id: 'stanbic',
    name: 'Stanbic Bank Ghana',
    categoryOrTier: 'Silver Sponsor',
    website: 'https://stanbicbank.com.gh',
  },
  {
    id: 'ghipss_sp',
    name: 'GhIPSS',
    categoryOrTier: 'Fintech Infrastructure Partner',
    website: 'https://ghipss.net',
  },
];

// Helper to render crisp, authentic vector brand logos for Ghanaian financial institutions
export const renderBrandLogo = (id: string, name: string) => {
  switch (id) {
    case 'bog':
    case 'bog_sp':
      return (
        <svg viewBox="0 0 280 80" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain">
          <g>
            {/* Gold Star and Laurel Emblem */}
            <circle cx="40" cy="40" r="32" fill="#0A5C36" />
            <circle cx="40" cy="40" r="28" fill="#1B7E3E" stroke="#FFE500" strokeWidth="2" />
            {/* 5-pointed gold star */}
            <polygon
              points="40,22 44,34 57,34 47,42 51,54 40,46 29,54 33,42 23,34 36,34"
              fill="#FFE500"
            />
            {/* Bank of Ghana Typography */}
            <text x="82" y="36" fontFamily="sans-serif" fontSize="19" fontWeight="900" fill="#0A5C36" letterSpacing="0.5">
              BANK OF GHANA
            </text>
            <text x="82" y="52" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="#555" letterSpacing="1.5">
              CENTRAL BANK &bull; EST. 1957
            </text>
          </g>
        </svg>
      );

    case 'ghipss':
    case 'ghipss_sp':
      return (
        <svg viewBox="0 0 260 70" className="h-14 sm:h-16 w-auto max-w-[200px] object-contain">
          <g>
            {/* Dynamic Payment Switch Swirls */}
            <circle cx="35" cy="35" r="24" fill="none" stroke="#F5A623" strokeWidth="6" strokeDasharray="25 15" />
            <circle cx="35" cy="35" r="14" fill="#008129" />
            <polygon points="32,27 43,35 32,43" fill="#FFFFFF" />
            {/* GhIPSS Wordmark */}
            <text x="70" y="38" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#008129">
              Gh
              <tspan fill="#1E293B">IPSS</tspan>
            </text>
            <text x="70" y="52" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#64748B" letterSpacing="0.8">
              NATIONAL PAYMENT SWITCH
            </text>
          </g>
        </svg>
      );

    case 'gab':
      return (
        <svg viewBox="0 0 280 70" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain">
          <g>
            {/* Association Shield Emblem */}
            <rect x="12" y="14" width="40" height="42" rx="4" fill="#0F172A" />
            <polygon points="16,22 32,16 48,22 48,38 32,50 16,38" fill="#F5A623" />
            <rect x="25" y="27" width="4" height="12" fill="#0F172A" />
            <rect x="35" y="27" width="4" height="12" fill="#0F172A" />
            {/* Typography */}
            <text x="64" y="34" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#0F172A" letterSpacing="1">
              GAB
            </text>
            <text x="64" y="50" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#64748B">
              GHANA ASSOCIATION OF BANKS
            </text>
          </g>
        </svg>
      );

    case 'fic':
      return (
        <svg viewBox="0 0 280 70" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain">
          <g>
            <circle cx="34" cy="35" r="24" fill="#0B2341" />
            <path d="M34,20 L44,26 L44,38 C44,45 34,50 34,50 C34,50 24,45 24,38 L24,26 Z" fill="#FFE500" />
            <path d="M34,26 L39,30 L39,37 C39,41 34,44 34,44 C34,44 29,41 29,37 L29,30 Z" fill="#0B2341" />
            <text x="70" y="34" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#0B2341" letterSpacing="1">
              FIC GHANA
            </text>
            <text x="70" y="50" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#64748B">
              FINANCIAL INTELLIGENCE CENTRE
            </text>
          </g>
        </svg>
      );

    case 'sec':
      return (
        <svg viewBox="0 0 280 70" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain">
          <g>
            <circle cx="34" cy="35" r="24" fill="#0A5C36" />
            <circle cx="34" cy="35" r="18" fill="none" stroke="#FFE500" strokeWidth="2.5" />
            <polygon points="34,23 37,31 46,31 39,37 42,45 34,40 26,45 29,37 22,31 31,31" fill="#FFE500" />
            <text x="70" y="34" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#0A5C36">
              SEC GHANA
            </text>
            <text x="70" y="50" fontFamily="sans-serif" fontSize="8.5" fontWeight="700" fill="#64748B">
              SECURITIES &amp; EXCHANGE COMMISSION
            </text>
          </g>
        </svg>
      );

    case 'nibs':
      return (
        <svg viewBox="0 0 270 70" className="h-14 sm:h-16 w-auto max-w-[200px] object-contain">
          <g>
            <rect x="12" y="14" width="42" height="42" fill="#1E3A8A" />
            <polygon points="18,22 33,16 48,22 48,34 33,42 18,34" fill="#F5A623" />
            <rect x="23" y="38" width="20" height="3" fill="#FFFFFF" />
            <text x="66" y="36" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#1E3A8A" letterSpacing="1">
              NiBS
            </text>
            <text x="66" y="50" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#64748B">
              NOBEL BUSINESS SCHOOL
            </text>
          </g>
        </svg>
      );

    case 'scb':
      return (
        <svg viewBox="0 0 290 70" className="h-14 sm:h-16 w-auto max-w-[220px] object-contain">
          <g>
            {/* Standard Chartered Ribbon Swirl */}
            <path
              d="M18,35 C18,23 28,14 40,14 C44,14 48,15 51,18 C46,21 39,24 33,30 C27,36 25,43 27,49 C21,46 18,41 18,35 Z"
              fill="#00965E"
            />
            <path
              d="M54,35 C54,47 44,56 32,56 C28,56 24,55 21,52 C26,49 33,46 39,40 C45,34 47,27 45,21 C51,24 54,29 54,35 Z"
              fill="#0079C1"
            />
            {/* Typography */}
            <text x="66" y="34" fontFamily="sans-serif" fontSize="17" fontWeight="900" fill="#0C2340">
              Standard
            </text>
            <text x="66" y="52" fontFamily="sans-serif" fontSize="17" fontWeight="900" fill="#00965E">
              Chartered
            </text>
          </g>
        </svg>
      );

    case 'ecobank':
      return (
        <svg viewBox="0 0 260 70" className="h-14 sm:h-16 w-auto max-w-[200px] object-contain">
          <g>
            {/* Ecobank Teal Canopy Logo */}
            <path d="M16,36 C16,21 26,14 36,14 C46,14 56,21 56,36 L56,44 L16,44 Z" fill="#005B94" />
            <path d="M26,36 C26,27 31,23 36,23 C41,23 46,27 46,36 L46,44 L26,44 Z" fill="#75B833" />
            {/* Typography */}
            <text x="68" y="38" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#005B94" letterSpacing="0.5">
              Ecobank
            </text>
            <text x="68" y="51" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#75B833" letterSpacing="0.5">
              The Pan African Bank
            </text>
          </g>
        </svg>
      );

    case 'gcb':
      return (
        <svg viewBox="0 0 260 70" className="h-14 sm:h-16 w-auto max-w-[200px] object-contain">
          <g>
            {/* GCB Eagle Emblem */}
            <rect x="12" y="14" width="42" height="42" fill="#FBBF24" />
            <polygon points="12,14 33,32 54,14" fill="#1E293B" />
            <circle cx="33" cy="40" r="7" fill="#1E293B" />
            {/* Typography */}
            <text x="66" y="38" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#1E293B" letterSpacing="1">
              GCB <tspan fill="#F59E0B">BANK</tspan>
            </text>
            <text x="66" y="52" fontFamily="sans-serif" fontSize="9" fontWeight="800" fill="#64748B" letterSpacing="1">
              YOUR BANK FOR LIFE
            </text>
          </g>
        </svg>
      );

    case 'ghib':
      return (
        <svg viewBox="0 0 270 70" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain">
          <g>
            <rect x="14" y="14" width="42" height="42" rx="4" fill="#881337" />
            <circle cx="35" cy="35" r="14" fill="none" stroke="#FDE047" strokeWidth="2.5" />
            <polygon points="35,26 39,34 47,34 40,39 43,47 35,42 27,47 30,39 23,34 31,34" fill="#FDE047" />
            <text x="68" y="36" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#881337" letterSpacing="1">
              GHIB
            </text>
            <text x="68" y="51" fontFamily="sans-serif" fontSize="8.5" fontWeight="700" fill="#64748B">
              GHANA INTERNATIONAL BANK
            </text>
          </g>
        </svg>
      );

    case 'absa':
      return (
        <svg viewBox="0 0 250 70" className="h-14 sm:h-16 w-auto max-w-[190px] object-contain">
          <g>
            <circle cx="34" cy="35" r="22" fill="#BE123C" />
            <text x="34" y="42" fontFamily="sans-serif" fontSize="18" fontWeight="900" fill="#FFFFFF" textAnchor="middle">
              b
            </text>
            <text x="68" y="42" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#BE123C" letterSpacing="-1">
              absa
            </text>
          </g>
        </svg>
      );

    case 'stanbic':
      return (
        <svg viewBox="0 0 270 70" className="h-14 sm:h-16 w-auto max-w-[210px] object-contain">
          <g>
            <rect x="14" y="14" width="42" height="42" rx="8" fill="#0033A0" />
            <path d="M22,35 C22,25 31,21 35,21 C41,21 48,26 48,35 C48,44 41,49 35,49 C28,49 22,43 22,35 Z" fill="none" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M26,35 L44,35" stroke="#FFFFFF" strokeWidth="3" />
            <text x="68" y="36" fontFamily="sans-serif" fontSize="21" fontWeight="900" fill="#0033A0">
              Stanbic Bank
            </text>
            <text x="68" y="50" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#64748B">
              MEMBER OF STANDARD BANK GROUP
            </text>
          </g>
        </svg>
      );

    default:
      return (
        <div className="h-14 flex items-center justify-center font-black text-xl text-slate-800">
          {name}
        </div>
      );
  }
};

export const PartnersSponsors: React.FC = () => {
  const { sponsors } = useApp();

  // Strictly filter corporate sponsors
  const sponsorsList = sponsors.filter((s) => s.type === 'SPONSOR');

  return (
    <div className="min-h-screen bg-[#0D3A21] pb-24 text-white">
      {/* 1. CINEMATIC HERO SECTION WITH GREEN TO YELLOW BRAND GRADIENT */}
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
            Corporate Sponsors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-white/95 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Leading commercial banks, multinational financial institutions, and fintech pioneers powering the conference.
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

      {/* 2. LOGO SHOWCASE GRID (Big prominent logos, zero text clutter) */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-12">
        {/* Action Header Card (White card on green page) */}
        <div className="bg-white p-6 sm:p-7 rounded-none border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#008129] block">
              OFFICIAL SPONSORS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Distinguished Corporate Banking Sponsors
            </h2>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-none bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Sponsorship Inquiries</span>
          </Link>
        </div>

        {/* Clean Logo Grid: Big prominent logos, clean card design */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
        >
          {sponsorsList.map((item) => (
            <a
              key={item.id}
              href={item.website_url || (item as any).website || '#'}
              target="_blank"
              rel="noreferrer"
              className="bg-white px-6 py-8 sm:px-8 sm:py-10 rounded-none border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#1B7E3E] transition-all duration-200 flex items-center justify-center text-center group h-36 sm:h-44 relative cursor-pointer"
              title={item.name}
              aria-label={item.name}
            >
              {/* Subtle external link icon on hover */}
              <div className="absolute top-2.5 right-2.5 text-slate-300 group-hover:text-[#1B7E3E] transition-colors p-1 opacity-0 group-hover:opacity-100">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>

              {/* Big prominent logo display */}
              <div className="w-full h-full flex items-center justify-center p-2 transition-transform duration-200 group-hover:scale-105">
                {item.logo_url && item.logo_url.trim() ? (
                  <img
                    src={item.logo_url}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  renderBrandLogo(item.id, item.name)
                )}
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
