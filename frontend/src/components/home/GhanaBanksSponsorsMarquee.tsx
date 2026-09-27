import React from 'react';
import { motion } from 'framer-motion';

interface BankLogo {
  id: string;
  name: string;
  shortName?: string;
  renderLogo: () => React.ReactNode;
}

// Crisp, accurate SVG emblems & typography for Ghana's Licensed Commercial Banks & Regulators
export const GHANA_BANKS_ROW_1: BankLogo[] = [
  {
    id: 'bog',
    name: 'Bank of Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0" fill="none">
          <circle cx="20" cy="20" r="19" fill="#006837" stroke="#D4AF37" strokeWidth="2" />
          <path d="M20 7L23 15H31L25 20L27 28L20 23L13 28L15 20L9 15H17L20 7Z" fill="#D4AF37" />
          <circle cx="20" cy="20" r="4.5" fill="#006837" />
        </svg>
        <div className="text-left leading-tight">
          <span className="block text-[13px] font-black tracking-tight text-[#006837] font-display">BANK OF GHANA</span>
          <span className="block text-[9px] font-bold text-[#8C7326] uppercase tracking-wider">Central Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'gcb',
    name: 'GCB Bank PLC',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#F49E12" />
          <path d="M18 6L30 14V26L18 32L6 26V14L18 6Z" fill="#002D62" />
          <path d="M18 10L26 16V24L18 28L10 24V16L18 10Z" fill="#F49E12" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#002D62] tracking-tighter font-display">GCB BANK</span>
          <span className="block text-[8px] font-extrabold text-[#F49E12] tracking-widest uppercase">PLC</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ecobank',
    name: 'Ecobank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 38 38" className="w-8 h-8 shrink-0" fill="none">
          <rect width="38" height="38" rx="8" fill="#005B94" />
          <path d="M8 19C8 12.9249 12.9249 8 19 8C23.6339 8 27.5611 10.8711 29.1171 14.9497L23.4735 17.1068C22.6865 15.2638 20.9859 14 19 14C16.2386 14 14 16.2386 14 19C14 21.7614 16.2386 24 19 24C20.9859 24 22.6865 22.7362 23.4735 20.8932L29.1171 23.0503C27.5611 27.1289 23.6339 30 19 30C12.9249 30 8 25.0751 8 19Z" fill="#00A3E0" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#005B94] tracking-tight font-display">Ecobank</span>
          <span className="block text-[8px] font-bold text-[#00A3E0] uppercase tracking-wider">The Pan African Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'scb',
    name: 'Standard Chartered',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 38 38" className="w-8 h-8 shrink-0" fill="none">
          <path d="M12 26C8 22 8 16 12 12C15 9 20 9 23 12L20 15C18 13 15 13 14 15C12 17 12 21 14 23L12 26Z" fill="#00A546" />
          <path d="M26 12C30 16 30 22 26 26C23 29 18 29 15 26L18 23C20 25 23 25 24 23C26 21 26 17 24 15L26 12Z" fill="#0099DA" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#0C2340] tracking-tight font-display">Standard</span>
          <span className="block text-[13px] font-black text-[#00A546] tracking-tight font-display">Chartered</span>
        </div>
      </div>
    ),
  },
  {
    id: 'absa',
    name: 'Absa Bank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <circle cx="18" cy="18" r="17" fill="#B40028" />
          <circle cx="18" cy="18" r="10" stroke="#FFFFFF" strokeWidth="3" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[16px] font-black text-[#B40028] tracking-tight font-display">absa</span>
          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Bank Ghana</span>
        </div>
      </div>
    ),
  },
  {
    id: 'stanbic',
    name: 'Stanbic Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <path d="M18 3L32 8V19C32 26.5 25.5 32.5 18 35C10.5 32.5 4 26.5 4 19V8L18 3Z" fill="#0033A0" />
          <path d="M12 18L16 22L24 14" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[14px] font-black text-[#0033A0] tracking-tight font-display">Stanbic Bank</span>
          <span className="block text-[8px] font-bold text-slate-500 uppercase">Standard Bank Group</span>
        </div>
      </div>
    ),
  },
  {
    id: 'fidelity',
    name: 'Fidelity Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#F37023" />
          <path d="M8 10H28V15H15V20H25V24H15V30H8V10Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[14px] font-black text-[#0C2340] tracking-tight font-display">FIDELITY</span>
          <span className="block text-[8px] font-extrabold text-[#F37023] uppercase tracking-wider">BANK GHANA</span>
        </div>
      </div>
    ),
  },
];

export const GHANA_BANKS_ROW_2: BankLogo[] = [
  {
    id: 'zenith',
    name: 'Zenith Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#D32F2F" />
          <path d="M9 10H27L14 26H27V30H9L22 14H9V10Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[14px] font-black text-[#D32F2F] tracking-tight font-display">ZENITH</span>
          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">BANK GHANA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'access',
    name: 'Access Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <path d="M18 4L32 18L18 32L4 18L18 4Z" fill="#FF5F00" />
          <path d="M18 10L26 18L18 26L10 18L18 10Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[14px] font-black text-[#002D62] tracking-tight font-display">access</span>
          <span className="block text-[8px] font-bold text-[#FF5F00] uppercase tracking-wider">Bank PLC</span>
        </div>
      </div>
    ),
  },
  {
    id: 'calbank',
    name: 'CalBank PLC',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#ED7D31" />
          <circle cx="18" cy="18" r="8" fill="#1B1B1B" />
          <circle cx="18" cy="18" r="4" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#1B1B1B] tracking-tight font-display">CalBank</span>
          <span className="block text-[8px] font-bold text-[#ED7D31] uppercase tracking-wider">Forward Together</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ghipss',
    name: 'GhIPSS',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <circle cx="18" cy="18" r="17" fill="#006699" />
          <path d="M10 18L18 10L26 18" stroke="#FFE500" strokeWidth="3" strokeLinecap="round" />
          <path d="M10 24L18 16L26 24" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#006699] tracking-tight font-display">GhIPSS</span>
          <span className="block text-[8px] font-bold text-[#008129] uppercase">National Switch</span>
        </div>
      </div>
    ),
  },
  {
    id: 'republic',
    name: 'Republic Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#002D62" />
          <path d="M18 7L21 15L29 18L21 21L18 29L15 21L7 18L15 15L18 7Z" fill="#C8102E" />
          <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#002D62] tracking-tight font-display">Republic Bank</span>
          <span className="block text-[8px] font-bold text-[#C8102E] uppercase">Ghana PLC</span>
        </div>
      </div>
    ),
  },
  {
    id: 'adb',
    name: 'ADB Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#006837" />
          <path d="M18 8L26 28H21L18 19L15 28H10L18 8Z" fill="#F49E12" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#006837] tracking-tight font-display">adb</span>
          <span className="block text-[8px] font-bold text-[#F49E12] uppercase">Agric Dev Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'umb',
    name: 'UMB Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#003865" />
          <circle cx="18" cy="18" r="7" fill="#F5A623" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#003865] tracking-tight font-display">UMB</span>
          <span className="block text-[8px] font-bold text-[#F5A623] uppercase">Universal Merchant</span>
        </div>
      </div>
    ),
  },
];

export const GHANA_BANKS_ROW_3: BankLogo[] = [
  {
    id: 'fnb',
    name: 'First National Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#009A9B" />
          <circle cx="18" cy="13" r="5" fill="#F37023" />
          <path d="M18 18V28M13 23L18 19L23 23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[12px] font-black text-[#002D62] tracking-tight font-display">First National Bank</span>
          <span className="block text-[8px] font-bold text-[#009A9B] uppercase">Ghana</span>
        </div>
      </div>
    ),
  },
  {
    id: 'sg',
    name: 'Societe Generale',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="18" fill="#E2001A" />
          <rect y="18" width="36" height="18" fill="#000000" />
          <rect y="16" width="36" height="4" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#1E1E1E] tracking-tight font-display">SOCIETE GENERALE</span>
          <span className="block text-[8px] font-bold text-[#E2001A] uppercase tracking-wider">GHANA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'cbg',
    name: 'Consolidated Bank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#0F2042" />
          <path d="M18 9C13 9 9 13 9 18C9 23 13 27 18 27C21.5 27 24.5 25 26 22H21C20 22.8 19 23.2 18 23.2C15.1 23.2 12.8 20.9 12.8 18C12.8 15.1 15.1 12.8 18 12.8C19 12.8 20 13.2 21 14H26C24.5 11 21.5 9 18 9Z" fill="#F47920" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] font-black text-[#0F2042] tracking-tighter font-display">CBG</span>
          <span className="block text-[8px] font-bold text-[#F47920] uppercase">Consolidated Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'prudential',
    name: 'Prudential Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#002D62" />
          <rect x="7" y="7" width="22" height="22" rx="3" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M14 13H22V19H14V13Z" fill="#D4AF37" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#002D62] tracking-tight font-display">PRUDENTIAL</span>
          <span className="block text-[8px] font-bold text-[#8C7326] uppercase">BANK GHANA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'fbnbank',
    name: 'FBNBank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#00205B" />
          <circle cx="18" cy="18" r="8" fill="#F5A623" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#00205B] tracking-tight font-display">FBNBank</span>
          <span className="block text-[8px] font-bold text-[#F5A623] uppercase">A FirstBank Company</span>
        </div>
      </div>
    ),
  },
  {
    id: 'omnibsic',
    name: 'OmniBSIC Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <circle cx="18" cy="18" r="17" fill="#00A3E0" />
          <path d="M12 18C12 14.7 14.7 12 18 12C21.3 12 24 14.7 24 18C24 21.3 21.3 24 18 24C14.7 24 12 21.3 12 18Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#00205B] tracking-tight font-display">OmniBSIC</span>
          <span className="block text-[8px] font-bold text-[#00A3E0] uppercase">Bank Ghana</span>
        </div>
      </div>
    ),
  },
  {
    id: 'arb',
    name: 'ARB Apex Bank',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none">
          <rect width="36" height="36" rx="6" fill="#008129" />
          <path d="M18 6L30 28H6L18 6Z" fill="#FFE500" />
          <circle cx="18" cy="20" r="3.5" fill="#008129" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[13px] font-black text-[#008129] tracking-tight font-display">ARB APEX</span>
          <span className="block text-[8px] font-bold text-slate-500 uppercase">Rural Banking Apex</span>
        </div>
      </div>
    ),
  },
];

interface MarqueeRowProps {
  banks: BankLogo[];
  direction?: 'left' | 'right';
  speedSeconds?: number;
  leftBadgeLabel?: string;
  rightBadgeLabel?: string;
  leftShape?: 'badge-dark' | 'accent-red' | 'none';
  rightShape?: 'badge-dark' | 'accent-gold' | 'none';
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({
  banks,
  direction = 'right',
  speedSeconds = 30,
  leftBadgeLabel,
  rightBadgeLabel,
  leftShape = 'none',
  rightShape = 'none',
}) => {
  // 4 sets guarantee seamless infinite looping regardless of screen resolution
  const loopItems = [...banks, ...banks, ...banks, ...banks];

  return (
    <div className="relative w-full overflow-hidden py-1.5 select-none group">
      {/* ── LEFT SHAPES OVERLAY (High Z-Index, Cards Slide Underneath) ── */}
      {leftShape === 'badge-dark' && (
        <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pointer-events-none drop-shadow-2xl">
          {/* Subtle dark under-shadow layer for 3D depth */}
          <div
            className="absolute inset-0 bg-black/60"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)',
              transform: 'translate(4px, 2px)',
            }}
          />
          {/* Main Dark Polygon Badge */}
          <div
            className="relative h-full flex items-center pl-4 sm:pl-7 pr-8 sm:pr-12 text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-widest bg-[#181A1B] border-l-2 border-white/10"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 38px) 0, 100% 100%, 0 100%)',
              width: 'clamp(115px, 16vw, 195px)',
            }}
          >
            <span className="font-display font-black text-white tracking-widest drop-shadow-md">
              {leftBadgeLabel}
            </span>
          </div>
        </div>
      )}

      {leftShape === 'accent-red' && (
        <div className="absolute left-0 top-0 bottom-0 z-30 pointer-events-none drop-shadow-2xl">
          {/* Red Angled Triangle Accent matching screenshot */}
          <div
            className="h-full bg-[#E52320]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 0 100%)',
              width: 'clamp(55px, 8vw, 95px)',
            }}
          />
        </div>
      )}

      {/* ── CONTINUOUS HARDWARE-ACCELERATED MOVING LOGO TRACK (Moving Right) ── */}
      <div
        className="flex gap-3 sm:gap-5 will-change-transform py-1 group-hover:[animation-play-state:paused]"
        style={{
          width: 'max-content',
          animation: `${direction === 'right' ? 'cibMarqueeRight' : 'cibMarqueeLeft'} ${speedSeconds}s linear infinite`,
        }}
      >
        {loopItems.map((b, idx) => (
          <div
            key={`${b.id}-${idx}`}
            className="bg-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 h-[62px] sm:h-[72px] min-w-[180px] sm:min-w-[215px] flex items-center justify-center shadow-md border border-slate-200/80 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 shrink-0 cursor-default"
          >
            {b.renderLogo()}
          </div>
        ))}
      </div>

      {/* ── RIGHT SHAPES OVERLAY (High Z-Index, Cards Slide Underneath) ── */}
      {rightShape === 'badge-dark' && (
        <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center justify-end pointer-events-none drop-shadow-2xl">
          {/* Subtle dark under-shadow layer for 3D depth */}
          <div
            className="absolute inset-0 bg-black/60"
            style={{
              clipPath: 'polygon(30px 0, 100% 0, 100% 100%, 0 100%)',
              transform: 'translate(-4px, 2px)',
            }}
          />
          {/* Main Dark Polygon Badge on Right */}
          <div
            className="relative h-full flex items-center justify-end pr-4 sm:pr-7 pl-8 sm:pl-12 text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-widest bg-[#181A1B] border-r-2 border-white/10"
            style={{
              clipPath: 'polygon(38px 0, 100% 0, 100% 100%, 0 100%)',
              width: 'clamp(125px, 18vw, 215px)',
            }}
          >
            <span className="font-display font-black text-white tracking-widest drop-shadow-md">
              {rightBadgeLabel}
            </span>
          </div>
        </div>
      )}

      {rightShape === 'accent-gold' && (
        <div className="absolute right-0 top-0 bottom-0 z-30 pointer-events-none drop-shadow-2xl">
          {/* Yellow/Gold Angled Triangle Accent matching screenshot */}
          <div
            className="h-full bg-[#F5A623]"
            style={{
              clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0 100%)',
              width: 'clamp(65px, 9vw, 105px)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export const GhanaBanksSponsorsMarquee: React.FC = () => {
  return (
    <section className="w-full bg-[#111315] text-white py-10 sm:py-14 overflow-hidden relative border-y border-white/10 shadow-2xl">
      {/* Dynamic Keyframes for smooth continuous hardware-accelerated movement to the RIGHT */}
      <style>{`
        @keyframes cibMarqueeRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        @keyframes cibMarqueeLeft {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* Section Header matching User's Reference Image */}
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight">
            2026 Sponsors
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Official commercial banks in Ghana, central bank regulators, and payment infrastructure sponsors.
          </p>
        </div>

        {/* 3 Tier Rows with Angled Shapes & Moving Logos under the shapes */}
        <div className="space-y-3 sm:space-y-4">
          {/* Row 1: GRAND badge on left (dark polygon), yellow accent on right */}
          <MarqueeRow
            banks={GHANA_BANKS_ROW_1}
            direction="right"
            speedSeconds={32}
            leftShape="badge-dark"
            leftBadgeLabel="GRAND"
            rightShape="accent-gold"
          />

          {/* Row 2: Red accent on left, PLATINUM badge on right (dark polygon) */}
          <MarqueeRow
            banks={GHANA_BANKS_ROW_2}
            direction="right"
            speedSeconds={36}
            leftShape="accent-red"
            rightShape="badge-dark"
            rightBadgeLabel="PLATINUM"
          />

          {/* Row 3: GOLD badge on left (dark polygon), yellow accent on right */}
          <MarqueeRow
            banks={GHANA_BANKS_ROW_3}
            direction="right"
            speedSeconds={30}
            leftShape="badge-dark"
            leftBadgeLabel="GOLD"
            rightShape="accent-gold"
          />
        </div>
      </div>
    </section>
  );
};
