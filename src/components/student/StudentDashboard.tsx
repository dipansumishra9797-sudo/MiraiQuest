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
  User,
  Shield,
  Eye,
  EyeOff,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    activeStudent,
    triggerXpEvent,
    useStreakFreeze,
    theme,
    isDark,
    navSection,
    setNavSection,
    toggleAnonymousMode,
    toggleOptOutOfLeaderboards,
    openProfileModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'assignments' | 'ledger' | 'badges' | 'coding' | 'peer_help' | 'store' | 'profile'
  >('overview');

  // Synchronize with drawer navigation
  useEffect(() => {
    if (navSection.startsWith('dashboard:')) {
      const sub = navSection.replace('dashboard:', '');
      if (['overview', 'assignments', 'ledger', 'badges', 'coding', 'peer_help', 'store', 'profile'].includes(sub)) {
        setActiveSubTab(sub as any);
      }
    }
  }, [navSection]);

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
    const isToday = i === 13;
    const isCompleted = activeStudent.streakCalendar.includes(str);
    return {
      dateStr: str,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isCompleted,
      isToday,
    };
  });

  const handleSubTabClick = (tabId: typeof activeSubTab) => {
    setActiveSubTab(tabId);
    setNavSection(`dashboard:${tabId}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isDark
              ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
              : 'bg-white border-emerald-500/60 text-emerald-800 shadow-xl'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Hero Profile & Progression Card */}
      <div
        className={`p-6 rounded-2xl border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Student Details */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openProfileModal(activeStudent.id, 'student', 'profile')}
              title="Click to view & edit profile"
              className="relative shrink-0 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                {activeStudent.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-[10px] font-extrabold text-white shadow-xs">
                Lvl {level}
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => openProfileModal(activeStudent.id, 'student', 'profile')}
                  className="text-xl font-bold tracking-tight text-left hover:text-indigo-500 transition-colors cursor-pointer group flex items-center gap-1.5"
                  title="Click to open student profile"
                >
                  <span>{activeStudent.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 opacity-60 group-hover:opacity-100 transition-all" />
                </button>
                {activeStudent.isAnonymous && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    @{activeStudent.anonymousNickname} (Anon Mode)
                  </span>
                )}
              </div>

              <div className={`text-xs mt-1 flex items-center gap-2 flex-wrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="flex items-center gap-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  {activeStudent.campus} Campus
                </span>
                <span>·</span>
                <span>Section {activeStudent.section}</span>
                <span>·</span>
                <span>Roll: {activeStudent.rollNumber}</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Stat Tiles (Streak, League, Total XP, Perks Coins) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Streak Tile */}
            <motion.div
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
              className={`relative p-3.5 rounded-xl border flex flex-col justify-between overflow-hidden transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <AnimatePresence>
                {showStreakBonusPop && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -2, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
                    className="absolute top-1 right-2 px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/50 text-orange-600 dark:text-orange-300 text-[9px] font-bold z-10 flex items-center gap-0.5 shadow-xs"
                  >
                    <span>🔥 Streak Active!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-orange-500 font-semibold">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span>Streak</span>
                </div>

                <span className="text-[10px] text-blue-600 dark:text-blue-300 flex items-center gap-0.5 font-medium">
                  <Snowflake className="w-3 h-3 text-blue-500" /> {activeStudent.streakFreezesRemaining} Freezes
                </span>
              </div>

              <div className="overflow-hidden">
                <div className="text-xl font-extrabold tabular-nums flex items-baseline gap-1">
                  <span className="text-orange-500">{activeStudent.streakDays}</span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Days</span>
                </div>
              </div>
            </motion.div>

            {/* 2. League Rank */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Trophy className="w-3.5 h-3.5" /> League
                </span>
              </div>
              <div className="text-xl font-extrabold tabular-nums flex items-baseline gap-1.5">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{activeStudent.league}</span>
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  #{activeStudent.leagueRank}
                </span>
              </div>
            </div>

            {/* 3. Total Academic XP */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="text-xs mb-1 font-semibold text-emerald-600 dark:text-emerald-400">
                Total Academic XP
              </div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeStudent.totalXp} XP
              </div>
            </div>

            {/* 4. Separate Coins Balance */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="text-xs mb-1 font-semibold text-amber-500 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Perks Coins
              </div>
              <div className="text-xl font-extrabold text-amber-500 tabular-nums">
                {activeStudent.coinsBalance}
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className={`mt-5 pt-5 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Level {level} Scholar
              </span>
              <span className="text-slate-400">·</span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Curve: XP(L) = 100·(L-1)^1.45 + 50·(L-1)
              </span>
            </div>

            <div className={`font-semibold tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {currentLevelXp} / {nextLevelXp} XP to Level {level + 1} ({progressPercent}%)
            </div>
          </div>

          <div
            className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs (Wrapped gracefully so nothing is ever horizontally cut off) */}
      <div
        className={`flex flex-wrap items-center gap-2 pb-2 border-b text-xs font-semibold ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        {[
          { id: 'overview', label: "Today's Focus", icon: Zap },
          { id: 'assignments', label: 'Coursework & Labs', icon: FileText },
          { id: 'ledger', label: 'Verifiable Ledger', icon: ShieldCheck },
          { id: 'badges', label: 'Badges & Quests', icon: Sparkles },
          { id: 'coding', label: 'Coding Practice (16 Topics)', icon: Code },
          { id: 'peer_help', label: 'Peer Doubts', icon: Users },
          { id: 'store', label: 'Perks Store', icon: ShoppingBag },
          { id: 'profile', label: 'Profile & Settings', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabClick(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30'
                  : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
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
            {/* Daily Streak Calendar (14-day Habit Tracker) */}
            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-orange-500">
                    <Calendar className="w-4 h-4" />
                    <span>Learning Habit Tracker (Last 14 Days)</span>
                  </h4>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Zero penalty for absences · Auto-freeze protects streaks ({activeStudent.streakFreezesRemaining} remaining)
                  </div>
                </div>

                {activeStudent.streakFreezesRemaining > 0 && (
                  <button
                    onClick={handleUseFreeze}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-colors shrink-0 cursor-pointer"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>Protect with Freeze</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                {calendarDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      day.isCompleted
                        ? isDark
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 font-bold'
                          : 'bg-orange-50 border-orange-300 text-orange-800 font-bold shadow-2xs'
                        : isDark
                        ? 'bg-slate-950 border-slate-800/80 text-slate-500'
                        : 'bg-slate-100/80 border-slate-200 text-slate-500'
                    } ${day.isToday ? 'ring-2 ring-indigo-500/60' : ''}`}
                  >
                    <div className="text-[10px] opacity-75">{day.dayName}</div>
                    <div className="text-xs font-bold tabular-nums mt-0.5">{day.dayNum}</div>
                    <div className="mt-1 text-center">
                      {day.isCompleted ? (
                        <Flame className="w-3.5 h-3.5 text-orange-500 mx-auto fill-current" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Micro Challenge Trigger */}
              <div
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
                  isDark
                    ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30 text-slate-100'
                    : 'bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-indigo-200 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
                    Daily Challenge
                  </div>
                  <h4 className="text-base font-bold mb-1">Syllabus Micro-Quiz</h4>
                  <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    3-5 questions strictly from topics taught this week. Earn 15 base + 5/correct XP.
                  </p>
                </div>

                <button
                  onClick={() => setShowQuizModal(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Today's Quiz</span>
                </button>
              </div>

              {/* Pre-Exam Boss Gauntlet */}
              <div
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
                  isDark
                    ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30 text-slate-100'
                    : 'bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-amber-200 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                    Pre-Exam Gauntlet
                  </div>
                  <h4 className="text-base font-bold mb-1">Mid-Term Boss Gauntlet</h4>
                  <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Synthesize 5 algorithmic stages for +100 XP & trophy badge before mid-terms.
                  </p>
                </div>

                <button
                  onClick={() => setShowBossModal(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Challenge Boss (+100 XP)</span>
                </button>
              </div>
            </div>

            {/* Verified Academic Feeds */}
            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Verified Academic Feeds
                </h4>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Official MSOT integrations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleQuickAttendClass}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold group-hover:text-emerald-500 transition-colors">
                      Class Attendance
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Biometric Register</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 tabular-nums shrink-0 ml-1.5">+10 XP</span>
                </button>

                <button
                  onClick={() => handleSubTabClick('assignments')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                      <span>Coursework & Labs</span>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Teacher Assignments</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 tabular-nums shrink-0 ml-1.5">+25 XP</span>
                </button>

                <button
                  onClick={() => handleSubTabClick('coding')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold group-hover:text-indigo-500 transition-colors flex items-center gap-1">
                      <span>Code Practice Arena</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>16 Topics · Inbuilt Tests</div>
                  </div>
                  <span className="text-xs font-bold text-indigo-500 tabular-nums shrink-0 ml-1.5">+40 XP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Quests & Fairness Highlights (1 col) */}
          <div className="space-y-6">
            {/* Inclusive Learning Proof Card */}
            <div
              className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Inclusive Learning Proof</span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Active student <strong className={isDark ? 'text-white' : 'text-slate-900'}>{activeStudent.name}</strong> holds{' '}
                <strong className="text-amber-500">Rank #{activeStudent.leagueRank} in {activeStudent.league} League</strong> with weekly learning points.
              </p>
              <div className={`pt-2 border-t space-y-1.5 text-[11px] ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Similar-level leagues prevent burn-out</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Weekly resets give equal footing to all</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Personal best improvement badges</span>
                </div>
              </div>
            </div>

            {/* Mini Badges Preview */}
            <div
              className={`p-5 rounded-2xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Earned Badges ({activeStudent.unlockedBadgeIds.length})
                </h4>
                <button
                  onClick={() => handleSubTabClick('badges')}
                  className="text-xs text-indigo-500 hover:underline font-semibold cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {activeStudent.unlockedBadgeIds.slice(0, 4).map((bid) => (
                  <div
                    key={bid}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-semibold capitalize">
                      {bid.replace('badge_', '').replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold">UNLOCKED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Coursework & Labs */}
      {activeSubTab === 'assignments' && (
        <StudentAssignmentsView onOpenCompilerWithProblem={() => handleSubTabClick('coding')} />
      )}

      {/* Subtab: Ledger */}
      {activeSubTab === 'ledger' && <XpLedgerView />}

      {/* Subtab: Badges & Quests */}
      {activeSubTab === 'badges' && <BadgesQuestsView />}

      {/* Subtab: Coding Practice (16 Topics with Auto-Update) */}
      {activeSubTab === 'coding' && <CodingPracticeView />}

      {/* Subtab: Peer Help */}
      {activeSubTab === 'peer_help' && <PeerHelpBoard />}

      {/* Subtab: Perks Store */}
      {activeSubTab === 'store' && <RewardsStoreView />}

      {/* Subtab: Profile & Privacy Settings */}
      {activeSubTab === 'profile' && (
        <div
          className={`p-6 rounded-2xl border space-y-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold">Student Profile & Settings</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Edit your personal details, verified social handles, privacy toggles, and discover your verified batchmates.
              </p>
            </div>

            <button
              onClick={() => openProfileModal(activeStudent.id, 'student', 'profile')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
            >
              <User className="w-4 h-4" />
              <span>Open Complete Profile & Batchmates</span>
            </button>
          </div>

          {/* Quick tab jump buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'profile', label: 'Personal Details', desc: 'Name, Bio, Skills & Tags' },
              { id: 'batchmates', label: 'Batchmates', desc: 'Same Campus & Section Only' },
              { id: 'social', label: 'Social Handles', desc: 'GitHub, LinkedIn, LeetCode' },
              { id: 'privacy', label: 'Privacy Controls', desc: 'Anon & Leaderboard Toggles' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => openProfileModal(activeStudent.id, 'student', t.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-2xs'
                }`}
              >
                <div className="font-bold text-xs text-indigo-500">{t.label}</div>
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anonymous Mode Card */}
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-xs">
                  {activeStudent.isAnonymous ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                  <span>Anonymous Alias Mode</span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Shows your nickname (<span className="font-mono text-indigo-500">@{activeStudent.anonymousNickname}</span>) on leaderboards instead of your real name.
                </p>
              </div>

              <button
                onClick={() => toggleAnonymousMode(activeStudent.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeStudent.isAnonymous
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {activeStudent.isAnonymous ? 'Enabled' : 'Enable'}
              </button>
            </div>

            {/* Leaderboard Opt-out */}
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>Leaderboard Opt-Out</span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Hide your position from public leagues while still earning verified academic XP.
                </p>
              </div>

              <button
                onClick={() => toggleOptOutOfLeaderboards(activeStudent.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeStudent.optOutOfLeaderboards
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {activeStudent.optOutOfLeaderboards ? 'Opted Out' : 'Active In Ranks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Quiz Modal */}
      <DailyQuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} />

      {/* Boss Battle Modal */}
      <BossBattleModal isOpen={showBossModal} onClose={() => setShowBossModal(false)} />
    </div>
  );
};
