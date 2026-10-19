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
import { CountUp } from '../common/CountUp';
import { StreakFlame, getStreakTier } from '../common/StreakFlame';
import { StreakMilestoneModal } from './StreakMilestoneModal';
import { GameStatBadge, LeagueEmblem } from '../common/GameIcons';
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
  Building2,
  ExternalLink,
  Globe,
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
    openProfileModal,
    updateStudentProfile,
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
  const [freezeEffectActive, setFreezeEffectActive] = useState(false);

  // Framer Motion streak animation triggers
  const [streakAnimKey, setStreakAnimKey] = useState<number>(0);
  const [showStreakBonusPop, setShowStreakBonusPop] = useState(false);
  const [milestoneCelebrationDays, setMilestoneCelebrationDays] = useState<number | null>(null);
  const prevStreakRef = useRef(activeStudent.streakDays);

  // Check if student completed today's action
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isTodayActivityDone = activeStudent.streakCalendar.includes(todayDateStr);
  const isStreakAtRisk = !isTodayActivityDone && activeStudent.streakDays > 0;

  useEffect(() => {
    if (activeStudent.streakDays !== prevStreakRef.current) {
      const oldVal = prevStreakRef.current;
      prevStreakRef.current = activeStudent.streakDays;
      setStreakAnimKey((k) => k + 1);
      setShowStreakBonusPop(true);

      // Check if student hit milestone 7, 14, 30, or 100 days
      if ([7, 14, 30, 100].includes(activeStudent.streakDays) && activeStudent.streakDays > oldVal) {
        setMilestoneCelebrationDays(activeStudent.streakDays);
      }

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
      setFreezeEffectActive(true);
      setTimeout(() => setFreezeEffectActive(false), 2400);
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
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border text-xs shadow-2xl flex items-center gap-2 ${
              isDark
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                : 'bg-white border-emerald-500/60 text-emerald-800 shadow-xl'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Profile & Progression Card */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border transition-colors interactive-card ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Left Column: Student Details (Avatar stacks above details on mobile) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4">
            <button
              onClick={() => openProfileModal(activeStudent.id, 'student', 'profile')}
              title="Click to view & edit profile"
              className="relative shrink-0 group cursor-pointer touch-target flex items-center justify-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                {activeStudent.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-[10px] font-extrabold text-white shadow-xs">
                Lvl {level}
              </span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <button
                  onClick={() => openProfileModal(activeStudent.id, 'student', 'profile')}
                  className="text-lg sm:text-xl font-bold tracking-tight text-center sm:text-left hover:text-indigo-500 transition-colors cursor-pointer group flex items-center gap-1.5"
                  title="Click to open student profile"
                >
                  <span className="truncate max-w-[240px] sm:max-w-none">{activeStudent.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 opacity-60 group-hover:opacity-100 transition-all shrink-0" />
                </button>
              </div>

              <div className={`text-xs mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="flex items-center gap-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {activeStudent.campus} Campus
                </span>
                <span>·</span>
                <span>Section {activeStudent.section}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">Roll: {activeStudent.rollNumber}</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Stat Tiles (2 cols on mobile, 4 on tablet/laptop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* 1. Streak Tile */}
            <motion.div
              onClick={() => {
                if (activeStudent.streakDays >= 7) {
                  setMilestoneCelebrationDays(activeStudent.streakDays);
                }
              }}
              animate={
                streakAnimKey > 0
                  ? {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 0px rgba(249, 115, 22, 0)',
                        '0 0 24px rgba(249, 115, 22, 0.45)',
                        '0 0 0px rgba(249, 115, 22, 0)',
                      ],
                    }
                  : { scale: 1 }
              }
              transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
              className={`relative p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between overflow-hidden transition-colors cursor-pointer select-none ${
                isDark ? 'bg-slate-950 border-slate-800 hover:border-orange-500/40' : 'bg-white border-slate-200 shadow-2xs hover:border-orange-300'
              }`}
              title="Click to view streak tier and milestone progress"
            >
              <AnimatePresence>
                {showStreakBonusPop && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.8 }}
                    animate={{ opacity: 1, y: -2, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
                    className="absolute top-1 right-2 px-1.5 py-0.5 rounded-full bg-orange-500/25 border border-orange-500/60 text-orange-400 text-[9px] font-black z-10 flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-orange-300" />
                    <span>Streak Up!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <StreakFlame
                    streakDays={activeStudent.streakDays}
                    size="xs"
                    isAtRisk={isStreakAtRisk}
                    isFrozen={freezeEffectActive}
                    isBursting={showStreakBonusPop}
                  />
                  <span className="font-extrabold text-orange-500 text-xs">
                    {getStreakTier(activeStudent.streakDays).name}
                  </span>
                </div>

                <span className="text-[10px] text-blue-400 flex items-center gap-0.5 font-bold">
                  <Snowflake className={`w-3 h-3 ${freezeEffectActive ? 'animate-spin' : ''}`} />
                  <span>{activeStudent.streakFreezesRemaining}</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between overflow-hidden mt-1">
                <div className="text-xl sm:text-2xl font-black tabular-nums flex items-baseline gap-1">
                  <span className="text-orange-500">
                    <CountUp value={activeStudent.streakDays} />
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Days</span>
                </div>
                {isStreakAtRisk && (
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider animate-pulse">
                    At Risk
                  </span>
                )}
              </div>
            </motion.div>

            {/* 2. League Rank */}
            <div
              className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between transition-colors interactive-card ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-amber-500 font-bold truncate">
                  <GameStatBadge stat="league" size="sm" />
                  <span>League</span>
                </span>
                <LeagueEmblem league={activeStudent.league} size="sm" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold tabular-nums flex items-baseline gap-1.5 mt-1">
                <span className={`truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeStudent.league}</span>
                <span className={`text-xs font-medium shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  #{activeStudent.leagueRank}
                </span>
              </div>
            </div>

            {/* 3. Total Academic XP */}
            <div
              className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between transition-colors interactive-card ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs mb-1 font-bold text-emerald-400 truncate">
                <GameStatBadge stat="xp" size="sm" />
                <span>Academic XP</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400 tabular-nums mt-1">
                <CountUp value={activeStudent.totalXp} suffix=" XP" />
              </div>
            </div>

            {/* 4. Separate Coins Balance */}
            <div
              className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between transition-colors interactive-card ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs mb-1 font-bold text-amber-400 truncate">
                <GameStatBadge stat="coins" size="sm" />
                <span>Perks Coins</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-400 tabular-nums mt-1">
                <CountUp value={activeStudent.coinsBalance} />
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className={`mt-4 sm:mt-5 pt-4 sm:pt-5 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Level {level} Scholar
              </span>
              <span className="text-slate-400">·</span>
              <span className={`text-[10px] sm:text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                XP(L) = 100·(L-1)^1.45 + 50·(L-1)
              </span>
            </div>

            <div className={`font-semibold tabular-nums text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <CountUp value={currentLevelXp} /> / {nextLevelXp} XP ({progressPercent}%)
            </div>
          </div>

          <div
            className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Horizontal Scrollable Chip Row on Mobile, Flex on Desktop */}
      <div
        className={`flex items-center gap-1.5 sm:gap-2 pb-2 border-b text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        {[
          { id: 'overview', label: "Today's Focus", icon: Zap },
          { id: 'assignments', label: 'Coursework & Labs', icon: FileText },
          { id: 'ledger', label: 'Verifiable Ledger', icon: ShieldCheck },
          { id: 'badges', label: 'Badges & Quests', icon: Sparkles },
          { id: 'coding', label: 'Coding Practice', icon: Code },
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
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 touch-target ${
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
              className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-orange-500">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Learning Habit Tracker (Last 14 Days)</span>
                  </h4>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Zero penalty for absences · Auto-freeze protects streaks ({activeStudent.streakFreezesRemaining} remaining)
                  </div>
                </div>

                {activeStudent.streakFreezesRemaining > 0 && (
                  <button
                    onClick={handleUseFreeze}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-colors shrink-0 cursor-pointer touch-target self-start sm:self-auto"
                  >
                    <Snowflake className={`w-3.5 h-3.5 ${freezeEffectActive ? 'animate-spin' : ''}`} />
                    <span>Protect with Freeze</span>
                  </button>
                )}
              </div>

              {/* 14 Day Habit Grid: 7 cols on mobile, 14 cols on tablet/desktop */}
              <div
                className={`grid grid-cols-7 sm:grid-cols-14 gap-1.5 rounded-2xl transition-all ${
                  freezeEffectActive ? 'ring-2 ring-blue-400/80 p-1.5 bg-blue-500/10 animate-frost' : ''
                }`}
              >
                {calendarDays.map((day, idx) => {
                  const isCellIgniting = day.isToday && showStreakBonusPop && day.isCompleted;

                  return (
                    <motion.div
                      key={day.dateStr}
                      initial={{ opacity: 0, y: 8, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.035, duration: 0.25, ease: 'easeOut' }}
                      className={`p-2 rounded-xl text-center border transition-all relative overflow-hidden select-none ${
                        isCellIgniting
                          ? 'animate-fire-fill bg-gradient-to-t from-orange-500 via-amber-500 to-orange-400 text-white font-black shadow-md border-orange-400'
                          : day.isCompleted
                          ? isDark
                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 font-bold'
                            : 'bg-orange-50 border-orange-300 text-orange-800 font-bold shadow-2xs'
                          : isDark
                          ? 'bg-slate-950 border-slate-800/80 text-slate-500'
                          : 'bg-slate-100/80 border-slate-200 text-slate-500'
                      } ${day.isToday ? 'ring-2 ring-indigo-500/80 shadow-sm' : ''}`}
                    >
                      <div className="text-[10px] opacity-75">{day.dayName}</div>
                      <div className="text-xs font-black tabular-nums mt-0.5">{day.dayNum}</div>
                      <div className="mt-1 flex items-center justify-center min-h-[22px]">
                        {day.isCompleted ? (
                          <StreakFlame
                            streakDays={activeStudent.streakDays}
                            size="xs"
                            isFrozen={day.isToday && freezeEffectActive}
                          />
                        ) : day.isToday && freezeEffectActive ? (
                          <Snowflake className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full inline-block ${
                              isDark ? 'bg-slate-800' : 'bg-slate-300'
                            }`}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
              { id: 'privacy', label: 'Privacy & Sharing', desc: 'Social Links & Cohort Isolation' },
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
            {/* Social Links Sharing Card */}
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-xs text-blue-500">
                  <Globe className="w-4 h-4" />
                  <span>Share Social Links with Batch</span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Control whether classmates in your section can view your GitHub, LinkedIn, and LeetCode handles.
                </p>
              </div>

              <button
                onClick={() =>
                  updateStudentProfile(activeStudent.id, {
                    shareSocialLinksWithBatchmates: !activeStudent.shareSocialLinksWithBatchmates,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeStudent.shareSocialLinksWithBatchmates
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {activeStudent.shareSocialLinksWithBatchmates ? 'Shared' : 'Private'}
              </button>
            </div>

            {/* Cohort Privacy Guarantee Card */}
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-500">
                  <Shield className="w-4 h-4" />
                  <span>Strict Cohort Privacy</span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Students only see rankings and batchmates from their same campus, academic year, and section. Phone numbers are never exposed.
                </p>
              </div>

              <div className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 shrink-0">
                Protected
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Quiz Modal */}
      <DailyQuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} />

      {/* Boss Battle Modal */}
      <BossBattleModal isOpen={showBossModal} onClose={() => setShowBossModal(false)} />

      {/* Streak Milestone Celebration Modal */}
      {milestoneCelebrationDays !== null && (
        <StreakMilestoneModal
          isOpen={milestoneCelebrationDays !== null}
          onClose={() => setMilestoneCelebrationDays(null)}
          milestoneDays={milestoneCelebrationDays}
          bonusXp={milestoneCelebrationDays * 10}
          isDark={isDark}
        />
      )}
    </div>
  );
};
