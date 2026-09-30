import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SecurePlaceCtaBannerProps {
  eventId?: string;
}

export const SecurePlaceCtaBanner: React.FC<SecurePlaceCtaBannerProps> = ({
  eventId = 'evt-1',
}) => {
  const { events } = useApp();
  const featuredEvent = events.find((e) => e.id === eventId) || events[0];

  return (
    <section className="relative w-full bg-[#0D3A21] text-white py-12 sm:py-16 lg:py-20 overflow-hidden border-b border-white/10 select-none">
      {/* 1. Multi-dimensional Stage Lighting Gradients (Warm Amber on left, Brand Green center, Deep Emerald right) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle 380px at 20% 50%, rgba(255, 229, 0, 0.16), transparent 70%),
            radial-gradient(circle 440px at 60% 50%, rgba(0, 168, 60, 0.18), transparent 70%),
            radial-gradient(circle 380px at 90% 50%, rgba(13, 58, 33, 0.3), transparent 70%),
            linear-gradient(90deg, #072113 0%, #0D3A21 50%, #082415 100%)
          `,
        }}
      />

      {/* 2. Vertical 3D Fluted / Ribbed Architectural Curtain Backdrop (Matching User Reference Texture) */}
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.14) 0px,
            rgba(255, 255, 255, 0.14) 2px,
            transparent 2px,
            transparent 16px,
            rgba(0, 0, 0, 0.45) 16px,
            rgba(0, 0, 0, 0.45) 18px
          )`,
        }}
      />

      {/* 3. Subtle horizontal sheen highlights */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFE500]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Content Container */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-10">
          {/* Left Text Block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="text-left space-y-2 max-w-3xl"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black font-display text-white tracking-tight leading-tight">
              Secure your Place at 2026 Conference
            </h2>
            <p className="text-white/85 text-sm sm:text-base lg:text-lg font-normal leading-relaxed">
              Register now at only{' '}
              <strong className="text-white font-bold">GHS 4,000</strong> by{' '}
              <span className="text-[#FFE500] font-bold">30 September 2026</span>.
            </p>
          </motion.div>

          {/* Right Button Block (Vibrant Yellow #FFE500 with Sharp Edges) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="shrink-0 self-start md:self-center"
          >
            <Link
              to={`/register?event=${featuredEvent?.id || eventId}`}
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 bg-[#FFE500] hover:bg-[#f5dc00] active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-none shadow-2xl hover:shadow-[0_0_30px_rgba(255,229,0,0.45)] transition-all duration-200 cursor-pointer group whitespace-nowrap border border-yellow-300"
            >
              <span>GET THE GHS 4,000 RATE</span>
              <ArrowRight className="w-4 h-4 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
