import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../store/appStore';
import { calculateLevelFromXp, getXpRequiredForLevel } from '../../modules/xpEngine';
import { DailyQuizModal } from './DailyQuizModal';
import { XpLedgerView } from './XpLedgerView';
import { BadgesQuestsView } from './BadgesQuestsView';
import { CodingPracticeView } from './CodingPracticeView';
import { StudentAssignmentsView } from './StudentAssignmentsView';
import { PeerHelpBoard } from './PeerHelpBoard';
import { RewardsStoreView } from './RewardsStoreView';
import { BossBattleModal } from './BossBattleModal';
import {
  Flame,
  Snowflake,
  Trophy,
  Coins,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Code,
  Users,
  ShoppingBag,
  FileText,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { activeStudent, triggerXpEvent, useStreakFreeze, theme } = useApp();
  const isDark = theme === 'dark';

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'assignments' | 'ledger' | 'badges' | 'coding' | 'peer_help' | 'store'>('overview');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showBossModal, setShowBossModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Framer Motion streak animation triggers
  const [streakAnimKey, setStreakAnimKey] = useState<number>(0);
  const [showStreakBonusPop, setShowStreakBonusPop] = useState(false);
  const prevStreakRef = useRef(activeStudent.streakDays);

  useEffect(() => {
    if (activeStudent.streakDays !== prevStreakRef.current) {
      prevStreakRef.current = activeStudent.streakDays;
      setStreakAnimKey((k) => k + 1);
      setShowStreakBonusPop(true);
      const timer = setTimeout(() => setShowStreakBonusPop(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [activeStudent.streakDays]);

  const triggerStreakAnimation = () => {
    setStreakAnimKey((k) => k + 1);
    setShowStreakBonusPop(true);
    setTimeout(() => setShowStreakBonusPop(false), 2400);
  };

  const { level, currentLevelXp, nextLevelXp, progressPercent } = calculateLevelFromXp(
    activeStudent.totalXp
  );

  const nextLevelTotalXp = getXpRequiredForLevel(level + 1);

  // Quick Action: Simulate On-Time Homework Submission (+20 XP)
  const handleQuickSubmitHomework = () => {
    const res = triggerXpEvent({
      eventId: `ev_hw_${Date.now()}`,
      studentId: activeStudent.id,
      actionKey: 'submit_assignment',
      timestamp: new Date().toISOString(),
      metadata: {
        onTime: true,
        assignmentTitle: 'Algorithmic Recurrence Relations (Lab 4)',
        verificationSource: 'MSOT LMS Timestamp Validation',
      },
    });

    if (res.success) {
      triggerStreakAnimation();
      setFeedbackToast(`Assignment verified & submitted on-time! +${res.pointsAwarded} XP awarded.`);
    } else {
      setFeedbackToast(`Action failed: ${res.rejectedReason}`);
    }
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Quick Action: Simulate Official Class Attendance (+10 XP)
  const handleQuickAttendClass = () => {
    const res = triggerXpEvent({
      eventId: `ev_att_${Date.now()}`,
      studentId: activeStudent.id,
      actionKey: 'attend_class',
      timestamp: new Date().toISOString(),
      metadata: {
        isOfficialVerification: true,
        subjectCode: 'CS-201 Lecture',
        verificationSource: 'Biometric Faculty Ledger Feed',
      },
    });

    if (res.success) {
      triggerStreakAnimation();
      setFeedbackToast(`Official lecture attendance recorded! +${res.pointsAwarded} XP awarded.`);
    } else {
      setFeedbackToast(`Action failed: ${res.rejectedReason}`);
    }
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleUseFreeze = () => {
    const success = useStreakFreeze(activeStudent.id);
    if (success) {
      setFeedbackToast(`Streak freeze applied! 1 freeze consumed to protect streak history.`);
    } else {
      setFeedbackToast(`No streak freezes remaining this month.`);
    }
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Generate 14-day calendar history
  const today = new Date();
  const calendarDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (13 - i));
    const str = d.toISOString().split('T')[0];
    const isCompleted = activeStudent.streakCalendar.includes(str);
    return {
      dateStr: str,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isCompleted,
    };
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Hero Profile & Progression Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity & Campus */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-inner">
                {activeStudent.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-[10px] font-bold text-slate-950 tabular-nums">
                Lvl {level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeStudent.name}</h2>
                {activeStudent.isAnonymous && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Incognito: {activeStudent.anonymousNickname}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{activeStudent.campus} Campus</span>
                <span>·</span>
                <span>Section {activeStudent.section}</span>
                <span>·</span>
                <span className="font-mono">{activeStudent.rollNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Streak with Freezes - Framer Motion Animated */}
            <motion.div
              key={`streak-card-${streakAnimKey}`}
              animate={
                streakAnimKey > 0
                  ? {
                      scale: [1, 1.03, 1],
                      boxShadow: [
                        '0 0 0px rgba(249, 115, 22, 0)',
                        '0 0 20px rgba(249, 115, 22, 0.35)',
                        '0 0 0px rgba(249, 115, 22, 0)',
                      ],
                    }
                  : { scale: 1 }
              }
              transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
              className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-sm"
            >
              {/* Floating Badge Pop on Streak Update */}
              <AnimatePresence>
                {showStreakBonusPop && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -2, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
                    className="absolute top-1 right-2 px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/50 text-orange-300 text-[9px] font-bold z-10 flex items-center gap-0.5 shadow-sm"
                  >
                    <span>🔥 Streak Active!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                  {/* Animated Flame Icon with Error-free Tween Keyframes */}
                  <motion.div
                    key={`flame-icon-${streakAnimKey}`}
                    animate={
                      streakAnimKey > 0
                        ? {
                            scale: [1, 1.35, 1],
                            rotate: [0, -12, 12, 0],
                          }
                        : {
                            scale: 1,
                            rotate: 0,
                          }
                    }
                    transition={{
                      type: 'tween',
                      duration: 0.5,
                      ease: 'easeInOut',
                    }}
                    className="inline-block origin-bottom"
                  >
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-400" />
                  </motion.div>
                  <span>Streak</span>
                </div>

                <span className="text-[10px] text-blue-300 flex items-center gap-0.5 font-medium">
                  <Snowflake className="w-3 h-3 text-blue-400" /> {activeStudent.streakFreezesRemaining}
                </span>
              </div>

              {/* Animated Streak Counter */}
              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`counter-${activeStudent.streakDays}-${streakAnimKey}`}
                    initial={{ y: 12, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -12, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                    className="text-xl font-extrabold text-white tabular-nums flex items-baseline gap-1"
                  >
                    <span className="text-orange-400">{activeStudent.streakDays}</span>
                    <span className="text-xs font-semibold text-slate-400">Days</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* League Rank */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Trophy className="w-3.5 h-3.5" /> League
                </span>
              </div>
              <div className="text-xl font-extrabold text-white tabular-nums flex items-baseline gap-1.5">
                <span>{activeStudent.league}</span>
                <span className="text-xs font-medium text-slate-400">#{activeStudent.leagueRank}</span>
              </div>
            </div>

            {/* Total Academic XP */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-xs text-slate-400 mb-1 font-semibold text-emerald-400">
                Total XP
              </div>
              <div className="text-xl font-extrabold text-emerald-400 tabular-nums">
                {activeStudent.totalXp} XP
              </div>
            </div>

            {/* Separate Coins Balance */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-xs text-slate-400 mb-1 font-semibold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Perks Coins
              </div>
              <div className="text-xl font-extrabold text-amber-400 tabular-nums">
                {activeStudent.coinsBalance}
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Level {level} Scholar</span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-slate-400">
                Curve: XP(L) = 100·(L-1)^1.45 + 50·(L-1)
              </span>
            </div>

            <div className="text-slate-300 font-medium tabular-nums">
              {currentLevelXp} / {nextLevelXp} XP to Level {level + 1} ({progressPercent}%)
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs font-medium">
        {[
          { id: 'overview', label: "Today's Focus", icon: Zap },
          { id: 'assignments', label: 'Coursework & Labs', icon: FileText },
          { id: 'ledger', label: 'Verifiable Ledger', icon: ShieldCheck },
          { id: 'badges', label: 'Badges & Quests', icon: Sparkles },
          { id: 'coding', label: 'Coding Practice', icon: Code },
          { id: 'peer_help', label: 'Peer Doubts', icon: Users },
          { id: 'store', label: 'Perks Store', icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Contents */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Hub (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Streak Calendar */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span>Learning Habit Tracker (Last 14 Days)</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Zero penalty for absences · Auto-freeze protects streaks ({activeStudent.streakFreezesRemaining} remaining)
                  </div>
                </div>

                {activeStudent.streakFreezesRemaining > 0 && (
                  <button
                    onClick={handleUseFreeze}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    <Snowflake className="w-3 h-3" />
                    <span>Protect with Freeze</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                {calendarDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-center border transition-all hover:scale-105 ${
                      day.isCompleted
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 font-bold'
                        : 'bg-slate-950 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500">{day.dayName}</div>
                    <div className="text-xs font-semibold tabular-nums mt-0.5">{day.dayNum}</div>
                    <div className="mt-1 text-center">
                      {day.isCompleted ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ type: 'tween', duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.1 }}
                          className="inline-block"
                        >
                          <Flame className="w-3.5 h-3.5 text-orange-400 mx-auto fill-current" />
                        </motion.div>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 inline-block" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Micro Challenge Trigger */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    Daily Challenge
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                    Syllabus Micro-Quiz
                  </h4>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    3-5 questions strictly from topics taught this week. Earn 15 base + 5/correct XP.
                  </p>
                </div>

                <button
                  onClick={() => setShowQuizModal(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Today's Quiz</span>
                </button>
              </div>

              {/* Pre-Exam Boss Gauntlet */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Pre-Exam Gauntlet
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                    Mid-Term Boss Gauntlet
                  </h4>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Synthesize 5 algorithmic stages for +100 XP & trophy badge before mid-terms.
                  </p>
                </div>

                <button
                  onClick={() => setShowBossModal(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Challenge Boss (+100 XP)</span>
                </button>
              </div>
            </div>

            {/* Simulated Verified Learning Actions */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Verified Academic Feeds
                </h4>
                <span className="text-[11px] text-slate-400">Official MSOT integrations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleQuickAttendClass}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      Class Attendance
                    </div>
                    <div className="text-[10px] text-slate-400">Biometric Register</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums shrink-0 ml-1.5">+10 XP</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('assignments')}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                      <span>Coursework & Labs</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">View Teacher Assignments</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums shrink-0 ml-1.5">+25 XP</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('coding')}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      <span>Code Compiler</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">LC / HR / Codeforces</div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 tabular-nums shrink-0 ml-1.5">+40 XP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Quests & Fairness Highlights (1 col) */}
          <div className="space-y-6">
            {/* Fairness Showcase Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Inclusive Learning Proof</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Active student <strong className="text-white">{activeStudent.name}</strong> holds <strong className="text-amber-400">Rank #1 in Bronze League</strong> with a +155% improvement over last week.
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Similar-level leagues prevent fatigue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Weekly resets give equal footing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Anonymous mode protects privacy</span>
                </div>
              </div>
            </div>

            {/* Mini Badges Preview */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Earned Badges ({activeStudent.unlockedBadgeIds.length})
                </h4>
                <button
                  onClick={() => setActiveSubTab('badges')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {activeStudent.unlockedBadgeIds.map((bid) => (
                  <div
                    key={bid}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-200 capitalize">
                      {bid.replace('badge_', '').replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">UNLOCKED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'assignments' && (
        <StudentAssignmentsView onOpenCompilerWithProblem={() => setActiveSubTab('coding')} />
      )}
      {activeSubTab === 'ledger' && <XpLedgerView />}
      {activeSubTab === 'badges' && <BadgesQuestsView />}
      {activeSubTab === 'coding' && <CodingPracticeView />}
      {activeSubTab === 'peer_help' && <PeerHelpBoard />}
      {activeSubTab === 'store' && <RewardsStoreView />}

      {/* Daily Quiz Modal */}
      <DailyQuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} />

      {/* Boss Battle Modal */}
      <BossBattleModal isOpen={showBossModal} onClose={() => setShowBossModal(false)} />
    </div>
  );
};
