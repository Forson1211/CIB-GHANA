import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface CountdownTimerProps {
  targetDateStr: string;
  endDateStr?: string;
  className?: string;
  variant?: 'dark' | 'light' | 'gold' | 'circular';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
  isEnded: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDateStr,
  endDateStr,
  className,
  variant = 'circular',
}) => {
  const [time, setTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isStarted: false,
    isEnded: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const targetTime = new Date(targetDateStr).getTime();
      const endTime = endDateStr ? new Date(endDateStr).getTime() : targetTime + 24 * 60 * 60 * 1000;

      if (now > endTime) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnded: true });
        return;
      }

      if (now >= targetTime) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnded: false });
        return;
      }

      const diff = targetTime - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds, isStarted: false, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, endDateStr]);

  if (time.isEnded) {
    return (
      <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold tracking-wider text-sm uppercase', className)}>
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Event Ended
      </div>
    );
  }

  if (time.isStarted) {
    return (
      <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-cib-green-800 border border-cib-green-200 font-bold tracking-wider text-sm uppercase', className)}>
        <span className="w-2 h-2 rounded-full bg-cib-green-600 animate-ping"></span>
        Event in Progress
      </div>
    );
  }

  // Circular timer as requested in reference image
  if (variant === 'circular' || variant === 'gold') {
    const radius = 36;
    const circumference = 2 * Math.PI * radius; // ~226.19

    const units = [
      {
        value: time.days,
        label: 'DAYS',
        progress: Math.min(1, Math.max(0.04, (time.days % 30) / 30)),
      },
      {
        value: time.hours,
        label: 'HOURS',
        progress: Math.min(1, Math.max(0.04, time.hours / 24)),
      },
      {
        value: time.minutes,
        label: 'MINUTES',
        progress: Math.min(1, Math.max(0.04, time.minutes / 60)),
      },
      {
        value: time.seconds,
        label: 'SECONDS',
        progress: Math.min(1, Math.max(0.04, time.seconds / 60)),
      },
    ];

    return (
      <div className={cn('flex items-center gap-3 sm:gap-5 py-1', className)}>
        {units.map((unit, idx) => {
          const strokeDashoffset = circumference * (1 - unit.progress);

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[72px] sm:max-w-[84px]">
              {/* Circular SVG Ring with Plain Glass Disc (Single ring) */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
                  <defs>
                    <linearGradient id={`circleGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#84cc16" />
                      <stop offset="60%" stopColor="#a3e635" />
                      <stop offset="100%" stopColor="#facc15" />
                    </linearGradient>
                  </defs>

                  {/* Subtle Background Circle Track with Clear Glass Fill */}
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    fill="rgba(255, 255, 255, 0.04)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                  />

                  {/* Active Glowing Progress Arc with Lime-Yellow Gradient */}
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    fill="transparent"
                    stroke={`url(#circleGrad-${idx})`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Bold Number in the center */}
                <span className="absolute font-sans font-black text-xl sm:text-2xl md:text-2xl text-white tracking-tight">
                  {unit.value}
                </span>
              </div>

              {/* Unit Label below */}
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-white/90 mt-2 text-center uppercase">
                {unit.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const unitStyles = {
    dark: 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-cib-charcoal-900/90 text-white shadow-lg font-mono font-bold text-xl sm:text-2xl backdrop-blur-md',
    light: 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl border bg-white text-cib-charcoal-900 border-slate-200 shadow-sm font-mono font-bold text-xl sm:text-2xl',
    gold: '',
    circular: '',
  };

  const labelStyles = {
    dark: 'text-slate-400 font-semibold',
    light: 'text-slate-500 font-semibold',
    gold: 'text-[#FFE500] font-black tracking-widest',
    circular: 'text-slate-300 font-medium tracking-widest',
  };

  return (
    <div className={cn('flex items-center justify-center gap-4 sm:gap-6', className)}>
      {[
        { value: pad(time.days), label: 'DAYS' },
        { value: pad(time.hours), label: 'HOURS' },
        { value: pad(time.minutes), label: 'MINUTES' },
        { value: pad(time.seconds), label: 'SECONDS' },
      ].map((unit, idx) => (
        <div key={idx} className="flex flex-col items-center min-w-[48px] sm:min-w-[60px]">
          <div
            className={cn(
              'flex items-center justify-center transition-all',
              unitStyles[variant]
            )}
          >
            {unit.value}
          </div>
          <span className={cn('text-[10px] sm:text-xs mt-2 text-center', labelStyles[variant])}>
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};
