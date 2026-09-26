import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import chatbotBaseIcon from '../../assets/chatbot-icon-gold.png';

interface LivingChatbotAvatarProps {
  size?: number | string;
  className?: string;
  isTyping?: boolean;
  interactive?: boolean;
}

export const LivingChatbotAvatar: React.FC<LivingChatbotAvatarProps> = ({
  size = 56,
  className = '',
  isTyping = false,
  interactive = true,
}) => {
  const [blinkState, setBlinkState] = useState<'open' | 'closed' | 'wink'>('open');
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });

  // Natural human-like blinking loop (with randomized intervals and double blinks)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
      // 1. Close eyelids
      setBlinkState('closed');

      // 2. Open after ~140ms
      setTimeout(() => {
        setBlinkState('open');

        // 25% chance of a realistic human double-blink
        if (Math.random() < 0.28) {
          setTimeout(() => {
            setBlinkState('closed');
            setTimeout(() => {
              setBlinkState('open');
            }, 130);
          }, 150);
        }
      }, 140);

      // Schedule next blink randomly between 2.5s and 5.5s
      const nextDelay = 2600 + Math.random() * 3200;
      timeoutId = setTimeout(triggerBlink, nextDelay);
    };

    // Initial blink after 1.5s
    timeoutId = setTimeout(triggerBlink, 1500);

    return () => clearTimeout(timeoutId);
  }, []);

  // Subtle glancing around every 4-7 seconds (gives conscious presence)
  useEffect(() => {
    if (isTyping) {
      setLookOffset({ x: 0, y: 0 });
      return;
    }

    const glanceInterval = setInterval(() => {
      const glances = [
        { x: 0, y: 0 },
        { x: -1.8, y: -0.8 },
        { x: 1.8, y: -0.8 },
        { x: 0, y: 1.2 },
        { x: 0, y: 0 },
      ];
      const randomGlance = glances[Math.floor(Math.random() * glances.length)];
      setLookOffset(randomGlance);

      // Return to center after 1.4s
      setTimeout(() => {
        setLookOffset({ x: 0, y: 0 });
      }, 1400);
    }, 4500);

    return () => clearInterval(glanceInterval);
  }, [isTyping]);

  return (
    <motion.div
      animate={{
        y: [0, -2.5, 0],
      }}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={interactive ? { scale: 1.08, rotate: [0, -3, 3, 0] } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      onMouseEnter={() => {
        if (interactive) {
          // Playful wink on hover!
          setBlinkState('wink');
          setTimeout(() => setBlinkState('open'), 400);
        }
      }}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
    >
      {/* Base Icon: Yellow circle + dark green headset + white face + yellow nose */}
      <img
        src={chatbotBaseIcon}
        alt="CIB Ghana AI Assistant"
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.22)]"
        draggable={false}
      />

      {/* Living Animated Eye Overlays
          Left Eye Center: 38.6% X, 49.9% Y
          Right Eye Center: 60.6% X, 49.9% Y
          Eye Diameter: ~8% width
      */}
      <div className="absolute inset-0 pointer-events-none">
        {/* LEFT EYE CONTAINER */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: '38.6%',
            top: '49.9%',
            width: '8.4%',
            height: '8.4%',
          }}
        >
          {/* Eye Pupil & Glint with Glancing Movement */}
          <motion.div
            animate={{
              x: isTyping ? [-1.5, 1.5, -1.5] : lookOffset.x,
              y: isTyping ? [0, -0.8, 0] : lookOffset.y,
            }}
            transition={{
              duration: isTyping ? 0.6 : 0.35,
              repeat: isTyping ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="w-full h-full rounded-full bg-[#005A1E] flex items-center justify-center relative overflow-hidden shadow-inner"
          >
            {/* Sparkle glint of life in the eye */}
            <span className="absolute top-[18%] left-[22%] w-[28%] h-[28%] rounded-full bg-white opacity-85" />
          </motion.div>

          {/* Eyelid covering the eye when blinking */}
          <motion.div
            animate={{
              scaleY: blinkState === 'closed' ? 1 : 0,
            }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
            className="absolute inset-0 rounded-full bg-white border-b border-[#005A1E]/40"
          />
        </div>

        {/* RIGHT EYE CONTAINER */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: '60.6%',
            top: '49.9%',
            width: '8.4%',
            height: '8.4%',
          }}
        >
          {/* Eye Pupil & Glint with Glancing Movement */}
          <motion.div
            animate={{
              x: isTyping ? [-1.5, 1.5, -1.5] : lookOffset.x,
              y: isTyping ? [0, -0.8, 0] : lookOffset.y,
            }}
            transition={{
              duration: isTyping ? 0.6 : 0.35,
              repeat: isTyping ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="w-full h-full rounded-full bg-[#005A1E] flex items-center justify-center relative overflow-hidden shadow-inner"
          >
            {/* Sparkle glint of life in the eye */}
            <span className="absolute top-[18%] left-[22%] w-[28%] h-[28%] rounded-full bg-white opacity-85" />
          </motion.div>

          {/* Eyelid covering the eye when blinking or winking */}
          <motion.div
            animate={{
              scaleY: blinkState === 'closed' || blinkState === 'wink' ? 1 : 0,
            }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
            className="absolute inset-0 rounded-full bg-white border-b border-[#005A1E]/40"
          />
        </div>
      </div>
    </motion.div>
  );
};
