import React from 'react';

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type MedalShape =
  | 'shield'
  | 'hexagon'
  | 'star'
  | 'crown'
  | 'laurel'
  | 'trophy'
  | 'ribbon'
  | 'gem'
  | 'circle';

export type BadgeIconType =
  | 'lightbulb_shield'
  | 'flame_shield'
  | 'blazing_crown'
  | 'star_hexagon'
  | 'brackets_trophy'
  | 'phoenix_arrow'
  | 'rocket'
  | 'handshake'
  | 'brain'
  | 'sword_shield'
  | 'team_player'
  | 'sunrise'
  | 'book'
  | 'lightning'
  | 'target'
  | 'gem'
  | 'code_brackets';

interface BadgeEmblemProps {
  iconType: BadgeIconType | string;
  rarity?: BadgeRarity;
  shape?: MedalShape;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isLocked?: boolean;
  isUnlockedAnimation?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BadgeEmblem: React.FC<BadgeEmblemProps> = ({
  iconType,
  rarity = 'bronze',
  shape = 'shield',
  size = 'md',
  isLocked = false,
  isUnlockedAnimation = false,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    xs: 32,
    sm: 44,
    md: 64,
    lg: 84,
    xl: 110,
    hero: 140,
  };

  const dim = sizeMap[size] || sizeMap.md;
  const uniqueId = `badge_${iconType}_${rarity}_${shape}_${size}`;

  // Metallic Rarity Palettes
  const rarityThemes: Record<
    BadgeRarity,
    {
      gradient: [string, string, string];
      border: string;
      innerGlow: string;
      accent: string;
      label: string;
    }
  > = {
    bronze: {
      gradient: ['#7c2d12', '#b45309', '#d97706'],
      border: '#f59e0b',
      innerGlow: 'rgba(217, 119, 6, 0.35)',
      accent: '#fbbf24',
      label: 'Bronze',
    },
    silver: {
      gradient: ['#334155', '#64748b', '#94a3b8'],
      border: '#cbd5e1',
      innerGlow: 'rgba(203, 213, 225, 0.45)',
      accent: '#f8fafc',
      label: 'Silver',
    },
    gold: {
      gradient: ['#b45309', '#f59e0b', '#fbbf24'],
      border: '#fef08a',
      innerGlow: 'rgba(251, 191, 36, 0.55)',
      accent: '#fffbeb',
      label: 'Gold',
    },
    platinum: {
      gradient: ['#0369a1', '#0ea5e9', '#38bdf8'],
      border: '#e0f2fe',
      innerGlow: 'rgba(56, 189, 248, 0.65)',
      accent: '#f0f9ff',
      label: 'Platinum',
    },
    diamond: {
      gradient: ['#4f46e5', '#8b5cf6', '#06b6d4'],
      border: '#c4b5fd',
      innerGlow: 'rgba(167, 139, 250, 0.75)',
      accent: '#ffffff',
      label: 'Diamond',
    },
  };

  const currentTheme = rarityThemes[rarity] || rarityThemes.bronze;

  // Render Inner Emblem Illustration
  const renderEmblemGraphic = () => {
    switch (iconType) {
      case 'lightbulb_shield':
      case 'First Flame':
      case 'Sparkles':
        return (
          <g transform="translate(50, 50) scale(0.9)">
            {/* Lightbulb in Shield */}
            <path
              d="M-12 -14 C-12 -22 12 -22 12 -14 C12 -8 7 -4 7 2 L-7 2 C-7 -4 -12 -8 -12 -14 Z"
              fill={isLocked ? '#94a3b8' : '#fef08a'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <rect x="-6" y="4" width="12" height="3" rx="1" fill="#cbd5e1" />
            <rect x="-4" y="8" width="8" height="2" rx="1" fill="#94a3b8" />
            <line x1="0" y1="-28" x2="0" y2="-24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-18" y1="-24" x2="-14" y2="-20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="-24" x2="14" y2="-20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-12" r="3" fill="#ffffff" />
          </g>
        );

      case 'flame_shield':
      case 'Habit Ignited':
      case 'Flame':
        return (
          <g transform="translate(50, 52) scale(0.95)">
            {/* Blazing Flame inside Shield */}
            <path
              d="M0 -24 C-4 -14 -16 -6 -16 8 C-16 19 -8 24 0 24 C8 24 16 19 16 8 C16 -6 4 -14 0 -24 Z"
              fill={isLocked ? '#94a3b8' : '#ea580c'}
            />
            <path
              d="M0 -12 C-2 -6 -10 0 -10 9 C-10 16 -5 20 0 20 C5 20 10 16 10 9 C10 0 2 -6 0 -12 Z"
              fill={isLocked ? '#cbd5e1' : '#f59e0b'}
            />
            <path
              d="M0 0 C-1 4 -5 7 -5 12 C-5 16 -2 18 0 18 C2 18 5 16 5 12 C5 7 1 4 0 0 Z"
              fill="#ffffff"
            />
          </g>
        );

      case 'blazing_crown':
      case 'Iron Will':
      case 'Crown':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* Crown with fire jewels */}
            <path
              d="M-22 14 L-26 -10 L-10 2 L0 -16 L10 2 L26 -10 L22 14 Z"
              fill={isLocked ? '#94a3b8' : '#f59e0b'}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x="-22" y="14" width="44" height="6" rx="2" fill="#d97706" />
            <circle cx="-26" cy="-10" r="2.5" fill="#ffffff" />
            <circle cx="0" cy="-16" r="3.5" fill="#fef08a" />
            <circle cx="26" cy="-10" r="2.5" fill="#ffffff" />
            <circle cx="0" cy="8" r="3" fill="#dc2626" />
            <circle cx="-12" cy="8" r="2" fill="#2563eb" />
            <circle cx="12" cy="8" r="2" fill="#16a34a" />
          </g>
        );

      case 'star_hexagon':
      case 'Vanguard Scholar':
      case 'Award':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* 5-pointed multi-faceted golden star */}
            <polygon
              points="0,-24 7,-8 24,-7 11,4 16,21 0,11 -16,21 -11,4 -24,-7 -7,-8"
              fill={isLocked ? '#94a3b8' : '#fef08a'}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="1" r="5" fill="#f59e0b" />
          </g>
        );

      case 'brackets_trophy':
      case 'Centurion Coder':
      case 'Code2':
        return (
          <g transform="translate(50, 48) scale(0.9)">
            {/* Trophy Cup with code brackets */}
            <path
              d="M-14 -16 L14 -16 L12 6 C12 14 0 16 0 16 C0 16 -12 14 -12 6 Z"
              fill={isLocked ? '#94a3b8' : '#f59e0b'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Handles */}
            <path d="M-14 -12 C-22 -12 -22 2 -12 2" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M14 -12 C22 -12 22 2 12 2" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Stem & Base */}
            <rect x="-3" y="16" width="6" height="8" fill="#d97706" />
            <rect x="-12" y="24" width="24" height="5" rx="1.5" fill="#ffffff" />
            {/* Code Brackets on cup */}
            <path d="M-6 -7 L-9 -4 L-6 -1" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M6 -7 L9 -4 L6 -1" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
            <line x1="2" y1="-8" x2="-2" y2="0" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'phoenix_arrow':
      case 'Phoenix Comeback':
      case 'Zap':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* Rising Phoenix wings & upward arrow */}
            <path
              d="M0 -22 L-14 -4 L-6 -4 L-12 16 L0 8 L12 16 L6 -4 L14 -4 Z"
              fill={isLocked ? '#94a3b8' : '#f97316'}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M0 -14 L-6 0 L-2 0 L-4 10 L0 6 L4 10 L2 0 L6 0 Z"
              fill="#fef08a"
            />
          </g>
        );

      case 'rocket':
      case 'Weekly Trailblazer':
      case 'Rocket':
        return (
          <g transform="translate(50, 50) rotate(-45) scale(0.9)">
            {/* Space Rocket */}
            <path
              d="M0 -24 C8 -16 10 0 10 12 L-10 12 C-10 0 -8 -16 0 -24 Z"
              fill={isLocked ? '#94a3b8' : '#ffffff'}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <circle cx="0" cy="-4" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            {/* Fins */}
            <path d="M-10 4 L-18 14 L-10 12 Z" fill="#ef4444" />
            <path d="M10 4 L18 14 L10 12 Z" fill="#ef4444" />
            {/* Exhaust Fire */}
            <polygon points="-5,14 0,26 5,14" fill="#f59e0b" />
            <polygon points="-2,14 0,20 2,14" fill="#ffffff" />
          </g>
        );

      case 'handshake':
      case 'Peer Helper':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* Clasped Hands / Handshake */}
            <path
              d="M-20 6 L-8 -6 C-5 -8 2 -8 6 -5 L14 3 C16 5 15 8 12 10 L6 13"
              stroke="#ffffff"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M20 6 L8 -6 C5 -8 -2 -8 -6 -5 L-14 3 C-16 5 -15 8 -12 10 L-6 13"
              stroke={isLocked ? '#94a3b8' : '#f59e0b'}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="0" cy="-14" r="3" fill="#ffffff" />
          </g>
        );

      case 'brain':
      case 'Quiz Master':
      case 'TrendingUp':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* Brain with synaptic energy */}
            <path
              d="M-3 -16 C-12 -16 -18 -10 -18 0 C-18 8 -14 14 -4 16 L-2 16 L-2 -16 Z"
              fill={isLocked ? '#94a3b8' : '#ec4899'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <path
              d="M3 -16 C12 -16 18 -10 18 0 C18 8 14 14 4 16 L2 16 L2 -16 Z"
              fill={isLocked ? '#94a3b8' : '#a855f7'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx="-9" cy="-3" r="2.5" fill="#ffffff" />
            <circle cx="9" cy="-3" r="2.5" fill="#ffffff" />
            <line x1="-7" y1="-3" x2="7" y2="-3" stroke="#fef08a" strokeWidth="1.5" />
          </g>
        );

      case 'sword_shield':
      case 'Gauntlet Conqueror':
      case 'Boss Slayer':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* Crossed mythical swords & boss shield */}
            <line x1="-18" y1="-18" x2="18" y2="18" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="-18" x2="-18" y2="18" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-18" cy="-18" r="3" fill="#f59e0b" />
            <circle cx="18" cy="-18" r="3" fill="#f59e0b" />
            <path
              d="M-10 -10 L10 -10 L10 4 C10 12 0 16 0 16 C0 16 -10 12 -10 4 Z"
              fill={isLocked ? '#94a3b8' : '#dc2626'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx="0" cy="2" r="3" fill="#fef08a" />
          </g>
        );

      case 'team_player':
      case 'Team Player':
        return (
          <g transform="translate(50, 50) scale(0.9)">
            {/* Collaborative Group Silhouettes */}
            <circle cx="0" cy="-10" r="6" fill="#ffffff" />
            <path d="M-10 14 C-10 6 10 6 10 14" fill="#ffffff" />
            <circle cx="-14" cy="-5" r="4.5" fill={isLocked ? '#94a3b8' : '#38bdf8'} />
            <path d="M-22 16 C-22 10 -6 10 -6 16" fill={isLocked ? '#94a3b8' : '#38bdf8'} />
            <circle cx="14" cy="-5" r="4.5" fill={isLocked ? '#94a3b8' : '#38bdf8'} />
            <path d="M6 16 C6 10 22 10 22 16" fill={isLocked ? '#94a3b8' : '#38bdf8'} />
          </g>
        );

      case 'sunrise':
      case 'Early Bird':
        return (
          <g transform="translate(50, 50) scale(0.95)">
            {/* Sunrise over mountains */}
            <path d="M-22 14 L-6 -4 L6 8 L14 -1 L24 14 Z" fill={isLocked ? '#64748b' : '#334155'} stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="0" cy="-6" r="9" fill={isLocked ? '#94a3b8' : '#f59e0b'} stroke="#ffffff" strokeWidth="2" />
            <line x1="0" y1="-22" x2="0" y2="-17" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-12" y1="-18" x2="-8" y2="-14" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="-18" x2="8" y2="-14" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      default:
        return (
          <g transform="translate(50, 50) scale(0.95)">
            <circle cx="0" cy="0" r="14" fill={isLocked ? '#94a3b8' : '#f59e0b'} stroke="#ffffff" strokeWidth="2" />
            <path d="M-5 -2 L0 -7 L5 -2 M0 -7 L0 6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  // Outer Medal Path by Shape
  const getMedalPath = () => {
    switch (shape) {
      case 'hexagon':
        return 'M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z';
      case 'star':
        return 'M50 2 L62 34 L96 35 L68 56 L79 90 L50 70 L21 90 L32 56 L4 35 L38 34 Z';
      case 'crown':
        return 'M10 35 L26 12 L50 24 L74 12 L90 35 L82 85 C82 88 50 95 50 95 C50 95 18 88 18 85 Z';
      case 'laurel':
      case 'circle':
        return 'M50 6 A44 44 0 1 0 50 94 A44 44 0 1 0 50 6 Z';
      case 'shield':
      default:
        return 'M50 5 L88 18 C88 55 72 82 50 95 C28 82 12 55 12 18 Z';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer group select-none transition-transform ${
        isUnlockedAnimation ? 'animate-badge-pop' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      style={{ width: dim, height: dim }}
      aria-label={`${rarity} rarity badge: ${iconType}`}
    >
      {/* 3D Parallax Shine overlay and glow */}
      {!isLocked && (
        <div
          className="absolute inset-0 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none -z-10"
          style={{ background: currentTheme.innerGlow }}
        />
      )}

      {/* Sparkles for Diamond Rarity */}
      {rarity === 'diamond' && !isLocked && (
        <>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75 pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-300 rounded-full animate-pulse opacity-85 pointer-events-none" />
        </>
      )}

      {/* SVG Medal Emblem */}
      <svg
        viewBox="0 0 100 100"
        width={dim}
        height={dim}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        style={{
          filter: isLocked ? 'grayscale(1) opacity(0.55)' : 'none',
        }}
      >
        <defs>
          {/* Metallic Body Gradient */}
          <linearGradient id={`${uniqueId}_metal`} x1="20" y1="5" x2="80" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={currentTheme.gradient[2]} />
            <stop offset="50%" stopColor={currentTheme.gradient[1]} />
            <stop offset="100%" stopColor={currentTheme.gradient[0]} />
          </linearGradient>

          {/* Border Metallic Sheen */}
          <linearGradient id={`${uniqueId}_sheen`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor={currentTheme.border} />
            <stop offset="100%" stopColor={currentTheme.gradient[0]} />
          </linearGradient>

          {/* Slow Diagonal Shine Sweep */}
          <linearGradient id={`${uniqueId}_sweep`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Shadow Drop */}
        <path d={getMedalPath()} fill="rgba(0, 0, 0, 0.25)" transform="translate(0, 2)" />

        {/* Main Medal Body */}
        <path
          d={getMedalPath()}
          fill={`url(#${uniqueId}_metal)`}
          stroke={`url(#${uniqueId}_sheen)`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Bevel Inset */}
        <path
          d={getMedalPath()}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          transform="scale(0.88) translate(6.8, 6.8)"
        />

        {/* Animated Shine Sweep on Unlocked Badges */}
        {!isLocked && (
          <path
            d={getMedalPath()}
            fill={`url(#${uniqueId}_sweep)`}
            className="animate-shine-sweep"
            pointerEvents="none"
          />
        )}

        {/* Inner Illustrated Graphic */}
        {renderEmblemGraphic()}

        {/* Small Lock Silhouette if Locked */}
        {isLocked && (
          <g transform="translate(50, 52)">
            <circle cx="0" cy="0" r="16" fill="rgba(15, 23, 42, 0.85)" stroke="#64748b" strokeWidth="1.5" />
            {/* Padlock */}
            <rect x="-6" y="-2" width="12" height="10" rx="2" fill="#e2e8f0" />
            <path
              d="M-4 -2 L-4 -6 C-4 -8.5 4 -8.5 4 -6 L4 -2"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="0" cy="3" r="1.5" fill="#475569" />
          </g>
        )}
      </svg>
    </div>
  );
};
