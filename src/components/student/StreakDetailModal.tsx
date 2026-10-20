import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakFlame, getStreakTier, StreakTier } from '../common/StreakFlame';
import { SlotCounter } from '../common/SlotCounter';
import {
  Flame,
  Snowflake,
  Trophy,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface StreakDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  streakFreezesRemaining: number;
  isTodayDone: boolean;
  isDark?: boolean;
  onSimulateCompleteToday: () => void;
  onUseFreeze: () => void;
  onTriggerMilestone: (days: number) => void;
  onToggleAtRiskDemo: () => void;
  onToggleResetDemo: () => void;
  isSimulatedAtRisk?: boolean;
  isSimulatedReset?: boolean;
}

export const StreakDetailModal: React.FC<StreakDetailModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  streakFreezesRemaining,
  isTodayDone,
  isDark = true,
  onSimulateCompleteToday,
  onUseFreeze,
  onTriggerMilestone,
  onToggleAtRiskDemo,
  onToggleResetDemo,
  isSimulatedAtRisk = false,
  isSimulatedReset = false,
}) => {
  if (!isOpen) return null;

  const effectiveDays = isSimulatedReset ? 0 : streakDays;
  const { tier, name, color, accentColor, desc } = getStreakTier(effectiveDays);
  const isAtRisk = isSimulatedAtRisk || (!isTodayDone && effectiveDays > 0);

  // Next milestone calculation
  const milestones = [7, 14, 30, 100];
  const nextMilestone = milestones.find((m) => m > effectiveDays) || 100;
  const prevMilestone = [...milestones].reverse().find((m) => m <= effectiveDays) || 0;
  const progressToNext = Math.min(
    100,
    Math.round(((effectiveDays - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
  );

  const tierList: {
    tier: StreakTier;
    name: string;
    range: string;
    desc: string;
    minDays: number;
    color: string;
  }[] = [
    {
      tier: 'spark',
      name: 'Spark',
      range: '1 – 6 Days',
      desc: 'Small warm flame. Laying the initial foundations of a lifelong daily learning habit.',
      minDays: 1,
      color: '#fb923c',
    },
    {
      tier: 'blaze',
      name: 'Blaze',
      range: '7 – 29 Days',
      desc: 'Bigger, brighter roaring firestorm. Unlocks 7-Day Consistency (+50 XP) & 14-Day (+140 XP).',
      minDays: 7,
      color: '#f97316',
    },
    {
      tier: 'inferno',
      name: 'Inferno',
      range: '30 – 99 Days',
      desc: 'Superheated white-hot blue plasma flame with extra embers. Unlocks +300 XP bonus.',
      minDays: 30,
      color: '#06b6d4',
    },
    {
      tier: 'legend',
      name: 'Legend',
      range: '100+ Days',
      desc: 'Golden crowned eternal flame with sparkling embers. Unlocks +1,000 XP bonus & Centurion Badge.',
      minDays: 100,
      color: '#f59e0b',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 border shadow-2xl my-auto transition-colors overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Ambient header glow */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: color }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer touch-target flex items-center justify-center ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Close streak details dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Hero Flame & Current Status */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 border-b pb-5 mb-5 border-slate-200 dark:border-slate-800/80">
            <div className="relative shrink-0 flex items-center justify-center p-2 rounded-2xl bg-black/10 dark:bg-white/5 border border-slate-200/50 dark:border-slate-800">
              <StreakFlame
                streakDays={effectiveDays}
                size="xl"
                isAtRisk={isAtRisk}
                isExtinguished={isSimulatedReset}
                showTierLabel={true}
              />
            </div>

            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Learning Habit Tier</span>
              </div>

              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <h3 className="text-2xl sm:text-3xl font-black">
                  <SlotCounter value={effectiveDays} /> Day Streak
                </h3>
                <span
                  className="text-sm font-extrabold px-2 py-0.5 rounded-lg border"
                  style={{
                    color,
                    borderColor: `${color}40`,
                    backgroundColor: `${color}15`,
                  }}
                >
                  {name} Tier
                </span>
              </div>

              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isSimulatedReset
                  ? 'A fresh spark awaits your journey. No penalties, no shame — every master started at day 1.'
                  : desc}
              </p>

              {/* Status Pills */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                {isTodayDone && !isSimulatedReset ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed Today</span>
                  </span>
                ) : isAtRisk ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Streak At Risk (Needs Action Today)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ready for Today's Spark</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>{streakFreezesRemaining} Freezes Available</span>
                </span>
              </div>
            </div>
          </div>

          {/* Milestone Progress Bar */}
          {!isSimulatedReset && (
            <div className={`p-4 rounded-2xl border mb-5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="flex items-center gap-1 text-orange-400">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Next Milestone: {nextMilestone} Days</span>
                </span>
                <span className="tabular-nums opacity-80">
                  {effectiveDays} / {nextMilestone} Days ({nextMilestone - effectiveDays} to go)
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300"
                />
              </div>
            </div>
          )}

          {/* 4 Tier Progression Cards Grid */}
          <div className="mb-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <span>Flame Growth Tiers</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tierList.map((t) => {
                const isCurrent = t.tier === tier && !isSimulatedReset;
                return (
                  <div
                    key={t.tier}
                    className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                      isCurrent
                        ? isDark
                          ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                          : 'bg-orange-50/80 border-orange-300 shadow-xs'
                        : isDark
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-80'
                        : 'bg-white border-slate-200 opacity-85'
                    }`}
                  >
                    <div className="p-1 rounded-xl bg-black/10 dark:bg-white/5 shrink-0 flex items-center justify-center">
                      <StreakFlame streakDays={t.minDays} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black" style={{ color: t.color }}>
                          {t.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                          {t.range}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-tight mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {t.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulation & Test Suite */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Animation Showcase</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Test all streak features
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={onSimulateCompleteToday}
                className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:brightness-110 active:scale-97 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer"
                title="Roll slot counter, burst flame with shockwave & particles, ignite habit cell"
              >
                <Flame className="w-4 h-4" />
                <span>+1 Daily Streak</span>
              </button>

              <button
                onClick={onUseFreeze}
                disabled={streakFreezesRemaining <= 0}
                className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold hover:bg-blue-500/30 active:scale-97 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer disabled:opacity-40"
                title="Spins snowflake, spreads frost across day cell, turns flame icy blue"
              >
                <Snowflake className="w-4 h-4 text-blue-400" />
                <span>Use Freeze</span>
              </button>

              <button
                onClick={onToggleAtRiskDemo}
                className={`p-2.5 rounded-xl border text-xs font-bold active:scale-97 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  isAtRisk
                    ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title="Tests dimmer flame, gentle quivering shake, and pulsing warning ring"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{isAtRisk ? 'At Risk: Active' : 'Toggle At Risk'}</span>
              </button>

              <button
                onClick={onToggleResetDemo}
                className={`p-2.5 rounded-xl border text-xs font-bold active:scale-97 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  isSimulatedReset
                    ? 'bg-slate-700/60 border-slate-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title="View soft smoke puff animation with encouraging, non-shaming wording"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>{isSimulatedReset ? 'Show Active' : 'Test Day 0 Smoke'}</span>
              </button>
            </div>

            {/* Milestone Overlay Trigger Chips */}
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Preview Overlays:
              </span>
              {[7, 14, 30, 100].map((m) => (
                <button
                  key={m}
                  onClick={() => onTriggerMilestone(m)}
                  className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-extrabold hover:bg-orange-500/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  <span>{m}d {m === 100 ? 'Legend' : m === 30 ? 'Inferno' : 'Blaze'}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
