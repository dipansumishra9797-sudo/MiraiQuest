import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeEmblem, BadgeRarity, MedalShape } from '../common/BadgeEmblem';
import { Badge } from '../../types';
import { X, Download, Share2, Award, Calendar, CheckCircle2, Lock } from 'lucide-react';

interface BadgeDetailModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent?: number;
  currentProgress?: string;
  studentName?: string;
  isDark?: boolean;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  isOpen,
  onClose,
  isUnlocked,
  unlockedAt = 'Oct 14, 2026',
  progressPercent = 0,
  currentProgress = '',
  studentName = 'Student',
  isDark = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !badge) return null;

  // Derive rarity and shape based on category or id
  const getBadgeRarity = (b: Badge): BadgeRarity => {
    if (b.id.includes('30') || b.id.includes('boss')) return 'diamond';
    if (b.id.includes('century') || b.id.includes('level_5')) return 'platinum';
    if (b.id.includes('streak_7') || b.category === 'improvement') return 'gold';
    if (b.xpReward >= 50) return 'silver';
    return 'bronze';
  };

  const getBadgeShape = (b: Badge): MedalShape => {
    if (b.id.includes('level_5')) return 'hexagon';
    if (b.id.includes('30') || b.id.includes('boss')) return 'crown';
    if (b.id.includes('century')) return 'circle';
    return 'shield';
  };

  const rarity = getBadgeRarity(badge);
  const shape = getBadgeShape(badge);

  // Download Badge Card as SVG/PNG
  const handleDownloadBadge = () => {
    const svgData = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700">
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="600" y2="700" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#020617" />
    </linearGradient>
    <linearGradient id="accentGlow" x1="0" y1="0" x2="600" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
    </linearGradient>
  </defs>
  <rect width="600" height="700" rx="32" fill="url(#cardBg)" stroke="#334155" stroke-width="2" />
  <rect width="600" height="250" rx="32" fill="url(#accentGlow)" />
  <text x="300" y="70" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="20" fill="#818cf8" letter-spacing="4">MIRAIQUEST VERIFIED ACHIEVEMENT</text>
  <text x="300" y="110" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="#94a3b8">MSOT COLLEGE OF HIGHER LEARNING</text>
  
  <circle cx="300" cy="270" r="100" fill="#1e1b4b" stroke="#4f46e5" stroke-width="4" />
  <text x="300" y="278" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="#fef08a">🏆 ${badge.title}</text>
  
  <text x="300" y="430" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ffffff">${badge.title}</text>
  <text x="300" y="470" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#94a3b8">${rarity.toUpperCase()} RARITY • +${badge.xpReward} ACADEMIC XP</text>
  
  <text x="300" y="520" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#cbd5e1">${badge.description}</text>
  
  <rect x="80" y="570" width="440" height="70" rx="16" fill="#1e293b" stroke="#334155" />
  <text x="110" y="605" font-family="sans-serif" font-size="14" fill="#94a3b8">Conferred To: <tspan fill="#ffffff" font-weight="bold">${studentName}</tspan></text>
  <text x="110" y="625" font-family="sans-serif" font-size="13" fill="#64748b">Verified Date: ${unlockedAt}</text>
</svg>
    `;

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MiraiQuest_Badge_${badge.title.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          ref={cardRef}
          className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Close badge details"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Rarity Ribbon */}
          <div className="flex items-center justify-center mb-4">
            <span
              className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-xs ${
                rarity === 'diamond'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : rarity === 'platinum'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : rarity === 'gold'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : rarity === 'silver'
                  ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
              }`}
            >
              {rarity} Tier Emblem
            </span>
          </div>

          {/* Large Hero Emblem */}
          <div className="flex justify-center my-3">
            <div className="relative">
              {/* Rotating light rays behind unlocked badge */}
              {isUnlocked && (
                <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-indigo-500/20 via-amber-500/10 to-transparent blur-2xl animate-spin-slow pointer-events-none -z-10" />
              )}
              <BadgeEmblem
                iconType={badge.title}
                rarity={rarity}
                shape={shape}
                size="hero"
                isLocked={!isUnlocked}
              />
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center mt-3">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center justify-center gap-1.5">
              <span>{badge.title}</span>
              {isUnlocked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </h3>

            <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {badge.description}
            </p>
          </div>

          {/* How It Was Earned / Condition Box */}
          <div
            className={`my-4 p-3.5 rounded-2xl border text-xs text-left ${
              isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Award className="w-3.5 h-3.5" />
                <span>Criteria to Unlock</span>
              </span>
              <span className="text-emerald-500 font-bold tabular-nums">+{badge.xpReward} XP</span>
            </div>
            <p className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {badge.conditionDescription}
            </p>

            {/* Progress Bar if Locked */}
            {!isUnlocked && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                <div className="flex justify-between text-[11px] mb-1 font-semibold">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Progress</span>
                  <span className="text-indigo-400">{currentProgress || `${progressPercent}%`}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Meta Info: Date & Verification */}
          <div className={`flex items-center justify-between text-xs py-2 px-1 border-t ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{isUnlocked ? `Unlocked: ${unlockedAt}` : 'Locked (In Progress)'}</span>
            </span>
            <span className="font-semibold text-indigo-400">MSOT Verified</span>
          </div>

          {/* Share / Download Actions */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              onClick={handleDownloadBadge}
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Badge</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${badge.title} - MiraiQuest Badge`,
                    text: `I earned the ${badge.title} badge on MiraiQuest!`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  handleDownloadBadge();
                }
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Emblem</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
