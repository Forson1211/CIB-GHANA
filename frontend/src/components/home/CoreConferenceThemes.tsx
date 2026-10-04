import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Cpu, Scale, Globe, Landmark, Coins, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThemeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const CoreConferenceThemes: React.FC = () => {
  const [compassRotation, setCompassRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sparklesActive, setSparklesActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePlayClick = () => {
    if (isSpinning) return;

    // 1. Compass turns and turns for 3 seconds (+2160 degrees = 6 full rotations)
    setCompassRotation((prev) => prev + 2160);
    setIsSpinning(true);
    setSparklesActive(false);

    // 2. Exactly 3 seconds of turning before showing the sparkles
    setTimeout(() => {
      setIsSpinning(false);
      setSparklesActive(true);

      // Coordinates of the center button
      const rect = buttonRef.current?.getBoundingClientRect();
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

      // 1st Wave: 360-degree radial blast of golden sparkles & stars
      confetti({
        particleCount: 95,
        spread: 360,
        startVelocity: 44,
        origin: { x, y },
        colors: ['#FFE500', '#FFD700', '#008129', '#10B981', '#EC4899', '#38BDF8', '#FFFFFF', '#F59E0B'],
        shapes: ['star', 'circle'],
        scalar: 1.25,
        ticks: 150,
        zIndex: 9999,
      });

      // 2nd Wave: High-velocity fireworks spray (+250ms)
      setTimeout(() => {
        confetti({
          particleCount: 75,
          spread: 160,
          startVelocity: 50,
          origin: { x, y },
          colors: ['#FFD700', '#FFE500', '#008129', '#FFFFFF', '#EC4899', '#8B5CF6'],
          shapes: ['star'],
          scalar: 1.3,
          ticks: 140,
          zIndex: 9999,
        });
      }, 250);

      // 3rd Wave: Left & right celebration cannons (+500ms)
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
      }, 500);

      // Turn off in-DOM sparkles after 2.5s
      setTimeout(() => {
        setSparklesActive(false);
      }, 2500);
    }, 3000);
  };

  const themes: ThemeItem[] = [
    {
      id: 'ethics',
      title: 'Dialing up Ethics and Trust',
      subtitle: 'Aligning ethical culture, corporate governance & boardroom accountability',
      icon: <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />,
    },
    {
      id: 'virtual-assets',
      title: 'Understanding Virtual Assets and Tokenization',
      subtitle: 'Exploring digital assets, CBDCs, tokenized collateral & AI megatrends',
      icon: <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />,
    },
    {
      id: 'leveraging-future-money',
      title: 'Leveraging AI in Banking',
      subtitle: 'Harnessing artificial intelligence to drive smarter decisions, fraud prevention & financial innovation',
      icon: <Landmark className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />,
    },
    {
      id: 'reimagining-future-money',
      title: 'Reimagining the Future of Money',
      subtitle: 'Transforming programmable currencies, liquidity systems & next-gen banking',
      icon: <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />,
    },
    {
      id: 'regulation',
      title: 'Navigating, Regulatory Landscape',
      subtitle: 'Harmonizing compliance, supervisory frameworks & regulatory direction',
      icon: <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />,
    },
    {
      id: 'fraud-cyber',
      title: 'Preventing Fraud and Cyber Risk',
      subtitle: 'Deploying AI detection algorithms, cybersecurity defenses & fraud mitigation',
      icon: <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />,
    },
  ];

  return (
    <section className="bg-[#0D3A21] text-white py-20 sm:py-24 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Left-Aligned with Navbar & Hero Left Margin */}
        <div className="text-center space-y-2 mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-widest font-black text-[#FFE500]">
            THEME: BANKING ON THE FUTURE
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light font-display tracking-tight text-white leading-tight">
            Trust, Technology and Transformation
          </h2>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Intricately Crafted Woven Compass Rosette with Golden Play Button */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start justify-center">
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] lg:w-[490px] lg:h-[490px] xl:w-[530px] xl:h-[530px] flex items-center justify-center group select-none">
              {/* Outer Ambient Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 via-indigo-500/20 to-emerald-500/20 blur-xl animate-pulse" />

              {/* Shockwave Rings when Sparkles Burst */}
              {sparklesActive && (
                <>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0.95 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: 1, ease: 'easeOut' }}
                    className="absolute inset-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[#FFE500] pointer-events-none z-15"
                  />
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    transition={{ duration: 1.4, delay: 0.15, repeat: 1, ease: 'easeOut' }}
                    className="absolute inset-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-emerald-400 pointer-events-none z-15"
                  />
                </>
              )}

              {/* Dynamic In-DOM Star Sparkles radiating outwards in 360 degrees */}
              {sparklesActive && (
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

              {/* The Woven Compass SVG - Animated to turn and turn for 3 seconds */}
              <motion.div
                animate={{ rotate: compassRotation }}
                transition={{
                  duration: 3.0,
                  ease: [0.2, 0.8, 0.25, 1], // Smooth turning for 3 seconds with gradual deceleration
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
                aria-label="Spin 30th Conference Themes Compass"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFD700]/30 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 fill-slate-950 ml-1 drop-shadow" />
                </div>
              </button>
            </div>
            <p className="text-xs text-white/60 font-semibold tracking-wider uppercase mt-4 text-center lg:text-left w-full max-w-[530px] pl-1">
              30th National Banking &amp; Ethics Conference Themes Compass
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

            {/* List of 6 Themes */}
            <div>
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="py-5 sm:py-6 flex items-center gap-5 sm:gap-6 group hover:bg-white/[0.03] transition-colors border-b border-white/[0.22] last:border-b-0"
                >
                  {/* Left Big White Icon */}
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {theme.icon}
                  </div>

                  {/* Right Content: 2-Tier Title & Concise Subtitle */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                      {theme.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/75 font-normal leading-snug mt-1">
                      {theme.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
