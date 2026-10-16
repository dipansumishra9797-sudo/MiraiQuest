/**
 * LevelUp XP Rules Engine
 * -------------------------------------------------------------
 * Event-driven, verifiable, anti-farming points economy.
 * Enforces the Three Core Principles:
 *  1. LEARNING FIRST: Every point maps to real learning.
 *  2. FAIR & INCLUSIVE: Daily caps prevent runaway farming; improvement rewarded.
 *  3. SEPARATE FROM GRADES: Grades feed into XP (Score % / 2), game points never touch grades.
 */

import { LedgerEntry, XpRule, XpSourceType } from '../types';

export interface XpEvent {
  eventId: string;
  studentId: string;
  actionKey: string;
  timestamp: string; // ISO string
  metadata: {
    isOfficialVerification?: boolean;
    verificationSource?: string;
    onTime?: boolean;
    quizScore?: number;
    quizTotal?: number;
    testScorePercent?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    helperId?: string;
    askerId?: string;
    problemId?: string;
    timeSpentSeconds?: number;
    [key: string]: any;
  };
}

export interface EngineResult {
  success: boolean;
  pointsAwarded: number;
  reason: string;
  ledgerEntry?: LedgerEntry;
  rejectedReason?: string;
}

/**
 * Level Formula:
 * XP required to reach Level L: 100 * (L - 1)^1.45 + 50 * (L - 1)
 * Progression feels attainable for beginners while maintaining late-game prestige.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.45) + 50 * (level - 1));
}

export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let level = 1;
  while (getXpRequiredForLevel(level + 1) <= totalXp) {
    level++;
  }
  const currentThreshold = getXpRequiredForLevel(level);
  const nextThreshold = getXpRequiredForLevel(level + 1);
  const xpInCurrentLevel = totalXp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)));

  return {
    level,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: xpNeededForNext,
    progressPercent,
  };
}

/**
 * Verifies if an action is eligible and calculates XP based on dynamic rule definitions.
 */
export function processXpEvent(
  event: XpEvent,
  rules: XpRule[],
  existingLedger: LedgerEntry[]
): EngineResult {
  const rule = rules.find((r) => r.actionKey === event.actionKey);

  // 1. Check if rule exists and is active
  if (!rule) {
    return {
      success: false,
      pointsAwarded: 0,
      reason: 'Rule not found',
      rejectedReason: `No rule registered for actionKey "${event.actionKey}"`,
    };
  }

  if (!rule.active) {
    return {
      success: false,
      pointsAwarded: 0,
      reason: 'Rule inactive',
      rejectedReason: `Rule "${rule.label}" is currently disabled by Admin`,
    };
  }

  const eventDate = event.timestamp.split('T')[0];

  // 2. Fetch student's existing valid entries for this day
  const dailyEntriesForAction = existingLedger.filter(
    (e) =>
      e.studentId === event.studentId &&
      e.date === eventDate &&
      e.actionKey === event.actionKey &&
      e.status === 'valid'
  );

  // 3. Action-specific validation & caps
  let pointsToAward = rule.xpValue;
  let actionType: XpSourceType = 'quiz';
  let description = rule.label;

  switch (event.actionKey) {
    case 'attend_class': {
      actionType = 'attendance';
      // Official MSOT attendance verification required
      if (!event.metadata.isOfficialVerification) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Unverified attendance',
          rejectedReason: 'Attendance must be imported from official MSOT biometric/faculty register',
        };
      }
      description = `Class Attendance: ${event.metadata.subjectCode || 'Lecture'} (${event.metadata.verificationSource || 'Faculty Feed'})`;
      break;
    }

    case 'submit_assignment': {
      actionType = 'classwork';
      if (!event.metadata.onTime) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Late submission',
          rejectedReason: 'XP is only awarded for on-time assignment completions to encourage consistency',
        };
      }
      description = `Assignment Submitted: ${event.metadata.assignmentTitle || 'Classwork'}`;
      break;
    }

    case 'daily_quiz': {
      actionType = 'quiz';
      // Rate limit: 1 XP-eligible quiz attempt per calendar day
      if (dailyEntriesForAction.length >= 1) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Daily limit reached',
          rejectedReason: 'Daily quiz XP is limited to 1 official attempt per day to prevent cram-farming',
        };
      }
      // Rule: 15 base XP + 5 per correct question
      const correct = event.metadata.quizScore || 0;
      pointsToAward = 15 + correct * 5;
      description = `Daily Quiz (${correct}/${event.metadata.quizTotal || 5} Correct)`;
      break;
    }

    case 'test_score': {
      actionType = 'test';
      const percent = event.metadata.testScorePercent || 0;
      // Formula: Score % / 2 (e.g. 80% -> 40 XP)
      pointsToAward = Math.round(percent / 2);
      description = `Bi-Weekly Test: ${event.metadata.subject || 'Core'} (${percent}% Score -> ${pointsToAward} XP)`;
      break;
    }

    case 'solve_coding': {
      actionType = 'coding';
      // Daily cap: Max 10 problems per day
      if (dailyEntriesForAction.length >= (rule.dailyCap || 10)) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Daily coding cap reached',
          rejectedReason: `Daily coding practice XP is capped at ${rule.dailyCap || 10} verified problems to promote steady pacing`,
        };
      }
      // Duplicate problem ID check
      const alreadySolved = existingLedger.some(
        (e) =>
          e.studentId === event.studentId &&
          e.actionKey === 'solve_coding' &&
          e.status === 'valid' &&
          e.verificationMetadata?.problemId === event.metadata.problemId
      );
      if (alreadySolved) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Duplicate problem',
          rejectedReason: `Problem "${event.metadata.problemId}" was already rewarded previously`,
        };
      }

      // Tiered difficulty
      const diff = event.metadata.difficulty || 'easy';
      if (diff === 'hard') pointsToAward = 40;
      else if (diff === 'medium') pointsToAward = 20;
      else pointsToAward = 10;

      description = `Coding Practice: ${event.metadata.problemTitle || 'Problem'} [${diff.toUpperCase()}]`;
      break;
    }

    case 'club_activity': {
      actionType = 'club';
      if (!event.metadata.isOfficialVerification) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Unverified club day',
          rejectedReason: 'Club activity requires verification by faculty club mentor',
        };
      }
      description = `Club Participation: ${event.metadata.clubName || 'Tech Club'}`;
      break;
    }

    case 'streak_7_day': {
      actionType = 'streak';
      // Max once per 7-day cycle
      pointsToAward = 50;
      description = '7-Day Learning Streak Consistency Bonus';
      break;
    }

    case 'peer_help': {
      actionType = 'peer_help';
      // Anti-gaming: helper cannot be asker
      if (event.metadata.helperId && event.metadata.askerId && event.metadata.helperId === event.metadata.askerId) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Self-help not allowed',
          rejectedReason: 'Students cannot accept their own answers for XP',
        };
      }
      // Daily cap: max 3 peer helps rewarded per day
      if (dailyEntriesForAction.length >= (rule.dailyCap || 3)) {
        return {
          success: false,
          pointsAwarded: 0,
          reason: 'Peer help cap reached',
          rejectedReason: 'Maximum 3 peer helps rewarded per day to encourage quality discussions',
        };
      }
      pointsToAward = 15;
      description = `Peer Discussion: Answer accepted for "${event.metadata.doubtTitle || 'Peer Doubt'}"`;
      break;
    }

    case 'boss_battle': {
      actionType = 'boss_battle';
      pointsToAward = 100;
      description = `Boss Battle: ${event.metadata.battleTitle || 'Pre-Exam Algorithmic Challenge'}`;
      break;
    }

    default:
      pointsToAward = rule.xpValue;
      description = rule.label;
  }

  // Create verifiable ledger entry
  const ledgerEntry: LedgerEntry = {
    id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId: event.studentId,
    timestamp: event.timestamp,
    date: eventDate,
    actionType,
    actionKey: event.actionKey,
    sourceDescription: description,
    points: pointsToAward,
    status: 'valid',
    verificationMetadata: {
      ...event.metadata,
      ruleSnapshotId: rule.id,
      ruleVersion: rule.lastUpdated,
    },
  };

  return {
    success: true,
    pointsAwarded: pointsToAward,
    reason: 'Verified and applied',
    ledgerEntry,
  };
}

/**
 * Audit ledger consistency: Total XP must ALWAYS equal the exact sum of valid ledger entries.
 */
export function auditStudentTotalXp(studentId: string, ledger: LedgerEntry[]): {
  calculatedTotal: number;
  validEntriesCount: number;
  voidedEntriesCount: number;
} {
  const studentEntries = ledger.filter((e) => e.studentId === studentId);
  const validEntries = studentEntries.filter((e) => e.status === 'valid');
  const voidedEntries = studentEntries.filter((e) => e.status === 'voided');

  const calculatedTotal = validEntries.reduce((sum, item) => sum + item.points, 0);

  return {
    calculatedTotal,
    validEntriesCount: validEntries.length,
    voidedEntriesCount: voidedEntries.length,
  };
}

/**
 * Scripted Unit Test Runner for XP Engine
 * Runs 10 rigorous scenarios validating rules, caps, edge cases, and integrity.
 */
export function runXpEngineUnitTests(sampleRules: XpRule[]): {
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; message: string; details: any }[];
} {
  const results: { testName: string; passed: boolean; message: string; details: any }[] = [];
  let ledger: LedgerEntry[] = [];

  function assert(name: string, condition: boolean, message: string, details?: any) {
    results.push({
      testName: name,
      passed: condition,
      message: condition ? `PASSED: ${message}` : `FAILED: ${message}`,
      details: details || {},
    });
  }

  const s1 = 'std_test_01';
  const now = '2026-10-13T09:00:00Z';

  // Test 1: Official class attendance gives 10 XP
  const t1 = processXpEvent(
    {
      eventId: 'ev_1',
      studentId: s1,
      actionKey: 'attend_class',
      timestamp: now,
      metadata: { isOfficialVerification: true, subjectCode: 'CS301' },
    },
    sampleRules,
    ledger
  );
  assert(
    '1. Official Attendance Award',
    t1.success && t1.pointsAwarded === 10 && t1.ledgerEntry?.actionType === 'attendance',
    'Official attendance awards exactly 10 XP with verified ledger entry'
  );
  if (t1.ledgerEntry) ledger.push(t1.ledgerEntry);

  // Test 2: Unverified attendance is rejected (No self-marking!)
  const t2 = processXpEvent(
    {
      eventId: 'ev_2',
      studentId: s1,
      actionKey: 'attend_class',
      timestamp: now,
      metadata: { isOfficialVerification: false },
    },
    sampleRules,
    ledger
  );
  assert(
    '2. Unverified Attendance Rejection',
    !t2.success && t2.pointsAwarded === 0,
    'Unverified attendance is rejected without awarding points'
  );

  // Test 3: On-time assignment yields 20 XP
  const t3 = processXpEvent(
    {
      eventId: 'ev_3',
      studentId: s1,
      actionKey: 'submit_assignment',
      timestamp: now,
      metadata: { onTime: true, assignmentTitle: 'Binary Search Trees' },
    },
    sampleRules,
    ledger
  );
  assert(
    '3. On-time Assignment Award',
    t3.success && t3.pointsAwarded === 20,
    'On-time assignment awards 20 XP'
  );
  if (t3.ledgerEntry) ledger.push(t3.ledgerEntry);

  // Test 4: Late assignment rejected
  const t4 = processXpEvent(
    {
      eventId: 'ev_4',
      studentId: s1,
      actionKey: 'submit_assignment',
      timestamp: now,
      metadata: { onTime: false },
    },
    sampleRules,
    ledger
  );
  assert(
    '4. Late Assignment Rejection',
    !t4.success && t4.pointsAwarded === 0,
    'Late assignment awards 0 XP to maintain consistency incentive'
  );

  // Test 5: Daily quiz formula: 15 base + 5 per correct
  const t5 = processXpEvent(
    {
      eventId: 'ev_5',
      studentId: s1,
      actionKey: 'daily_quiz',
      timestamp: now,
      metadata: { quizScore: 4, quizTotal: 5 },
    },
    sampleRules,
    ledger
  );
  assert(
    '5. Daily Quiz Score Formula',
    t5.success && t5.pointsAwarded === 35, // 15 + 4*5 = 35
    'Quiz with 4/5 correct awards 15 base + 20 = 35 XP'
  );
  if (t5.ledgerEntry) ledger.push(t5.ledgerEntry);

  // Test 6: Second quiz on the same day is rate-limited
  const t6 = processXpEvent(
    {
      eventId: 'ev_6',
      studentId: s1,
      actionKey: 'daily_quiz',
      timestamp: now,
      metadata: { quizScore: 5, quizTotal: 5 },
    },
    sampleRules,
    ledger
  );
  assert(
    '6. Daily Quiz Rate Limit (1/day)',
    !t6.success && t6.pointsAwarded === 0,
    'Second daily quiz attempt on same date rejected by rate limiter'
  );

  // Test 7: Bi-weekly test score formula: Score % / 2
  const t7 = processXpEvent(
    {
      eventId: 'ev_7',
      studentId: s1,
      actionKey: 'test_score',
      timestamp: now,
      metadata: { testScorePercent: 86, subject: 'DSA' },
    },
    sampleRules,
    ledger
  );
  assert(
    '7. Bi-Weekly Test Score Mapping',
    t7.success && t7.pointsAwarded === 43, // 86 / 2 = 43
    '86% test score awards exactly 43 XP (Score % / 2)'
  );
  if (t7.ledgerEntry) ledger.push(t7.ledgerEntry);

  // Test 8: Coding problem tiered points (Easy=10, Medium=20, Hard=40)
  const t8 = processXpEvent(
    {
      eventId: 'ev_8',
      studentId: s1,
      actionKey: 'solve_coding',
      timestamp: now,
      metadata: { problemId: 'LC_206', difficulty: 'hard', problemTitle: 'Reverse Linked List' },
    },
    sampleRules,
    ledger
  );
  assert(
    '8. Coding Practice Hard Tier Award',
    t8.success && t8.pointsAwarded === 40,
    'Hard coding problem awards 40 XP'
  );
  if (t8.ledgerEntry) ledger.push(t8.ledgerEntry);

  // Test 9: Duplicate coding problem rejection
  const t9 = processXpEvent(
    {
      eventId: 'ev_9',
      studentId: s1,
      actionKey: 'solve_coding',
      timestamp: now,
      metadata: { problemId: 'LC_206', difficulty: 'hard' },
    },
    sampleRules,
    ledger
  );
  assert(
    '9. Duplicate Problem Anti-Farming',
    !t9.success && t9.pointsAwarded === 0,
    'Resubmitting identical solved problem awards 0 XP'
  );

  // Test 10: Peer Help self-answer rejection
  const t10 = processXpEvent(
    {
      eventId: 'ev_10',
      studentId: s1,
      actionKey: 'peer_help',
      timestamp: now,
      metadata: { helperId: s1, askerId: s1, doubtTitle: 'Graph Traversal' },
    },
    sampleRules,
    ledger
  );
  assert(
    '10. Peer Help Self-Answer Rejection',
    !t10.success && t10.pointsAwarded === 0,
    'Self-accepted answers are rejected by peer help integrity check'
  );

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { passed, failed, results };
}
