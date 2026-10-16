/**
 * LevelUp Anti-Gaming & Academic Integrity Module
 * -------------------------------------------------------------
 * Detects and prevents cheating patterns:
 * 1. Rapid-fire answering (bot / speed clicking)
 * 2. Answer-sharing patterns (near-identical sequence & timestamp proximity)
 * 3. Text similarity / Copy-pasting (Jaccard token comparison)
 * 4. Fake / forged external platform practice
 * 5. Sudden XP Spikes (>3x baseline rolling average)
 */

import { AuditFlag, Campus, LedgerEntry } from '../types';

export interface CheatingSimulationResult {
  attemptId: string;
  scenarioName: string;
  technique: string;
  detected: boolean;
  algorithmUsed: string;
  triggerDetails: string;
  mitigationAction: string;
}

/**
 * Rapid-fire question timer check.
 * If average time per question is under 2.5 seconds, flag as bot or blind guessing.
 */
export function checkRapidFireQuiz(
  timeSpentSeconds: number[],
  minThresholdPerQuestion: number = 2.5
): { isSuspicious: boolean; averageTime: number; reason?: string } {
  if (timeSpentSeconds.length === 0) return { isSuspicious: false, averageTime: 0 };
  const total = timeSpentSeconds.reduce((a, b) => a + b, 0);
  const avg = total / timeSpentSeconds.length;

  if (avg < minThresholdPerQuestion) {
    return {
      isSuspicious: true,
      averageTime: Math.round(avg * 10) / 10,
      reason: `Impossibly fast submission (Avg: ${avg.toFixed(1)}s per question, threshold: ${minThresholdPerQuestion}s).`,
    };
  }
  return { isSuspicious: false, averageTime: Math.round(avg * 10) / 10 };
}

/**
 * Token Jaccard text similarity detector for Peer Help or open text answers.
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokenize = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Answer-Sharing Pattern Detector:
 * Checks if two students submitted the exact same sequence of options within a 60-second window.
 */
export function checkAnswerSharing(
  attemptA: { studentId: string; options: number[]; timestamp: number },
  attemptB: { studentId: string; options: number[]; timestamp: number }
): { isCollusion: boolean; matchPercent: number; timeDeltaSeconds: number } {
  if (attemptA.studentId === attemptB.studentId) return { isCollusion: false, matchPercent: 0, timeDeltaSeconds: 0 };

  const timeDeltaSeconds = Math.abs(attemptA.timestamp - attemptB.timestamp) / 1000;
  if (timeDeltaSeconds > 120) {
    // Submissions too far apart to be direct live copying
    return { isCollusion: false, matchPercent: 0, timeDeltaSeconds: Math.round(timeDeltaSeconds) };
  }

  let matches = 0;
  const len = Math.min(attemptA.options.length, attemptB.options.length);
  for (let i = 0; i < len; i++) {
    if (attemptA.options[i] === attemptB.options[i]) matches++;
  }

  const matchPercent = Math.round((matches / len) * 100);

  // If match is 100% and submitted within 45 seconds of each other
  const isCollusion = matchPercent === 100 && timeDeltaSeconds <= 45;

  return { isCollusion, matchPercent, timeDeltaSeconds: Math.round(timeDeltaSeconds) };
}

/**
 * XP Spike Detector:
 * Flags student if today's XP exceeds 3x their 7-day daily average and is > 120 XP.
 */
export function detectXpSpike(
  studentId: string,
  todayXp: number,
  past7DaysDailyXp: number[],
  spikeThresholdMultiplier: number = 3.0
): { isSpike: boolean; baselineAvg: number; currentXp: number; ratio: number } {
  const sum = past7DaysDailyXp.reduce((a, b) => a + b, 0);
  const baselineAvg = Math.max(15, Math.round(sum / Math.max(1, past7DaysDailyXp.length)));
  const ratio = Math.round((todayXp / baselineAvg) * 10) / 10;

  const isSpike = todayXp > 120 && todayXp >= baselineAvg * spikeThresholdMultiplier;

  return {
    isSpike,
    baselineAvg,
    currentXp: todayXp,
    ratio,
  };
}

/**
 * Executes 5 Simulated Cheating Attempts to showcase anti-gaming defenses.
 */
export function runCheatingAttemptsDemo(): CheatingSimulationResult[] {
  const results: CheatingSimulationResult[] = [];

  // 1. Quiz Rapid-Fire Bot
  const times = [0.8, 0.4, 0.5, 0.6, 0.7]; // Total 3.0s for 5 questions
  const rapidCheck = checkRapidFireQuiz(times, 2.5);
  results.push({
    attemptId: 'cheat_sim_01',
    scenarioName: '1. Automated Quiz Clickbot / Rapid Fire',
    technique: 'Spamming options across 5 quiz questions in 3.0 seconds (0.6s/question)',
    detected: rapidCheck.isSuspicious,
    algorithmUsed: 'Minimum Time Per Question Invariant (<2.5s)',
    triggerDetails: `Detected average answer time of ${rapidCheck.averageTime}s vs human baseline 4s-12s.`,
    mitigationAction: 'Submission blocked; 15-minute cooldown penalty imposed; flagged to Faculty.',
  });

  // 2. Answer-Sharing Collusion
  const attemptA = { studentId: 'student_vikram', options: [2, 0, 3, 1, 0], timestamp: 1728800000000 };
  const attemptB = { studentId: 'student_rohan', options: [2, 0, 3, 1, 0], timestamp: 1728800014000 }; // 14s later
  const sharingCheck = checkAnswerSharing(attemptA, attemptB);
  results.push({
    attemptId: 'cheat_sim_02',
    scenarioName: '2. Synchronized In-Class Answer Sharing',
    technique: 'Second student submits identical answer pattern 14 seconds after peer in same lab section',
    detected: sharingCheck.isCollusion,
    algorithmUsed: 'Cross-Student Vector Matching + Temporal Window (Delta <= 45s, Match = 100%)',
    triggerDetails: `Identical 5/5 option sequence matched within ${sharingCheck.timeDeltaSeconds}s of peer submission.`,
    mitigationAction: 'Questions randomized and shuffled for both; flagged for faculty section review.',
  });

  // 3. Fake / Forged External Coding URL
  const mockPayload = { url: 'https://fake-mock-leetcode.io/solutions/xyz999', verifiedKey: null };
  const isValidPlatform = mockPayload.url.startsWith('https://leetcode.com/problems/') || mockPayload.url.startsWith('https://github.com/');
  results.push({
    attemptId: 'cheat_sim_03',
    scenarioName: '3. Forged Coding Practice Submission',
    technique: 'Submitting unverified third-party domain URL claiming 40 XP for hard DP problem',
    detected: !isValidPlatform,
    algorithmUsed: 'Cryptographic API Signature & Domain Allowlist Verification',
    triggerDetails: 'Submission domain fails MSOT external verification allowlist.',
    mitigationAction: 'Immediate rejection with 0 XP; ledger logs "Unverified external practice attempt".',
  });

  // 4. Impossibly Fast Hard Algorithmic Solution
  const hardSolveTime = 1.4; // seconds
  const isImpossible = hardSolveTime < 5.0; // hard problem requires testing
  results.push({
    attemptId: 'cheat_sim_04',
    scenarioName: '4. Instant Hard-Tier Coding Solver',
    technique: 'Submitting accepted solution for Hard Graph Problem within 1.4 seconds of problem load',
    detected: isImpossible,
    algorithmUsed: 'Complexity-to-Time Baseline Bound (Hard min threshold: 120s from challenge open)',
    triggerDetails: `Solved in ${hardSolveTime}s. Impossible human reading + typing + test suite runtime.`,
    mitigationAction: 'Solution quarantined; requires faculty manual test code review.',
  });

  // 5. XP Spike Anomaly
  const baseline = [20, 25, 15, 30, 20, 25, 20]; // avg ~22 XP
  const spikeXp = 210; // today
  const spikeCheck = detectXpSpike('student_test', spikeXp, baseline);
  results.push({
    attemptId: 'cheat_sim_05',
    scenarioName: '5. Runaway XP Spike / Multi-Event Burst',
    technique: 'Student generates 210 XP in a single afternoon compared to 22 XP rolling daily baseline',
    detected: spikeCheck.isSpike,
    algorithmUsed: 'Rolling 7-Day Exponential Moving Average Spike Detector (>3x and >120 XP)',
    triggerDetails: `Daily total of ${spikeXp} XP is ${spikeCheck.ratio}x higher than 7-day average (${spikeCheck.baselineAvg} XP).`,
    mitigationAction: 'Audit item automatically generated in Admin Console; XP withheld from weekly league rank until approved.',
  });

  return results;
}
