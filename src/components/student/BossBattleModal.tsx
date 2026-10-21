import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/appStore';
import { Crown, Sparkles, CheckCircle2, ChevronRight, X, Clock } from 'lucide-react';
import { ClosedChestIcon } from '../common/ChestIcons';

interface BossBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BossBattleModal: React.FC<BossBattleModalProps> = ({ isOpen, onClose }) => {
  const { activeStudent, triggerXpEvent, triggerConfetti, isDark, setIsFocusCriticalActive, triggerChestReward } = useApp();

  useEffect(() => {
    if (isOpen) {
      setIsFocusCriticalActive(true);
      return () => setIsFocusCriticalActive(false);
    }
  }, [isOpen, setIsFocusCriticalActive]);

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState<string | null>(null);

  // Anti-Cheat: Tab switch & blur auto-submission
  useEffect(() => {
    if (!isOpen || isCompleted || isAutoSubmitted) return;

    let hasFired = false;

    const handleViolation = async (reason: string) => {
      if (hasFired) return;
      hasFired = true;
      setIsAutoSubmitted(true);
      setAutoSubmitReason(reason);
      setIsAnswered(true);

      try {
        await fetch('/api/quiz/auto-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: activeStudent.id,
            studentName: activeStudent.name,
            campus: activeStudent.campus,
            section: activeStudent.section,
            quizId: 'boss_battle_midterm',
            quizTitle: 'Mid-Term Boss Gauntlet',
            score: currentStage,
            totalQuestions: 5,
            reason: reason,
            switchCount: 1,
          }),
        });

        await fetch('/api/anticheat/log-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: activeStudent.id,
            studentName: activeStudent.name,
            campus: activeStudent.campus,
            section: activeStudent.section,
            eventType: 'tab_switch_during_boss_battle',
            quizId: 'boss_battle_midterm',
            quizTitle: 'Mid-Term Boss Gauntlet',
            details: `Anti-cheat trigger: Student switched tabs during boss battle gauntlet. Auto-submitted at Stage ${currentStage + 1}.`,
            severity: 'high',
          }),
        });
      } catch (err) {
        console.error('Failed to report anti-cheat event:', err);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab_switch');
      }
    };

    const onWindowBlur = () => {
      handleViolation('window_unfocused');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [isOpen, isCompleted, isAutoSubmitted, currentStage, activeStudent]);

  if (!isOpen) return null;

  const bossStages = [
    {
      title: 'Stage 1: Asymptotic Invariant Check',
      prompt: 'Which master theorem case applies to T(n) = 3T(n/4) + n log n?',
      options: ['Case 1: n^(log_4(3)) dominates', 'Case 3: f(n) = n log n dominates asymptotically (Theta(n log n))', 'Case 2: Exact logarithmic resonance', 'Master theorem fails to apply'],
      correctIndex: 1,
      explanation: 'log_4(3) approx 0.792, while n log n grows strictly faster by a polynomial factor n^(1 - 0.792) = n^(0.208). Hence Case 3 applies.',
    },
    {
      title: 'Stage 2: Monotonic Stack Boundary',
      prompt: 'In Largest Rectangle in Histogram, when do you pop an element from the stack?',
      options: ['When current bar height is strictly greater than stack top', 'When current bar height is strictly less than stack top', 'When stack size exceeds 10 elements', 'On every alternating step'],
      correctIndex: 1,
      explanation: 'A shorter bar limits the right boundary of the rectangle that the taller bar could extend to, requiring stack resolution.',
    },
    {
      title: 'Stage 3: Graph Shortest Path Failure Modes',
      prompt: 'Under what specific condition does standard Dijkstra algorithm with priority queue fail?',
      options: ['Disconnected graphs', 'Directed acyclic graphs', 'Graphs with any negative edge weights', 'Graphs with odd cycle counts'],
      correctIndex: 2,
      explanation: 'Dijkstra greedy invariant assumes visited vertices have finalized minimal distances, which is invalidated if negative edges decrease costs later.',
    },
    {
      title: 'Stage 4: Python Dunder Resolution',
      prompt: 'When evaluating "x in obj", what is the primary dunder method Python seeks before falling back to __iter__?',
      options: ['__contains__', '__has__', '__in__', '__lookup__'],
      correctIndex: 0,
      explanation: 'Python first invokes obj.__contains__(x). If undefined, it falls back to iterative sequence searching via __iter__ and __getitem__.',
    },
    {
      title: 'Stage 5: Final Boss Algorithmic Synthesis',
      prompt: 'In dynamic programming, what two structural properties are strictly necessary for optimal substructure to guarantee polynomial optimality?',
      options: ['Linear memory and recursion', 'Overlapping subproblems and optimal substructure', 'Sorting and binary partition', 'Greedy choice and tree structures'],
      correctIndex: 1,
      explanation: 'Optimal substructure ensures optimal subproblem solutions compose into optimal global solutions, while overlapping subproblems make memoization advantageous.',
    },
  ];

  const current = bossStages[currentStage];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentStage + 1 < bossStages.length) {
      setCurrentStage((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      triggerXpEvent({
        eventId: `ev_boss_${Date.now()}`,
        studentId: activeStudent.id,
        actionKey: 'boss_battle',
        timestamp: new Date().toISOString(),
        metadata: {
          battleTitle: 'Pre-Exam Algorithmic Boss Gauntlet',
        },
      });
      triggerConfetti();
      setIsCompleted(true);
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-700 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const subBoxBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div className={`relative w-full sm:max-w-xl h-[100dvh] sm:h-auto sm:max-h-[90vh] border-0 sm:border rounded-none sm:rounded-2xl p-4 sm:p-6 shadow-2xl overflow-y-auto flex flex-col justify-between transition-colors pb-safe ${cardBg}`}>
        {/* Dynamic Security Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.05] flex flex-wrap items-center justify-around gap-12 p-4 rotate-[-15deg] z-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="text-xs font-mono font-bold tracking-widest uppercase">
              {activeStudent.name} · {activeStudent.rollNumber} · {activeStudent.campus}
            </span>
          ))}
        </div>

        <div className={`relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b mb-4 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <div>
              <div className="font-bold text-sm">MID-TERM BOSS GAUNTLET</div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Timed Revision Challenge · 100 XP Prize</div>
            </div>
          </div>

          <button onClick={onClose} className={`p-2 rounded-lg touch-target cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAutoSubmitted ? (
          <div className="relative z-10 text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-rose-500 mb-2">Boss Gauntlet Auto-Submitted</h4>
            <p className={`text-xs max-w-md mx-auto mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Anti-cheat detected a tab-switch or window defocus event ({autoSubmitReason || 'unfocused'}).
              The gauntlet was automatically locked and submitted. Your faculty supervisor has been logged with the timestamp and telemetry snapshot.
            </p>
            <div className={`p-3.5 rounded-xl border text-xs max-w-sm mx-auto mb-6 text-left ${subBoxBg}`}>
              <div className="font-semibold text-rose-500 mb-1">Incident Record Logged:</div>
              <div className="text-[11px] text-slate-400 font-mono">
                Candidate: {activeStudent.name} ({activeStudent.rollNumber})<br />
                Campus: {activeStudent.campus} · Section {activeStudent.section}<br />
                Stage Reached: {currentStage + 1} / {bossStages.length}<br />
                Status: Flagged for Faculty Review
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        ) : !isCompleted ? (
          <div className="relative z-10">
            <div className={`flex items-center justify-between text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="text-amber-500 font-semibold">{current.title}</span>
              <span className="tabular-nums">Stage {currentStage + 1} of {bossStages.length}</span>
            </div>

            <h4 className="text-base font-semibold mb-4 leading-snug">
              {current.prompt}
            </h4>

            <div className="space-y-2.5 mb-6">
              {current.options.map((opt, idx) => {
                let style = isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100';

                if (isAnswered) {
                  if (idx === current.correctIndex) {
                    style = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-semibold';
                  } else if (idx === selectedOpt) {
                    style = 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-300';
                  } else {
                    style = isDark
                      ? 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all min-h-[48px] touch-target cursor-pointer active:scale-99 ${style}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === current.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className={`p-3 rounded-xl border text-xs mb-4 leading-relaxed ${subBoxBg}`}>
                <span className="font-semibold">Explanation: </span>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{current.explanation}</span>
              </div>
            )}

            {isAnswered && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <span>{currentStage + 1 < bossStages.length ? 'Next Stage' : 'Finish Gauntlet'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold mb-1">Gauntlet Conquered!</h4>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              You synthesized and verified all core algorithmic invariants before exams!
            </p>

            <div className={`p-4 rounded-xl border text-center max-w-xs mx-auto mb-6 ${subBoxBg}`}>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Reward</div>
              <div className="text-3xl font-extrabold text-emerald-500 tabular-nums">+100 XP</div>
              <div className="text-[11px] text-amber-500 font-semibold mt-1">
                Unlocked "Gauntlet Conqueror" Badge
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  triggerChestReward({
                    id: `boss_gauntlet_${Date.now()}`,
                    title: 'Gauntlet Conquered!',
                    subtitle: 'Mid-Term Boss Defeated · Algorithmic Invariants Cleared',
                    rarity: 'diamond',
                    items: [
                      { type: 'xp', amount: 100, label: 'Boss XP' },
                      { type: 'coins', amount: 50, label: 'Boss Coins' },
                      { type: 'badge', label: 'Gauntlet Conqueror' },
                    ],
                  });
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer"
              >
                <ClosedChestIcon size={18} rarity="diamond" glow={true} />
                <span>Claim Diamond Chest (+100 XP)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
