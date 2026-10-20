import React from 'react';

interface ChestIconProps {
  className?: string;
  size?: number;
  rarity?: 'bronze' | 'silver' | 'gold' | 'diamond';
  glow?: boolean;
}

/**
 * Closed Chest Icon for claimable quests and reward alerts.
 * Features detailed wood planks, metal corner brackets, golden padlock, and subtle ambient glow.
 */
export const ClosedChestIcon: React.FC<ChestIconProps> = ({
  className = '',
  size = 24,
  rarity = 'gold',
  glow = true,
}) => {
  const getColors = () => {
    switch (rarity) {
      case 'diamond':
        return {
          wood: '#1e1b4b',
          woodDark: '#0f172a',
          metal: '#38bdf8',
          metalDark: '#0284c7',
          lock: '#a855f7',
          glow: 'rgba(56, 189, 248, 0.45)',
        };
      case 'silver':
        return {
          wood: '#334155',
          woodDark: '#1e293b',
          metal: '#cbd5e1',
          metalDark: '#94a3b8',
          lock: '#f8fafc',
          glow: 'rgba(203, 213, 225, 0.4)',
        };
      case 'bronze':
        return {
          wood: '#78350f',
          woodDark: '#451a03',
          metal: '#b45309',
          metalDark: '#78350f',
          lock: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.35)',
        };
      case 'gold':
      default:
        return {
          wood: '#9a3412',
          woodDark: '#7c2d12',
          metal: '#fbbf24',
          metalDark: '#d97706',
          lock: '#fef08a',
          glow: 'rgba(251, 191, 36, 0.5)',
        };
    }
  };

  const colors = getColors();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${glow ? 'animate-pulse' : ''} ${className}`}
      style={{
        filter: glow ? `drop-shadow(0 0 6px ${colors.glow})` : undefined,
      }}
    >
      {/* Chest Body Base */}
      <rect x="6" y="20" width="36" height="22" rx="4" fill={colors.wood} />
      <rect x="6" y="32" width="36" height="10" rx="2" fill={colors.woodDark} />

      {/* Wood plank horizontal lines */}
      <line x1="6" y1="26" x2="42" y2="26" stroke="#431407" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="6" y1="34" x2="42" y2="34" stroke="#431407" strokeWidth="1" strokeOpacity="0.5" />

      {/* Metal Straps / Bands on Body */}
      <rect x="12" y="20" width="4" height="22" fill={colors.metal} />
      <rect x="32" y="20" width="4" height="22" fill={colors.metal} />
      <circle cx="14" cy="24" r="0.9" fill={colors.metalDark} />
      <circle cx="14" cy="38" r="0.9" fill={colors.metalDark} />
      <circle cx="34" cy="24" r="0.9" fill={colors.metalDark} />
      <circle cx="34" cy="38" r="0.9" fill={colors.metalDark} />

      {/* Domed Chest Lid */}
      <path
        d="M6 20C6 13.5 10 9 24 9C38 9 42 13.5 42 20H6Z"
        fill={colors.wood}
      />
      {/* Lid Highlight Rim */}
      <path
        d="M8 18C9.5 14 14 11 24 11C34 11 38.5 14 40 18"
        stroke={colors.woodDark}
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Metal Straps on Lid */}
      <path d="M12 20C12 14.5 13.5 11 14 10H16C15.5 11 16 14.5 16 20H12Z" fill={colors.metal} />
      <path d="M32 20C32 14.5 32.5 11 32 10H34C34.5 11 36 14.5 36 20H32Z" fill={colors.metal} />

      {/* Metal Seam Rim where Lid meets Body */}
      <rect x="5" y="19" width="38" height="3" rx="1.5" fill={colors.metalDark} />

      {/* Golden Clasp & Padlock */}
      <rect x="20" y="18" width="8" height="9" rx="2" fill={colors.metal} />
      {/* Padlock Shackle */}
      <path
        d="M22 18V15C22 13.9 22.9 13 24 13C25.1 13 26 13.9 26 15V18"
        stroke={colors.lock}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Padlock Body */}
      <rect x="21.5" y="18" width="5" height="6" rx="1" fill={colors.lock} />
      {/* Keyhole */}
      <circle cx="24" cy="20.5" r="0.75" fill="#451a03" />
      <path d="M24 21.2V22.5" stroke="#451a03" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Open Empty Chest Icon for claimed milestones and quests.
 */
export const OpenChestIcon: React.FC<ChestIconProps> = ({
  className = '',
  size = 24,
  rarity = 'gold',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 opacity-75 ${className}`}
    >
      {/* Tilted Open Lid (Behind body) */}
      <path
        d="M7 16C8 9 14 5 24 5C34 5 40 9 41 16L39 18C37 13 32 9 24 9C16 9 11 13 9 18L7 16Z"
        fill="#78350f"
      />
      <rect x="13" y="6" width="3" height="11" fill="#d97706" />
      <rect x="32" y="6" width="3" height="11" fill="#d97706" />

      {/* Chest Interior Glow / Lining */}
      <rect x="7" y="19" width="34" height="12" rx="2" fill="#451a03" />
      <path d="M10 20L24 25L38 20V26L24 30L10 26V20Z" fill="#78350f" opacity="0.6" />

      {/* Chest Front Body */}
      <rect x="6" y="23" width="36" height="19" rx="3" fill="#9a3412" />
      <rect x="6" y="34" width="36" height="8" rx="2" fill="#7c2d12" />

      {/* Metal Bands */}
      <rect x="12" y="23" width="4" height="19" fill="#d97706" />
      <rect x="32" y="23" width="4" height="19" fill="#d97706" />

      {/* Empty Latch */}
      <rect x="21" y="22" width="6" height="5" rx="1.5" fill="#f59e0b" />
      <circle cx="24" cy="24.5" r="0.75" fill="#451a03" />

      {/* Subtle Checkmark Badge over open chest */}
      <circle cx="37" cy="37" r="7" fill="#10b981" />
      <path
        d="M34 37L36 39L40 35"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
