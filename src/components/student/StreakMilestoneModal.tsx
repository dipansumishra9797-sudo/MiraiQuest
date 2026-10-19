import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakFlame, getStreakTier } from '../common/StreakFlame';
import { fireConfetti } from '../../utils/confetti';
import { Sparkles, Trophy, Flame, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) {
      fireConfetti();
      const timer = setTimeout(() => {
        fireConfetti();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const milestoneTitles: Record<number, string> = {
    7: '7-Day Blaze Unlocked!',
    14: '2-Week Master of Consistency!',
    30: '30-Day Blue Inferno Legendary Status!',
    100: '100-Day Crowned Centurion Legend!',
  };

  const title = milestoneTitles[milestoneDays] || `${milestoneDays}-Day Habit Milestone!`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border shadow-2xl overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-orange-500/40 text-white'
              : 'bg-gradient-to-b from-orange-50/90 via-white to-white border-orange-300 text-slate-900'
          }`}
        >
          {/* Background radiant rays effect */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

          {/* Top Milestone Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/15 border border-orange-500/30 text-orange-400 mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>Habit Milestone Achieved</span>
          </div>

          {/* Hero Tier Flame */}
          <div className="my-3 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
              className="relative"
            >
              <StreakFlame streakDays={milestoneDays} size="hero" showTierLabel={true} isBursting={true} />
            </motion.div>
          </div>

          {/* Heading */}
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            {title}
          </h3>

          <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            You've maintained an unbroken learning streak for{' '}
            <span className="font-bold text-orange-400">{milestoneDays} days</span>. Your commitment
            has elevated your flame to the <span className="font-bold underline decoration-orange-400">{name}</span> tier!
          </p>

          {/* Flying Bonus XP Counter Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className={`my-6 p-4 rounded-2xl border flex items-center justify-between ${
              isDark
                ? 'bg-slate-900/80 border-amber-500/30 text-amber-300'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider opacity-80">Milestone Reward</div>
                <div className="text-xl font-black text-amber-400">+{bonusXp} Academic XP</div>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
              Awarded!
            </span>
          </motion.div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Claim & Keep Flaming</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
