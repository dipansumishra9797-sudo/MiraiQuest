import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  AuditFlag,
  Badge,
  Campus,
  AcademicYear,
  GlobalFilterState,
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
  AppNotification,
  NotificationPreferences,
  AntiCheatLog,
  AutoSubmittedQuiz,
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
import { ALL_INITIAL_CODING_CATALOG, TopicProblemItem } from '../data/codingPracticeCatalog';
import { calculateLevelFromXp, processXpEvent, XpEvent } from '../modules/xpEngine';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';

export type StudentBgStyle = 'mirai' | 'sakura' | 'gradient' | 'off' | 'all' | 'orbs' | 'particles' | 'aurora';

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
  effectiveTheme: 'light' | 'dark';
  isDark: boolean;
  importedProblems: CodingProblem[];
  allCodingProblems: (CodingProblem | TopicProblemItem)[];
  studentSolvedProblems: Record<string, string[]>;
  unlockedTopicBatches: Record<string, number>;
  
  // Navigation & Drawer
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  navSection: string;
  setNavSection: (sec: string) => void;
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  createAssignment: (asgn: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  deleteAssignment: (id: string) => void;
  submitAssignment: (asgnId: string, studentId: string, codeOrText: string, fileName?: string) => { success: boolean; pointsAwarded: number; message: string };
  gradeAssignmentSubmission: (subId: string, grade: number, feedback: string, facultyName: string) => void;
  importCodingProblem: (problem: CodingProblem) => void;
  addCodingProblem: (problem: CodingProblem) => void;
  solveCodingProblem: (studentId: string, problemId: string) => { success: boolean; pointsAwarded: number; message: string; nextProblemId?: string };
  generateAiTopicQuestions: (topicId: string, count?: number) => Promise<{ success: boolean; count: number; message: string }>;
  triggerXpEvent: (event: XpEvent) => { success: boolean; pointsAwarded: number; reason: string; rejectedReason?: string };
  updateRule: (ruleId: string, updates: Partial<XpRule>, adminName: string) => void;
  toggleRuleActive: (ruleId: string, adminName: string) => void;
  voidLedgerEntry: (ledgerId: string, reason: string, voidedByName: string) => void;
  claimDailyQuizReward: (score: number, total: number, timeSpentArr: number[], subjectId: string) => { success: boolean; xpEarned: number; reason?: string };
  answerPeerDoubt: (postId: string, answerText: string) => void;
  acceptPeerAnswer: (postId: string, answerId: string) => Promise<{ success: boolean; message: string; xpAwarded?: number }>;
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
  
  // Rank Progression Celebration
  rankProgressModal: { show: boolean; oldLevel: number; newLevel: number; studentName: string } | null;
  closeRankProgressModal: () => void;
  triggerConfetti: () => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (notif: AppNotification) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;

  // Code drafts
  studentDrafts: Record<string, Record<string, string>>;
  saveStudentDraft: (problemId: string, lang: string, code: string) => void;

  // Question Bank operations
  batchImportQuestions: (questions: Question[]) => { importedCount: number; errors: string[] };
  deleteQuestion: (questionId: string) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;

  // Anti-Cheat tracking
  antiCheatLogs: AntiCheatLog[];
  logAntiCheatEvent: (event: Omit<AntiCheatLog, 'id' | 'timestamp'>) => void;
  autoSubmittedQuizzes: Record<string, AutoSubmittedQuiz>;
  autoSubmitQuiz: (attempt: Omit<AutoSubmittedQuiz, 'id' | 'submittedAt' | 'locked'>) => Promise<void>;
  grantQuizRetake: (quizId: string, studentId: string, reason: string, grantedByName: string) => Promise<void>;

  // MCQ Assignments
  submitMcqAssignment: (asgnId: string, studentId: string, answers: Record<string, number>, timeSpentSeconds: number) => { success: boolean; pointsAwarded: number; score: number; total: number; message: string };

  // User Profile Modal
  isProfileModalOpen: boolean;
  profileModalUserId: string | null;
  profileModalRole: 'student' | 'faculty' | 'admin';
  profileActiveTab: 'profile' | 'batchmates' | 'social' | 'account' | 'privacy' | 'appearance' | 'notifications';
  setProfileActiveTab: (tab: 'profile' | 'batchmates' | 'social' | 'account' | 'privacy' | 'appearance' | 'notifications') => void;
  openProfileModal: (
    userId?: string,
    roleOverride?: 'student' | 'faculty' | 'admin',
    initialTab?: 'profile' | 'batchmates' | 'social' | 'account' | 'privacy' | 'appearance'
  ) => void;
  closeProfileModal: () => void;
  updateStudentProfile: (studentId: string, updates: Partial<StudentProfile>) => Promise<{ success: boolean; error?: string }>;
  requestPhoneOtp: (studentId: string, newPhoneNumber: string) => Promise<{ success: boolean; message: string; mockOtp?: string }>;
  verifyPhoneOtp: (studentId: string, newPhoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  updateFacultyProfile: (facultyId: string, updates: Partial<FacultyProfile>) => Promise<{ success: boolean; error?: string }>;

  // Global Filters (Teacher & Admin)
  globalFilters: GlobalFilterState;
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  updateGlobalFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  toggleCampusFilter: (campus: Campus) => void;
  toggleYearFilter: (year: AcademicYear) => void;
  toggleSectionFilter: (section: string) => void;
  clearGlobalFilters: () => void;
  filteredStudents: StudentProfile[];
  availableSections: string[];

  // Student Animated Background
  studentBgAnimationEnabled: boolean;
  setStudentBgAnimationEnabled: (enabled: boolean) => void;
  studentBgStyle: StudentBgStyle;
  setStudentBgStyle: (style: StudentBgStyle) => void;
  isFocusCriticalActive: boolean;
  setIsFocusCriticalActive: (active: boolean) => void;

  // Sound Effects Preference
  soundEffectsEnabled: boolean;
  setSoundEffectsEnabled: (enabled: boolean) => void;

  // Chest Reward Animation System
  claimedRewardIds: string[];
  activeChestReward: any | null;
  headerPulseTrigger: number;
  triggerChestReward: (config: {
    id: string;
    title?: string;
    subtitle?: string;
    rarity?: 'bronze' | 'silver' | 'gold' | 'diamond';
    items: {
      type: 'xp' | 'coins' | 'badge' | 'freeze' | 'item';
      amount?: number;
      label: string;
      badgeName?: string;
    }[];
    onFlyComplete?: () => void;
  }) => boolean;
  closeChestReward: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'msot_miraiquest_storage_v2';
const FILTERS_STORAGE_KEY = 'miraiquest_global_filters_v2';

export const DEFAULT_GLOBAL_FILTERS: GlobalFilterState = {
  campuses: [],
  years: [],
  sections: [],
  subject: 'all',
  searchQuery: '',
  sortBy: 'xp',
};

const parseFiltersFromUrl = (): Partial<GlobalFilterState> => {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const result: Partial<GlobalFilterState> = {};

    const campusParam = params.get('campus') || params.get('campuses');
    if (campusParam) {
      const validCampuses = campusParam
        .split(',')
        .map((c) => c.trim())
        .filter((c) => ['HI-Tech', 'Rathinam', 'JUJ'].includes(c)) as Campus[];
      if (validCampuses.length > 0) result.campuses = validCampuses;
    }

    const yearParam = params.get('year') || params.get('years');
    if (yearParam) {
      const validYears = yearParam
        .split(',')
        .map((y) => y.trim())
        .filter((y) =>
          ['1st Year', '2nd Year', '3rd Year', '4th Year'].includes(y)
        ) as AcademicYear[];
      if (validYears.length > 0) result.years = validYears;
    }

    const sectionParam = params.get('section') || params.get('sections');
    if (sectionParam) {
      result.sections = sectionParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const subjectParam = params.get('subject');
    if (subjectParam) {
      result.subject = subjectParam.trim();
    }

    const searchParam = params.get('search');
    if (searchParam) {
      result.searchQuery = searchParam.trim();
    }

    const sortParam = params.get('sort') || params.get('sortBy');
    if (sortParam && ['name', 'xp', 'streak', 'activity'].includes(sortParam)) {
      result.sortBy = sortParam as any;
    }

    return result;
  } catch (e) {
    return {};
  }
};

const syncFiltersToUrl = (filters: GlobalFilterState) => {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);

    if (filters.campuses.length > 0) {
      params.set('campus', filters.campuses.join(','));
    } else {
      params.delete('campus');
      params.delete('campuses');
    }

    if (filters.years.length > 0) {
      params.set('year', filters.years.join(','));
    } else {
      params.delete('year');
      params.delete('years');
    }

    if (filters.sections.length > 0) {
      params.set('section', filters.sections.join(','));
    } else {
      params.delete('section');
      params.delete('sections');
    }

    if (filters.subject && filters.subject !== 'all') {
      params.set('subject', filters.subject);
    } else {
      params.delete('subject');
    }

    if (filters.searchQuery.trim()) {
      params.set('search', filters.searchQuery.trim());
    } else {
      params.delete('search');
    }

    if (filters.sortBy && filters.sortBy !== 'xp') {
      params.set('sort', filters.sortBy);
    } else {
      params.delete('sort');
      params.delete('sortBy');
    }

    const newQuery = params.toString();
    const newUrl = newQuery
      ? `${window.location.pathname}?${newQuery}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  } catch (e) {
    console.warn('Could not sync filters to URL:', e);
  }
};


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

  // Safe migration helper: ensure legacy privacy flags are cleaned
  const migrateStudentProfiles = (rawList: any[]): StudentProfile[] => {
    return rawList.map((s) => {
      const clean: any = {};
      for (const key of Object.keys(s)) {
        if (!key.toLowerCase().includes('anon') && !key.toLowerCase().includes('opt')) {
          clean[key] = s[key];
        }
      }
      return clean as StudentProfile;
    });
  };

  const [students, setStudents] = useState<StudentProfile[]>(() =>
    migrateStudentProfiles(initial?.students || INITIAL_STUDENTS)
  );
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>(INITIAL_FACULTY);
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

  // Student solved problems mapping
  const [studentSolvedProblems, setStudentSolvedProblems] = useState<Record<string, string[]>>(() => {
    if (initial?.studentSolvedProblems) return initial.studentSolvedProblems;
    return {
      std_rahul_verma: ['mq_arrays_1', 'mq_arrays_3'],
      std_maya_sharma: ['mq_arrays_1', 'mq_arrays_2', 'mq_arrays_3', 'mq_strings_1', 'mq_hashing_1'],
      std_arjun_patel: ['mq_arrays_1'],
      std_sneha_kulkarni: ['mq_arrays_1', 'mq_strings_2'],
    };
  });

  // Track unlocked batches per topic (batch 1 default, batch 2 unlocked after mastery)
  const [unlockedTopicBatches, setUnlockedTopicBatches] = useState<Record<string, number>>(
    initial?.unlockedTopicBatches || { arrays: 1, strings: 1, hashing: 1 }
  );

  // Navigation & Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [navSection, setNavSection] = useState<string>(initial?.navSection || 'dashboard:overview');

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  // Theme mode: light and dark only (default: light)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('msot_miraiquest_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return (initial?.theme === 'light' || initial?.theme === 'dark') ? initial.theme : 'light';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const resolved: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
    setEffectiveTheme(resolved);

    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('msot_miraiquest_theme', resolved);
    } catch (e) {
      console.warn('Theme storage error:', e);
    }
  }, [theme]);

  const isDark = effectiveTheme === 'dark';

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Student Background Animation Preference (saved per user, default on)
  const [studentBgAnimationEnabled, setStudentBgAnimationEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(`mq_student_bg_anim_${activeStudentId}`);
      if (stored !== null) return stored === 'true';
    } catch {}
    return true;
  });

  const [studentBgStyle, setStudentBgStyleState] = useState<StudentBgStyle>(() => {
    try {
      const stored = localStorage.getItem(`mq_student_bg_style_${activeStudentId}`);
      if (stored && ['all', 'orbs', 'particles', 'aurora', 'mirai', 'sakura', 'off'].includes(stored)) {
        return stored as StudentBgStyle;
      }
    } catch {}
    return 'all'; // Default: Orbs plus Particles
  });

  useEffect(() => {
    try {
      const storedStyle = localStorage.getItem(`mq_student_bg_style_${activeStudentId}`);
      if (storedStyle && ['all', 'orbs', 'particles', 'aurora', 'mirai', 'sakura', 'off'].includes(storedStyle)) {
        setStudentBgStyleState(storedStyle as StudentBgStyle);
        setStudentBgAnimationEnabledState(storedStyle !== 'off');
      } else {
        const storedAnim = localStorage.getItem(`mq_student_bg_anim_${activeStudentId}`);
        const isAnim = storedAnim !== null ? storedAnim === 'true' : true;
        setStudentBgAnimationEnabledState(isAnim);
        setStudentBgStyleState(isAnim ? 'all' : 'off');
      }
    } catch {}
  }, [activeStudentId]);

  const setStudentBgAnimationEnabled = (enabled: boolean) => {
    setStudentBgAnimationEnabledState(enabled);
    const newStyle: StudentBgStyle = enabled ? (studentBgStyle === 'off' ? 'all' : studentBgStyle) : 'off';
    setStudentBgStyleState(newStyle);
    try {
      localStorage.setItem(`mq_student_bg_anim_${activeStudentId}`, String(enabled));
      localStorage.setItem(`mq_student_bg_style_${activeStudentId}`, newStyle);
    } catch (e) {
      console.warn('Failed to save student bg anim preference:', e);
    }
  };

  const setStudentBgStyle = (style: StudentBgStyle) => {
    setStudentBgStyleState(style);
    const enabled = style !== 'off';
    setStudentBgAnimationEnabledState(enabled);
    try {
      localStorage.setItem(`mq_student_bg_style_${activeStudentId}`, style);
      localStorage.setItem(`mq_student_bg_anim_${activeStudentId}`, String(enabled));
    } catch (e) {
      console.warn('Failed to save student bg style preference:', e);
    }
  };

  // Sound Effects Preference (default OFF as requested)
  const [soundEffectsEnabled, setSoundEffectsEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mq_sound_fx');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const setSoundEffectsEnabled = (enabled: boolean) => {
    setSoundEffectsEnabledState(enabled);
    soundManager.setMuted(!enabled);
    try {
      localStorage.setItem('mq_sound_fx', String(enabled));
    } catch (e) {
      console.warn('Failed to save sound fx preference:', e);
    }
  };

  useEffect(() => {
    soundManager.setMuted(!soundEffectsEnabled);
  }, [soundEffectsEnabled]);

  // Claimed Rewards Tracking (Guarantees backend safety - never claim twice)
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`mq_claimed_rewards_${activeStudentId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`mq_claimed_rewards_${activeStudentId}`);
      if (stored) setClaimedRewardIds(JSON.parse(stored));
      else setClaimedRewardIds([]);
    } catch {}
  }, [activeStudentId]);

  // Active Chest Modal State
  const [activeChestReward, setActiveChestReward] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
    items: {
      type: 'xp' | 'coins' | 'badge' | 'freeze' | 'item';
      amount?: number;
      label: string;
      badgeName?: string;
    }[];
    onFlyComplete?: () => void;
  } | null>(null);

  const [headerPulseTrigger, setHeaderPulseTrigger] = useState<number>(0);

  const triggerChestReward = (config: {
    id: string;
    title?: string;
    subtitle?: string;
    rarity?: 'bronze' | 'silver' | 'gold' | 'diamond';
    items: {
      type: 'xp' | 'coins' | 'badge' | 'freeze' | 'item';
      amount?: number;
      label: string;
      badgeName?: string;
    }[];
    onFlyComplete?: () => void;
  }): boolean => {
    // Backend Safety Check: prevent double claim
    if (claimedRewardIds.includes(config.id)) {
      return false;
    }

    // 1. Mark as claimed in state & local storage immediately
    const nextClaimed = [...claimedRewardIds, config.id];
    setClaimedRewardIds(nextClaimed);
    try {
      localStorage.setItem(`mq_claimed_rewards_${activeStudentId}`, JSON.stringify(nextClaimed));
    } catch (e) {
      console.warn('Failed to save claimed reward:', e);
    }

    // 2. Grant rewards immediately into Student Profile & Ledger
    let totalXp = 0;
    let totalCoins = 0;
    config.items.forEach((item) => {
      if (item.type === 'xp' && item.amount) totalXp += item.amount;
      if (item.type === 'coins' && item.amount) totalCoins += item.amount;
    });

    if (totalXp > 0) {
      triggerXpEvent({
        eventId: `ev_chest_${config.id}_${Date.now()}`,
        studentId: activeStudentId,
        actionKey: 'solve_coding',
        timestamp: new Date().toISOString(),
        metadata: {
          rewardTitle: config.title || 'Chest Reward Claim',
          xpAwarded: totalXp,
          coinsAwarded: totalCoins,
        },
      });
    }

    if (totalCoins > 0) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === activeStudentId
            ? { ...s, coinsBalance: (s.coinsBalance || 0) + totalCoins }
            : s
        )
      );
    }

    // 3. Open Chest Reward Modal
    setActiveChestReward({
      isOpen: true,
      title: config.title || 'Reward Unlocked!',
      subtitle: config.subtitle || 'Congratulations on completing this quest!',
      rarity:
        config.rarity ||
        (totalXp >= 100 ? 'diamond' : totalXp >= 60 ? 'gold' : totalXp >= 30 ? 'silver' : 'bronze'),
      items: config.items,
      onFlyComplete: () => {
        setHeaderPulseTrigger((c) => c + 1);
        if (config.onFlyComplete) config.onFlyComplete();
      },
    });

    return true;
  };

  const closeChestReward = () => {
    setActiveChestReward(null);
  };

  // Focus-Critical Screen State (quizzes, compiler workspace, boss battles)
  const [isFocusCriticalActive, setIsFocusCriticalActive] = useState<boolean>(false);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [profileModalRole, setProfileModalRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [profileActiveTab, setProfileActiveTab] = useState<'profile' | 'batchmates' | 'social' | 'account' | 'privacy' | 'appearance' | 'notifications'>('profile');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_asgn_new',
      title: 'New Coursework Published',
      message: 'Prof. Priya Nair published "Data Structures Mid-Term Assignment" for your section.',
      type: 'assignment',
      category: 'academic',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      link: 'coursework',
    },
    {
      id: 'notif_battle_live',
      title: 'Campus Battle is LIVE',
      message: 'HI-Tech vs Rathinam weekly campus battle round has commenced. Solve problems to earn points!',
      type: 'battle',
      category: 'battles',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      read: false,
      link: 'battles',
    },
    {
      id: 'notif_doubt_answered',
      title: 'Answer on your Technical Doubt',
      message: 'Maya Sharma posted an answer to your doubt on "Recursion Call Stacks". Check and accept to award 15 XP.',
      type: 'peer_accept',
      category: 'doubts',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      read: false,
      link: 'peer_help',
    },
    {
      id: 'notif_streak_alert',
      title: 'Streak at Risk!',
      message: 'Complete your daily micro-quiz before midnight to maintain your 5-day streak.',
      type: 'streak',
      category: 'gamification',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      read: true,
      link: 'dashboard',
    },
  ]);

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('mq_notif_prefs');
      return saved ? JSON.parse(saved) : {
        academic: true,
        battles: true,
        doubts: true,
        gamification: true,
        pushEnabled: false,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      };
    } catch {
      return {
        academic: true,
        battles: true,
        doubts: true,
        gamification: true,
        pushEnabled: false,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      };
    }
  });

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => {
      const next = { ...prev, ...prefs };
      try {
        localStorage.setItem('mq_notif_prefs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Student code drafts per problem and language
  const [studentDrafts, setStudentDrafts] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem('mq_student_drafts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveStudentDraft = (problemId: string, lang: string, codeStr: string) => {
    setStudentDrafts((prev) => {
      const next = {
        ...prev,
        [problemId]: {
          ...(prev[problemId] || {}),
          [lang]: codeStr,
        },
      };
      try {
        localStorage.setItem('mq_student_drafts', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Question bank batch operations
  const batchImportQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
    return { importedCount: newQuestions.length, errors: [] };
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q)));
  };

  // Anti-Cheat Logs & Auto-Submission tracking
  const [antiCheatLogs, setAntiCheatLogs] = useState<AntiCheatLog[]>([]);
  const [autoSubmittedQuizzes, setAutoSubmittedQuizzes] = useState<Record<string, AutoSubmittedQuiz>>({});

  const logAntiCheatEvent = async (event: Omit<AntiCheatLog, 'id' | 'timestamp'>) => {
    const newLog: AntiCheatLog = {
      ...event,
      id: `ac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAntiCheatLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/anticheat/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch {}
  };

  const autoSubmitQuiz = async (attempt: Omit<AutoSubmittedQuiz, 'id' | 'submittedAt' | 'locked'>) => {
    const record: AutoSubmittedQuiz = {
      ...attempt,
      id: `as_${attempt.quizId}_${attempt.studentId}`,
      submittedAt: new Date().toISOString(),
      locked: true,
    };
    setAutoSubmittedQuizzes((prev) => ({ ...prev, [record.id]: record }));

    try {
      await fetch('/api/quiz/auto-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {}
  };

  const grantQuizRetake = async (quizId: string, studentId: string, reason: string, grantedByName: string) => {
    const recordId = `as_${quizId}_${studentId}`;
    setAutoSubmittedQuizzes((prev) => {
      if (!prev[recordId]) return prev;
      return {
        ...prev,
        [recordId]: {
          ...prev[recordId],
          locked: false,
          retakeGranted: true,
          retakeReason: reason,
          retakeGrantedBy: grantedByName,
        },
      };
    });

    try {
      await fetch('/api/quiz/grant-retake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, studentId, reason, grantedByName }),
      });
    } catch {}
  };

  // MCQ Assignment Submission & Auto-Grading
  const submitMcqAssignment = (
    asgnId: string,
    studentId: string,
    answers: Record<string, number>,
    timeSpentSeconds: number
  ) => {
    const asgn = assignments.find((a) => a.id === asgnId);
    if (!asgn || !asgn.mcqs) {
      return { success: false, pointsAwarded: 0, score: 0, total: 0, message: 'Assignment not found.' };
    }

    let correctCount = 0;
    asgn.mcqs.forEach((m) => {
      if (answers[m.id] === m.correctOptionIndex) {
        correctCount++;
      }
    });

    const now = new Date();
    const due = new Date(`${asgn.dueDate}T${asgn.dueTime || '23:59'}`);
    const isLate = now > due;
    const pointsAwarded = isLate ? 0 : asgn.pointsXp || 20;

    const submission: AssignmentSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assignmentId: asgnId,
      studentId,
      studentName: activeStudent.name,
      campus: activeStudent.campus,
      section: activeStudent.section,
      submittedAt: new Date().toISOString(),
      status: isLate ? 'late' : 'graded',
      grade: pointsAwarded,
      maxPoints: asgn.pointsXp || 20,
      mcqScore: correctCount,
      mcqTotal: asgn.mcqs.length,
      mcqAnswers: answers,
      feedback: `MCQ Score: ${correctCount}/${asgn.mcqs.length} correct (${Math.round(
        (correctCount / asgn.mcqs.length) * 100
      )}%). ${isLate ? 'Late submission: 0 XP recorded.' : 'Submitted on time! Verified XP recorded.'}`,
    };

    setAssignmentSubmissions((prev) => [
      submission,
      ...prev.filter((s) => s.assignmentId !== asgnId || s.studentId !== studentId),
    ]);

    if (pointsAwarded > 0) {
      triggerXpEvent({
        eventId: `ev_asgn_${Date.now()}`,
        studentId,
        actionKey: 'submit_classwork',
        timestamp: new Date().toISOString(),
        metadata: {
          assignmentId: asgnId,
          title: asgn.title,
          mcqScore: correctCount,
        },
      });
    }

    return {
      success: true,
      pointsAwarded,
      score: correctCount,
      total: asgn.mcqs.length,
      message: isLate
        ? `MCQ test submitted! Score: ${correctCount}/${asgn.mcqs.length}. Submitted past due date (${asgn.dueDate}), so 0 XP was awarded.`
        : `Great job! Score: ${correctCount}/${asgn.mcqs.length} (${Math.round((correctCount / asgn.mcqs.length) * 100)}%). Earned +${pointsAwarded} XP!`,
    };
  };



  const [rankProgressModal, setRankProgressModal] = useState<{
    show: boolean;
    oldLevel: number;
    newLevel: number;
    studentName: string;
  } | null>(null);

  // Global Filters State (Teacher & Admin)
  const [globalFilters, setGlobalFilters] = useState<GlobalFilterState>(() => {
    const urlFilters = parseFiltersFromUrl();
    if (Object.keys(urlFilters).length > 0) {
      return { ...DEFAULT_GLOBAL_FILTERS, ...urlFilters };
    }
    try {
      const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_GLOBAL_FILTERS, ...JSON.parse(saved) };
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_GLOBAL_FILTERS;
  });

  // Sync Global Filters to LocalStorage and URL query params
  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(globalFilters));
    } catch (e) {
      console.warn('Could not save global filters:', e);
    }
    syncFiltersToUrl(globalFilters);
  }, [globalFilters]);

  const updateGlobalFilter = <K extends keyof GlobalFilterState>(
    key: K,
    value: GlobalFilterState[K]
  ) => {
    setGlobalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCampusFilter = (campus: Campus) => {
    setGlobalFilters((prev) => {
      const exists = prev.campuses.includes(campus);
      return {
        ...prev,
        campuses: exists
          ? prev.campuses.filter((c) => c !== campus)
          : [...prev.campuses, campus],
      };
    });
  };

  const toggleYearFilter = (year: AcademicYear) => {
    setGlobalFilters((prev) => {
      const exists = prev.years.includes(year);
      return {
        ...prev,
        years: exists
          ? prev.years.filter((y) => y !== year)
          : [...prev.years, year],
      };
    });
  };

  const toggleSectionFilter = (section: string) => {
    setGlobalFilters((prev) => {
      const exists = prev.sections.includes(section);
      return {
        ...prev,
        sections: exists
          ? prev.sections.filter((s) => s !== section)
          : [...prev.sections, section],
      };
    });
  };

  const clearGlobalFilters = () => {
    setGlobalFilters(DEFAULT_GLOBAL_FILTERS);
  };

  // Available sections dynamically computed based on selected campus and year
  const availableSections = useMemo(() => {
    const relevant = students.filter((s) => {
      if (
        globalFilters.campuses.length > 0 &&
        !globalFilters.campuses.includes(s.campus)
      )
        return false;
      if (
        globalFilters.years.length > 0 &&
        !globalFilters.years.includes(s.year)
      )
        return false;
      return true;
    });
    return Array.from(new Set(relevant.map((s) => s.section))).sort();
  }, [students, globalFilters.campuses, globalFilters.years]);

  // Students filtered by active global filters (campus, year, section, search, sort)
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (
          globalFilters.campuses.length > 0 &&
          !globalFilters.campuses.includes(s.campus)
        ) {
          return false;
        }
        if (
          globalFilters.years.length > 0 &&
          !globalFilters.years.includes(s.year)
        ) {
          return false;
        }
        if (
          globalFilters.sections.length > 0 &&
          !globalFilters.sections.includes(s.section)
        ) {
          return false;
        }
        if (globalFilters.searchQuery.trim()) {
          const q = globalFilters.searchQuery.toLowerCase();
          const matchName = s.name.toLowerCase().includes(q);
          const matchRoll = s.rollNumber.toLowerCase().includes(q);
          const matchEmail = s.email.toLowerCase().includes(q);
          if (!matchName && !matchRoll && !matchEmail) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (globalFilters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (globalFilters.sortBy === 'streak') {
          return b.streakDays - a.streakDays;
        }
        if (globalFilters.sortBy === 'activity') {
          return b.lastActiveDate.localeCompare(a.lastActiveDate);
        }
        return b.totalXp - a.totalXp;
      });
  }, [students, globalFilters]);


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
          studentSolvedProblems,
          unlockedTopicBatches,
          theme,
          navSection,
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
    studentSolvedProblems,
    unlockedTopicBatches,
    theme,
    navSection,
  ]);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const activeFaculty = facultyList.find((f) => f.id === activeFacultyId) || facultyList[0];

  // Real-time WebSocket Gateway (Students Only)
  useEffect(() => {
    if (role !== 'student') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${activeStudent.id}&role=student&campus=${activeStudent.campus}&year=${activeStudent.year}&section=${activeStudent.section}`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'notification' && msg.data) {
            setNotifications((prev) => [msg.data, ...prev]);
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (ws) ws.close();
    };
  }, [role, activeStudent.id, activeStudent.campus, activeStudent.year, activeStudent.section]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
    });
  };

  const closeRankProgressModal = () => setRankProgressModal(null);

  // Combined coding problems list
  const allCodingProblems = [
    ...ALL_INITIAL_CODING_CATALOG,
    ...CODING_PROBLEMS.filter(
      (cp) => !ALL_INITIAL_CODING_CATALOG.some((catalogP) => catalogP.id === cp.id)
    ),
    ...importedProblems,
  ];

  // Solve Coding Problem with instant XP, anti-gaming checks, and dynamic unlocked recommendations
  const solveCodingProblem = (studentId: string, problemId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, pointsAwarded: 0, message: 'Student not found.' };

    const solvedList = studentSolvedProblems[studentId] || [];
    if (solvedList.includes(problemId)) {
      return {
        success: false,
        pointsAwarded: 0,
        message: 'Problem has already been solved and verified. XP can only be earned once per problem.',
      };
    }

    // Daily Cap Check: maximum 10 verified problems per day
    const today = new Date().toISOString().split('T')[0];
    const todaySolvesCount = ledger.filter(
      (entry) =>
        entry.studentId === studentId &&
        entry.actionKey === 'solve_coding' &&
        entry.date === today &&
        entry.status === 'valid'
    ).length;

    if (todaySolvesCount >= 10) {
      return {
        success: false,
        pointsAwarded: 0,
        message: 'Daily coding cap reached (10 verified problems/day). Come back tomorrow to earn more XP!',
      };
    }

    const problem = allCodingProblems.find((p) => p.id === problemId);
    const difficulty = problem?.difficulty || 'medium';
    const xpReward = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 40;

    // Trigger XP Event
    const res = triggerXpEvent({
      eventId: `ev_solve_code_${problemId}_${Date.now()}`,
      studentId,
      actionKey: 'solve_coding',
      timestamp: new Date().toISOString(),
      metadata: {
        problemId,
        problemTitle: problem?.title || 'Algorithmic Problem',
        difficulty,
        verificationSource: 'MiraiQuest Automated Sandboxed Unit-Test Verifier',
      },
    });

    if (!res.success) {
      return {
        success: false,
        pointsAwarded: 0,
        message: res.rejectedReason || 'Verification check failed.',
      };
    }

    // Update solved list
    const updatedSolved = [...solvedList, problemId];
    setStudentSolvedProblems((prev) => ({
      ...prev,
      [studentId]: updatedSolved,
    }));

    // Update student's verified count
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              codingHandles: {
                ...s.codingHandles,
                verifiedProblemsCount: updatedSolved.length,
              },
            }
          : s
      )
    );

    triggerConfetti();

    // Check topic progression & find next recommended question in this topic
    const topicId = (problem as any)?.topicId || 'arrays';
    const topicProblems = allCodingProblems.filter((p: any) => p.topicId === topicId);
    const solvedInTopic = topicProblems.filter((p) => updatedSolved.includes(p.id));
    const nextUnsolved = topicProblems.find((p) => !updatedSolved.includes(p.id));

    // If student finished most of this topic (>= 60%), unlock harder batch
    if (topicProblems.length > 0 && solvedInTopic.length / topicProblems.length >= 0.6) {
      const currentBatch = unlockedTopicBatches[topicId] || 1;
      if (currentBatch < 2) {
        setUnlockedTopicBatches((prev) => ({
          ...prev,
          [topicId]: 2,
        }));
      }
    }

    return {
      success: true,
      pointsAwarded: res.pointsAwarded || xpReward,
      message: `Unit tests verified! Earned +${res.pointsAwarded || xpReward} XP for "${problem?.title}".`,
      nextProblemId: nextUnsolved?.id,
    };
  };

  const addCodingProblem = (problem: CodingProblem) => {
    setImportedProblems((prev) => [problem, ...prev]);
  };

  // Generate 10 AI Questions for a topic and put in Teacher Approval Queue
  const generateAiTopicQuestions = async (topicId: string, count: number = 10) => {
    try {
      const sampleTitles = [
        `Optimal ${topicId.toUpperCase()} Range Queries`,
        `Bi-directional ${topicId.toUpperCase()} Search`,
        `Monotonic ${topicId.toUpperCase()} Transformation`,
        `Partitioning Boundary for ${topicId.toUpperCase()}`,
        `Cyclic Invariants in ${topicId.toUpperCase()}`,
        `Amortized ${topicId.toUpperCase()} Window`,
        `Dynamic ${topicId.toUpperCase()} Memoization`,
        `Fast-Slow Pointer on ${topicId.toUpperCase()}`,
        `Multi-Threaded ${topicId.toUpperCase()} Queue`,
        `Matrix Coordinates in ${topicId.toUpperCase()}`,
      ];

      const newProblems: TopicProblemItem[] = sampleTitles.slice(0, count).map((title, idx) => ({
        id: `mq_ai_${topicId}_${Date.now()}_${idx}`,
        title,
        platform: 'leetcode',
        platformProblemNumber: `AI-${idx + 1}`,
        difficulty: idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard',
        xpReward: idx % 3 === 0 ? 10 : idx % 3 === 1 ? 20 : 40,
        category: topicId,
        tags: [topicId, 'AI-Generated', 'Pending Faculty Review'],
        description: `Collegiate-level algorithmic challenge targeting deep mastery of ${topicId}. Implement an optimal in-place solution with bounded memory usage.`,
        constraints: ['1 <= n <= 10^5', 'Runtime constraint: O(n log n) or better'],
        examples: [{ input: 'data = [1, 2, 3]', output: 'true', explanation: 'Satisfies algorithmic condition.' }],
        functionName: 'solve' + title.replace(/[^a-zA-Z]/g, ''),
        starterCode: {
          javascript: `function solve(input) {\n  // Implement solution\n  return true;\n}`,
          python: `def solve(input):\n    return True`,
          cpp: `// C++ implementation`,
          java: `// Java implementation`,
        },
        testCases: [
          {
            id: `tc_${idx}_1`,
            input: [[1, 2, 3]],
            inputFormatted: '[1, 2, 3]',
            expectedOutput: true,
            expectedOutputFormatted: 'true',
          },
        ],
        topicId,
        topicName: topicId.toUpperCase(),
        batch: 2,
        hints: ['Pay close attention to edge cases.', 'Consider time vs space trade-offs.'],
      }));

      // Add as pending questions in the question bank for teacher approval
      newProblems.forEach((p) => {
        addQuestion({
          subjectId: 'dsa',
          topic: `Coding: ${topicId.toUpperCase()}`,
          difficulty: p.difficulty,
          questionText: `[Coding Challenge] ${p.title}: ${p.description}`,
          options: [
            'O(n) Time, O(1) Extra Space',
            'O(n log n) Time, O(n) Space',
            'O(n^2) Brute Force',
            'O(2^n) Exponential Recursion',
          ],
          correctOptionIndex: 0,
          explanation: 'Optimal algorithmic paradigm balances time and space efficiency.',
          source: 'ai_generated',
          status: 'pending_approval',
          weekNumber: 4,
        });
        setImportedProblems((prev) => [p, ...prev]);
      });

      return {
        success: true,
        count: newProblems.length,
        message: `Generated ${newProblems.length} new topic questions for ${topicId}! Sent to the Faculty Approval Queue for verification before releasing to students.`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: err?.message || 'Failed to generate AI questions.',
      };
    }
  };

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
            setRankProgressModal({
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



  // Claim Daily Quiz
  const claimDailyQuizReward = (score: number, total: number, timeSpentArr: number[], subjectId: string) => {
    const now = new Date().toISOString();
    const event: XpEvent = {
      eventId: `ev_quiz_${Date.now()}`,
      studentId: activeStudentId,
      actionKey: 'daily_quiz',
      timestamp: now,
      metadata: {
        score,
        totalQuestions: total,
        subjectId,
        timePerQuestionSeconds: timeSpentArr,
        verificationSource: 'MiraiQuest In-App Quiz Engine',
      },
    };

    const res = triggerXpEvent(event);
    if (res.success) {
      triggerConfetti();
      return { success: true, xpEarned: res.pointsAwarded };
    }
    return { success: false, xpEarned: 0, reason: res.rejectedReason };
  };

  const addPeerPost = (title: string, body: string, subject: string, topic: string) => {
    const newPost: PeerHelpPost = {
      id: `post_${Date.now()}`,
      studentId: activeStudent.id,
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
          authorId: activeStudent.id,
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

  const addNotification = (notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const openProfileModal = (
    userId?: string,
    roleOverride?: 'student' | 'faculty' | 'admin',
    initialTab?: 'profile' | 'batchmates' | 'social' | 'account' | 'privacy' | 'appearance'
  ) => {
    const targetRole = roleOverride || role;
    setProfileModalRole(targetRole);
    if (userId) {
      setProfileModalUserId(userId);
    } else {
      if (targetRole === 'student') setProfileModalUserId(activeStudentId);
      else if (targetRole === 'faculty') setProfileModalUserId(activeFaculty.id);
      else setProfileModalUserId('admin_01');
    }
    setProfileActiveTab(initialTab || 'profile');
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const updateStudentProfile = async (
    studentId: string,
    updates: Partial<StudentProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/students/${studentId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
      );
      return { success: true };
    } catch {
      // Local fallback
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
      );
      return { success: true };
    }
  };

  const requestPhoneOtp = async (studentId: string, newPhoneNumber: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/request-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP request failed');
      return { success: true, message: data.message, mockOtp: data.mockOtp };
    } catch (e: any) {
      return { success: false, message: e.message || 'OTP request failed' };
    }
  };

  const verifyPhoneOtp = async (studentId: string, newPhoneNumber: string, otp: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhoneNumber, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid OTP code' };
      }
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, phoneNumber: newPhoneNumber } : s))
      );
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Verification error' };
    }
  };

  const updateFacultyProfile = async (
    facultyId: string,
    updates: Partial<FacultyProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/faculty/${facultyId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update faculty profile' };
      }
      setFacultyList((prev) =>
        prev.map((f) => (f.id === facultyId ? { ...f, ...updates } : f))
      );
      return { success: true };
    } catch {
      setFacultyList((prev) =>
        prev.map((f) => (f.id === facultyId ? { ...f, ...updates } : f))
      );
      return { success: true };
    }
  };

  const acceptPeerAnswer = async (
    postId: string,
    answerId: string
  ): Promise<{ success: boolean; message: string; xpAwarded?: number }> => {
    const post = peerPosts.find((p) => p.id === postId);
    if (!post) return { success: false, message: 'Doubt post not found.' };

    const answer = post.answers.find((a) => a.id === answerId);
    if (!answer) return { success: false, message: 'Answer not found.' };

    if (post.isLocked) {
      return { success: false, message: 'Choice is locked. XP has already been awarded.' };
    }

    const callerId = role === 'student' ? activeStudentId : activeFaculty.id;
    const isOwner = callerId === post.studentId;
    const isFaculty = role === 'faculty' || role === 'admin';

    if (!isOwner && !isFaculty) {
      return { success: false, message: 'Permission denied: Only the student who asked this doubt (or faculty) can accept an answer.' };
    }

    if (answer.authorId === post.studentId) {
      return { success: false, message: 'Invalid action: Asker cannot accept their own answer, and no self-help XP is allowed.' };
    }

    try {
      const response = await fetch('/api/peer-doubts/accept-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doubtId: postId,
          answerId,
          doubtOwnerId: post.studentId,
          answerAuthorId: answer.authorId,
          answerAuthorName: answer.authorName,
          callerId,
          callerRole: role,
          doubtTitle: post.title,
          isAlreadyLocked: post.isLocked || false,
          helperTodayAcceptedCount: 0,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Failed to accept answer.' };
      }

      // Reorder answers so accepted answer is on top!
      setPeerPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const updatedAnswers = p.answers.map((a) => ({
            ...a,
            isAccepted: a.id === answerId,
            xpAwarded: a.id === answerId ? data.pointsAwarded > 0 : false,
          }));
          // Sort accepted answer to top
          updatedAnswers.sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0));
          return {
            ...p,
            acceptedAnswerId: answerId,
            isLocked: true,
            answers: updatedAnswers,
          };
        })
      );

      // Award XP to helper if pointsAwarded > 0
      if (data.pointsAwarded > 0) {
        const ledgerId = `led_${Date.now()}_peer`;
        const newLedgerEntry: LedgerEntry = {
          id: ledgerId,
          studentId: answer.authorId,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          actionType: 'peer_help',
          actionKey: 'peer_help',
          sourceDescription: `Peer Help: "${post.title}"`,
          points: data.pointsAwarded,
          status: 'valid',
          verificationMetadata: {
            doubtId: post.id,
            doubtTitle: post.title,
            doubtLink: `/peer-help#post_${post.id}`,
            askerId: post.studentId,
            answerId,
          },
        };

        setLedger((prev) => [newLedgerEntry, ...prev]);

        // Update student XP, level, and increment acceptedAnswerCount
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id !== answer.authorId) return s;
            const newTotalXp = s.totalXp + data.pointsAwarded;
            const { level } = calculateLevelFromXp(newTotalXp);
            return {
              ...s,
              totalXp: newTotalXp,
              level,
              acceptedAnswerCount: (s.acceptedAnswerCount || 0) + 1,
            };
          })
        );
      } else {
        // Still increment acceptedAnswerCount for recognition
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id !== answer.authorId) return s;
            return {
              ...s,
              acceptedAnswerCount: (s.acceptedAnswerCount || 0) + 1,
            };
          })
        );
      }

      // Add notification for helper
      if (data.notification) {
        addNotification(data.notification);
      }

      // If collusion flag generated, add to auditFlags
      if (data.collusionFlag) {
        setAuditFlags((prev) => [data.collusionFlag, ...prev]);
      }

      return {
        success: true,
        message: data.pointsAwarded > 0
          ? `Answer accepted! +${data.pointsAwarded} XP awarded to ${answer.authorName}. Choice is locked.`
          : `Answer accepted! Daily cap reached for ${answer.authorName} (no additional XP). Choice is locked.`,
        xpAwarded: data.pointsAwarded,
      };
    } catch {
      // Offline fallback
      setPeerPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const updatedAnswers = p.answers.map((a) => ({
            ...a,
            isAccepted: a.id === answerId,
            xpAwarded: a.id === answerId,
          }));
          updatedAnswers.sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0));
          return {
            ...p,
            acceptedAnswerId: answerId,
            isLocked: true,
            answers: updatedAnswers,
          };
        })
      );

      const newLedgerEntry: LedgerEntry = {
        id: `led_${Date.now()}_peer`,
        studentId: answer.authorId,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        actionType: 'peer_help',
        actionKey: 'peer_help',
        sourceDescription: `Peer Help: "${post.title}"`,
        points: 15,
        status: 'valid',
        verificationMetadata: {
          doubtId: post.id,
          doubtTitle: post.title,
          doubtLink: `/peer-help#post_${post.id}`,
          askerId: post.studentId,
          answerId,
        },
      };

      setLedger((prev) => [newLedgerEntry, ...prev]);
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== answer.authorId) return s;
          const newTotalXp = s.totalXp + 15;
          const { level } = calculateLevelFromXp(newTotalXp);
          return {
            ...s,
            totalXp: newTotalXp,
            level,
            acceptedAnswerCount: (s.acceptedAnswerCount || 0) + 1,
          };
        })
      );

      return {
        success: true,
        message: `Answer accepted! +15 XP awarded to ${answer.authorName}. Choice is locked.`,
        xpAwarded: 15,
      };
    }
  };

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

  const redeemReward = (itemId: string) => {
    const item = rewardItems.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (activeStudent.coinsBalance < item.costCoins) {
      return { success: false, message: `Insufficient coins balance (${activeStudent.coinsBalance}/${item.costCoins})` };
    }
    if (item.stock <= 0) {
      return { success: false, message: 'Item is out of stock' };
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === activeStudentId
          ? { ...s, coinsBalance: s.coinsBalance - item.costCoins }
          : s
      )
    );

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

    return { success: true, message: `Redeemed ${item.title}! Voucher code sent to ${activeStudent.email}` };
  };

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
      return prev.map((student) => {
        const currentTierIndex = tierOrder.indexOf(student.league);
        let nextTier = student.league;

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
          weeklyXp: 0,
          leagueRank: Math.floor(Math.random() * 10) + 1,
        };
      });
    });

    triggerConfetti();
    return { promotedCount: promoted, relegatedCount: relegated };
  };

  const simulateBatchSubmissions = (count: number = 300) => {
    const queue: { id: string; teamId: string; points: number }[] = [];
    const idempotencySet = new Set<string>();
    let duplicates = 0;

    for (let i = 0; i < count; i++) {
      const isDup = i % 20 === 0;
      const key = isDup ? `idemp_dup_sim_${Math.floor(i / 20)}` : `idemp_unique_${i}_${Date.now()}`;

      if (idempotencySet.has(key)) {
        duplicates++;
      } else {
        idempotencySet.add(key);
        queue.push({
          id: `sim_sub_${i}`,
          teamId: ['team_hi_tech', 'team_rathinam', 'team_juj'][i % 3],
          points: [10, 20, 40][i % 3],
        });
      }
    }

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
      p95LatencyMs: 42,
    };
  };

  const simulateExternalCodingSync = (platform: 'leetcode' | 'codeforces' | 'github') => {
    const handle = activeStudent.codingHandles[platform] || 'active_student';
    const problemsAdded = 2;
    const now = new Date().toISOString();

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
    setStudentSolvedProblems({
      std_rahul_verma: ['mq_arrays_1', 'mq_arrays_3'],
      std_maya_sharma: ['mq_arrays_1', 'mq_arrays_2', 'mq_arrays_3', 'mq_strings_1', 'mq_hashing_1'],
      std_arjun_patel: ['mq_arrays_1'],
      std_sneha_kulkarni: ['mq_arrays_1', 'mq_strings_2'],
    });
    setUnlockedTopicBatches({ arrays: 1, strings: 1, hashing: 1 });
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
        effectiveTheme,
        isDark,
        setTheme,
        toggleTheme,
        importedProblems,
        allCodingProblems,
        studentSolvedProblems,
        unlockedTopicBatches,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        navSection,
        setNavSection,
        importCodingProblem,
        addCodingProblem,
        solveCodingProblem,
        generateAiTopicQuestions,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        gradeAssignmentSubmission,
        triggerXpEvent,
        updateRule,
        toggleRuleActive,
        voidLedgerEntry,
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
        rankProgressModal,
        closeRankProgressModal,
        triggerConfetti,
        globalFilters,
        setGlobalFilters,
        updateGlobalFilter,
        toggleCampusFilter,
        toggleYearFilter,
        toggleSectionFilter,
        clearGlobalFilters,
        filteredStudents,
        availableSections,
        notifications,
        addNotification,
        markNotificationAsRead,
        deleteNotification,
        markAllNotificationsAsRead,
        notificationPreferences,
        updateNotificationPreferences,
        studentDrafts,
        saveStudentDraft,
        batchImportQuestions,
        deleteQuestion,
        updateQuestion,
        antiCheatLogs,
        logAntiCheatEvent,
        autoSubmittedQuizzes,
        autoSubmitQuiz,
        grantQuizRetake,
        submitMcqAssignment,
        isProfileModalOpen,
        profileModalUserId,
        profileModalRole,
        profileActiveTab,
        setProfileActiveTab,
        openProfileModal,
        closeProfileModal,
        updateStudentProfile,
        requestPhoneOtp,
        verifyPhoneOtp,
        updateFacultyProfile,
        studentBgAnimationEnabled,
        setStudentBgAnimationEnabled,
        studentBgStyle,
        setStudentBgStyle,
        isFocusCriticalActive,
        setIsFocusCriticalActive,
        soundEffectsEnabled,
        setSoundEffectsEnabled,
        claimedRewardIds,
        activeChestReward,
        headerPulseTrigger,
        triggerChestReward,
        closeChestReward,
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
