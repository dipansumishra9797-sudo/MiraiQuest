import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SlotCounterProps {
  value: number;
  className?: string;
  duration?: number;
  durationMs?: number;
}

interface DigitReelProps {
  targetDigit: number;
  heightEm?: number;
  delay?: number;
}

const DigitReel: React.FC<DigitReelProps> = ({
  targetDigit,
  heightEm = 1.15,
  delay = 0,
}) => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  if (prefersReduced) {
    return <span className="tabular-nums">{targetDigit}</span>;
  }

  return (
    <span
      className="inline-block overflow-hidden align-baseline select-none"
      style={{
        height: `${heightEm}em`,
        lineHeight: `${heightEm}em`,
        verticalAlign: 'baseline',
      }}
    >
      <motion.span
        className="flex flex-col tabular-nums font-black"
        initial={{ y: 0 }}
        animate={{ y: `-${targetDigit * heightEm}em` }}
        transition={{
          type: 'spring',
          damping: 22,
          stiffness: 200,
          mass: 0.85,
          delay,
        }}
      >
        {digits.map((d) => (
          <span
            key={d}
            className="inline-flex items-center justify-center font-black"
            style={{ height: `${heightEm}em`, lineHeight: `${heightEm}em` }}
          >
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

export const SlotCounter: React.FC<SlotCounterProps> = ({
  value,
  className = '',
}) => {
  const safeVal = Math.max(0, Math.floor(value));
  const digits = safeVal.toString().split('').map(Number);

  return (
    <span className={`inline-flex items-baseline font-black tabular-nums ${className}`}>
      {digits.map((digit, index) => (
        <DigitReel
          key={`${digits.length - index}-${digit}`}
          targetDigit={digit}
          delay={index * 0.04}
        />
      ))}
    </span>
  );
};
