import { describe, it, expect } from 'vitest';
import {
  getXpRequiredForLevel,
  calculateLevelFromXp,
  processXpEvent,
  auditStudentTotalXp,
  XpEvent,
} from '../src/modules/xpEngine';
import { INITIAL_RULES, INITIAL_STUDENTS, INITIAL_LEDGER } from '../src/data/mockData';

describe('XP Engine & Progression Formulas', () => {
  it('calculates level progression thresholds accurately according to formula 100*(L-1)^1.45 + 50*(L-1)', () => {
    expect(getXpRequiredForLevel(1)).toBe(0);
    expect(getXpRequiredForLevel(2)).toBe(150); // 100*(1) + 50 = 150
    expect(getXpRequiredForLevel(3)).toBeGreaterThan(150);
    expect(getXpRequiredForLevel(5)).toBeGreaterThan(getXpRequiredForLevel(4));
  });

  it('calculates current level, current level XP, next level XP, and progress percentage', () => {
    const resLvl1 = calculateLevelFromXp(75);
    expect(resLvl1.level).toBe(1);
    expect(resLvl1.currentLevelXp).toBe(75);
    expect(resLvl1.progressPercent).toBe(50); // 75 / 150 = 50%

    const resLvl2 = calculateLevelFromXp(200);
    expect(resLvl2.level).toBe(2);
    expect(resLvl2.currentLevelXp).toBe(50); // 200 - 150 = 50
  });

  it('enforces attendance verification requiring official biometric/faculty feed', () => {
    const eventUnverified: XpEvent = {
      eventId: 'ev_att_1',
      studentId: 'std_rahul_verma',
      actionKey: 'attend_class',
      timestamp: '2026-10-20T09:00:00Z',
      metadata: { isOfficialVerification: false },
    };
    const res1 = processXpEvent(eventUnverified, INITIAL_RULES, []);
    expect(res1.success).toBe(false);
    expect(res1.rejectedReason).toContain('official MSOT biometric');

    const eventVerified: XpEvent = {
      eventId: 'ev_att_2',
      studentId: 'std_rahul_verma',
      actionKey: 'attend_class',
      timestamp: '2026-10-20T09:00:00Z',
      metadata: { isOfficialVerification: true, subjectCode: 'CS301' },
    };
    const res2 = processXpEvent(eventVerified, INITIAL_RULES, []);
    expect(res2.success).toBe(true);
    expect(res2.pointsAwarded).toBe(10);
  });

  it('rejects late assignment submissions for XP rewards', () => {
    const eventLate: XpEvent = {
      eventId: 'ev_asgn_1',
      studentId: 'std_rahul_verma',
      actionKey: 'submit_assignment',
      timestamp: '2026-10-20T10:00:00Z',
      metadata: { onTime: false },
    };
    const res = processXpEvent(eventLate, INITIAL_RULES, []);
    expect(res.success).toBe(false);
    expect(res.rejectedReason).toContain('on-time assignment completions');
  });

  it('calculates daily quiz rewards: 15 base XP + 5 XP per correct question', () => {
    const eventQuiz: XpEvent = {
      eventId: 'ev_quiz_1',
      studentId: 'std_rahul_verma',
      actionKey: 'daily_quiz',
      timestamp: '2026-10-20T11:00:00Z',
      metadata: { quizScore: 4, quizTotal: 5 },
    };
    const res = processXpEvent(eventQuiz, INITIAL_RULES, []);
    expect(res.success).toBe(true);
    expect(res.pointsAwarded).toBe(35); // 15 + 4*5 = 35
  });

  it('calculates bi-weekly official test marks as Test Score % / 2', () => {
    const eventTest: XpEvent = {
      eventId: 'ev_test_1',
      studentId: 'std_rahul_verma',
      actionKey: 'test_score',
      timestamp: '2026-10-20T12:00:00Z',
      metadata: { testScorePercent: 80, subject: 'DSA' },
    };
    const res = processXpEvent(eventTest, INITIAL_RULES, []);
    expect(res.success).toBe(true);
    expect(res.pointsAwarded).toBe(40); // 80 / 2 = 40
  });

  it('awards tiered coding practice XP and enforces duplicate prevention', () => {
    const eventCodingEasy: XpEvent = {
      eventId: 'ev_code_1',
      studentId: 'std_rahul_verma',
      actionKey: 'solve_coding',
      timestamp: '2026-10-20T13:00:00Z',
      metadata: { problemId: 'lc_1', difficulty: 'easy' },
    };
    const res1 = processXpEvent(eventCodingEasy, INITIAL_RULES, []);
    expect(res1.success).toBe(true);
    expect(res1.pointsAwarded).toBe(10);

    // Hard difficulty awards 40
    const eventCodingHard: XpEvent = {
      eventId: 'ev_code_2',
      studentId: 'std_rahul_verma',
      actionKey: 'solve_coding',
      timestamp: '2026-10-20T13:10:00Z',
      metadata: { problemId: 'lc_hard_1', difficulty: 'hard' },
    };
    const resHard = processXpEvent(eventCodingHard, INITIAL_RULES, []);
    expect(resHard.pointsAwarded).toBe(40);

    // Duplicate submission of same problem
    const existingLedger = [
      {
        id: 'led_1',
        studentId: 'std_rahul_verma',
        actionKey: 'solve_coding',
        actionType: 'coding' as const,
        sourceDescription: 'Two Sum',
        points: 10,
        timestamp: '2026-10-20T13:00:00Z',
        date: '2026-10-20',
        status: 'valid' as const,
        verificationMetadata: { problemId: 'lc_1' },
      },
    ];
    const resDup = processXpEvent(eventCodingEasy, INITIAL_RULES, existingLedger);
    expect(resDup.success).toBe(false);
    expect(resDup.rejectedReason).toContain('already rewarded previously');
  });

  it('enforces peer help XP rules: +15 XP for accepted answer, self-answers strictly blocked', () => {
    // Self-answer test
    const eventSelf: XpEvent = {
      eventId: 'ev_peer_self',
      studentId: 'std_rahul_verma',
      actionKey: 'peer_help',
      timestamp: '2026-10-20T14:00:00Z',
      metadata: { helperId: 'std_rahul_verma', askerId: 'std_rahul_verma' },
    };
    const resSelf = processXpEvent(eventSelf, INITIAL_RULES, []);
    expect(resSelf.success).toBe(false);
    expect(resSelf.rejectedReason).toContain('own answers');

    // Valid peer answer
    const eventPeer: XpEvent = {
      eventId: 'ev_peer_valid',
      studentId: 'std_maya_sharma',
      actionKey: 'peer_help',
      timestamp: '2026-10-20T14:15:00Z',
      metadata: { helperId: 'std_maya_sharma', askerId: 'std_rahul_verma' },
    };
    const resPeer = processXpEvent(eventPeer, INITIAL_RULES, []);
    expect(resPeer.success).toBe(true);
    expect(resPeer.pointsAwarded).toBe(15);
  });

  it('validates that every seeded student has totalXp strictly equal to their valid ledger entries sum', () => {
    INITIAL_STUDENTS.forEach((student) => {
      const audit = auditStudentTotalXp(student.id, INITIAL_LEDGER);
      expect(audit.calculatedTotal).toBe(student.totalXp);
    });
  });
});
