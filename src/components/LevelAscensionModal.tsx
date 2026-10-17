import React from 'react';
import { useApp } from '../store/appStore';
import { Sparkles, Trophy, ArrowRight, X } from 'lucide-react';

export const LevelAscensionModal: React.FC = () => {
  const { rankProgressModal, closeRankProgressModal, theme } = useApp();
  const isDark = theme === 'dark';

  if (!rankProgressModal || !rankProgressModal.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md border rounded-2xl p-6 shadow-2xl text-center overflow-hidden transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={closeRankProgressModal}
          className={`absolute top-4 right-4 transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mb-4 text-indigo-500">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>LEVEL ASCENSION</span>
        </div>

        <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Congratulations!
        </h3>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {rankProgressModal.studentName}
          </span>{' '}
          has advanced in mastery!
        </p>

        {/* Level Progression Display */}
        <div
          className={`flex items-center justify-center gap-4 py-4 px-6 rounded-xl border mb-6 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-center">
            <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Previous
            </div>
            <div className="text-2xl font-extrabold text-slate-400 tabular-nums">
              Lvl {rankProgressModal.oldLevel}
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-500 shrink-0" />

          <div className="text-center">
            <div className="text-xs text-emerald-500 font-semibold mb-1">New Rank</div>
            <div className="text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
              Lvl {rankProgressModal.newLevel}
            </div>
          </div>
        </div>

        <div className={`text-xs mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Level formula: Higher levels require progressively more effort to reward genuine deep practice over short bursts.
        </div>

        <button
          onClick={closeRankProgressModal}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          Claim & Continue
        </button>
      </div>
    </div>
  );
};
