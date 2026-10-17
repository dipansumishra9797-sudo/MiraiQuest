export type Campus = 'HI-Tech' | 'Rathinam' | 'JUJ';
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export interface GlobalFilterState {
  campuses: Campus[];
  years: AcademicYear[];
  sections: string[];
  subject: string;
  searchQuery: string;
  sortBy: 'name' | 'xp' | 'streak' | 'activity';
}


export type UserRole = 'student' | 'faculty' | 'admin';

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type XpSourceType =
  | 'attendance'
  | 'classwork'
  | 'homework'
  | 'quiz'
  | 'test'
  | 'coding'
  | 'club'
  | 'streak'
  | 'peer_help'
  | 'boss_battle';

export interface XpRule {
  id: string;
  actionKey: string;
  label: string;
  category: 'academic' | 'practice' | 'engagement' | 'collaboration';
  xpValue: number;
  dailyCap: number; // Maximum times per day or max points
  active: boolean;
  description: string;
  verificationSource: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface RuleAuditLog {
  id: string;
  ruleId: string;
  actionKey: string;
  changedBy: string;
  timestamp: string;
  oldValue: number;
  newValue: number;
  field: string;
}

export interface LedgerEntry {
  id: string;
  studentId: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  actionType: XpSourceType;
  actionKey: string;
  sourceDescription: string;
  points: number;
  status: 'valid' | 'voided';
  voidedReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  verificationMetadata?: Record<string, any>;
}

export interface StudentSocialLinks {
  linkedin?: string;
  github?: string;
  leetcode?: string;
  portfolio?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  nickname?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  skills?: string[];
  rollNumber: string;
  campus: Campus;
  year: AcademicYear;
  section: string; // e.g. "CS-A", "CS-B", "IT-A"
  avatar: string;
  anonymousNickname: string;
  isAnonymous: boolean;
  optOutOfLeaderboards: boolean;
  shareSocialLinksWithBatchmates?: boolean;
  acceptedAnswerCount?: number;
  
  // Progression
  totalXp: number;
  level: number;
  coinsBalance: number; // Separate from XP!

  // Streak
  streakDays: number;
  streakFreezesRemaining: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakCalendar: string[]; // List of completed dates YYYY-MM-DD

  // League
  league: LeagueTier;
  leagueRank: number;
  weeklyXp: number;
  previousWeeklyXp: number; // for personal best calculation

  // Badges & Quests
  unlockedBadgeIds: string[];
  completedQuestIds: string[];

  // External practice handles & Social links
  socialLinks?: StudentSocialLinks;
  codingHandles: {
    leetcode?: string;
    codeforces?: string;
    github?: string;
    verifiedProblemsCount: number;
  };
}

export interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  campus: Campus;
  department: string;
  assignedSections: string[];
  subjects: string[];
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  socialLinks?: StudentSocialLinks;
}

export interface Question {
  id: string;
  subjectId: string; // 'dsa' | 'python'
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  source: 'curated' | 'faculty_upload' | 'ai_generated';
  status: 'approved' | 'pending_approval' | 'rejected';
  weekNumber: number;
  createdAt: string;
  reviewedBy?: string;
}

export interface SyllabusWeek {
  weekNumber: number;
  topic: string;
  isTaught: boolean;
  learningObjectives: string[];
}

export interface SubjectSyllabus {
  id: string;
  name: string;
  code: string;
  facultyInCharge: string;
  weeks: SyllabusWeek[];
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  score: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }[];
  xpEarned: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: 'milestone' | 'improvement' | 'streak' | 'mastery' | 'boss';
  icon: string;
  xpReward: number;
  conditionDescription: string;
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  topic: string;
  subject: string;
  description: string;
  targetCount: number;
  currentProgress: number;
  rewardXp: number;
  rewardBadgeId?: string;
  isCompleted: boolean;
  expiresInDays?: number;
}

export interface TeamBattleTeam {
  teamId: string;
  teamName: string;
  campusOrSection: string;
  totalRawXp: number;
  participantCount: number;
  eligibleStudentCount: number;
  normalizedScore: number;
}

export interface TeamBattleSubmission {
  id: string;
  studentId: string;
  studentName: string;
  teamId: string;
  problemTitle: string;
  points: number;
  timestamp: string;
}

export interface TeamBattle {
  id: string;
  title: string;
  description: string;
  type: 'section_vs_section' | 'campus_vs_campus';
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'completed';
  teams: TeamBattleTeam[];
  recentSubmissions: TeamBattleSubmission[];
  normalizationFormulaDescription: string;
}

export interface BattleMvpAward {
  studentId: string;
  studentName: string;
  campusOrSection: string;
  mvpTitle: string;
  xpAwarded: number;
  problemsSolved: number;
  highlightReason: string;
}

export interface PastTeamBattleMatch {
  id: string;
  title: string;
  date: string;
  type: 'section_vs_section' | 'campus_vs_campus';
  winnerTeam: {
    name: string;
    score: number;
    campusOrSection: string;
  };
  runnerUpTeam: {
    name: string;
    score: number;
    campusOrSection: string;
  };
  totalXpPoolAwarded: number;
  winnerXpBonusPerStudent: number;
  mvps: BattleMvpAward[];
  summaryNote: string;
}

export interface PeerHelpAnswer {
  id: string;
  authorId: string;
  authorName: string;
  authorCampus: Campus;
  body: string;
  timestamp: string;
  isAccepted: boolean;
  xpAwarded?: boolean;
}

export interface PeerHelpPost {
  id: string;
  studentId: string;
  authorName: string;
  authorCampus: Campus;
  title: string;
  body: string;
  subject: string;
  topic: string;
  timestamp: string;
  acceptedAnswerId?: string;
  isLocked?: boolean;
  answers: PeerHelpAnswer[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'peer_accept' | 'streak' | 'assignment' | 'nudge';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  category: 'voucher' | 'merch' | 'mentor' | 'privilege';
  costCoins: number;
  stock: number;
  description: string;
  icon: string;
}

export interface RewardRedemption {
  id: string;
  studentId: string;
  studentName: string;
  itemId: string;
  itemTitle: string;
  costCoins: number;
  timestamp: string;
  status: 'approved' | 'pending' | 'delivered';
}

export interface AuditFlag {
  id: string;
  studentId: string;
  studentName: string;
  campus: Campus;
  timestamp: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
  suggestedAction: string;
  status: 'pending' | 'voided' | 'dismissed';
  flaggedLedgerEntryId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  campus: Campus | 'All Campuses';
  section: string; // e.g. "All Sections", "CS-A", "CS-B"
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  pointsXp: number;
  description: string;
  instructions: string[];
  type: 'coding' | 'lab_report' | 'homework';
  platformLink?: string; // e.g. LeetCode / HackerRank / Codeforces URL or Problem ID
  problemId?: string; // Linked coding problem id if type === 'coding'
  starterCode?: string;
  language?: string;
  attachments?: { name: string; size: string; type: string }[];
  createdByName: string;
  createdAt: string;
  status: 'published' | 'draft' | 'archived';
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  campus: Campus;
  section: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number; // XP points awarded
  maxPoints: number;
  feedback?: string;
  submissionCode?: string;
  submissionText?: string;
  fileName?: string;
  gradedBy?: string;
  gradedAt?: string;
}

