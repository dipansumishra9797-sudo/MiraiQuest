import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export type StreakTier = 'spark' | 'blaze' | 'inferno' | 'legend';

export interface StreakTierInfo {
  tier: StreakTier;
  name: string;
  color: string;
  accentColor: string;
  desc: string;
  minDays: number;
}

export function getStreakTier(days: number): StreakTierInfo {
  if (days >= 100) {
    return {
      tier: 'legend',
      name: 'Legend',
      color: '#f59e0b',
      accentColor: '#fde047',
      desc: 'Golden Crowned Eternal Flame',
      minDays: 100,
    };
  }
  if (days >= 30) {
    return {
      tier: 'inferno',
      name: 'Inferno',
      color: '#06b6d4',
      accentColor: '#38bdf8',
      desc: 'White-Hot Blue Plasma',
      minDays: 30,
    };
  }
  if (days >= 7) {
    return {
      tier: 'blaze',
      name: 'Blaze',
      color: '#f97316',
      accentColor: '#facc15',
      desc: 'Roaring Firestorm',
      minDays: 7,
    };
  }
  return {
    tier: 'spark',
    name: 'Spark',
    color: '#fb923c',
    accentColor: '#fbbf24',
    desc: 'Ignited Habit',
    minDays: 1,
  };
}

export interface StreakFlameProps {
  streakDays: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isAtRisk?: boolean;
  isFrozen?: boolean;
  isBursting?: boolean;
  isExtinguished?: boolean;
  showTierLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  streakDays,
  size = 'md',
  isAtRisk = false,
  isFrozen = false,
  isBursting = false,
  isExtinguished = false,
  showTierLabel = false,
  className = '',
  onClick,
}) => {
  const { tier, name } = getStreakTier(streakDays);
  const isZero = streakDays === 0 || isExtinguished;

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

  // Dimension mapping
  const sizeMap = {
    xs: { width: 18, height: 22 },
    sm: { width: 24, height: 30 },
    md: { width: 34, height: 42 },
    lg: { width: 48, height: 60 },
    xl: { width: 68, height: 84 },
    hero: { width: 108, height: 135 },
  };

  const dims = sizeMap[size] || sizeMap.md;

  // Tier color definitions for layered SVG
  const tierColors = {
    spark: {
      outerStart: '#ea580c',
      outerEnd: '#f97316',
      midStart: '#f59e0b',
      midEnd: '#fbbf24',
      coreStart: '#fef08a',
      coreEnd: '#ffffff',
      glow: 'rgba(249, 115, 22, 0.45)',
      ember: '#fb923c',
    },
    blaze: {
      outerStart: '#dc2626',
      outerEnd: '#ea580c',
      midStart: '#f97316',
      midEnd: '#facc15',
      coreStart: '#fef9c3',
      coreEnd: '#ffffff',
      glow: 'rgba(234, 88, 12, 0.65)',
      ember: '#f59e0b',
    },
    inferno: {
      outerStart: '#1d4ed8',
      outerEnd: '#0284c7',
      midStart: '#06b6d4',
      midEnd: '#38bdf8',
      coreStart: '#e0f2fe',
      coreEnd: '#ffffff',
      glow: 'rgba(6, 182, 212, 0.75)',
      ember: '#38bdf8',
    },
    legend: {
      outerStart: '#b45309',
      outerEnd: '#d97706',
      midStart: '#f59e0b',
      midEnd: '#fcd34d',
      coreStart: '#fffbeb',
      coreEnd: '#ffffff',
      glow: 'rgba(245, 158, 11, 0.85)',
      ember: '#fde047',
    },
    frozen: {
      outerStart: '#0284c7',
      outerEnd: '#38bdf8',
      midStart: '#7dd3fc',
      midEnd: '#bae6fd',
      coreStart: '#e0f2fe',
      coreEnd: '#ffffff',
      glow: 'rgba(56, 189, 248, 0.7)',
      ember: '#93c5fd',
    },
    atRisk: {
      outerStart: '#9a3412',
      outerEnd: '#c2410c',
      midStart: '#ea580c',
      midEnd: '#fb923c',
      coreStart: '#fed7aa',
      coreEnd: '#ffedd5',
      glow: 'rgba(234, 88, 12, 0.25)',
      ember: '#ea580c',
    },
  };

  const activeColors = isFrozen
    ? tierColors.frozen
    : isAtRisk
    ? tierColors.atRisk
    : tierColors[tier];

  // Scale multiplier based on tier (Flame grows with streak)
  const tierScale =
    tier === 'legend' ? 1.18 : tier === 'inferno' ? 1.1 : tier === 'blaze' ? 1.04 : 0.96;

  const idPrefix = `flame_${size}_${tier}_${isFrozen ? 'frz' : ''}_${isAtRisk ? 'risk' : ''}_${isZero ? 'zero' : ''}`;

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center relative select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      aria-label={`${name} tier learning streak: ${streakDays} days`}
      title={
        isZero
          ? 'Fresh start: complete an activity to ignite your spark!'
          : isFrozen
          ? 'Streak protected by Streak Freeze'
          : isAtRisk
          ? 'Streak at risk: complete your daily task to keep burning'
          : `${streakDays} Day Streak (${name} Tier)`
      }
    >
      {/* Outer Glow Halo & Container */}
      <div
        className={`relative flex items-center justify-center transition-all ${
          !prefersReduced && isBursting ? 'scale-125 duration-300' : ''
        } ${!prefersReduced && isAtRisk && !isZero ? 'animate-flame-at-risk' : ''} ${
          !prefersReduced && isFrozen ? 'animate-frost-glow' : ''
        }`}
        style={{
          width: dims.width,
          height: dims.height,
          filter: isZero
            ? 'none'
            : isAtRisk
            ? `drop-shadow(0 0 ${size === 'hero' ? '14px' : '6px'} ${activeColors.glow}) opacity(0.72)`
            : `drop-shadow(0 0 ${size === 'hero' ? '26px' : size === 'xl' ? '18px' : '9px'} ${activeColors.glow})`,
        }}
      >
        {/* Soft glowing radial backdrop halo */}
        {!isZero && !prefersReduced && (
          <div
            className="absolute inset-0 rounded-full blur-md -z-10 pointer-events-none animate-halo-pulse"
            style={{
              background: `radial-gradient(circle, ${activeColors.glow} 0%, transparent 72%)`,
              transform: `scale(${tierScale * 1.5})`,
            }}
          />
        )}

        {/* Shockwave ring on streak increase burst */}
        {!prefersReduced && isBursting && (
          <div
            className="absolute inset-0 rounded-full border-2 animate-shockwave pointer-events-none -z-10"
            style={{ borderColor: activeColors.midStart }}
          />
        )}

        {/* Warning ring for At-Risk state */}
        {!prefersReduced && isAtRisk && !isZero && (
          <div
            className="absolute -inset-1.5 rounded-full border border-dashed border-amber-500/70 animate-spin-slow pointer-events-none -z-10"
          />
        )}

        {/* Main Layered SVG Flame */}
        <svg
          viewBox="0 0 100 125"
          width={dims.width}
          height={dims.height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Outer Flame Gradient */}
            <linearGradient id={`${idPrefix}_outer`} x1="50" y1="120" x2="50" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeColors.outerStart} />
              <stop offset="55%" stopColor={activeColors.outerEnd} />
              <stop offset="100%" stopColor={activeColors.midStart} />
            </linearGradient>

            {/* Middle Flame Gradient */}
            <linearGradient id={`${idPrefix}_mid`} x1="50" y1="110" x2="50" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeColors.midStart} />
              <stop offset="65%" stopColor={activeColors.midEnd} />
              <stop offset="100%" stopColor={activeColors.coreStart} />
            </linearGradient>

            {/* Inner White-Hot Core Gradient */}
            <linearGradient id={`${idPrefix}_core`} x1="50" y1="102" x2="50" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeColors.coreStart} />
              <stop offset="100%" stopColor={activeColors.coreEnd} />
            </linearGradient>

            {/* Crown Gold Gradient (Legend tier only) */}
            <linearGradient id={`${idPrefix}_crown`} x1="50" y1="6" x2="50" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Soft Smoke Puff Gradient */}
            <radialGradient id={`${idPrefix}_smoke`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(148, 163, 184, 0.45)" />
              <stop offset="70%" stopColor="rgba(148, 163, 184, 0.25)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Golden Crown for 100+ Days Legend Tier */}
          {tier === 'legend' && !isFrozen && !isZero && (
            <g className={prefersReduced ? '' : 'animate-crown-float origin-bottom'}>
              <path
                d="M24 22L30 8L50 18L70 8L76 22C76 22 65 26 50 26C35 26 24 22 24 22Z"
                fill={`url(#${idPrefix}_crown)`}
                stroke="#fffbeb"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="30" cy="8" r="2.5" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
              <circle cx="50" cy="18" r="3" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />
              <circle cx="70" cy="8" r="2.5" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
              <circle cx="50" cy="23" r="1.6" fill="#dc2626" />
              <circle cx="38" cy="23" r="1.2" fill="#2563eb" />
              <circle cx="62" cy="23" r="1.2" fill="#16a34a" />
            </g>
          )}

          {/* Ice Snowflake Overlay if Frozen */}
          {isFrozen && !isZero && (
            <g className={prefersReduced ? '' : 'animate-snowflake-spin origin-center'} transform="translate(50, 60)">
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-11" y1="-11" x2="11" y2="11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="-11" y1="11" x2="11" y2="-11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M-10 -4 L-14 0 L-10 4" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M10 -4 L14 0 L10 4" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M-4 -10 L0 -14 L4 -10" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M-4 10 L0 14 L4 10" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <circle cx="0" cy="0" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
            </g>
          )}

          {/* Active Flame Layers */}
          {!isZero && (
            <>
              {/* Outer Layer: Base Flame (Sways gently) */}
              <path
                className={prefersReduced ? '' : 'flame-outer-layer'}
                d="M50 8 C46 25 36 37 30 50 C21 66 18 83 23 98 C28 113 38 120 50 120 C62 120 72 113 77 98 C82 83 79 66 70 50 C64 37 54 25 50 8 Z"
                fill={`url(#${idPrefix}_outer)`}
              />

              {/* Middle Layer: Secondary Licking Flame (Scales & sways at different speed) */}
              <path
                className={prefersReduced ? '' : 'flame-mid-layer'}
                d="M50 30 C46 44 38 56 34 68 C29 82 34 97 42 106 C46 111 54 111 58 106 C66 97 71 82 66 68 C62 56 54 44 50 30 Z"
                fill={`url(#${idPrefix}_mid)`}
              />

              {/* Inner Layer: White-Hot Core (Rapid pulse & shimmer) */}
              <path
                className={prefersReduced ? '' : 'flame-core-layer'}
                d="M50 54 C47 65 42 74 41 83 C40 92 44 100 50 100 C56 100 60 92 59 83 C58 74 53 65 50 54 Z"
                fill={`url(#${idPrefix}_core)`}
              />

              {/* Floating Embers / Sparks (Animated via CSS) */}
              {!prefersReduced && (
                <g className="flame-embers pointer-events-none">
                  <circle className="ember-1" cx="38" cy="42" r="2.2" fill={activeColors.ember} />
                  <circle className="ember-2" cx="62" cy="38" r="1.8" fill={activeColors.coreEnd} />
                  <circle className="ember-3" cx="50" cy="18" r="2.4" fill={activeColors.midEnd} />

                  {/* Extra embers for Blaze */}
                  {tier !== 'spark' && (
                    <circle className="ember-4" cx="44" cy="28" r="1.9" fill={activeColors.outerEnd} />
                  )}

                  {/* Extra floating embers for Inferno & Legend tiers */}
                  {(tier === 'inferno' || tier === 'legend') && (
                    <>
                      <circle className="ember-5" cx="28" cy="52" r="1.8" fill={activeColors.ember} />
                      <circle className="ember-6" cx="72" cy="46" r="2.1" fill={activeColors.coreStart} />
                    </>
                  )}
                </g>
              )}

              {/* Radial Burst Particles on Streak Increment */}
              {!prefersReduced && isBursting && (
                <g className="burst-sparks pointer-events-none">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x2 = 50 + Math.cos(rad) * 36;
                    const y2 = 65 + Math.sin(rad) * 36;
                    return (
                      <motion.circle
                        key={i}
                        cx={50}
                        cy={65}
                        r={2.4}
                        fill={activeColors.midEnd}
                        initial={{ cx: 50, cy: 65, opacity: 1, scale: 1 }}
                        animate={{ cx: x2, cy: y2, opacity: 0, scale: 0.2 }}
                        transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.02 }}
                      />
                    );
                  })}
                </g>
              )}
            </>
          )}

          {/* Soft Smoke Puff when Streak is 0 / Reset (Graceful, non-shaming) */}
          {isZero && (
            <g className={prefersReduced ? '' : 'animate-smoke-puff origin-center'}>
              <circle cx="50" cy="72" r="17" fill="rgba(148, 163, 184, 0.45)" />
              <circle cx="41" cy="58" r="14" fill="rgba(148, 163, 184, 0.38)" />
              <circle cx="59" cy="54" r="15" fill="rgba(148, 163, 184, 0.3)" />
              <circle cx="48" cy="40" r="12" fill="rgba(148, 163, 184, 0.2)" />
              <circle cx="53" cy="26" r="9" fill="rgba(148, 163, 184, 0.12)" />
            </g>
          )}
        </svg>
      </div>

      {/* Tier Label (Optional) */}
      {showTierLabel && (
        <span
          className="mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs transition-colors select-none"
          style={{
            color: isZero ? '#94a3b8' : activeColors.outerEnd,
            backgroundColor: isZero ? 'rgba(148, 163, 184, 0.12)' : `${activeColors.outerStart}18`,
            borderColor: isZero ? 'rgba(148, 163, 184, 0.3)' : `${activeColors.outerEnd}40`,
          }}
        >
          {isZero ? 'Spark Ready' : name}
        </span>
      )}
    </div>
  );
};
