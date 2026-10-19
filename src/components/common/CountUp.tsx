import React, { useEffect, useState } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  formatter,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(() => {
    // If reduced motion is preferred, jump straight to value
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return value;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    const start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();
    let frameId: number;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formatted = formatter ? formatter(displayValue) : displayValue.toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
