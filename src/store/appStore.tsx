import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuditFlag,
  Badge,
  Campus,
  FacultyProfile,
  LedgerEntry,
  PeerHelpPost,
  Quest,
  Question,
  RewardItem,
  RewardRedemption,
  RuleAuditLog,
  StudentProfile,
  SubjectSyllabus,
  TeamBattle,
  UserRole,
  XpRule,
  ThemeMode,
  Assignment,
  AssignmentSubmission,
} from '../types';
import {
  CAMPUSES,
  INITIAL_AUDIT_FLAGS,
  INITIAL_BADGES,
  INITIAL_BATTLES,
  INITIAL_FACULTY,
  INITIAL_LEDGER,
  INITIAL_PEER_POSTS,
  INITIAL_QUESTS,
  INITIAL_QUESTIONS,
  INITIAL_REWARD_ITEMS,
  INITIAL_RULES,
  INITIAL_STUDENTS,
  SYLLABUS_LIST,
  INITIAL_ASSIGNMENTS,
  INITIAL_ASSIGNMENT_SUBMISSIONS,
} from '../data/mockData';
import { CODING_PROBLEMS, CodingProblem } from '../data/codingProblems';
import { calculateLevelFromXp, processXpEvent, XpEvent } from '../modules/xpEngine';
import confetti from 'canvas-confetti';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeStudent: StudentProfile;
  students: StudentProfile[];
  facultyList: FacultyProfile[];
  activeFaculty: FacultyProfile;
  setActiveFacultyId: (id: string) => void;
  rules: XpRule[];
  ruleAuditLogs: RuleAuditLog[];
  ledger: LedgerEntry[];
  questions: Question[];
  syllabusList: SubjectSyllabus[];
  badges: Badge[];
  quests: Quest[];
  battles: TeamBattle[];
  peerPosts: PeerHelpPost[];
  rewardItems: RewardItem[];
  redemptions: RewardRedemption[];
  auditFlags: AuditFlag[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  theme: ThemeMode;
  importedProblems: CodingProblem[];
  allCodingProblems: CodingProblem[];
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  createAssignment: (asgn: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  deleteAssignment: (id: string) => void;
  submitAssignment: (asgnId: string, studentId: string, codeOrText: string, fileName?: string) => { success: boolean; pointsAwarded: number; message: string };
  gradeAssignmentSubmission: (subId: string, grade: number, feedback: string, facultyName: string) => void;
  importCodingProblem: (problem: CodingProblem) => void;
  triggerXpEvent: (event: XpEvent) => { success: boolean; pointsAwarded: number; reason: string; rejectedReason?: string };
  updateRule: (ruleId: string, updates: Partial<XpRule>, adminName: string) => void;
  toggleRuleActive: (ruleId: string, adminName: string) => void;
  voidLedgerEntry: (ledgerId: string, reason: string, voidedByName: string) => void;
  toggleAnonymousMode: (studentId: string) => void;
  toggleOptOutOfLeaderboards: (studentId: string) => void;
  claimDailyQuizReward: (score: number, total: number, timeSpentArr: number[], subjectId: string) => { success: boolean; xpEarned: number; reason?: string };
  answerPeerDoubt: (postId: string, answerText: string) => void;
  acceptPeerAnswer: (postId: string, answerId: string) => void;
  addPeerPost: (title: string, body: string, subject: string, topic: string) => void;
  approveQuestion: (questionId: string, facultyName: string) => void;
  rejectQuestion: (questionId: string, facultyName: string) => void;
  addQuestion: (q: Omit<Question, 'id' | 'createdAt'>) => void;
  toggleSyllabusTopicTaught: (subjectId: string, weekNumber: number) => void;
  redeemReward: (itemId: string) => { success: boolean; message: string };
  resolveAuditFlag: (flagId: string, action: 'void' | 'dismiss', reviewerName: string, note: string) => void;
  simulateWeekEnd: () => { promotedCount: number; relegatedCount: number };
  simulateBatchSubmissions: (count: number) => { totalSubmitted: number; processed: number; duplicatesRejected: number; p95LatencyMs: number };
  simulateExternalCodingSync: (platform: 'leetcode' | 'codeforces' | 'github') => { success: boolean; problemsAdded: number; xpEarned: number; message: string };
  useStreakFreeze: (studentId: string) => boolean;
  sendFacultyNudge: (studentId: string) => void;
  resetAllData: () => void;
  
  // UI Level-Up Celebration
  levelUpModal: { show: boolean; oldLevel: number; newLevel: number; studentName: string } | null;
  closeLevelUpModal: () => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'msot_levelup_storage_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or defaults
  const loadInitial = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse localStorage, resetting:', e);
    }
    return null;
  };

  const initial = loadInitial();

  const [role, setRole] = useState<UserRole>(initial?.role || 'student');
  const [activeStudentId, setActiveStudentId] = useState<string>(initial?.activeStudentId || 'std_rahul_verma');
  const [activeFacultyId, setActiveFacultyId] = useState<string>(initial?.activeFacultyId || 'fac_priya_nair');

  const [students, setStudents] = useState<StudentProfile[]>(initial?.students || INITIAL_STUDENTS);
  const [facultyList] = useState<FacultyProfile[]>(INITIAL_FACULTY);
  const [rules, setRules] = useState<XpRule[]>(initial?.rules || INITIAL_RULES);
  const [ruleAuditLogs, setRuleAuditLogs] = useState<RuleAuditLog[]>(initial?.ruleAuditLogs || []);
  const [ledger, setLedger] = useState<LedgerEntry[]>(initial?.ledger || INITIAL_LEDGER);
  const [questions, setQuestions] = useState<Question[]>(initial?.questions || INITIAL_QUESTIONS);
  const [syllabusList, setSyllabusList] = useState<SubjectSyllabus[]>(initial?.syllabusList || SYLLABUS_LIST);
  const [badges, setBadges] = useState<Badge[]>(initial?.badges || INITIAL_BADGES);
  const [quests, setQuests] = useState<Quest[]>(initial?.quests || INITIAL_QUESTS);
  const [battles, setBattles] = useState<TeamBattle[]>(initial?.battles || INITIAL_BATTLES);
  const [peerPosts, setPeerPosts] = useState<PeerHelpPost[]>(initial?.peerPosts || INITIAL_PEER_POSTS);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>(initial?.rewardItems || INITIAL_REWARD_ITEMS);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(initial?.redemptions || []);
  const [auditFlags, setAuditFlags] = useState<AuditFlag[]>(initial?.auditFlags || INITIAL_AUDIT_FLAGS);
  const [assignments, setAssignments] = useState<Assignment[]>(
    initial?.assignments || INITIAL_ASSIGNMENTS
  );
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(
    initial?.assignmentSubmissions || INITIAL_ASSIGNMENT_SUBMISSIONS
  );
  const [importedProblems, setImportedProblems] = useState<CodingProblem[]>(
    initial?.importedProblems || []
  );
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('msot_levelup_theme') as ThemeMode;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return initial?.theme || 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('msot_levelup_theme', theme);
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    } catch (e) {
      console.warn('Failed to update theme classes:', e);
    }
  }, [theme]);

  const [levelUpModal, setLevelUpModal] = useState<{ show: boolean; oldLevel: number; newLevel: number; studentName: string } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          role,
          activeStudentId,
          activeFacultyId,
          students,
          rules,
          ruleAuditLogs,
          ledger,
          questions,
          syllabusList,
          badges,
          quests,
          battles,
          peerPosts,
          rewardItems,
          redemptions,
          auditFlags,
          assignments,
          assignmentSubmissions,
          importedProblems,
          theme,
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [
    role,
    activeStudentId,
    activeFacultyId,
    students,
    rules,
    ruleAuditLogs,
    ledger,
    questions,
    syllabusList,
    badges,
    quests,
    battles,
    peerPosts,
    rewardItems,
    redemptions,
    auditFlags,
    assignments,
    assignmentSubmissions,
    importedProblems,
    theme,
  ]);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const activeFaculty = facultyList.find((f) => f.id === activeFacultyId) || facultyList[0];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
    });
  };

  const closeLevelUpModal = () => setLevelUpModal(null);

  // Core XP Event Dispatcher
  const triggerXpEvent = (event: XpEvent) => {
    const result = processXpEvent(event, rules, ledger);

    if (result.success && result.ledgerEntry) {
      const newLedger = [result.ledgerEntry, ...ledger];
      setLedger(newLedger);

      // Recompute target student's total XP & level
      setStudents((prev) =>
        prev.map((std) => {
          if (std.id !== event.studentId) return std;

          const updatedEntries = newLedger.filter((e) => e.studentId === std.id && e.status === 'valid');
          const newTotalXp = updatedEntries.reduce((sum, e) => sum + e.points, 0);
          const oldLevel = std.level;
          const { level: newLevel } = calculateLevelFromXp(newTotalXp);

          // Add coins (separate from XP!)
          const addedCoins = Math.floor(result.pointsAwarded * 0.4);

          // Check if level increased
          if (newLevel > oldLevel) {
            triggerConfetti();
            setLevelUpModal({
              show: true,
              oldLevel,
              newLevel,
              studentName: std.name,
            });
          }

          // Update streak if action counts towards daily learning
          const today = event.timestamp.split('T')[0];
          let newStreak = std.streakDays;
          let newCalendar = [...std.streakCalendar];
          if (!newCalendar.includes(today)) {
            newCalendar.push(today);
            newStreak += 1;
          }

          return {
            ...std,
            totalXp: newTotalXp,
            level: newLevel,
            weeklyXp: std.weeklyXp + result.pointsAwarded,
            coinsBalance: std.coinsBalance + addedCoins,
            streakDays: newStreak,
            streakCalendar: newCalendar,
            lastActiveDate: today,
          };
        })
      );
    }

    return result;
  };

  // Rule Administration
  const updateRule = (ruleId: string, updates: Partial<XpRule>, adminName: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        if (updates.xpValue !== undefined && updates.xpValue !== r.xpValue) {
          const log: RuleAuditLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ruleId: r.id,
            actionKey: r.actionKey,
            changedBy: adminName,
            timestamp: new Date().toISOString(),
            oldValue: r.xpValue,
            newValue: updates.xpValue,
            field: 'xpValue',
          };
          setRuleAuditLogs((prevLogs) => [log, ...prevLogs]);
        }
        return {
          ...r,
          ...updates,
          lastUpdated: new Date().toISOString().split('T')[0],
          updatedBy: adminName,
        };
      })
    );
  };

  const toggleRuleActive = (ruleId: string, adminName: string) => {
    const target = rules.find((r) => r.id === ruleId);
    if (target) {
      updateRule(ruleId, { active: !target.active }, adminName);
    }
  };

  // Faculty/Admin Override: VOID suspicious XP entry
  const voidLedgerEntry = (ledgerId: string, reason: string, voidedByName: string) => {
    const targetEntry = ledger.find((e) => e.id === ledgerId);
    if (!targetEntry || targetEntry.status === 'voided') return;

    const newLedger = ledger.map((e) =>
      e.id === ledgerId
        ? ({
            ...e,
            status: 'voided',
            voidedReason: reason,
            voidedBy: voidedByName,
            voidedAt: new Date().toISOString(),
          } as LedgerEntry)
        : e
    );
    setLedger(newLedger);

    // Recompute affected student's total XP immediately
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== targetEntry.studentId) return s;
        const validEntries = newLedger.filter((e) => e.studentId === s.id && e.status === 'valid');
        const updatedTotal = validEntries.reduce((sum, item) => sum + item.points, 0);
        const { level } = calculateLevelFromXp(updatedTotal);
        return {
          ...s,
          totalXp: updatedTotal,
          level,
        };
      })
    );
  };

  const toggleAnonymousMode = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isAnonymous: !s.isAnonymous } : s))
    );
  };

  const toggleOptOutOfLeaderboards = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, optOutOfLeaderboards: !s.optOutOfLeaderboards } : s))
    );
  };

  // Claim Daily Quiz
  const claimDailyQuizReward = (score: number, total: number, timeSpentArr: number[], subjectId: string) => {
    const now = new Date().toISOString();
    const event: XpEvent = {
      eventId: `ev_quiz_${Date.now()}`,
      studentId: activeStudentId,
      actionKey: 'daily_quiz',
      timestamp: now,
      metadata: {
        quizScore: score,
        quizTotal: total,
        subjectId,
        timeSpentArr,
      },
    };

    const res = triggerXpEvent(event);
    if (res.success) {
      // Check for first quiz badge
      if (!activeStudent.unlockedBadgeIds.includes('badge_first_quiz')) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === activeStudentId
              ? { ...s, unlockedBadgeIds: [...s.unlockedBadgeIds, 'badge_first_quiz'] }
              : s
          )
        );
        triggerConfetti();
      }
    }
    return { success: res.success, xpEarned: res.pointsAwarded, reason: res.rejectedReason };
  };

  // Peer Help Board
  const addPeerPost = (title: string, body: string, subject: string, topic: string) => {
    const newPost: PeerHelpPost = {
      id: `post_${Date.now()}`,
      studentId: activeStudentId,
      authorName: activeStudent.name,
      authorCampus: activeStudent.campus,
      title,
      body,
      subject,
      topic,
      timestamp: 'Just now',
      answers: [],
    };
    setPeerPosts([newPost, ...peerPosts]);
  };

  const answerPeerDoubt = (postId: string, answerText: string) => {
    setPeerPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newAns = {
          id: `ans_${Date.now()}`,
          authorId: activeStudentId,
          authorName: activeStudent.name,
          authorCampus: activeStudent.campus,
          body: answerText,
          timestamp: 'Just now',
          isAccepted: false,
        };
        return { ...p, answers: [...p.answers, newAns] };
      })
    );
  };

  const acceptPeerAnswer = (postId: string, answerId: string) => {
    const post = peerPosts.find((p) => p.id === postId);
    if (!post) return;
    const answer = post.answers.find((a) => a.id === answerId);
    if (!answer) return;

    // Update post answer state
    setPeerPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          answers: p.answers.map((a) => (a.id === answerId ? { ...a, isAccepted: true } : a)),
        };
      })
    );

    // Trigger verifiable peer help XP to answer author (15 XP)
    triggerXpEvent({
      eventId: `ev_peer_${Date.now()}`,
      studentId: answer.authorId,
      actionKey: 'peer_help',
      timestamp: new Date().toISOString(),
      metadata: {
        helperId: answer.authorId,
        askerId: post.studentId,
        doubtTitle: post.title,
      },
    });
  };

  // Question Bank & Faculty Approval Queue
  const approveQuestion = (questionId: string, facultyName: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, status: 'approved', reviewedBy: facultyName }
          : q
      )
    );
  };

  const rejectQuestion = (questionId: string, facultyName: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, status: 'rejected', reviewedBy: facultyName }
          : q
      )
    );
  };

  const addQuestion = (qData: Omit<Question, 'id' | 'createdAt'>) => {
    const newQ: Question = {
      ...qData,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuestions([newQ, ...questions]);
  };

  const toggleSyllabusTopicTaught = (subjectId: string, weekNumber: number) => {
    setSyllabusList((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          weeks: sub.weeks.map((w) =>
            w.weekNumber === weekNumber ? { ...w, isTaught: !w.isTaught } : w
          ),
        };
      })
    );
  };

  // Rewards Store
  const redeemReward = (itemId: string) => {
    const item = rewardItems.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (activeStudent.coinsBalance < item.costCoins) {
      return { success: false, message: `Insufficient coins balance (${activeStudent.coinsBalance}/${item.costCoins})` };
    }
    if (item.stock <= 0) {
      return { success: false, message: 'Item is out of stock' };
    }

    // Deduct coins (notice: total XP & level are NEVER reduced!)
    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeStudentId
          ? { ...s, coinsBalance: s.coinsBalance - item.costCoins }
          : s
      )
    );

    // Decrement stock
    setRewardItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: i.stock - 1 } : i))
    );

    const red: RewardRedemption = {
      id: `red_${Date.now()}`,
      studentId: activeStudentId,
      studentName: activeStudent.name,
      itemId: item.id,
      itemTitle: item.title,
      costCoins: item.costCoins,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setRedemptions([red, ...redemptions]);
    triggerConfetti();

    return { success: true, message: `Redeemed ${item.title}! Voucher voucher code sent to ${activeStudent.email}` };
  };

  // Anti-Gaming Audits
  const resolveAuditFlag = (flagId: string, action: 'void' | 'dismiss', reviewerName: string, note: string) => {
    const flag = auditFlags.find((f) => f.id === flagId);
    if (!flag) return;

    if (action === 'void' && flag.flaggedLedgerEntryId) {
      voidLedgerEntry(flag.flaggedLedgerEntryId, `Flag resolved: ${note}`, reviewerName);
    }

    setAuditFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? {
              ...f,
              status: action === 'void' ? 'voided' : 'dismissed',
              reviewedBy: reviewerName,
              reviewedAt: new Date().toISOString(),
              reviewNote: note,
            }
          : f
      )
    );
  };

  // League Promotion & Relegation Simulation (Week End)
  const simulateWeekEnd = () => {
    let promoted = 0;
    let relegated = 0;

    const tierOrder: ('Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond')[] = [
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Diamond',
    ];

    setStudents((prev) => {
      // Group by league
      return prev.map((student) => {
        const currentTierIndex = tierOrder.indexOf(student.league);
        let nextTier = student.league;

        // Top 20% promoted, bottom 10% relegated (if not bronze)
        if (student.leagueRank <= 3 && currentTierIndex < tierOrder.length - 1) {
          nextTier = tierOrder[currentTierIndex + 1];
          promoted++;
        } else if (student.leagueRank >= 16 && currentTierIndex > 0) {
          nextTier = tierOrder[currentTierIndex - 1];
          relegated++;
        }

        return {
          ...student,
          league: nextTier,
          previousWeeklyXp: student.weeklyXp,
          weeklyXp: 0, // Weekly reset gives fresh chance to late-starters!
          leagueRank: Math.floor(Math.random() * 10) + 1,
        };
      });
    });

    triggerConfetti();
    return { promotedCount: promoted, relegatedCount: relegated };
  };

  // Simulate 300 Concurrent Submissions (Team Battle Queue)
  const simulateBatchSubmissions = (count: number = 300) => {
    const queue: { id: string; teamId: string; points: number }[] = [];
    const idempotencySet = new Set<string>();
    let duplicates = 0;

    for (let i = 0; i < count; i++) {
      // Simulate 5% intentional duplicate resubmissions
      const isDup = i % 20 === 0;
      const key = isDup ? `idemp_dup_sim_${Math.floor(i / 20)}` : `idemp_unique_${i}_${Date.now()}`;

      if (idempotencySet.has(key)) {
        duplicates++;
      } else {
        idempotencySet.add(key);
        queue.push({
          id: `sim_sub_${i}`,
          teamId: ['team_hi_tech', 'team_rathinam', 'team_rgib', 'team_juj'][i % 4],
          points: [10, 20, 40][i % 3],
        });
      }
    }

    // Process queued points into team battle
    setBattles((prev) =>
      prev.map((b) => {
        if (b.status !== 'active') return b;
        const updatedTeams = b.teams.map((t) => {
          const teamPoints = queue
            .filter((item) => item.teamId === t.teamId)
            .reduce((sum, item) => sum + item.points, 0);

          const newRaw = t.totalRawXp + teamPoints;
          const newParticipants = t.participantCount + Math.floor(teamPoints / 50);
          const participationRate = Math.min(1.0, newParticipants / t.eligibleStudentCount);
          const normalized = Math.round(((newRaw / Math.max(1, newParticipants)) * (1 + participationRate * 0.25)) * 10) / 10;

          return {
            ...t,
            totalRawXp: newRaw,
            participantCount: newParticipants,
            normalizedScore: normalized,
          };
        });

        return {
          ...b,
          teams: updatedTeams,
        };
      })
    );

    return {
      totalSubmitted: count,
      processed: queue.length,
      duplicatesRejected: duplicates,
      p95LatencyMs: 42, // Simulated high-throughput redis queue latency
    };
  };

  // External Platform Coding Practice Sync (LeetCode / Codeforces / GitHub)
  const simulateExternalCodingSync = (platform: 'leetcode' | 'codeforces' | 'github') => {
    const handle = activeStudent.codingHandles[platform] || 'active_student';
    const problemsAdded = 2;
    const now = new Date().toISOString();

    // Trigger 2 verified coding problems via XP Engine
    const res1 = triggerXpEvent({
      eventId: `ev_code_${Date.now()}_1`,
      studentId: activeStudentId,
      actionKey: 'solve_coding',
      timestamp: now,
      metadata: {
        problemId: `${platform}_${Date.now()}_1`,
        difficulty: 'medium',
        problemTitle: `${platform.toUpperCase()} Sync: Binary Tree Level Order`,
        platform,
        handle,
      },
    });

    const res2 = triggerXpEvent({
      eventId: `ev_code_${Date.now()}_2`,
      studentId: activeStudentId,
      actionKey: 'solve_coding',
      timestamp: now,
      metadata: {
        problemId: `${platform}_${Date.now()}_2`,
        difficulty: 'easy',
        problemTitle: `${platform.toUpperCase()} Sync: Two Sum Hash Map`,
        platform,
        handle,
      },
    });

    const totalXp = (res1.pointsAwarded || 0) + (res2.pointsAwarded || 0);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeStudentId
          ? {
              ...s,
              codingHandles: {
                ...s.codingHandles,
                verifiedProblemsCount: s.codingHandles.verifiedProblemsCount + problemsAdded,
              },
            }
          : s
      )
    );

    triggerConfetti();

    return {
      success: true,
      problemsAdded,
      xpEarned: totalXp,
      message: `Verified and imported ${problemsAdded} new completed solutions from ${platform.toUpperCase()} (${handle})! Earned ${totalXp} XP.`,
    };
  };

  const useStreakFreeze = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target || target.streakFreezesRemaining <= 0) return false;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, streakFreezesRemaining: s.streakFreezesRemaining - 1 }
          : s
      )
    );
    return true;
  };

  const sendFacultyNudge = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;
    alert(`Supportive nudge dispatched to ${target.name} (${target.email}): "Hey ${target.name}, Prof. ${activeFaculty.name} noticed you missed recent labs. Drop by office hours or start with a 3-minute quiz today to keep your streak going!"`);
  };

  const allCodingProblems = [...CODING_PROBLEMS, ...importedProblems];

  const importCodingProblem = (problem: CodingProblem) => {
    setImportedProblems((prev) => {
      if (prev.some((p) => p.id === problem.id)) return prev;
      return [problem, ...prev];
    });
  };

  const createAssignment = (asgnData: Omit<Assignment, 'id' | 'createdAt'>): Assignment => {
    const newAsgn: Assignment = {
      ...asgnData,
      id: `asgn_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => [newAsgn, ...prev]);
    return newAsgn;
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const submitAssignment = (
    asgnId: string,
    studentId: string,
    codeOrText: string,
    fileName?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    const asgn = assignments.find((a) => a.id === asgnId);
    if (!student || !asgn) {
      return { success: false, pointsAwarded: 0, message: 'Invalid assignment or student' };
    }

    const now = new Date();
    const isLate = asgn.dueDate ? now.toISOString().split('T')[0] > asgn.dueDate : false;

    const existing = assignmentSubmissions.find(
      (s) => s.assignmentId === asgnId && s.studentId === studentId
    );

    const submission: AssignmentSubmission = {
      id: existing ? existing.id : `sub_${Date.now()}`,
      assignmentId: asgnId,
      studentId,
      studentName: student.name,
      campus: student.campus,
      section: student.section,
      submittedAt: now.toISOString(),
      status: isLate ? 'late' : 'submitted',
      maxPoints: asgn.pointsXp,
      submissionCode: asgn.type === 'coding' ? codeOrText : undefined,
      submissionText: asgn.type !== 'coding' ? codeOrText : undefined,
      fileName,
    };

    setAssignmentSubmissions((prev) => {
      const filtered = prev.filter((s) => s.id !== submission.id);
      return [submission, ...filtered];
    });

    const res = triggerXpEvent({
      eventId: `ev_asgn_${asgnId}_${Date.now()}`,
      studentId,
      actionKey: 'submit_assignment',
      timestamp: now.toISOString(),
      metadata: {
        assignmentId: asgnId,
        assignmentTitle: asgn.title,
        onTime: !isLate,
        verificationSource: 'Teacher Verified Assignment Portal',
      },
    });

    return {
      success: true,
      pointsAwarded: res.pointsAwarded || asgn.pointsXp,
      message: isLate
        ? 'Submitted past deadline. Faculty coordinator will verify late credit.'
        : `Assignment successfully submitted on-time! +${res.pointsAwarded || asgn.pointsXp} XP awarded.`,
    };
  };

  const gradeAssignmentSubmission = (
    subId: string,
    grade: number,
    feedback: string,
    facultyName: string
  ) => {
    setAssignmentSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        return {
          ...sub,
          status: 'graded',
          grade,
          feedback,
          gradedBy: facultyName,
          gradedAt: new Date().toISOString(),
        };
      })
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRole('student');
    setActiveStudentId('std_rahul_verma');
    setActiveFacultyId('fac_priya_nair');
    setStudents(INITIAL_STUDENTS);
    setRules(INITIAL_RULES);
    setRuleAuditLogs([]);
    setLedger(INITIAL_LEDGER);
    setQuestions(INITIAL_QUESTIONS);
    setSyllabusList(SYLLABUS_LIST);
    setBadges(INITIAL_BADGES);
    setQuests(INITIAL_QUESTS);
    setBattles(INITIAL_BATTLES);
    setPeerPosts(INITIAL_PEER_POSTS);
    setRewardItems(INITIAL_REWARD_ITEMS);
    setRedemptions([]);
    setAuditFlags(INITIAL_AUDIT_FLAGS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setAssignmentSubmissions(INITIAL_ASSIGNMENT_SUBMISSIONS);
    setImportedProblems([]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeStudentId,
        setActiveStudentId,
        activeStudent,
        students,
        facultyList,
        activeFaculty,
        setActiveFacultyId,
        rules,
        ruleAuditLogs,
        ledger,
        questions,
        syllabusList,
        badges,
        quests,
        battles,
        peerPosts,
        rewardItems,
        redemptions,
        auditFlags,
        assignments,
        assignmentSubmissions,
        theme,
        setTheme,
        toggleTheme,
        importedProblems,
        allCodingProblems,
        importCodingProblem,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        gradeAssignmentSubmission,
        triggerXpEvent,
        updateRule,
        toggleRuleActive,
        voidLedgerEntry,
        toggleAnonymousMode,
        toggleOptOutOfLeaderboards,
        claimDailyQuizReward,
        answerPeerDoubt,
        acceptPeerAnswer,
        addPeerPost,
        approveQuestion,
        rejectQuestion,
        addQuestion,
        toggleSyllabusTopicTaught,
        redeemReward,
        resolveAuditFlag,
        simulateWeekEnd,
        simulateBatchSubmissions,
        simulateExternalCodingSync,
        useStreakFreeze,
        sendFacultyNudge,
        resetAllData,
        levelUpModal,
        closeLevelUpModal,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
