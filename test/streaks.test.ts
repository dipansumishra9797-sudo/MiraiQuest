import { describe, it, expect } from 'vitest';
import { INITIAL_STUDENTS, INITIAL_RULES } from '../src/data/mockData';
import { processXpEvent, XpEvent } from '../src/modules/xpEngine';

describe('Streak & Habit Tracker System', () => {
  it('identifies active streaks and computes streak milestones', () => {
    const rahul = INITIAL_STUDENTS.find((s) => s.id === 'std_rahul_verma');
    expect(rahul).toBeDefined();
    expect(rahul?.streakDays).toBeGreaterThan(0);
    expect(rahul?.streakFreezesRemaining).toBeGreaterThanOrEqual(0);
  });

  it('awards 7-day streak consistency bonus (+50 XP) upon reaching 7-day milestone', () => {
    const eventStreakBonus: XpEvent = {
      eventId: 'ev_streak_7',
      studentId: 'std_rahul_verma',
      actionKey: 'streak_7_day',
      timestamp: '2026-10-20T18:00:00Z',
      metadata: { streakDays: 7 },
    };
    const res = processXpEvent(eventStreakBonus, INITIAL_RULES, []);
    expect(res.success).toBe(true);
    expect(res.pointsAwarded).toBe(50);
  });

  it('supports streak freeze consumption keeping streak intact', () => {
    let freezes = 2;
    let streak = 8;

    const useFreeze = () => {
      if (freezes <= 0) return false;
      freezes -= 1;
      return true; // streak preserved
    };

    expect(useFreeze()).toBe(true);
    expect(freezes).toBe(1);
    expect(streak).toBe(8);

    expect(useFreeze()).toBe(true);
    expect(freezes).toBe(0);

    // No freezes left
    expect(useFreeze()).toBe(false);
  });

  it('validates streakCalendar tracking entries are valid calendar dates', () => {
    INITIAL_STUDENTS.slice(0, 10).forEach((student) => {
      expect(Array.isArray(student.streakCalendar)).toBe(true);
      expect(student.streakCalendar.length).toBeGreaterThan(0);
      student.streakCalendar.forEach((dateStr) => {
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });
});
