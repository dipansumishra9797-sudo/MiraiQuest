import React from 'react';

export type StreakTier = 'spark' | 'blaze' | 'inferno' | 'legend';

export function getStreakTier(days: number): { tier: StreakTier; name: string; color: string; desc: string } {
  if (days >= 100) {
    return { tier: 'legend', name: 'Legend', color: '#f59e0b', desc: 'Golden Crowned Eternal Flame' };
  }
  if (days >= 30) {
    return { tier: 'inferno', name: 'Inferno', color: '#06b6d4', desc: 'White-Hot Blue Plasma' };
  }
  if (days >= 7) {
    return { tier: 'blaze', name: 'Blaze', color: '#f97316', desc: 'Roaring Firestorm' };
  }
  return { tier: 'spark', name: 'Spark', color: '#fb923c', desc: 'Ignited Habit' };
}

interface StreakFlameProps {
  streakDays: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isAtRisk?: boolean;
  isFrozen?: boolean;
  isBursting?: boolean;
  isExtinguished?: boolean;
  showTierLabel?: boolean;
  className?: string;
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
}) => {
  const { tier, name } = getStreakTier(streakDays);

  // Dimension mapping
  const sizeMap = {
    xs: { width: 16, height: 20 },
    sm: { width: 22, height: 28 },
    md: { width: 32, height: 40 },
    lg: { width: 44, height: 56 },
    xl: { width: 64, height: 80 },
    hero: { width: 96, height: 120 },
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
      glow: 'rgba(234, 88, 12, 0.3)',
      ember: '#ea580c',
    },
  };

  const activeColors = isFrozen
    ? tierColors.frozen
    : isAtRisk
    ? tierColors.atRisk
    : tierColors[tier];

  // Scale multiplier based on tier
  const tierScale = tier === 'legend' ? 1.15 : tier === 'inferno' ? 1.08 : tier === 'blaze' ? 1.02 : 0.94;

  const idPrefix = `flame_${size}_${tier}_${isFrozen ? 'frz' : ''}_${isAtRisk ? 'risk' : ''}`;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center relative select-none ${className}`}
      aria-label={`${name} tier learning streak: ${streakDays} days`}
      title={`${streakDays} Day Streak (${name} Tier)`}
    >
      {/* Container with state animations */}
      <div
        className={`relative flex items-center justify-center transition-all ${
          isBursting ? 'scale-125 duration-300' : ''
        } ${isAtRisk ? 'animate-flame-at-risk' : ''} ${
          isFrozen ? 'animate-frost-glow' : ''
        }`}
        style={{
          width: dims.width,
          height: dims.height,
          filter: isExtinguished
            ? 'grayscale(1) opacity(0.4)'
            : `drop-shadow(0 0 ${size === 'hero' ? '24px' : size === 'xl' ? '16px' : '8px'} ${activeColors.glow})`,
        }}
      >
        {/* Soft glowing radial backdrop halo */}
        {!isExtinguished && (
          <div
            className="absolute inset-0 rounded-full blur-md -z-10 pointer-events-none animate-halo-pulse"
            style={{
              background: `radial-gradient(circle, ${activeColors.glow} 0%, transparent 70%)`,
              transform: `scale(${tierScale * 1.5})`,
            }}
          />
        )}

        {/* Shockwave ring on streak increase burst */}
        {isBursting && (
          <div
            className="absolute inset-0 rounded-full border-2 border-orange-400 animate-shockwave pointer-events-none -z-10"
            style={{ borderColor: activeColors.midStart }}
          />
        )}

        {/* Warning ring for At-Risk state */}
        {isAtRisk && (
          <div
            className="absolute -inset-1 rounded-full border border-dashed border-amber-500/60 animate-spin-slow pointer-events-none -z-10"
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
            <linearGradient id={`${idPrefix}_outer`} x1="50" y1="120" x2="50" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeColors.outerStart} />
              <stop offset="60%" stopColor={activeColors.outerEnd} />
              <stop offset="100%" stopColor={activeColors.midStart} />
            </linearGradient>

            {/* Middle Flame Gradient */}
            <linearGradient id={`${idPrefix}_mid`} x1="50" y1="110" x2="50" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeColors.midStart} />
              <stop offset="70%" stopColor={activeColors.midEnd} />
              <stop offset="100%" stopColor={activeColors.coreStart} />
            </linearGradient>

            {/* Inner White-Hot Core Gradient */}
            <linearGradient id={`${idPrefix}_core`} x1="50" y1="105" x2="50" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeColors.coreStart} />
              <stop offset="100%" stopColor={activeColors.coreEnd} />
            </linearGradient>

            {/* Crown Gold Gradient (Legend tier only) */}
            <linearGradient id={`${idPrefix}_crown`} x1="50" y1="0" x2="50" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Ice Crystal Gradient (Freeze) */}
            <linearGradient id={`${idPrefix}_frost`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Golden Crown for 100+ Days Legend Tier */}
          {tier === 'legend' && !isFrozen && !isExtinguished && (
            <g className="animate-crown-float origin-bottom">
              <path
                d="M26 24L32 10L50 20L68 10L74 24C74 24 64 27 50 27C36 27 26 24 26 24Z"
                fill={`url(#${idPrefix}_crown)`}
                stroke="#fffbeb"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="10" r="2.5" fill="#ffffff" />
              <circle cx="50" cy="19" r="3" fill="#ffffff" />
              <circle cx="68" cy="10" r="2.5" fill="#ffffff" />
              <circle cx="50" cy="24" r="1.5" fill="#dc2626" />
            </g>
          )}

          {/* Ice Snowflake Overlay if Frozen */}
          {isFrozen && (
            <g className="animate-snowflake-spin origin-center" transform="translate(50, 60)">
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="-11" y1="-11" x2="11" y2="11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="-11" y1="11" x2="11" y2="-11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="0" cy="0" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}

          {/* Outer Layer: Base Flame (Sways gently) */}
          <path
            className={isExtinguished ? '' : 'flame-outer-layer'}
            d="M50 10 C46 32 30 45 22 64 C12 87 26 115 50 115 C74 115 88 87 78 64 C70 45 54 32 50 10 Z"
            fill={`url(#${idPrefix}_outer)`}
          />

          {/* Middle Layer: Secondary Licking Flame (Scales & sways at different frequency) */}
          <path
            className={isExtinguished ? '' : 'flame-mid-layer'}
            d="M50 32 C46 48 35 58 31 72 C25 88 35 106 50 106 C65 106 75 88 69 72 C65 58 54 48 50 32 Z"
            fill={`url(#${idPrefix}_mid)`}
          />

          {/* Inner Layer: White-Hot Core (Rapid pulse & shimmer) */}
          <path
            className={isExtinguished ? '' : 'flame-core-layer'}
            d="M50 56 C48 66 42 74 40 82 C37 92 42 100 50 100 C58 100 63 92 60 82 C58 74 52 66 50 56 Z"
            fill={`url(#${idPrefix}_core)`}
          />

          {/* Floating Embers / Sparks (Animated via CSS) */}
          {!isExtinguished && (
            <g className="flame-embers">
              <circle className="ember-1" cx="38" cy="40" r="2" fill={activeColors.ember} />
              <circle className="ember-2" cx="62" cy="35" r="1.6" fill={activeColors.coreEnd} />
              <circle className="ember-3" cx="50" cy="18" r="2.2" fill={activeColors.midEnd} />
              {(tier === 'inferno' || tier === 'legend') && (
                <>
                  <circle className="ember-4" cx="28" cy="50" r="1.5" fill={activeColors.ember} />
                  <circle className="ember-5" cx="72" cy="45" r="1.8" fill={activeColors.coreStart} />
                </>
              )}
            </g>
          )}

          {/* Smoke Puff when Extinguished / Reset */}
          {isExtinguished && (
            <g className="animate-smoke-puff origin-center">
              <circle cx="50" cy="65" r="18" fill="rgba(148, 163, 184, 0.45)" />
              <circle cx="42" cy="55" r="14" fill="rgba(148, 163, 184, 0.35)" />
              <circle cx="58" cy="52" r="16" fill="rgba(148, 163, 184, 0.3)" />
              <circle cx="50" cy="40" r="12" fill="rgba(148, 163, 184, 0.2)" />
            </g>
          )}
        </svg>
      </div>

      {/* Tier Label (Optional) */}
      {showTierLabel && (
        <span
          className="mt-1 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full border shadow-2xs transition-colors"
          style={{
            color: activeColors.outerEnd,
            backgroundColor: `${activeColors.outerStart}15`,
            borderColor: `${activeColors.outerEnd}40`,
          }}
        >
          {name}
        </span>
      )}
    </div>
  );
};
