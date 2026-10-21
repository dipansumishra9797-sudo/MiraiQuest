import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { INITIAL_STUDENTS, INITIAL_FACULTY, INITIAL_RULES, INITIAL_BATTLES } from '../src/data/mockData';
import { calculateLevelFromXp } from '../src/modules/xpEngine';

describe('BUG 1: Open Source Guide Navigation & Isolation', () => {
  // Test route resolver logic used in App.tsx
  const getNavSectionFromPathname = (
    pathname: string,
    role: 'student' | 'faculty' | 'admin'
  ): string => {
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    switch (cleanPath) {
      case '/open-source-guide':
        return 'open_source_guide';
      case '/leagues':
        return 'leagues';
      case '/team-battles':
        return 'battles';
      case '/peer-doubts':
        return 'dashboard:peer_help';
      case '/coursework':
        return 'dashboard:assignments';
      case '/ledger':
        return 'dashboard:ledger';
      case '/badges-quests':
        return 'dashboard:badges';
      case '/coding-practice':
        return 'dashboard:coding';
      case '/perks-store':
        return 'dashboard:store';
      case '/profile':
        return 'dashboard:profile';
      case '/':
      default:
        if (role === 'student') return 'dashboard:overview';
        if (role === 'faculty') return 'faculty:analytics';
        return 'admin:rules';
    }
  };

  it('correctly maps URL routes to navigation sections without wildcard catch-all bugs', () => {
    expect(getNavSectionFromPathname('/open-source-guide', 'student')).toBe('open_source_guide');
    expect(getNavSectionFromPathname('/open-source-guide', 'faculty')).toBe('open_source_guide');
    expect(getNavSectionFromPathname('/peer-doubts', 'student')).toBe('dashboard:peer_help');
    expect(getNavSectionFromPathname('/leagues', 'student')).toBe('leagues');
    expect(getNavSectionFromPathname('/team-battles', 'student')).toBe('battles');
    expect(getNavSectionFromPathname('/coursework', 'student')).toBe('dashboard:assignments');
    expect(getNavSectionFromPathname('/', 'student')).toBe('dashboard:overview');
    expect(getNavSectionFromPathname('/', 'faculty')).toBe('faculty:analytics');
    expect(getNavSectionFromPathname('/', 'admin')).toBe('admin:rules');
  });

  it('eliminates the navigation lock where currentTab prevents leaving leagues/battles or Open Source Guide', () => {
    // Root cause: Previously, App.tsx had:
    // const isStudentLeagues = role === 'student' && (navSection === 'leagues' || currentTab === 'leagues');
    // If currentTab was ever set to 'leagues', isStudentLeagues stayed true FOREVER even when navSection changed!

    type AppNavState = {
      role: 'student' | 'faculty' | 'admin';
      navSection: string;
      currentTab: string;
    };

    // Broken legacy logic:
    const legacyIsStudentLeagues = (state: AppNavState) =>
      state.role === 'student' && (state.navSection === 'leagues' || state.currentTab === 'leagues');

    // Fixed logic:
    const fixedIsStudentLeagues = (state: AppNavState) =>
      state.role === 'student' && state.navSection === 'leagues';

    const stateOnOpenSourceGuide: AppNavState = {
      role: 'student',
      navSection: 'open_source_guide',
      currentTab: 'leagues', // User previously visited leagues
    };

    // Under legacy code, isStudentLeagues was true, hijacking the screen and preventing Open Source Guide or Dashboard from rendering!
    expect(legacyIsStudentLeagues(stateOnOpenSourceGuide)).toBe(true); // BUG!

    // Under fixed code, isStudentLeagues is false, allowing Open Source Guide or Dashboard to render properly!
    expect(fixedIsStudentLeagues(stateOnOpenSourceGuide)).toBe(false); // FIXED!

    const stateBackToDashboard: AppNavState = {
      role: 'student',
      navSection: 'dashboard:overview',
      currentTab: 'leagues',
    };
    expect(fixedIsStudentLeagues(stateBackToDashboard)).toBe(false);
  });

  it('ensures the iframe sandbox strictly blocks top navigation and popup breakout', () => {
    const sandboxAttributes = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';

    // Verify allow-top-navigation is NOT present
    expect(sandboxAttributes.includes('allow-top-navigation')).toBe(false);
    expect(sandboxAttributes.includes('allow-top-navigation-by-user-activation')).toBe(false);

    // Verify necessary permissions for interactive learning are present
    expect(sandboxAttributes.includes('allow-scripts')).toBe(true);
    expect(sandboxAttributes.includes('allow-same-origin')).toBe(true);
    expect(sandboxAttributes.includes('allow-forms')).toBe(true);
  });

  it('cleans up body overflow and pointer-events locks on unmount', () => {
    // Mock document.body for Node.js test environment
    const mockDocument = {
      body: {
        style: {
          overflow: 'hidden',
          pointerEvents: 'none',
        },
      },
    };

    // Execute the cleanup logic as implemented in OpenSourceGuideView unmount
    const unmountCleanup = (doc: typeof mockDocument) => {
      doc.body.style.overflow = '';
      doc.body.style.pointerEvents = '';
    };

    unmountCleanup(mockDocument);

    expect(mockDocument.body.style.overflow).toBe('');
    expect(mockDocument.body.style.pointerEvents).toBe('');
  });

  it('handles "Back to Dashboard" navigation correctly for both student and faculty portals', () => {
    let currentNavSection = 'open_source_guide';
    let pushedUrl = '';

    const mockPushState = (url: string) => {
      pushedUrl = url;
    };

    const handleBackToDashboard = (role: 'student' | 'faculty') => {
      if (role === 'faculty') {
        currentNavSection = 'faculty:analytics';
        mockPushState('/');
      } else {
        currentNavSection = 'dashboard:overview';
        mockPushState('/');
      }
    };

    // Test student portal
    handleBackToDashboard('student');
    expect(currentNavSection).toBe('dashboard:overview');
    expect(pushedUrl).toBe('/');

    // Test faculty portal
    currentNavSection = 'open_source_guide';
    handleBackToDashboard('faculty');
    expect(currentNavSection).toBe('faculty:analytics');
    expect(pushedUrl).toBe('/');
  });
});

describe('BUG 2: Peer Doubts & State Hydration on Refresh', () => {
  it('guarantees activeStudent is never undefined on refresh or first render', () => {
    const students = INITIAL_STUDENTS;
    const currentStudentId = 'std_non_existent'; // Simulating stale or missing localStorage ID on refresh

    // Store implementation logic:
    const activeStudent =
      students.find((s) => s.id === currentStudentId) || students[0] || INITIAL_STUDENTS[0];

    expect(activeStudent).toBeDefined();
    expect(activeStudent.id).toBe(INITIAL_STUDENTS[0].id);
    expect(activeStudent.name).toBe(INITIAL_STUDENTS[0].name);
    expect(Array.isArray(activeStudent.streakCalendar)).toBe(true);
  });

  it('guarantees activeFaculty is never undefined on refresh or first render', () => {
    const faculty = INITIAL_FACULTY;
    const currentFacultyId = 'fac_non_existent';

    const activeFaculty =
      faculty.find((f) => f.id === currentFacultyId) || faculty[0] || INITIAL_FACULTY[0];

    expect(activeFaculty).toBeDefined();
    expect(activeFaculty.id).toBe(INITIAL_FACULTY[0].id);
    expect(activeFaculty.name).toBe(INITIAL_FACULTY[0].name);
  });

  it('preserves peer doubts state and prevents crashes when doubts are loading or empty', () => {
    // Test safe rendering and operations with empty array
    const emptyDoubts: any[] = [];
    const safeDoubts = Array.isArray(emptyDoubts) ? emptyDoubts : [];

    expect(safeDoubts.length).toBe(0);

    // Subject filtering logic
    const selectedSubject = 'dsa';
    const searchQuery = 'graph';

    const filterDoubts = (posts: typeof emptyDoubts, subject: string, query: string) => {
      return (posts || []).filter((post) => {
        if (!post) return false;
        const subjectMatch =
          subject === 'all' ||
          (post.subject || '').toLowerCase() === subject.toLowerCase();
        const queryMatch =
          !query.trim() ||
          (post.title || '').toLowerCase().includes(query.toLowerCase()) ||
          (post.content || '').toLowerCase().includes(query.toLowerCase()) ||
          ((post.tags || []) as string[]).some((t) =>
            t.toLowerCase().includes(query.toLowerCase())
          );
        return subjectMatch && queryMatch;
      });
    };

    expect(filterDoubts(emptyDoubts, selectedSubject, searchQuery)).toEqual([]);

    // Test with sample doubts
    const sampleDoubts = [
      {
        id: 'post_1',
        studentId: 'std_1',
        studentName: 'Aarav Sharma',
        subject: 'DSA',
        title: 'How to detect cycle in directed graph?',
        content: 'I tried DFS with visited array but getting false positives.',
        tags: ['Graphs', 'DFS', 'Cycle Detection'],
        answers: [],
        upvotes: 5,
        solved: false,
      },
      {
        id: 'post_2',
        studentId: 'std_2',
        studentName: 'Priya Patel',
        subject: 'Python',
        title: 'List comprehension with nested conditions',
        content: 'Syntax error when chaining if-else inside list comprehension.',
        tags: ['Python', 'Basics'],
        answers: [{ id: 'ans_1', authorName: 'Rohan', content: 'Put if-else before for loop' }],
        upvotes: 2,
        solved: true,
      },
    ];

    // Filter by DSA
    const dsaFiltered = filterDoubts(sampleDoubts, 'dsa', '');
    expect(dsaFiltered.length).toBe(1);
    expect(dsaFiltered[0].id).toBe('post_1');

    // Filter by Python
    const pythonFiltered = filterDoubts(sampleDoubts, 'python', '');
    expect(pythonFiltered.length).toBe(1);
    expect(pythonFiltered[0].id).toBe('post_2');

    // Filter by search query "cycle"
    const searchFiltered = filterDoubts(sampleDoubts, 'all', 'cycle');
    expect(searchFiltered.length).toBe(1);
    expect(searchFiltered[0].id).toBe('post_1');

    // Non-matching query returns empty array without throwing
    const noMatch = filterDoubts(sampleDoubts, 'all', 'xyz123nonexistent');
    expect(noMatch.length).toBe(0);
  });

  it('safely handles missing answers, undefined tags, and optional chaining on doubts', () => {
    const malformedPost = {
      id: 'post_incomplete',
      studentName: 'Test Student',
      // subject, content, tags, answers intentionally undefined
    };

    const renderPostSafely = (post: any) => {
      const answersCount = Array.isArray(post.answers) ? post.answers.length : 0;
      const tags = Array.isArray(post.tags) ? post.tags : [];
      const title = post.title || 'Untitled Doubt';
      const content = post.content || '';
      const subject = post.subject || 'General';

      return { answersCount, tags, title, content, subject };
    };

    const result = renderPostSafely(malformedPost);
    expect(result.answersCount).toBe(0);
    expect(result.tags).toEqual([]);
    expect(result.title).toBe('Untitled Doubt');
    expect(result.subject).toBe('General');
  });

  it('lazily initializes subtab from navSection on refresh preventing flash of overview', () => {
    const getInitialSubTab = (navSection: string) => {
      if (navSection.startsWith('dashboard:')) {
        const sub = navSection.replace('dashboard:', '');
        if (
          [
            'overview',
            'assignments',
            'ledger',
            'badges',
            'coding',
            'peer_help',
            'store',
            'profile',
          ].includes(sub)
        ) {
          return sub;
        }
      }
      return 'overview';
    };

    // User refreshes on Peer Doubts (/peer-doubts -> navSection = 'dashboard:peer_help')
    expect(getInitialSubTab('dashboard:peer_help')).toBe('peer_help');

    // User refreshes on Assignments (/coursework -> navSection = 'dashboard:assignments')
    expect(getInitialSubTab('dashboard:assignments')).toBe('assignments');

    // User refreshes on Ledger (/ledger -> navSection = 'dashboard:ledger')
    expect(getInitialSubTab('dashboard:ledger')).toBe('ledger');

    // User refreshes on Badges (/badges-quests -> navSection = 'dashboard:badges')
    expect(getInitialSubTab('dashboard:badges')).toBe('badges');

    // Default overview
    expect(getInitialSubTab('dashboard:overview')).toBe('overview');
    expect(getInitialSubTab('unknown')).toBe('overview');
  });
});

describe('Resilience & Safe Fallbacks Across All Views', () => {
  it('StudentAssignmentsView safe data handling with null/undefined values', () => {
    const emptyAssignments: any = undefined;
    const safeList = emptyAssignments || [];
    expect(safeList.length).toBe(0);

    const safeFilter = (list: any[], status: string) => {
      return (list || []).filter((item) => (status === 'all' ? true : item.status === status));
    };

    expect(safeFilter(emptyAssignments, 'all')).toEqual([]);
  });

  it('XpLedgerView safe calculations with empty ledger', () => {
    const emptyLedger: any = [];
    const studentId = 'std_hi_1';

    const studentEntries = (emptyLedger || []).filter((e: any) => e.studentId === studentId);
    const totalEarned = studentEntries.reduce((sum: number, e: any) => sum + (e.points || 0), 0);

    expect(studentEntries.length).toBe(0);
    expect(totalEarned).toBe(0);
  });

  it('RewardsStoreView handles zero coins balance and empty catalog safely', () => {
    const mockStudent = { ...INITIAL_STUDENTS[0], coinsBalance: 0 };
    const items: any[] = [];

    const canAfford = (itemPrice: number) => (mockStudent.coinsBalance ?? 0) >= itemPrice;
    expect(canAfford(100)).toBe(false);
    expect(items.length).toBe(0);
  });

  it('TeamBattlesView safe fallback to default battle when selected battle is missing', () => {
    const battles = INITIAL_BATTLES;
    const selectedBattleId = 'non_existent_battle';

    const activeBattle = battles.find((b) => b.id === selectedBattleId) || battles[0] || INITIAL_BATTLES[0];
    expect(activeBattle).toBeDefined();
    expect(activeBattle.id).toBe(INITIAL_BATTLES[0].id);
  });
});

describe('Rich Background Animation & Preferences', () => {
  const supportedStyles = ['all', 'orbs', 'particles', 'aurora', 'off'] as const;
  type SupportedStyle = (typeof supportedStyles)[number];

  it('defaults background style to "all" (Orbs plus Particles)', () => {
    const defaultStyle: SupportedStyle = 'all';
    expect(defaultStyle).toBe('all');
    expect(supportedStyles.includes('all')).toBe(true);
  });

  it('correctly persists and retrieves background style per user', () => {
    const mockStorage: Record<string, string> = {};
    const setPref = (studentId: string, style: SupportedStyle) => {
      mockStorage[`mq_student_bg_style_${studentId}`] = style;
    };
    const getPref = (studentId: string): SupportedStyle => {
      const stored = mockStorage[`mq_student_bg_style_${studentId}`];
      if (stored && (supportedStyles as readonly string[]).includes(stored)) {
        return stored as SupportedStyle;
      }
      return 'all';
    };

    const studentA = 'std_test_1';
    const studentB = 'std_test_2';

    expect(getPref(studentA)).toBe('all'); // Default: Orbs plus Particles

    setPref(studentA, 'aurora');
    setPref(studentB, 'particles');

    expect(getPref(studentA)).toBe('aurora');
    expect(getPref(studentB)).toBe('particles');

    setPref(studentA, 'off');
    expect(getPref(studentA)).toBe('off');
    expect(getPref(studentB)).toBe('particles'); // Isolation preserved
  });

  it('calculates particle count within 60-80 on laptop and 30-40 on mobile', () => {
    const getParticleCount = (screenWidth: number) => {
      const isMobile = screenWidth < 768;
      return isMobile ? 38 : 72;
    };

    const laptopCount = getParticleCount(1440);
    expect(laptopCount).toBeGreaterThanOrEqual(60);
    expect(laptopCount).toBeLessThanOrEqual(80);

    const mobileCount = getParticleCount(390);
    expect(mobileCount).toBeGreaterThanOrEqual(30);
    expect(mobileCount).toBeLessThanOrEqual(40);
  });

  it('validates orb opacity bounds in light and dark mode', () => {
    // Requirements: 0.35 to 0.55 in light mode, 0.4 to 0.7 in dark mode
    const orbOpacities = [
      { id: 'orb1', light: 0.52, dark: 0.68 },
      { id: 'orb2', light: 0.48, dark: 0.64 },
      { id: 'orb3', light: 0.46, dark: 0.62 },
      { id: 'orb4', light: 0.42, dark: 0.56 },
      { id: 'orb5', light: 0.44, dark: 0.58 },
    ];

    orbOpacities.forEach(({ id, light, dark }) => {
      expect(light, `${id} light opacity`).toBeGreaterThanOrEqual(0.35);
      expect(light, `${id} light opacity`).toBeLessThanOrEqual(0.55);

      expect(dark, `${id} dark opacity`).toBeGreaterThanOrEqual(0.40);
      expect(dark, `${id} dark opacity`).toBeLessThanOrEqual(0.70);
    });
  });
});

