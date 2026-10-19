import React from 'react';

export type GameStatType =
  | 'streak'
  | 'league'
  | 'xp'
  | 'coins'
  | 'level'
  | 'quiz'
  | 'coding'
  | 'doubts'
  | 'perks'
  | 'battles'
  | 'leaderboard'
  | 'ledger'
  | 'attendance';

interface GameStatBadgeProps {
  stat: GameStatType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GameStatBadge: React.FC<GameStatBadgeProps> = ({
  stat,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { container: 'w-7 h-7 rounded-lg', icon: 16 },
    md: { container: 'w-9 h-9 rounded-xl', icon: 20 },
    lg: { container: 'w-11 h-11 rounded-2xl', icon: 24 },
  };

  const dims = sizeMap[size] || sizeMap.md;

  const statConfigs: Record<
    GameStatType,
    {
      gradient: string;
      border: string;
      iconColor: string;
      renderIcon: (s: number) => React.ReactNode;
    }
  > = {
    streak: {
      gradient: 'from-orange-500/20 via-amber-500/15 to-red-500/10',
      border: 'border-orange-500/40 text-orange-400',
      iconColor: '#f97316',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#f97316" stroke="#ea580c" />
        </svg>
      ),
    },
    league: {
      gradient: 'from-amber-500/20 via-yellow-500/15 to-amber-600/10',
      border: 'border-amber-500/40 text-amber-400',
      iconColor: '#f59e0b',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
          <path d="M14 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
          <path d="M6 4h12v7a6 6 0 0 1-12 0V4z" fill="#f59e0b" fillOpacity="0.3" stroke="#d97706" />
        </svg>
      ),
    },
    xp: {
      gradient: 'from-emerald-500/20 via-teal-500/15 to-emerald-600/10',
      border: 'border-emerald-500/40 text-emerald-400',
      iconColor: '#10b981',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#10b981" stroke="#059669" />
        </svg>
      ),
    },
    coins: {
      gradient: 'from-amber-400/25 via-yellow-500/20 to-amber-500/10',
      border: 'border-amber-400/40 text-amber-300',
      iconColor: '#facc15',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" fill="#facc15" stroke="#ca8a04" />
          <circle cx="12" cy="12" r="5" stroke="#eab308" strokeDasharray="2 2" />
          <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#713f12" stroke="none">¢</text>
        </svg>
      ),
    },
    level: {
      gradient: 'from-purple-500/20 via-indigo-500/15 to-purple-600/10',
      border: 'border-purple-500/40 text-purple-400',
      iconColor: '#a855f7',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#a855f7" stroke="#7e22ce" />
        </svg>
      ),
    },
    quiz: {
      gradient: 'from-indigo-500/20 via-violet-500/15 to-indigo-600/10',
      border: 'border-indigo-500/40 text-indigo-400',
      iconColor: '#6366f1',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" fill="#6366f1" fillOpacity="0.25" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      ),
    },
    coding: {
      gradient: 'from-cyan-500/20 via-blue-500/15 to-cyan-600/10',
      border: 'border-cyan-500/40 text-cyan-400',
      iconColor: '#06b6d4',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    doubts: {
      gradient: 'from-rose-500/20 via-pink-500/15 to-rose-600/10',
      border: 'border-rose-500/40 text-rose-400',
      iconColor: '#f43f5e',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" fill="#f43f5e" fillOpacity="0.2" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    perks: {
      gradient: 'from-pink-500/20 via-rose-500/15 to-pink-600/10',
      border: 'border-pink-500/40 text-pink-400',
      iconColor: '#ec4899',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" rx="1" fill="#ec4899" fillOpacity="0.25" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      ),
    },
    battles: {
      gradient: 'from-red-600/25 via-orange-600/20 to-red-700/10',
      border: 'border-red-500/40 text-red-400',
      iconColor: '#ef4444',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="14.5" y1="17.5" x2="3" y2="6" />
          <line x1="2" y1="3" x2="6" y2="3" />
          <line x1="3" y1="2" x2="3" y2="6" />
          <line x1="9.5" y1="6.5" x2="21" y2="18" />
          <line x1="18" y1="21" x2="22" y2="21" />
          <line x1="21" y1="18" x2="21" y2="22" />
          <polyline points="14 14 18 10 14 6" />
        </svg>
      ),
    },
    leaderboard: {
      gradient: 'from-yellow-500/25 via-amber-500/20 to-yellow-600/10',
      border: 'border-yellow-500/40 text-yellow-400',
      iconColor: '#eab308',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20h20" />
          <path d="M5 20V12h4v8" fill="#eab308" fillOpacity="0.2" />
          <path d="M10 20V6h4v14" fill="#eab308" fillOpacity="0.4" />
          <path d="M15 20v-5h4v5" fill="#eab308" fillOpacity="0.2" />
        </svg>
      ),
    },
    ledger: {
      gradient: 'from-emerald-500/20 via-teal-500/15 to-emerald-600/10',
      border: 'border-emerald-500/40 text-emerald-400',
      iconColor: '#10b981',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#10b981" fillOpacity="0.25" stroke="#059669" />
          <polyline points="9 12 11 14 15 10" stroke="#ffffff" />
        </svg>
      ),
    },
    attendance: {
      gradient: 'from-sky-500/20 via-blue-500/15 to-sky-600/10',
      border: 'border-sky-500/40 text-sky-400',
      iconColor: '#0284c7',
      renderIcon: (s) => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="9 16 11 18 15 14" stroke="#0284c7" strokeWidth="2.5" />
        </svg>
      ),
    },
  };

  const conf = statConfigs[stat] || statConfigs.xp;

  return (
    <div
      className={`inline-flex items-center justify-center border bg-gradient-to-br shadow-xs shrink-0 select-none ${dims.container} ${conf.gradient} ${conf.border} ${className}`}
    >
      {conf.renderIcon(dims.icon)}
    </div>
  );
};

// ---------------------------------------------------------
// League Emblems (Bronze, Silver, Gold, Platinum, Diamond)
// ---------------------------------------------------------
interface LeagueEmblemProps {
  league: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LeagueEmblem: React.FC<LeagueEmblemProps> = ({
  league,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 72,
  };
  const dim = sizeMap[size] || sizeMap.md;

  const normalized = league.toLowerCase();

  const colors = {
    bronze: { base: '#b45309', light: '#f59e0b', dark: '#78350f', border: '#d97706' },
    silver: { base: '#94a3b8', light: '#f1f5f9', dark: '#475569', border: '#cbd5e1' },
    gold: { base: '#f59e0b', light: '#fef08a', dark: '#b45309', border: '#fbbf24' },
    platinum: { base: '#0284c7', light: '#bae6fd', dark: '#0369a1', border: '#38bdf8' },
    diamond: { base: '#8b5cf6', light: '#e0e7ff', dark: '#4c1d95', border: '#c4b5fd' },
  }[normalized] || { base: '#f59e0b', light: '#fef08a', dark: '#b45309', border: '#fbbf24' };

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        <linearGradient id={`league_${normalized}_grad`} x1="20" y1="10" x2="80" y2="90">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="50%" stopColor={colors.base} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
      </defs>

      {/* Outer Shield Emblem */}
      <path
        d="M50 8 L88 22 C88 58 72 84 50 94 C28 84 12 58 12 22 Z"
        fill={`url(#league_${normalized}_grad)`}
        stroke={colors.border}
        strokeWidth="3.5"
      />

      {/* Inner Inset */}
      <path
        d="M50 16 L80 28 C80 56 68 76 50 84 C32 76 20 56 20 28 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Specific Crest Symbol by League */}
      {normalized === 'diamond' ? (
        <g transform="translate(50, 48)">
          <polygon points="0,-18 16,0 0,18 -16,0" fill="#ffffff" stroke="#a78bfa" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#38bdf8" />
        </g>
      ) : normalized === 'platinum' ? (
        <g transform="translate(50, 48)">
          <polygon points="0,-18 14,-6 8,14 -8,14 -14,-6" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="0" cy="0" r="3.5" fill="#0284c7" />
        </g>
      ) : normalized === 'gold' ? (
        <g transform="translate(50, 48)">
          <polygon points="0,-16 5,-5 16,-5 8,3 11,14 0,7 -11,14 -8,3 -16,-5 -5,-5" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
        </g>
      ) : normalized === 'silver' ? (
        <g transform="translate(50, 48)">
          <rect x="-10" y="-10" width="20" height="20" rx="3" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#94a3b8" />
        </g>
      ) : (
        <g transform="translate(50, 48)">
          <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="#92400e" strokeWidth="2" />
          <polygon points="0,-6 6,6 -6,6" fill="#b45309" />
        </g>
      )}
    </svg>
  );
};

// ---------------------------------------------------------
// Illustrated Empty States
// ---------------------------------------------------------
interface IllustratedEmptyStateProps {
  type: 'no_data' | 'no_results' | 'no_doubts' | 'all_caught_up' | 'locked';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  isDark?: boolean;
}

export const IllustratedEmptyState: React.FC<IllustratedEmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  className = '',
  isDark = true,
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center max-w-sm mx-auto select-none ${className}`}>
      {/* SVG Graphic */}
      <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        {type === 'no_results' ? (
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="45" cy="45" r="28" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#6366f1" strokeWidth="3" />
            <line x1="66" y1="66" x2="88" y2="88" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
            <path d="M36 42 Q45 35 54 42" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="38" cy="48" r="2.5" fill="#94a3b8" />
            <circle cx="52" cy="48" r="2.5" fill="#94a3b8" />
          </svg>
        ) : type === 'all_caught_up' ? (
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="36" fill={isDark ? '#064e3b' : '#ecfdf5'} stroke="#10b981" strokeWidth="3" />
            <polyline points="32 50 44 62 68 38" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="20" width="50" height="60" rx="8" fill={isDark ? '#1e293b' : '#f8fafc'} stroke="#64748b" strokeWidth="2.5" />
            <line x1="36" y1="35" x2="64" y2="35" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="48" x2="56" y2="48" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="61" x2="48" y2="61" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="70" cy="70" r="14" fill="#6366f1" />
            <text x="70" y="75" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="14">+</text>
          </svg>
        )}
      </div>

      <h5 className="font-extrabold text-sm sm:text-base mb-1 tracking-tight">{title}</h5>
      <p className={`text-xs leading-relaxed max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
