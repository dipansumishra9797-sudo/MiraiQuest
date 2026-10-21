import { describe, it, expect } from 'vitest';
import {
  checkRapidFireQuiz,
  calculateTextSimilarity,
  checkAnswerSharing,
  detectXpSpike,
  runCheatingAttemptsDemo,
} from '../src/modules/antiGaming';

describe('Anti-Gaming & Academic Integrity Suite', () => {
  it('detects impossibly fast rapid-fire quiz attempts (<2.5s per question)', () => {
    // 5 questions in 4 seconds = 0.8s avg -> should flag
    const fastTimes = [0.9, 0.7, 0.8, 0.8, 0.8];
    const fastResult = checkRapidFireQuiz(fastTimes, 2.5);
    expect(fastResult.isSuspicious).toBe(true);
    expect(fastResult.reason).toContain('Impossibly fast submission');

    // 5 questions with human pacing: 6s, 8s, 5s, 10s, 7s -> avg 7.2s -> valid
    const humanTimes = [6, 8, 5, 10, 7];
    const humanResult = checkRapidFireQuiz(humanTimes, 2.5);
    expect(humanResult.isSuspicious).toBe(false);
  });

  it('computes token-based Jaccard similarity to detect copy-pasted peer help answers', () => {
    const textA = 'Binary search requires a sorted array and operates by repeatedly dividing search space in half.';
    const textB = 'Binary search requires a sorted array and operates by repeatedly dividing the search interval in half.';
    const similarityHigh = calculateTextSimilarity(textA, textB);
    expect(similarityHigh).toBeGreaterThan(70);

    const textDiff = 'Dynamic programming stores overlapping subproblem solutions using memoization table.';
    const similarityLow = calculateTextSimilarity(textA, textDiff);
    expect(similarityLow).toBeLessThan(25);
  });

  it('detects answer-sharing collusion between two students within a 45s window with 100% option match', () => {
    const student1 = {
      studentId: 'std_vikram',
      options: [1, 2, 0, 3, 1],
      timestamp: 1729000000000,
    };
    const student2Collusion = {
      studentId: 'std_rohan',
      options: [1, 2, 0, 3, 1],
      timestamp: 1729000020000, // 20 seconds later
    };

    const collusionCheck = checkAnswerSharing(student1, student2Collusion);
    expect(collusionCheck.isCollusion).toBe(true);
    expect(collusionCheck.matchPercent).toBe(100);
    expect(collusionCheck.timeDeltaSeconds).toBe(20);

    // If options differ, collusion is false
    const student3Different = {
      studentId: 'std_anjali',
      options: [1, 2, 3, 0, 1],
      timestamp: 1729000025000,
    };
    const diffCheck = checkAnswerSharing(student1, student3Different);
    expect(diffCheck.isCollusion).toBe(false);
  });

  it('flags abnormal XP spikes exceeding 3x rolling 7-day average and >120 XP', () => {
    const rollingBaseline = [20, 25, 20, 30, 25, 20, 25]; // avg ~23 XP
    const spikeCheck = detectXpSpike('std_test', 220, rollingBaseline, 3.0);
    expect(spikeCheck.isSpike).toBe(true);
    expect(spikeCheck.ratio).toBeGreaterThanOrEqual(3.0);

    // Normal day (40 XP)
    const normalCheck = detectXpSpike('std_test', 40, rollingBaseline, 3.0);
    expect(normalCheck.isSpike).toBe(false);
  });

  it('runs the 5 cheating simulation scenarios with 100% defense detection rate', () => {
    const results = runCheatingAttemptsDemo();
    expect(results.length).toBe(5);
    results.forEach((scenario) => {
      expect(scenario.detected).toBe(true);
      expect(scenario.mitigationAction).toBeDefined();
    });
  });
});
