import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building } from 'lucide-react';
import { Sponsor } from '../../types';

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
      <div className="flex items-center gap-3.5">
        <svg viewBox="0 0 40 40" className="w-11 h-11 sm:w-13 sm:h-13 lg:w-14 lg:h-14 shrink-0" fill="none">
          <circle cx="20" cy="20" r="19" fill="#006837" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M20 6L23.5 15H32L25.5 20.5L28 29L20 23.5L12 29L14.5 20.5L8 15H16.5L20 6Z" fill="#D4AF37" />
          <circle cx="20" cy="20" r="4.5" fill="#006837" />
        </svg>
        <div className="text-left leading-tight">
          <span className="block text-[15px] sm:text-[17px] lg:text-[19px] font-black tracking-tight text-[#006837] font-display">BANK OF GHANA</span>
          <span className="block text-[10px] sm:text-[11px] lg:text-[12px] font-bold text-[#8C7326] uppercase tracking-wider">Central Bank Regulator</span>
        </div>
      </div>
    ),
  },
  {
    id: 'gcb',
    name: 'GCB Bank PLC',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#F49E12" />
          <path d="M18 6L30 14V26L18 32L6 26V14L18 6Z" fill="#002D62" />
          <path d="M18 10L26 16V24L18 28L10 24V16L18 10Z" fill="#F49E12" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#002D62] tracking-tighter font-display">GCB BANK</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-extrabold text-[#F49E12] tracking-widest uppercase mt-0.5">PLC</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ecobank',
    name: 'Ecobank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 38 38" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="38" height="38" rx="9" fill="#005B94" />
          <path d="M8 19C8 12.9249 12.9249 8 19 8C23.6339 8 27.5611 10.8711 29.1171 14.9497L23.4735 17.1068C22.6865 15.2638 20.9859 14 19 14C16.2386 14 14 16.2386 14 19C14 21.7614 16.2386 24 19 24C20.9859 24 22.6865 22.7362 23.4735 20.8932L29.1171 23.0503C27.5611 27.1289 23.6339 30 19 30C12.9249 30 8 25.0751 8 19Z" fill="#00A3E0" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#005B94] tracking-tight font-display">Ecobank</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#00A3E0] uppercase tracking-wider mt-0.5">The Pan African Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'scb',
    name: 'Standard Chartered',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 38 38" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <path d="M12 26C8 22 8 16 12 12C15 9 20 9 23 12L20 15C18 13 15 13 14 15C12 17 12 21 14 23L12 26Z" fill="#00A546" />
          <path d="M26 12C30 16 30 22 26 26C23 29 18 29 15 26L18 23C20 25 23 25 24 23C26 21 26 17 24 15L26 12Z" fill="#0099DA" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#0C2340] tracking-tight font-display">Standard</span>
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#00A546] tracking-tight font-display">Chartered</span>
        </div>
      </div>
    ),
  },
  {
    id: 'absa',
    name: 'Absa Bank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-3.5">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <circle cx="18" cy="18" r="17" fill="#B40028" />
          <circle cx="18" cy="18" r="10" stroke="#FFFFFF" strokeWidth="3.5" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[19px] sm:text-[22px] lg:text-[25px] font-black text-[#B40028] tracking-tight font-display">absa</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Bank Ghana</span>
        </div>
      </div>
    ),
  },
  {
    id: 'stanbic',
    name: 'Stanbic Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <path d="M18 3L32 8V19C32 26.5 25.5 32.5 18 35C10.5 32.5 4 26.5 4 19V8L18 3Z" fill="#0033A0" />
          <path d="M12 18L16 22L24 14" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[16px] sm:text-[19px] lg:text-[21px] font-black text-[#0033A0] tracking-tight font-display">Stanbic Bank</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase mt-0.5">Standard Bank Group</span>
        </div>
      </div>
    ),
  },
  {
    id: 'fidelity',
    name: 'Fidelity Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="9" fill="#F37023" />
          <path d="M8 10H28V15H15V20H25V24H15V30H8V10Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[16px] sm:text-[19px] lg:text-[21px] font-black text-[#0C2340] tracking-tight font-display">FIDELITY</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-extrabold text-[#F37023] uppercase tracking-wider mt-0.5">BANK GHANA</span>
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
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#D32F2F" />
          <path d="M9 10H27L14 26H27V30H9L22 14H9V10Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[16px] sm:text-[19px] lg:text-[21px] font-black text-[#D32F2F] tracking-tight font-display">ZENITH</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">BANK GHANA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'access',
    name: 'Access Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <path d="M18 4L32 18L18 32L4 18L18 4Z" fill="#FF5F00" />
          <path d="M18 10L26 18L18 26L10 18L18 10Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[16px] sm:text-[19px] lg:text-[21px] font-black text-[#002D62] tracking-tight font-display">access</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#FF5F00] uppercase tracking-wider mt-0.5">Bank PLC</span>
        </div>
      </div>
    ),
  },
  {
    id: 'calbank',
    name: 'CalBank PLC',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#ED7D31" />
          <circle cx="18" cy="18" r="8" fill="#1B1B1B" />
          <circle cx="18" cy="18" r="4" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#1B1B1B] tracking-tight font-display">CalBank</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#ED7D31] uppercase tracking-wider mt-0.5">Forward Together</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ghipss',
    name: 'GhIPSS',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <circle cx="18" cy="18" r="17" fill="#006699" />
          <path d="M10 18L18 10L26 18" stroke="#FFE500" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M10 24L18 16L26 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#006699] tracking-tight font-display">GhIPSS</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#008129] uppercase mt-0.5">National Switch</span>
        </div>
      </div>
    ),
  },
  {
    id: 'republic',
    name: 'Republic Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#002D62" />
          <path d="M18 7L21 15L29 18L21 21L18 29L15 21L7 18L15 15L18 7Z" fill="#C8102E" />
          <circle cx="18" cy="18" r="3.5" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#002D62] tracking-tight font-display">Republic Bank</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#C8102E] uppercase mt-0.5">Ghana PLC</span>
        </div>
      </div>
    ),
  },
  {
    id: 'adb',
    name: 'ADB Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#006837" />
          <path d="M18 8L26 28H21L18 19L15 28H10L18 8Z" fill="#F49E12" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#006837] tracking-tight font-display">adb</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#F49E12] uppercase mt-0.5">Agric Dev Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'umb',
    name: 'UMB Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#003865" />
          <circle cx="18" cy="18" r="7.5" fill="#F5A623" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#003865] tracking-tight font-display">UMB</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#F5A623] uppercase mt-0.5">Universal Merchant</span>
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
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#009A9B" />
          <circle cx="18" cy="13" r="5.5" fill="#F37023" />
          <path d="M18 18V28M13 23L18 19L23 23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[14px] sm:text-[17px] lg:text-[19px] font-black text-[#002D62] tracking-tight font-display">First National Bank</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#009A9B] uppercase mt-0.5">Ghana</span>
        </div>
      </div>
    ),
  },
  {
    id: 'sg',
    name: 'Societe Generale',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="18" fill="#E2001A" />
          <rect y="18" width="36" height="18" fill="#000000" />
          <rect y="16" width="36" height="4" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#1E1E1E] tracking-tight font-display">SOCIETE GENERALE</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#E2001A] uppercase tracking-wider mt-0.5">GHANA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'cbg',
    name: 'Consolidated Bank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#0F2042" />
          <path d="M18 9C13 9 9 13 9 18C9 23 13 27 18 27C21.5 27 24.5 25 26 22H21C20 22.8 19 23.2 18 23.2C15.1 23.2 12.8 20.9 12.8 18C12.8 15.1 15.1 12.8 18 12.8C19 12.8 20 13.2 21 14H26C24.5 11 21.5 9 18 9Z" fill="#F47920" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[17px] sm:text-[20px] lg:text-[22px] font-black text-[#0F2042] tracking-tighter font-display">CBG</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#F47920] uppercase mt-0.5">Consolidated Bank</span>
        </div>
      </div>
    ),
  },
  {
    id: 'prudential',
    name: 'Prudential Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#002D62" />
          <rect x="7" y="7" width="22" height="22" rx="3" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M14 13H22V19H14V13Z" fill="#D4AF37" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#002D62] tracking-tight font-display">PRUDENTIAL</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#8C7326] uppercase mt-0.5">BANK GHANA</span>
        </div>
      </div>
    ),
  },
  {
    id: 'fbnbank',
    name: 'FBNBank Ghana',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#00205B" />
          <circle cx="18" cy="18" r="8.5" fill="#F5A623" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#00205B] tracking-tight font-display">FBNBank</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#F5A623] uppercase mt-0.5">A FirstBank Company</span>
        </div>
      </div>
    ),
  },
  {
    id: 'omnibsic',
    name: 'OmniBSIC Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <circle cx="18" cy="18" r="17" fill="#00A3E0" />
          <path d="M12 18C12 14.7 14.7 12 18 12C21.3 12 24 14.7 24 18C24 21.3 21.3 24 18 24C14.7 24 12 21.3 12 18Z" fill="#FFFFFF" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#00205B] tracking-tight font-display">OmniBSIC</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-[#00A3E0] uppercase mt-0.5">Bank Ghana</span>
        </div>
      </div>
    ),
  },
  {
    id: 'arb',
    name: 'ARB Apex Bank',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 shrink-0" fill="none">
          <rect width="36" height="36" rx="8" fill="#008129" />
          <path d="M18 6L30 28H6L18 6Z" fill="#FFE500" />
          <circle cx="18" cy="20" r="4" fill="#008129" />
        </svg>
        <div className="text-left leading-none">
          <span className="block text-[15px] sm:text-[18px] lg:text-[20px] font-black text-[#008129] tracking-tight font-display">ARB APEX</span>
          <span className="block text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase mt-0.5">Rural Banking Apex</span>
        </div>
      </div>
    ),
  },
];

interface MarqueeRowProps {
  banks: BankLogo[];
  direction?: 'left' | 'right';
  speedSeconds?: number;
  leftShape?: 'badge-dark' | 'accent-red' | 'none';
  rightShape?: 'badge-dark' | 'accent-gold' | 'none';
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({
  banks,
  direction = 'right',
  speedSeconds = 34,
  leftShape = 'none',
  rightShape = 'none',
}) => {
  // 4 sets guarantee seamless infinite looping across any wide 4K or ultra-wide viewport
  const loopItems = [...banks, ...banks, ...banks, ...banks];

  return (
    <div className="relative w-full overflow-hidden py-2 sm:py-3 select-none group">
      {/* ── LEFT SHAPES OVERLAY (High Z-Index, Cards Slide Underneath, Edge-to-Edge) ── */}
      {leftShape === 'badge-dark' && (
        <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pointer-events-none drop-shadow-2xl">
          {/* Main Dark Polygon Badge */}
          <div
            className="relative h-full flex items-center"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 55px) 0, 100% 100%, 0 100%)',
              width: 'clamp(150px, 20vw, 290px)',
              background: '#0D3B22',
            }}
          />
        </div>
      )}

      {leftShape === 'accent-red' && (
        <div className="absolute left-0 top-0 bottom-0 z-30 pointer-events-none drop-shadow-2xl">
          {/* Red Angled Triangle Accent matching screenshot */}
          <div
            className="h-full bg-[#E52320]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 0 100%)',
              width: 'clamp(80px, 11vw, 150px)',
            }}
          />
        </div>
      )}

      {/* ── CONTINUOUS HARDWARE-ACCELERATED MOVING LOGO TRACK (Moving Right) ── */}
      <div
        className="flex gap-4 sm:gap-6 lg:gap-8 will-change-transform py-1.5 group-hover:[animation-play-state:paused]"
        style={{
          width: 'max-content',
          animation: `${direction === 'right' ? 'cibMarqueeRight' : 'cibMarqueeLeft'} ${speedSeconds}s linear infinite`,
        }}
      >
        {loopItems.map((b, idx) => (
          <div
            key={`${b.id}-${idx}`}
            className="bg-white rounded-xl sm:rounded-2xl px-5 sm:px-7 py-2.5 sm:py-3 h-[84px] sm:h-[98px] lg:h-[110px] min-w-[240px] sm:min-w-[290px] lg:min-w-[340px] flex items-center justify-center shadow-lg border border-slate-200/90 hover:shadow-2xl transition-all duration-200 shrink-0 cursor-default"
          >
            <div className="flex items-center justify-center max-w-full max-h-full">
              {b.renderLogo()}
            </div>
          </div>
        ))}
      </div>

      {/* ── RIGHT SHAPES OVERLAY (High Z-Index, Cards Slide Underneath, Edge-to-Edge) ── */}
      {rightShape === 'badge-dark' && (
        <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center justify-end pointer-events-none drop-shadow-2xl">
          {/* Main Dark Polygon Badge on Right */}
          <div
            className="relative h-full flex items-center justify-end"
            style={{
              clipPath: 'polygon(55px 0, 100% 0, 100% 100%, 0 100%)',
              width: 'clamp(160px, 22vw, 320px)',
              background: '#0D3B22',
            }}
          />
        </div>
      )}

      {rightShape === 'accent-gold' && (
        <div className="absolute right-0 top-0 bottom-0 z-30 pointer-events-none drop-shadow-2xl">
          {/* Yellow/Gold Angled Triangle Accent matching screenshot */}
          <div
            className="h-full bg-[#FFD700]"
            style={{
              clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0 100%)',
              width: 'clamp(90px, 12vw, 170px)',
            }}
          />
        </div>
      )}
    </div>
  );
};

// Map of built-in bank logos by key/slug
const BUILTIN_BANK_RENDERERS: Record<string, () => React.ReactNode> = {
  bog: GHANA_BANKS_ROW_1[0].renderLogo,
  gcb: GHANA_BANKS_ROW_1[1].renderLogo,
  ecobank: GHANA_BANKS_ROW_1[2].renderLogo,
  scb: GHANA_BANKS_ROW_1[3].renderLogo,
  absa: GHANA_BANKS_ROW_1[4].renderLogo,
  stanbic: GHANA_BANKS_ROW_1[5].renderLogo,
  fidelity: GHANA_BANKS_ROW_1[6].renderLogo,

  zenith: GHANA_BANKS_ROW_2[0].renderLogo,
  access: GHANA_BANKS_ROW_2[1].renderLogo,
  calbank: GHANA_BANKS_ROW_2[2].renderLogo,
  ghipss: GHANA_BANKS_ROW_2[3].renderLogo,
  republic: GHANA_BANKS_ROW_2[4].renderLogo,
  adb: GHANA_BANKS_ROW_2[5].renderLogo,
  umb: GHANA_BANKS_ROW_2[6].renderLogo,

  fnb: GHANA_BANKS_ROW_3[0].renderLogo,
  sg: GHANA_BANKS_ROW_3[1].renderLogo,
  cbg: GHANA_BANKS_ROW_3[2].renderLogo,
  prudential: GHANA_BANKS_ROW_3[3].renderLogo,
  fbnbank: GHANA_BANKS_ROW_3[4].renderLogo,
  omnibsic: GHANA_BANKS_ROW_3[5].renderLogo,
  arb: GHANA_BANKS_ROW_3[6].renderLogo,
};

const renderCorporateMemberLogo = (cm: Sponsor): React.ReactNode => {
  if (cm.logo_url && cm.logo_url.trim()) {
    return (
      <div className="flex items-center justify-center h-full max-w-[260px] px-2">
        <img
          src={cm.logo_url}
          alt={cm.name}
          className="h-auto w-auto max-h-[52px] sm:max-h-[62px] lg:max-h-[68px] max-w-full object-contain filter drop-shadow-xs"
        />
      </div>
    );
  }

  const cleanId = cm.id.toLowerCase().replace(/_cm|_sp/g, '');
  if (BUILTIN_BANK_RENDERERS[cleanId]) {
    return BUILTIN_BANK_RENDERERS[cleanId]();
  }

  const nameLower = cm.name.toLowerCase();
  for (const [key, renderFn] of Object.entries(BUILTIN_BANK_RENDERERS)) {
    if (nameLower.includes(key)) {
      return renderFn();
    }
  }

  // Fallback card for newly added corporate members without uploaded image
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-cib-green-50 text-cib-green-700 flex items-center justify-center shrink-0 font-black text-base border border-cib-green-200">
        <Building className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
      </div>
      <div className="text-left leading-tight">
        <span className="block text-[18px] sm:text-[22px] lg:text-[24px] font-black tracking-tight text-cib-charcoal-900 font-display line-clamp-1">
          {cm.name}
        </span>
        <span className="block text-[10px] sm:text-[11px] lg:text-[12px] font-bold text-cib-green-700 uppercase tracking-wider line-clamp-1">
          {cm.categoryOrRole || 'Corporate Member'}
        </span>
      </div>
    </div>
  );
};

export const GhanaBanksSponsorsMarquee: React.FC = () => {
  const { sponsors } = useApp();

  const corporateMembers = sponsors.filter(
    (s) => s.type === 'CORPORATE_MEMBER' || (s.type as any) === 'PARTNER'
  );

  const dynamicLogos: BankLogo[] = corporateMembers.map((cm) => ({
    id: cm.id,
    name: cm.name,
    renderLogo: () => renderCorporateMemberLogo(cm),
  }));

  const allLogos =
    dynamicLogos.length > 0
      ? dynamicLogos
      : [...GHANA_BANKS_ROW_1, ...GHANA_BANKS_ROW_2, ...GHANA_BANKS_ROW_3];

  const row1 = allLogos.filter((_, idx) => idx % 3 === 0);
  const row2 = allLogos.filter((_, idx) => idx % 3 === 1);
  const row3 = allLogos.filter((_, idx) => idx % 3 === 2);

  const padRow = (items: BankLogo[]): BankLogo[] => {
    if (items.length === 0) return allLogos;
    if (items.length < 5) return [...items, ...items, ...items];
    return items;
  };

  const finalRow1 = padRow(row1);
  const finalRow2 = padRow(row2);
  const finalRow3 = padRow(row3);

  return (
    <section id="corporate-members" className="w-full bg-[#0D3A21] text-white py-16 sm:py-24 lg:py-28 overflow-hidden relative border-y border-white/10 shadow-2xl scroll-mt-24">
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

      {/* Header Aligned in Line with Site Logo on Mobile & Desktop */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-left space-y-1.5">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight">
          Corporate Members
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium max-w-3xl">
          Official commercial banks in Ghana, central bank regulators, and financial institutions.
        </p>
      </div>

      {/* Edge-to-Edge 3-Tier Marquee Rows with Big Cards & Crisp Vector Logos moving RIGHT */}
      <div className="w-full space-y-5 sm:space-y-7 lg:space-y-9">
        {/* Row 1: Dark polygon shape on left, yellow accent on right */}
        <MarqueeRow
          banks={finalRow1}
          direction="right"
          speedSeconds={36}
          leftShape="badge-dark"
          rightShape="accent-gold"
        />

        {/* Row 2: Red accent on left, dark polygon shape on right */}
        <MarqueeRow
          banks={finalRow2}
          direction="right"
          speedSeconds={40}
          leftShape="accent-red"
          rightShape="badge-dark"
        />

        {/* Row 3: Dark polygon shape on left, yellow accent on right */}
        <MarqueeRow
          banks={finalRow3}
          direction="right"
          speedSeconds={34}
          leftShape="badge-dark"
          rightShape="accent-gold"
        />
      </div>
    </section>
  );
};
