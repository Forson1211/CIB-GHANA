import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThemeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const CoreConferenceThemes: React.FC = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [compassRotation, setCompassRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePlayClick = () => {
    // 1. Compass spins: turn turn turn! (+1440 degrees = 4 complete rotations)
    setCompassRotation((prev) => prev + 1440);
    setIsSpinning(true);
    setShowSparkles(true);

    // 2. Exact origin from the video button coordinates
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

    // 3. 1st Wave: 360-degree radial blast of congratulation sparkles & stars
    confetti({
      particleCount: 85,
      spread: 360,
      startVelocity: 42,
      origin: { x, y },
      colors: ['#FFE500', '#FFD700', '#008129', '#10B981', '#EC4899', '#38BDF8', '#FFFFFF', '#F59E0B'],
      shapes: ['star', 'circle'],
      scalar: 1.25,
      ticks: 140,
      zIndex: 9999,
    });

    // 4. 2nd Wave: Intense celebratory golden glitter explosion
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 160,
        startVelocity: 50,
        origin: { x, y },
        colors: ['#FFD700', '#FFE500', '#008129', '#FFFFFF', '#EC4899', '#8B5CF6'],
        shapes: ['star'],
        scalar: 1.3,
        ticks: 150,
        zIndex: 9999,
      });
    }, 280);

    // 5. 3rd Wave: Left & right celebration cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 80,
        startVelocity: 45,
        origin: { x: Math.max(0.08, x - 0.12), y },
        colors: ['#FFE500', '#008129', '#38BDF8', '#F59E0B'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 80,
        startVelocity: 45,
        origin: { x: Math.min(0.92, x + 0.12), y },
        colors: ['#FFE500', '#008129', '#EC4899', '#10B981'],
        zIndex: 9999,
      });
    }, 560);

    // 6. Stop spinning state after 2.4s
    setTimeout(() => {
      setIsSpinning(false);
    }, 2400);

    // 7. Hide celebratory banner after 4.2s
    setTimeout(() => {
      setShowSparkles(false);
    }, 4200);

    // 8. Open video modal after full celebratory spin and sparkles blow
    setTimeout(() => {
      setVideoModalOpen(true);
    }, 2400);
  };

  const themes: ThemeItem[] = [
    {
      id: 'tech',
      title: 'Technology Rewiring',
      subtitle: 'Scaling technology, ethical AI & fraud detection',
      icon: (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 shrink-0" fill="none">
          <rect x="14" y="14" width="36" height="36" rx="8" fill="url(#chip-bg)" stroke="#EC4899" strokeWidth="1.5" />
          <rect x="22" y="22" width="20" height="20" rx="4" fill="#072113" stroke="#06B6D4" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="4" fill="#FACC15" />
          {/* Circuit Pins */}
          <path d="M22 14V6M32 14V6M42 14V6M22 58V50M32 58V50M42 58V50M14 22H6M14 32H6M14 42H6M58 22H50M58 32H50M58 42H50" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 26L30 30M38 26L34 30M26 38L30 34M38 38L34 34" stroke="#EC4899" strokeWidth="1.5" />
          <defs>
            <linearGradient id="chip-bg" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#831843" />
              <stop offset="0.5" stopColor="#312E81" />
              <stop offset="1" stopColor="#0E7490" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: 'policy',
      title: 'Policy Rewiring',
      subtitle: 'Aligning ethical culture & boardroom accountability',
      icon: (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 shrink-0" fill="none">
          {/* Gavel Head */}
          <rect x="18" y="12" width="28" height="18" rx="4" transform="rotate(35 32 21)" fill="url(#gavel-head)" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M20 18L44 35" stroke="#F43F5E" strokeWidth="2" />
          <path d="M16 23L40 40" stroke="#FBBF24" strokeWidth="2" />
          {/* Gavel Handle */}
          <path d="M32 30L12 50" stroke="url(#gavel-handle)" strokeWidth="4.5" strokeLinecap="round" />
          {/* Impact Pedestal */}
          <rect x="36" y="44" width="22" height="12" rx="3" fill="#1E293B" stroke="#A855F7" strokeWidth="1.5" />
          <line x1="38" y1="50" x2="56" y2="50" stroke="#FBBF24" strokeWidth="1.5" />
          <defs>
            <linearGradient id="gavel-head" x1="18" y1="12" x2="46" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EC4899" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="gavel-handle" x1="32" y1="30" x2="12" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: 'geoeconomic',
      title: 'Geoeconomic Rewiring',
      subtitle: 'Building cross-border payments & AfCFTA trade corridors',
      icon: (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 shrink-0" fill="none">
          {/* Multicolored Globe with Woven Latitude & Continents */}
          <circle cx="32" cy="32" r="22" fill="url(#globe-grad)" stroke="#38BDF8" strokeWidth="1.5" />
          <ellipse cx="32" cy="32" rx="11" ry="22" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="10" y1="32" x2="54" y2="32" stroke="#FBBF24" strokeWidth="1.5" />
          <path d="M14 22Q32 26 50 22M14 42Q32 38 50 42" stroke="#A855F7" strokeWidth="1.5" />
          {/* Trade Connection Points */}
          <circle cx="24" cy="24" r="3" fill="#FFE500" />
          <circle cx="40" cy="38" r="3" fill="#22C55E" />
          <path d="M24 24L40 38" stroke="#FFE500" strokeWidth="1.5" strokeDasharray="2 2" />
          <defs>
            <radialGradient id="globe-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 32) rotate(45) scale(24)">
              <stop stopColor="#1E3A8A" />
              <stop offset="0.6" stopColor="#0F766E" />
              <stop offset="1" stopColor="#042F2E" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: 'capital',
      title: 'Capital Rewiring',
      subtitle: 'Rebuilding investment priorities & balance sheet resilience',
      icon: (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 shrink-0" fill="none">
          {/* Steering Wheel / Capital Helm */}
          <circle cx="32" cy="32" r="20" stroke="url(#wheel-ring)" strokeWidth="3" fill="#0A2F1B" />
          <circle cx="32" cy="32" r="7" fill="#F59E0B" stroke="#FFE500" strokeWidth="1.5" />
          {/* Wheel Spokes */}
          <line x1="32" y1="12" x2="32" y2="25" stroke="#EC4899" strokeWidth="2.5" />
          <line x1="32" y1="39" x2="32" y2="52" stroke="#EC4899" strokeWidth="2.5" />
          <line x1="12" y1="32" x2="25" y2="32" stroke="#38BDF8" strokeWidth="2.5" />
          <line x1="39" y1="32" x2="52" y2="32" stroke="#38BDF8" strokeWidth="2.5" />
          <line x1="18" y1="18" x2="27" y2="27" stroke="#A855F7" strokeWidth="2" />
          <line x1="37" y1="37" x2="46" y2="46" stroke="#A855F7" strokeWidth="2" />
          <line x1="18" y1="46" x2="27" y2="37" stroke="#10B981" strokeWidth="2" />
          <line x1="37" y1="27" x2="46" y2="18" stroke="#10B981" strokeWidth="2" />
          <defs>
            <linearGradient id="wheel-ring" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="0.33" stopColor="#EC4899" />
              <stop offset="0.66" stopColor="#6366F1" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: 'sustainability',
      title: 'Sustainability Rewiring',
      subtitle: 'Mobilizing ESG & green finance frameworks for African banks',
      icon: (
        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-13 sm:h-13 shrink-0" fill="none">
          {/* Stylized Glowing Eco Leaf & Energy Rings */}
          <circle cx="32" cy="32" r="22" fill="#052E16" stroke="#10B981" strokeWidth="1.5" />
          <path d="M32 14C32 14 44 22 44 34C44 42 38 48 30 48C22 48 18 42 18 34C18 24 32 14 32 14Z" fill="url(#leaf-grad)" stroke="#34D399" strokeWidth="1.5" />
          <path d="M32 20V46" stroke="#FFE500" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 28Q38 30 42 32M32 34Q38 36 41 39M32 28Q26 30 22 32M32 34Q26 36 23 39" stroke="#A7F3D0" strokeWidth="1.5" />
          <defs>
            <linearGradient id="leaf-grad" x1="18" y1="14" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="0.5" stopColor="#10B981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-[#0D3A21] text-white py-20 sm:py-24 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Left-Aligned with Navbar & Hero Left Margin */}
        <div className="text-left space-y-2 mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-widest font-black text-[#FFE500]">
            Core Conference Themes &bull; 30th National Banking &amp; Ethics Conference
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
            New Risks. New Rules. New Growth.
          </h2>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Intricately Crafted Woven Compass Rosette with Golden Play Button */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-center">
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] lg:w-[490px] lg:h-[490px] xl:w-[530px] xl:h-[530px] flex items-center justify-center group select-none">
              {/* Outer Ambient Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 via-indigo-500/20 to-emerald-500/20 blur-xl animate-pulse" />

              {/* Celebratory Congratulation Sparkles Floating Banner */}
              <AnimatePresence>
                {showSparkles && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.85 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute -top-12 sm:-top-14 z-40 px-5 sm:px-6 py-2.5 rounded-none bg-gradient-to-r from-[#FFE500] via-[#FFF380] to-[#FFE500] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_12px_40px_rgba(255,229,0,0.65)] flex items-center gap-2.5 pointer-events-none whitespace-nowrap border-2 border-yellow-300"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950 animate-spin" />
                    <span>🎉 Congratulations! Conference Preview Unlocked!</span>
                    <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shockwave Rings when Spinning */}
              {isSpinning && (
                <>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0.95 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 1.1, repeat: 2, ease: 'easeOut' }}
                    className="absolute inset-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[#FFE500] pointer-events-none z-15"
                  />
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.3, delay: 0.2, repeat: 2, ease: 'easeOut' }}
                    className="absolute inset-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-emerald-400 pointer-events-none z-15"
                  />
                </>
              )}

              {/* Dynamic In-DOM Star Sparkles radiating outwards in 360 degrees */}
              {isSpinning && (
                <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const angle = (idx * 22.5 * Math.PI) / 180;
                    const distance = 170;
                    const targetX = Math.cos(angle) * distance;
                    const targetY = Math.sin(angle) * distance;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
                        animate={{
                          x: targetX,
                          y: targetY,
                          scale: [0.2, 1.6, 0.9, 0],
                          opacity: [1, 1, 0.8, 0],
                          rotate: [0, 360],
                        }}
                        transition={{ duration: 1.5, delay: (idx % 4) * 0.08, ease: 'easeOut' }}
                        className="absolute"
                      >
                        <Sparkles className="w-6 h-6 text-[#FFE500] drop-shadow-[0_0_12px_rgba(255,229,0,0.9)]" />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* The Woven Compass SVG - Animated to turn turn turn! */}
              <motion.div
                animate={{ rotate: compassRotation }}
                transition={{
                  duration: 2.2,
                  ease: [0.16, 1, 0.3, 1], // Smooth powerful turn turn turn with gradual deceleration
                }}
                className="w-full h-full relative flex items-center justify-center pointer-events-none"
              >
                <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    {/* Concentric Woven Thread Gradients */}
                    <linearGradient id="thread-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E3A8A" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="thread-rose" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#881337" />
                      <stop offset="50%" stopColor="#E11D48" />
                      <stop offset="100%" stopColor="#BE123C" />
                    </linearGradient>
                    <linearGradient id="thread-ochre" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#78350F" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                    <linearGradient id="thread-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#064E3B" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="thread-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4C1D95" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                    <linearGradient id="star-light" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F8FAFC" />
                      <stop offset="50%" stopColor="#CBD5E1" />
                      <stop offset="100%" stopColor="#64748B" />
                    </linearGradient>
                    <linearGradient id="star-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="50%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                  </defs>

                  {/* Outer Ring Segment 1: Radial Woven Cord Texture */}
                  <circle cx="250" cy="250" r="236" fill="#0A2F1B" stroke="#1E293B" strokeWidth="4" />

                  {/* Layered Colored Woven Rings (36 radiating cord segments) */}
                  <g strokeWidth="9" strokeLinecap="round" opacity="0.95">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const angle = (i * 10 * Math.PI) / 180;
                      const r1 = 150;
                      const r2 = 230;
                      const x1 = 250 + r1 * Math.cos(angle);
                      const y1 = 250 + r1 * Math.sin(angle);
                      const x2 = 250 + r2 * Math.cos(angle);
                      const y2 = 250 + r2 * Math.sin(angle);
                      const colors = [
                        '#1E3A8A', '#3B82F6', '#881337', '#E11D48',
                        '#D97706', '#F59E0B', '#065F46', '#10B981',
                        '#4C1D95', '#8B5CF6', '#0284C7', '#06B6D4'
                      ];
                      const strokeColor = colors[i % colors.length];
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={strokeColor}
                          strokeDasharray="14 3"
                        />
                      );
                    })}
                  </g>

                  {/* Secondary Middle Concentric Ring */}
                  <circle cx="250" cy="250" r="160" fill="#0B132B" stroke="#FFE500" strokeWidth="2.5" />
                  <circle cx="250" cy="250" r="148" fill="#1C1A27" stroke="#EC4899" strokeWidth="2" strokeDasharray="6 3" />

                  {/* Inner Textured Cord Spokes */}
                  <g strokeWidth="7" strokeLinecap="round" opacity="0.85">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const angle = (i * 15 * Math.PI) / 180;
                      const r1 = 70;
                      const r2 = 145;
                      const x1 = 250 + r1 * Math.cos(angle);
                      const y1 = 250 + r1 * Math.sin(angle);
                      const x2 = 250 + r2 * Math.cos(angle);
                      const y2 = 250 + r2 * Math.sin(angle);
                      const colors = ['#E11D48', '#38BDF8', '#F59E0B', '#10B981', '#A855F7', '#EC4899'];
                      return (
                        <line
                          key={`inner-${i}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={colors[i % colors.length]}
                        />
                      );
                    })}
                  </g>

                  {/* Dimensional 8-Point Metallic Compass Star */}
                  {/* North Major Point */}
                  <polygon points="250,250 250,20 236,250" fill="url(#star-light)" />
                  <polygon points="250,250 250,20 264,250" fill="url(#star-dark)" />

                  {/* South Major Point */}
                  <polygon points="250,250 250,480 264,250" fill="url(#star-light)" />
                  <polygon points="250,250 250,480 236,250" fill="url(#star-dark)" />

                  {/* East Major Point */}
                  <polygon points="250,250 480,250 250,236" fill="url(#star-light)" />
                  <polygon points="250,250 480,250 250,264" fill="url(#star-dark)" />

                  {/* West Major Point */}
                  <polygon points="250,250 20,250 250,264" fill="url(#star-light)" />
                  <polygon points="250,250 20,250 250,236" fill="url(#star-dark)" />

                  {/* Diagonal Minor Points */}
                  {/* North-East */}
                  <polygon points="250,250 410,90 242,242" fill="url(#star-light)" opacity="0.9" />
                  <polygon points="250,250 410,90 258,258" fill="url(#star-dark)" opacity="0.9" />

                  {/* North-West */}
                  <polygon points="250,250 90,90 258,242" fill="url(#star-light)" opacity="0.9" />
                  <polygon points="250,250 90,90 242,258" fill="url(#star-dark)" opacity="0.9" />

                  {/* South-East */}
                  <polygon points="250,250 410,410 258,242" fill="url(#star-light)" opacity="0.9" />
                  <polygon points="250,250 410,410 242,258" fill="url(#star-dark)" opacity="0.9" />

                  {/* South-West */}
                  <polygon points="250,250 90,410 242,242" fill="url(#star-light)" opacity="0.9" />
                  <polygon points="250,250 90,410 258,258" fill="url(#star-dark)" opacity="0.9" />

                  {/* Compass Center Pivot Ring */}
                  <circle cx="250" cy="250" r="54" fill="#000000" opacity="0.4" />
                </svg>
              </motion.div>

              {/* Center Golden Play Button with interactive feedback */}
              <button
                ref={buttonRef}
                type="button"
                onClick={handlePlayClick}
                className={`absolute inset-auto w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-[#E5A800] via-[#FFD700] to-[#FFE500] hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(255,229,0,0.6)] flex items-center justify-center cursor-pointer transition-all duration-300 z-20 group-hover:brightness-110 ${
                  isSpinning
                    ? 'scale-110 ring-4 ring-[#FFE500] shadow-[0_0_60px_rgba(255,229,0,0.95)]'
                    : ''
                }`}
                aria-label="Play 30th Conference Preview Video"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFD700]/30 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 fill-slate-950 ml-1 drop-shadow" />
                </div>
              </button>
            </div>
            <p className="text-xs text-white/60 font-semibold tracking-wider uppercase mt-4 text-center lg:text-left w-full max-w-[530px] pl-1">
              Watch 30th Conference Highlights &amp; Preview
            </p>
          </div>

          {/* Right Column: Theme List with Subheadings & Vibrant Badges */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Sub-header */}
            <div className="space-y-1 pb-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FFE500] font-display tracking-tight">
                Insights. Actions. Outcomes.
              </h3>
              <p className="text-sm sm:text-base text-white/80 font-medium">
                Making Sense of 2026 and Shaping 2027
              </p>
            </div>

            {/* List of 5 Themes */}
            <div className="divide-y divide-white/10">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="py-4 sm:py-5 flex items-center gap-4 sm:gap-5 group hover:bg-white/[0.02] transition-colors rounded-lg"
                >
                  {/* Left Illustrated Icon Badge */}
                  <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {theme.icon}
                  </div>

                  {/* Right Content: Clean 2-Tier Title & Concise Subtitle matching Reference Design */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                      {theme.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-snug mt-1">
                      {theme.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-bold text-white text-base">
                  30th National Banking &amp; Ethics Conference — Teaser &amp; Highlights
                </h3>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Conference Teaser"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
