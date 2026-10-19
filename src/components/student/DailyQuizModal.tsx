import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../store/appStore';
import { Question } from '../../types';
import { getStudyBuddyHint, getHinglishExplanation } from '../../modules/geminiService';
import { checkRapidFireQuiz } from '../../modules/antiGaming';
import { Clock, HelpCircle, CheckCircle, XCircle, Sparkles, Languages, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { CountUp } from '../common/CountUp';
import { fireConfetti } from '../../utils/confetti';

interface DailyQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({ isOpen, onClose }) => {
  const { questions, syllabusList, claimDailyQuizReward, isDark } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<'dsa' | 'python'>('dsa');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewardResult, setRewardResult] = useState<{ success: boolean; xpEarned: number; reason?: string } | null>(null);

  // AI & Hinglish states
  const [studyBuddyHint, setStudyBuddyHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hinglishText, setHinglishText] = useState<string | null>(null);
  const [loadingHinglish, setLoadingHinglish] = useState(false);
  const [showHinglish, setShowHinglish] = useState(false);
  const [rapidFireWarning, setRapidFireWarning] = useState<string | null>(null);

  // Initialize questions from taught weeks of selected subject
  useEffect(() => {
    if (!isOpen) return;

    const syllabus = syllabusList.find((s) => s.id === selectedSubject);
    const taughtWeekNumbers = syllabus ? syllabus.weeks.filter((w) => w.isTaught).map((w) => w.weekNumber) : [1, 2, 3, 4];

    // Filter approved questions for taught topics
    const eligible = questions.filter(
      (q) => q.subjectId === selectedSubject && q.status === 'approved' && taughtWeekNumbers.includes(q.weekNumber)
    );

    // Pick 3-5 randomized questions
    const shuffled = [...eligible].sort(() => 0.5 - Math.random()).slice(0, 4);
    setActiveQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeRemaining(30);
    setTimePerQuestion([]);
    setStartTime(Date.now());
    setIsCompleted(false);
    setRewardResult(null);
    setStudyBuddyHint(null);
    setHinglishText(null);
    setShowHinglish(false);
    setRapidFireWarning(null);
  }, [isOpen, selectedSubject, questions, syllabusList]);

  // Question Timer
  useEffect(() => {
    if (!isOpen || isAnswered || isCompleted || activeQuestions.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSelectOption(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAnswered, isCompleted, currentIndex, activeQuestions]);

  if (!isOpen) return null;

  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQ) return;

    const elapsed = Math.max(1, (Date.now() - startTime) / 1000);
    const newTimes = [...timePerQuestion, elapsed];
    setTimePerQuestion(newTimes);

    // Rapid-fire anti-gaming check
    if (elapsed < 2.0 && index !== -1) {
      setRapidFireWarning(`Anti-Gaming Notice: Answering in under 2 seconds (${elapsed.toFixed(1)}s) triggers automated rate-limits.`);
    }

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctOptionIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeRemaining(30);
      setStartTime(Date.now());
      setStudyBuddyHint(null);
      setHinglishText(null);
      setShowHinglish(false);
      setRapidFireWarning(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsCompleted(true);
    const res = claimDailyQuizReward(score, activeQuestions.length, timePerQuestion, selectedSubject);
    setRewardResult(res);
    if (score >= Math.ceil(activeQuestions.length / 2)) {
      fireConfetti();
    }
  };

  const handleFetchHint = async () => {
    if (!currentQ || studyBuddyHint || loadingHint) return;
    setLoadingHint(true);
    const selOpt = selectedOption !== null && selectedOption >= 0 ? currentQ.options[selectedOption] : currentQ.options[0];
    const correctOpt = currentQ.options[currentQ.correctOptionIndex];
    const subjectName = selectedSubject === 'dsa' ? 'Data Structures & Algorithms' : 'Python Programming';
    const hint = await getStudyBuddyHint(currentQ.questionText, selOpt, correctOpt, subjectName, currentQ.topic);
    setStudyBuddyHint(hint);
    setLoadingHint(false);
  };

  const handleToggleHinglish = async () => {
    if (!currentQ) return;
    if (!hinglishText && !loadingHinglish) {
      setLoadingHinglish(true);
      const text = await getHinglishExplanation(currentQ.explanation, currentQ.questionText, currentQ.topic);
      setHinglishText(text);
      setLoadingHinglish(false);
    }
    setShowHinglish(!showHinglish);
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const headerBg = isDark
    ? 'border-slate-800 bg-slate-950/50'
    : 'border-slate-200 bg-slate-50';
  const subBoxBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full sm:max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] border-0 sm:border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors pb-safe ${cardBg}`}>
        {/* Header */}
        <div className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between shrink-0 ${headerBg}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Daily Micro-Challenge</span>
              <span className="opacity-40">·</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Syllabus Topics Only</span>
            </div>
            <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              15 Base XP + 5 XP per correct answer · 1 official attempt per calendar day
            </div>
          </div>

          <button onClick={onClose} className={`p-2 rounded-lg touch-target cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isCompleted ? (
            activeQuestions.length === 0 ? (
              <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No approved questions available for current syllabus topics. Please check back after faculty approval.
              </div>
            ) : (
              <div>
                {/* Subject Selector & Progress Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSubject('dsa')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        selectedSubject === 'dsa'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      DSA (CS-201)
                    </button>
                    <button
                      onClick={() => setSelectedSubject('python')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        selectedSubject === 'python'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Python (PY-102)
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Question {currentIndex + 1} of {activeQuestions.length}
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold tabular-nums transition-colors ${
                      timeRemaining <= 5
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 animate-pulse'
                        : `text-amber-500 ${subBoxBg}`
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeRemaining}s</span>
                    </div>
                  </div>
                </div>

                {/* Animated Timer Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                      timeRemaining <= 5
                        ? 'bg-rose-500 animate-pulse'
                        : timeRemaining <= 10
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${(timeRemaining / 30) * 100}%` }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {/* Question Topic & Difficulty */}
                    <div className={`flex items-center gap-2 text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="text-indigo-500 font-medium">{currentQ.topic}</span>
                      <span>·</span>
                      <span className="capitalize">{currentQ.difficulty}</span>
                    </div>

                    {/* Question Text */}
                    <h4 className="text-base sm:text-lg font-semibold mb-6 leading-snug">
                      {currentQ.questionText}
                    </h4>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                      {currentQ.options.map((opt, idx) => {
                        let btnStyle = isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100';

                        if (isAnswered) {
                          if (idx === currentQ.correctOptionIndex) {
                            btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-medium shadow-md shadow-emerald-500/20 scale-[1.01] transition-transform';
                          } else if (idx === selectedOption) {
                            btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-300 animate-shake';
                          } else {
                            btnStyle = isDark
                              ? 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                              : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(idx)}
                            className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all text-xs sm:text-sm flex items-center justify-between min-h-[48px] touch-target cursor-pointer pressable-btn ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${
                                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isAnswered && idx === currentQ.correctOptionIndex && (
                              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-2 animate-bounce" />
                            )}
                            {isAnswered && idx === selectedOption && idx !== currentQ.correctOptionIndex && (
                              <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {rapidFireWarning && (
                      <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{rapidFireWarning}</span>
                      </div>
                    )}

                    {/* Explanation & AI Tools */}
                    {isAnswered && (
                      <div className="space-y-3 mb-6 animate-in fade-in duration-200">
                        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${subBoxBg}`}>
                          <div className="font-bold mb-1">
                            Explanation:
                          </div>
                          <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{currentQ.explanation}</p>
                        </div>

                        {showHinglish && hinglishText && (
                          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                            <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-500">
                              <Languages className="w-3.5 h-3.5" />
                              <span>Hinglish Explanation (AI Study Buddy):</span>
                            </div>
                            <p>{hinglishText}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Bar: AI Assistance & Next Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleFetchHint}
                          disabled={loadingHint || Boolean(studyBuddyHint)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer pressable-btn ${
                            isDark
                              ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{loadingHint ? 'Thinking...' : studyBuddyHint ? 'Hint Received' : 'Study Buddy Hint'}</span>
                        </button>

                        <button
                          onClick={handleToggleHinglish}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer pressable-btn ${
                            isDark
                              ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Languages className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{loadingHinglish ? 'Translating...' : showHinglish ? 'Hide Hinglish' : 'Explain in Hinglish'}</span>
                        </button>
                      </div>

                      {isAnswered && (
                        <button
                          onClick={handleNextQuestion}
                          className="flex items-center justify-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer pressable-btn"
                        >
                          <span>{currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Complete Challenge'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {studyBuddyHint && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-300">
                        <strong>Study Buddy Hint: </strong>
                        {studyBuddyHint}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )
          ) : (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold">Challenge Completed!</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                You scored <strong className={`tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}><CountUp value={score} /></strong> out of {activeQuestions.length} on today's syllabus topics.
              </p>

              {rewardResult && (
                <div className={`p-4 rounded-xl border max-w-sm mx-auto space-y-1 ${subBoxBg}`}>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>XP Awarded to Verifiable Ledger</div>
                  <div className="text-3xl font-extrabold text-emerald-500 tabular-nums">
                    +<CountUp value={rewardResult.xpEarned} suffix=" XP" />
                  </div>
                  {rewardResult.reason && (
                    <div className="text-[11px] text-amber-500 font-medium pt-1">
                      {rewardResult.reason}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer pressable-btn"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
