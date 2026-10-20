import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, Award, Sparkles, Check, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';
import { fireConfetti } from '../../utils/confetti';
import { SlotCounter } from './SlotCounter';

export type ChestRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ChestRewardItem {
  type: 'xp' | 'coins' | 'badge' | 'freeze' | 'item';
  amount?: number;
  label: string;
  badgeName?: string;
  icon?: string;
}

export interface RewardChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  rarity?: ChestRarity;
  items: ChestRewardItem[];
  onFlyComplete?: () => void;
}

export const RewardChestModal: React.FC<RewardChestModalProps> = ({
  isOpen,
  onClose,
  title = 'Quest Reward Unlocked!',
  subtitle = 'Great progress! Claim your rewards below.',
  rarity = 'gold',
  items,
  onFlyComplete,
}) => {
  // Animation step: 0 = drop-in, 1 = rattle/anticipation, 2 = lid open & light rays, 3 = items floating, 4 = flying to counters, 5 = done
  const [step, setStep] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
    }
  }, []);

  // Sequence Timer Controller
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      isCompletedRef.current = false;
      return;
    }

    if (prefersReducedMotion) {
      // Reduced motion: jump directly to opened state with reward cards
      setStep(3);
      soundManager.playChestOpenChime();
      return;
    }

    // Normal full sequence (total ~3.8 seconds)
    // Step 0: Chest Drops & lands with shake (0 to 650ms)
    setStep(0);

    // Step 1: Chest shakes & rattles (650ms to 1450ms)
    const t1 = setTimeout(() => {
      setStep(1);
      soundManager.playChestRattle();
    }, 650);

    // Step 2: Lid pops open + light burst + shockwave (1450ms to 2200ms)
    const t2 = setTimeout(() => {
      setStep(2);
      soundManager.playChestOpenChime();
      fireConfetti({
        particleCount: rarity === 'diamond' ? 85 : 55,
        spread: 80,
        origin: { y: 0.55 },
      });
    }, 1450);

    // Step 3: Items fly out & float (2200ms to 3300ms)
    const t3 = setTimeout(() => {
      setStep(3);
      soundManager.playItemPopSound();
    }, 2200);

    // Step 4: Items fly to header counters (3300ms to 4000ms)
    const t4 = setTimeout(() => {
      setStep(4);
      soundManager.playCoinSound();
      if (onFlyComplete) onFlyComplete();
    }, 3300);

    // Step 5: Finish & close
    const t5 = setTimeout(() => {
      handleComplete();
    }, 4100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, prefersReducedMotion]);

  const handleComplete = () => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    if (onFlyComplete) onFlyComplete();
    onClose();
  };

  const handleSkip = () => {
    soundManager.playCoinSound();
    handleComplete();
  };

  if (!isOpen) return null;

  // Colors & styles by rarity
  const getRarityTheme = () => {
    switch (rarity) {
      case 'diamond':
        return {
          woodBase: '#1e1b4b',
          woodTrim: '#312e81',
          metalStrap: '#38bdf8',
          metalHighlight: '#bae6fd',
          lockColor: '#e0e7ff',
          rayGradient: 'from-cyan-400 via-indigo-400 to-fuchsia-400',
          glowColor: 'rgba(56, 189, 248, 0.6)',
          accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        };
      case 'silver':
        return {
          woodBase: '#334155',
          woodTrim: '#475569',
          metalStrap: '#cbd5e1',
          metalHighlight: '#f8fafc',
          lockColor: '#e2e8f0',
          rayGradient: 'from-slate-200 via-cyan-200 to-indigo-200',
          glowColor: 'rgba(203, 213, 225, 0.5)',
          accentBadge: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
        };
      case 'bronze':
        return {
          woodBase: '#78350f',
          woodTrim: '#92400e',
          metalStrap: '#b45309',
          metalHighlight: '#fde68a',
          lockColor: '#f59e0b',
          rayGradient: 'from-amber-400 via-orange-400 to-yellow-300',
          glowColor: 'rgba(245, 158, 11, 0.5)',
          accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        };
      case 'gold':
      default:
        return {
          woodBase: '#9a3412',
          woodTrim: '#c2410c',
          metalStrap: '#f59e0b',
          metalHighlight: '#fef08a',
          lockColor: '#fbbf24',
          rayGradient: 'from-amber-300 via-yellow-400 to-orange-400',
          glowColor: 'rgba(251, 191, 36, 0.65)',
          accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        };
    }
  };

  const theme = getRarityTheme();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-hidden">
        {/* Ambient background rays when chest opens */}
        {step >= 2 && !prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: 0 }}
              animate={{ scale: [0.8, 1.4], opacity: [0.7, 0.95, 0.8], rotate: 360 }}
              transition={{
                rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
                scale: { duration: 0.8, ease: 'easeOut' },
                opacity: { duration: 0.6 },
              }}
              className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, rgba(251, 191, 36, 0.15) 35%, transparent 70%)`,
              }}
            />
            {/* Pulsing Shockwave Ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 1, borderWidth: 6 }}
              animate={{ scale: 2.8, opacity: 0, borderWidth: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute w-64 h-64 rounded-full border-amber-400 pointer-events-none"
            />
          </div>
        )}

        {/* Top Control Bar: Title & Skip Button */}
        <div className="absolute top-4 inset-x-4 max-w-xl mx-auto flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${theme.accentBadge}`}
            >
              {rarity} Chest
            </span>
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
              MiraiQuest MSOT
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-white/15 backdrop-blur-sm"
          >
            <span>Skip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Stage: Chest Container & Floating Rewards */}
        <div className="relative flex flex-col items-center justify-center max-w-md w-full text-center">
          {/* Header Title Text */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 z-10"
          >
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">{subtitle}</p>
          </motion.div>

          {/* Floating Reward Items (Pop out of chest at Step >= 3) */}
          <div className="relative w-full h-24 mb-3 flex items-center justify-center">
            {step >= 3 && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 z-20">
                {items.map((item, idx) => {
                  const isXp = item.type === 'xp';
                  const isCoin = item.type === 'coins';

                  return (
                    <motion.div
                      key={idx}
                      initial={{
                        scale: 0.2,
                        y: 40,
                        opacity: 0,
                      }}
                      animate={
                        step === 4
                          ? {
                              // Fly towards top-right header counters
                              x: isXp ? 140 : 80,
                              y: -240,
                              scale: 0.3,
                              opacity: 0,
                            }
                          : {
                              scale: 1,
                              y: [0, -6, 0],
                              opacity: 1,
                            }
                      }
                      transition={
                        step === 4
                          ? { duration: 0.65, ease: 'easeInOut' }
                          : {
                              y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 },
                              scale: { type: 'spring', damping: 12, stiffness: 200, delay: idx * 0.15 },
                              opacity: { duration: 0.25 },
                            }
                      }
                      className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/90 border border-amber-400/50 shadow-xl backdrop-blur-md min-w-[96px] sm:min-w-[110px]"
                    >
                      {/* Item Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 shadow-md ${
                          isXp
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCoin
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {isXp ? (
                          <Zap className="w-5 h-5 fill-current animate-pulse" />
                        ) : isCoin ? (
                          <Coins className="w-5 h-5 fill-current" />
                        ) : (
                          <Award className="w-5 h-5 fill-current" />
                        )}
                      </div>

                      {/* Number with rolling count */}
                      <div className="text-base sm:text-lg font-black text-white tabular-nums flex items-center">
                        {item.amount !== undefined ? (
                          <>
                            <span className="text-amber-400 mr-0.5">+</span>
                            <SlotCounter value={item.amount} durationMs={800} />
                          </>
                        ) : (
                          <span>{item.label}</span>
                        )}
                      </div>

                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {item.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Treasure Chest Inline SVG Rig */}
          <div className="relative w-52 h-44 sm:w-64 sm:h-52 flex items-center justify-center">
            {/* Dust puff upon landing */}
            {step === 0 && (
              <motion.div
                initial={{ scale: 0.4, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute bottom-2 w-32 h-6 rounded-full bg-amber-400/30 blur-md pointer-events-none"
              />
            )}

            {/* Shaking & Bouncing Chest Container */}
            <motion.div
              initial={prefersReducedMotion ? { y: 0 } : { y: -260, scale: 0.8 }}
              animate={
                prefersReducedMotion
                  ? { y: 0, scale: 1 }
                  : step === 0
                  ? {
                      y: [ -260, 0, -20, 0 ],
                      scale: [ 0.8, 1.05, 0.95, 1 ],
                    }
                  : step === 1
                  ? {
                      // Rattle anticipation shake
                      rotate: [ 0, -3, 3, -4, 4, -2, 2, 0 ],
                      scale: [ 1, 1.04, 1.02, 1.06, 1 ],
                    }
                  : {
                      y: 0,
                      scale: 1,
                    }
              }
              transition={
                step === 0
                  ? { duration: 0.6, times: [0, 0.6, 0.85, 1], ease: 'easeOut' }
                  : step === 1
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
              className="relative w-44 h-40 sm:w-56 sm:h-48 flex items-center justify-center"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 160 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
              >
                <defs>
                  <filter id="chestGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="chestWoodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.woodTrim} />
                    <stop offset="100%" stopColor={theme.woodBase} />
                  </linearGradient>
                  <linearGradient id="chestGoldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={theme.metalHighlight} />
                    <stop offset="50%" stopColor={theme.metalStrap} />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                </defs>

                {/* Chest Base Body */}
                <rect
                  x="20"
                  y="62"
                  width="120"
                  height="66"
                  rx="8"
                  fill="url(#chestWoodGrad)"
                  stroke="#431407"
                  strokeWidth="2.5"
                />

                {/* Horizontal Wood Planks Texture */}
                <line x1="20" y1="84" x2="140" y2="84" stroke="#451a03" strokeWidth="1.8" strokeOpacity="0.6" />
                <line x1="20" y1="106" x2="140" y2="106" stroke="#451a03" strokeWidth="1.8" strokeOpacity="0.6" />

                {/* Corner Reinforcement Brackets & Straps */}
                <rect x="20" y="62" width="12" height="66" rx="3" fill="url(#chestGoldGrad)" />
                <rect x="128" y="62" width="12" height="66" rx="3" fill="url(#chestGoldGrad)" />
                <rect x="48" y="62" width="10" height="66" fill="url(#chestGoldGrad)" />
                <rect x="102" y="62" width="10" height="66" fill="url(#chestGoldGrad)" />

                {/* Rivets on Straps */}
                {[70, 95, 120].map((y) => (
                  <React.Fragment key={y}>
                    <circle cx="26" cy={y} r="2.2" fill="#fef08a" />
                    <circle cx="53" cy={y} r="2.2" fill="#fef08a" />
                    <circle cx="107" cy={y} r="2.2" fill="#fef08a" />
                    <circle cx="134" cy={y} r="2.2" fill="#fef08a" />
                  </React.Fragment>
                ))}

                {/* Inside Velvet Lining (Visible when lid opens) */}
                {step >= 2 && (
                  <g>
                    <rect x="24" y="64" width="112" height="28" rx="4" fill="#7f1d1d" />
                    {/* Glowing golden treasure pile in chest */}
                    <path
                      d="M32 78 Q 80 64 128 78 Q 80 92 32 78 Z"
                      fill="#fbbf24"
                      filter="url(#chestGlow)"
                    />
                    <ellipse cx="80" cy="76" rx="42" ry="10" fill="#fef08a" opacity="0.9" />
                  </g>
                )}

                {/* Animated Chest Lid */}
                <motion.g
                  initial={{ rotate: 0, y: 0 }}
                  animate={
                    step >= 2
                      ? {
                          rotate: -45,
                          y: -32,
                          originX: '20px',
                          originY: '60px',
                        }
                      : step === 1
                      ? {
                          // Lid rattle vibration
                          y: [0, -2, 0, -3, 0],
                        }
                      : { rotate: 0, y: 0 }
                  }
                  transition={
                    step >= 2
                      ? { type: 'spring', damping: 10, stiffness: 180 }
                      : { duration: 0.15, repeat: Infinity }
                  }
                >
                  {/* Domed Lid Body */}
                  <path
                    d="M18 60 C18 36 36 20 80 20 C124 20 142 36 142 60 Z"
                    fill="url(#chestWoodGrad)"
                    stroke="#431407"
                    strokeWidth="2.5"
                  />
                  {/* Metal Bands across Domed Lid */}
                  <path d="M18 60 C18 42 22 28 26 22 L36 22 C32 28 28 42 28 60 Z" fill="url(#chestGoldGrad)" />
                  <path d="M142 60 C142 42 138 28 134 22 L124 22 C128 28 132 42 132 60 Z" fill="url(#chestGoldGrad)" />
                  <path d="M48 60 C49 38 52 26 55 20 H65 C62 26 59 38 58 60 Z" fill="url(#chestGoldGrad)" />
                  <path d="M112 60 C111 38 108 26 105 20 H95 C98 26 101 38 102 60 Z" fill="url(#chestGoldGrad)" />

                  {/* Rim strip */}
                  <rect x="16" y="57" width="128" height="7" rx="3.5" fill="url(#chestGoldGrad)" stroke="#431407" strokeWidth="1" />

                  {/* Golden Padlock Hasps (Attaches to lid) */}
                  <rect x="74" y="52" width="12" height="15" rx="3" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
                </motion.g>

                {/* Padlock Body (Drops or pops open at Step >= 2) */}
                <motion.g
                  animate={
                    step >= 2
                      ? { y: 45, opacity: 0, rotate: 25 }
                      : step === 1
                      ? { rotate: [-5, 5, -5] }
                      : { y: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.35 }}
                >
                  {/* Golden Lock Body */}
                  <rect
                    x="71"
                    y="63"
                    width="18"
                    height="18"
                    rx="4"
                    fill="url(#chestGoldGrad)"
                    stroke="#78350f"
                    strokeWidth="1.5"
                    filter="url(#chestGlow)"
                  />
                  {/* Lock Keyhole */}
                  <circle cx="80" cy="70" r="2.2" fill="#451a03" />
                  <polygon points="78.5,70 81.5,70 81,76 79,76" fill="#451a03" />
                </motion.g>
              </svg>
            </motion.div>
          </div>

          {/* Confirm Action Button */}
          <div className="mt-4 z-20">
            <button
              type="button"
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Collect & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
