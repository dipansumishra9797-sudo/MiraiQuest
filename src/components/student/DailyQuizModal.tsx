import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/appStore';
import { Question } from '../../types';
import { getStudyBuddyHint, getHinglishExplanation } from '../../modules/geminiService';
import { checkRapidFireQuiz } from '../../modules/antiGaming';
import { Clock, HelpCircle, CheckCircle, XCircle, Sparkles, Languages, ChevronRight, X, AlertTriangle } from 'lucide-react';

interface DailyQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({ isOpen, onClose }) => {
  const { questions, syllabusList, claimDailyQuizReward } = useApp();

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
          // Time expired for this question
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

    const isCorrect = index === currentQ.correctOptionIndex;
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
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
      // Quiz Finished! Check anti-gaming and claim XP
      const rapidCheck = checkRapidFireQuiz(timePerQuestion);
      if (rapidCheck.isSuspicious) {
        setRapidFireWarning(rapidCheck.reason || 'Flagged for rapid automated answering.');
      }

      const finalScore = selectedOption === currentQ?.correctOptionIndex ? score : score;
      const res = claimDailyQuizReward(finalScore, activeQuestions.length, timePerQuestion, selectedSubject);
      setRewardResult(res);
      setIsCompleted(true);
    }
  };

  const handleAskStudyBuddy = async () => {
    if (!currentQ || selectedOption === null || loadingHint) return;
    setLoadingHint(true);
    const userPicked = selectedOption === -1 ? 'Time Expired' : currentQ.options[selectedOption];
    const correct = currentQ.options[currentQ.correctOptionIndex];
    const hint = await getStudyBuddyHint(currentQ.questionText, userPicked, correct, selectedSubject, currentQ.topic);
    setStudyBuddyHint(hint);
    setLoadingHint(false);
  };

  const handleToggleHinglish = async () => {
    if (!currentQ) return;
    if (!hinglishText && !loadingHinglish) {
      setLoadingHinglish(true);
      const res = await getHinglishExplanation(currentQ.explanation, currentQ.questionText, currentQ.topic);
      setHinglishText(res);
      setLoadingHinglish(false);
    }
    setShowHinglish(!showHinglish);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Daily Micro-Challenge</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Current Syllabus Topics Only</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              15 Base XP + 5 XP per correct answer · 1 official attempt per calendar day
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isCompleted ? (
            activeQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
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
                        selectedSubject === 'dsa' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      DSA (CS-201)
                    </button>
                    <button
                      onClick={() => setSelectedSubject('python')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        selectedSubject === 'python' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Python (PY-102)
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 tabular-nums">
                      Question {currentIndex + 1} of {activeQuestions.length}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-semibold tabular-nums text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeRemaining}s</span>
                    </div>
                  </div>
                </div>

                {/* Question Topic & Difficulty */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="text-indigo-400 font-medium">{currentQ.topic}</span>
                  <span>·</span>
                  <span className="capitalize">{currentQ.difficulty}</span>
                </div>

                {/* Question Text */}
                <h4 className="text-base sm:text-lg font-semibold text-white mb-6 leading-snug">
                  {currentQ.questionText}
                </h4>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {currentQ.options.map((opt, idx) => {
                    let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40';

                    if (isAnswered) {
                      if (idx === currentQ.correctOptionIndex) {
                        btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-medium';
                      } else if (idx === selectedOption) {
                        btnStyle = 'bg-rose-500/10 border-rose-500 text-rose-300';
                      } else {
                        btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-center justify-between ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isAnswered && idx === currentQ.correctOptionIndex && (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isAnswered && idx === selectedOption && idx !== currentQ.correctOptionIndex && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Rapid fire anti-gaming alert */}
                {rapidFireWarning && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{rapidFireWarning}</span>
                  </div>
                )}

                {/* Post-Answer Feedback & AI Tools */}
                {isAnswered && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <span>Explanation</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Hinglish toggle */}
                        <button
                          onClick={handleToggleHinglish}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                        >
                          <Languages className="w-3.5 h-3.5 text-amber-400" />
                          <span>{showHinglish ? 'Show English' : 'Hinglish Explanations'}</span>
                        </button>

                        {/* AI Study Buddy for incorrect answers */}
                        {selectedOption !== currentQ.correctOptionIndex && (
                          <button
                            onClick={handleAskStudyBuddy}
                            disabled={loadingHint || Boolean(studyBuddyHint)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800 rounded-lg transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{loadingHint ? 'Consulting TA...' : studyBuddyHint ? 'TA Hint Loaded' : 'Ask AI Study Buddy'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {showHinglish && hinglishText ? hinglishText : currentQ.explanation}
                    </p>

                    {/* AI Study Buddy Hint Banner */}
                    {studyBuddyHint && (
                      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 leading-relaxed">
                        <span className="font-semibold text-white">AI Study Buddy (Pedagogical Insight): </span>
                        {studyBuddyHint}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold text-white mb-1">Micro-Challenge Completed!</h4>
              <p className="text-slate-400 text-xs mb-6">
                You completed today's official syllabus challenge.
              </p>

              {/* Scorecard */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Score Accuracy</div>
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {score} / {activeQuestions.length}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">XP Earned</div>
                  <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                    {rewardResult?.success ? `+${rewardResult.xpEarned} XP` : '0 XP'}
                  </div>
                </div>
              </div>

              {rewardResult?.reason && !rewardResult.success && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs max-w-md mx-auto mb-6">
                  {rewardResult.reason}
                </div>
              )}

              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Rule: Daily quizzes are capped at 1 official XP-earning attempt per day to prevent binge cramming and promote daily habit consistency.
              </p>

              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isCompleted && isAnswered && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              <span>{currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Complete Quiz & Award XP'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
