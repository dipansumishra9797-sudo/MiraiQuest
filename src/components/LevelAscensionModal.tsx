import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/appStore';
import { Sparkles, Trophy, ArrowRight, X } from 'lucide-react';
import { fireLevelAscensionConfetti } from '../utils/confetti';

export const LevelAscensionModal: React.FC = () => {
  const { rankProgressModal, closeRankProgressModal, theme } = useApp();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (rankProgressModal?.show) {
      fireLevelAscensionConfetti();
    }
  }, [rankProgressModal?.show]);

  if (!rankProgressModal || !rankProgressModal.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`relative w-full max-w-md border rounded-2xl p-5 sm:p-6 pb-6 shadow-2xl text-center overflow-hidden transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <button
          onClick={closeRankProgressModal}
          className={`absolute top-3 right-3 p-2 rounded-lg touch-target flex items-center justify-center transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1, damping: 15 }}
          className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/30 border border-amber-400/50 flex items-center justify-center mb-4 text-amber-400 shadow-lg shadow-amber-500/20"
        >
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
        </motion.div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>LEVEL ASCENSION</span>
        </div>

        <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Congratulations!
        </h3>
        <p className={`text-xs sm:text-sm mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {rankProgressModal.studentName}
          </span>{' '}
          has advanced in mastery!
        </p>

        {/* Level Progression Display */}
        <div
          className={`flex items-center justify-center gap-4 py-3 sm:py-4 px-4 sm:px-6 rounded-xl border mb-5 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-center">
            <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Previous
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-400 tabular-nums">
              Lvl {rankProgressModal.oldLevel}
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-500 shrink-0" />

          <div className="text-center">
            <div className="text-xs text-emerald-500 font-semibold mb-1">New Rank</div>
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
              Lvl {rankProgressModal.newLevel}
            </div>
          </div>
        </div>

        <div className={`text-[11px] sm:text-xs mb-5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Level formula: Higher levels require progressively more effort to reward genuine deep practice over short bursts.
        </div>

        <button
          onClick={closeRankProgressModal}
          className="w-full py-3 sm:py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer touch-target flex items-center justify-center"
        >
          Claim & Continue
        </button>
      </motion.div>
    </div>
  );
};
