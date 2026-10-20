import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakFlame, getStreakTier } from '../common/StreakFlame';
import { fireConfetti } from '../../utils/confetti';
import { Trophy, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { ClosedChestIcon } from '../common/ChestIcons';

interface StreakMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneDays: number;
  bonusXp: number;
  isDark?: boolean;
}

export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  isOpen,
  onClose,
  milestoneDays,
  bonusXp,
  isDark = true,
}) => {
  const { tier, name } = getStreakTier(milestoneDays);
  const { triggerChestReward } = useApp();
  const [isXpFlying, setIsXpFlying] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsXpFlying(false);
      setHasClaimed(false);
      // Multi-wave confetti burst
      fireConfetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      const timer1 = setTimeout(() => {
        fireConfetti({ particleCount: 90, spread: 90, origin: { y: 0.55 } });
      }, 500);
      const timer2 = setTimeout(() => {
        fireConfetti({ particleCount: 60, spread: 110, origin: { y: 0.7 } });
      }, 1100);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const milestoneTitles: Record<number, string> = {
    7: '7-Day Blaze Unlocked!',
    14: '14-Day Consistency Master!',
    30: '30-Day Blue Inferno Legendary Status!',
    100: '100-Day Crowned Centurion Legend!',
  };

  const title = milestoneTitles[milestoneDays] || `${milestoneDays}-Day Habit Milestone!`;

  const handleClaim = () => {
    if (hasClaimed) return;
    setHasClaimed(true);
    onClose();

    // Trigger full-screen chest reward animation
    triggerChestReward({
      id: `streak_milestone_${milestoneDays}_${Date.now()}`,
      title,
      subtitle: `${milestoneDays}-Day Habit Milestone Conquered!`,
      rarity: milestoneDays >= 100 ? 'diamond' : milestoneDays >= 30 ? 'gold' : 'silver',
      items: [
        { type: 'xp', amount: bonusXp, label: 'Streak Bonus XP' },
        { type: 'coins', amount: Math.min(100, milestoneDays * 5), label: 'Habit Coins' },
      ],
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
        {/* Full-Screen Ambient Radiant Beams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-b from-orange-500/25 via-amber-500/10 to-transparent blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-amber-600/15 blur-3xl" />
        </div>

        {/* Flying XP Particles (Launch towards top-right XP counter when claimed) */}
        {isXpFlying && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 16 }).map((_, i) => {
              const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 120;
              const startY = window.innerHeight / 2 + 80 + (Math.random() - 0.5) * 60;
              const targetX = window.innerWidth - 80;
              const targetY = 30;

              return (
                <motion.div
                  key={i}
                  initial={{
                    x: startX,
                    y: startY,
                    scale: 0.5,
                    opacity: 1,
                  }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: [0.5, 1.4, 0.2],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                    delay: i * 0.035,
                  }}
                  className="fixed top-0 left-0 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-orange-300 to-yellow-100 flex items-center justify-center shadow-lg shadow-amber-500/60"
                >
                  <Sparkles className="w-3 h-3 text-amber-900" />
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center border shadow-2xl overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-orange-500/40 text-white'
              : 'bg-gradient-to-b from-orange-50/95 via-white to-white border-orange-300 text-slate-900'
          }`}
        >
          {/* Top Milestone Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/15 border border-orange-500/30 text-orange-400 mb-4 shadow-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>Habit Milestone Achieved</span>
          </div>

          {/* Hero Tier Flame with Dynamic Burst */}
          <div className="my-2 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.15, duration: 0.65, ease: 'easeOut' }}
              className="relative"
            >
              <StreakFlame
                streakDays={milestoneDays}
                size="hero"
                showTierLabel={true}
                isBursting={true}
              />
            </motion.div>
          </div>

          {/* Milestone Heading */}
          <h3 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
            {title}
          </h3>

          <p className={`text-xs sm:text-sm mt-2 leading-relaxed max-w-md mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            You've maintained an unbroken learning streak for{' '}
            <span className="font-black text-orange-400">{milestoneDays} days</span>. Your dedication
            has elevated your flame to the <span className="font-extrabold underline decoration-orange-400">{name}</span> tier!
          </p>

          {/* Bonus XP Reward Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className={`my-6 p-4 rounded-2xl border flex items-center justify-between transition-all ${
              isDark
                ? 'bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
                <Zap className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider opacity-80">
                  Consistency Milestone Reward
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  +{bonusXp} Academic XP
                </div>
              </div>
            </div>

            <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready</span>
            </span>
          </motion.div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={hasClaimed}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/35 hover:shadow-orange-500/60 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {hasClaimed ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Claimed!</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ClosedChestIcon size={20} rarity={milestoneDays >= 100 ? 'diamond' : milestoneDays >= 30 ? 'gold' : 'silver'} glow={true} />
                <span>Claim Milestone Chest (+{bonusXp} XP)</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
