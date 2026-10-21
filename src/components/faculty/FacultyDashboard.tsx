import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../store/appStore';
import { generateQuizQuestionsFromAI } from '../../modules/geminiService';
import { FacultyAssignmentManager } from './FacultyAssignmentManager';
import { QuestionBatchImportModal } from './QuestionBatchImportModal';
import { CodingQuestionManager } from './CodingQuestionManager';
import { CODING_TOPICS } from '../../data/codingPracticeCatalog';
import { GlobalFilterBar } from '../GlobalFilterBar';
import { CountUp } from '../common/CountUp';
import { StreakFlame } from '../common/StreakFlame';
import { DashboardOverviewSkeleton } from '../common/Skeletons';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  Users,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Plus,
  Sparkles,
  BookOpen,
  TrendingDown,
  Clock,
  ShieldAlert,
  Send,
  Building2,
  Award,
  ArrowUpRight,
  Code,
  ShieldCheck,
  Check,
  HelpCircle,
  BarChart3,
  Flame,
  Search,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Edit3,
} from 'lucide-react';
import { IllustratedEmptyState, GameStatBadge } from '../common/GameIcons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const FacultyDashboard: React.FC = () => {
  const {
    students,
    activeFaculty,
    questions,
    syllabusList,
    ledger,
    assignments,
    auditFlags,
    theme,
    isDark,
    approveQuestion,
    rejectQuestion,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    batchImportQuestions,
    toggleSyllabusTopicTaught,
    voidLedgerEntry,
    sendFacultyNudge,
    allCodingProblems,
    addCodingProblem,
    updateCodingProblem,
    deleteCodingProblem,
    reorderCodingProblems,
    autoSubmittedQuizzes,
    grantQuizRetake,
    studentSolvedProblems,
    navSection,
    setNavSection,
    filteredStudents,
    globalFilters,
    updateGlobalFilter,
    isSessionReady,
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  type FacultyTab =
    | 'analytics'
    | 'roster'
    | 'coding'
    | 'assignments'
    | 'questions'
    | 'ai_queue'
    | 'syllabus'
    | 'quiet'
    | 'audit';

  const [activeTab, setActiveTab] = useState<FacultyTab>(() => {
    if (navSection.startsWith('faculty:')) {
      const sub = navSection.replace('faculty:', '');
      if (
        ['analytics', 'roster', 'coding', 'assignments', 'questions', 'ai_queue', 'syllabus', 'quiet', 'audit'].includes(
          sub
        )
      ) {
        return sub as any;
      }
    }
    return 'analytics';
  });

  // Synchronize with drawer navigation
  useEffect(() => {
    if (navSection.startsWith('faculty:')) {
      const sub = navSection.replace('faculty:', '');
      if (
        ['analytics', 'roster', 'coding', 'assignments', 'questions', 'ai_queue', 'syllabus', 'quiet', 'audit'].includes(
          sub
        )
      ) {
        setActiveTab(sub as any);
      }
    }
  }, [navSection]);

  const handleTabChange = (tabId: FacultyTab) => {
    setActiveTab(tabId);
    setNavSection(`faculty:${tabId}`);
  };

  // AI Question Generation State
  const [generatingAi, setGeneratingAi] = useState(false);
  const [genTopic, setGenTopic] = useState('Recursion, Call Stacks & Backtracking');
  const [genSubject, setGenSubject] = useState('Data Structures & Algorithms');
  const [genCount, setGenCount] = useState(3);
  const [genNotice, setGenNotice] = useState<string | null>(null);

  // AI Queue Filters
  const [queueTopicFilter, setQueueTopicFilter] = useState('all');

  // Manual Question State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualQText, setManualQText] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrect, setManualCorrect] = useState(0);
  const [manualExplanation, setManualExplanation] = useState('');
  const [manualTopic, setManualTopic] = useState('Recursion, Call Stacks & Backtracking');
  const [manualSubject, setManualSubject] = useState<'dsa' | 'python'>('dsa');

  // Question Bank Batch Import State
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [batchImportNotice, setBatchImportNotice] = useState<string | null>(null);

  // Coding Practice Sub-Tab: 'matrix' | 'manager'
  const [codingSubTab, setCodingSubTab] = useState<'matrix' | 'manager'>('matrix');

  // AI Queue Question Inline Editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQOptions, setEditQOptions] = useState<string[]>(['', '', '', '']);
  const [editQCorrect, setEditQCorrect] = useState(0);
  const [editQExplanation, setEditQExplanation] = useState('');

  // Auto-Submitted Quiz Attempts & Integrity Review
  const [serverAutoSubmittedAttempts, setServerAutoSubmittedAttempts] = useState<any[]>([]);
  const [retakeNotes, setRetakeNotes] = useState<Record<string, string>>({});
  const [retakeStatusNotice, setRetakeStatusNotice] = useState<string | null>(null);

  // Load auto-submitted attempts from server on audit tab switch
  useEffect(() => {
    if (activeTab === 'audit') {
      fetch('/api/quiz/auto-submitted')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.records)) {
            setServerAutoSubmittedAttempts(data.records);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // Faculty XP Void Form
  const [voidLedgerId, setVoidLedgerId] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [voidNotice, setVoidNotice] = useState<string | null>(null);

  // Broadcast Nudge State
  const [broadcastNudgeNotice, setBroadcastNudgeNotice] = useState<string | null>(null);

  // Analytics Computation (strictly respects active global filters)
  const cohortStudentCount = filteredStudents.length;
  const activeStudentsCount = filteredStudents.filter((s) => s.streakDays > 0).length;
  const avgStreak =
    cohortStudentCount > 0
      ? Math.round(filteredStudents.reduce((sum, s) => sum + s.streakDays, 0) / cohortStudentCount)
      : 0;

  // Quiz completion rate in filtered group
  const quizCompletionRate =
    cohortStudentCount > 0
      ? Math.min(
          100,
          Math.round(
            (filteredStudents.filter((s) => s.streakDays >= 2).length / cohortStudentCount) * 100
          )
        )
      : 0;

  // Quiz Quality Metrics: AI question approval and % accepted without edits
  const aiGeneratedQuestions = questions.filter((q) => q.source === 'ai_generated');
  const approvedAiQuestions = aiGeneratedQuestions.filter((q) => q.status === 'approved');
  const approvedWithoutEditsCount = approvedAiQuestions.filter((q) => !q.editedBeforeApproval).length;
  const percentAcceptedWithoutEdits =
    approvedAiQuestions.length > 0
      ? Math.round((approvedWithoutEditsCount / approvedAiQuestions.length) * 100)
      : 92;
  const approvalRate =
    aiGeneratedQuestions.length > 0
      ? Math.round((approvedAiQuestions.length / aiGeneratedQuestions.length) * 100)
      : 88;

  // Quiet students (inactive for 5+ days or streak == 0) within filtered cohort
  const quietStudents = filteredStudents.filter(
    (s) => s.streakDays === 0 || s.lastActiveDate < '2026-10-09'
  );

  // Struggling topics (with subject filter awareness)
  const allStrugglingTopics = [
    {
      topic: 'Recursion Call Stacks & Invariants',
      subject: 'dsa',
      subjectLabel: 'DSA',
      errorRate: 38,
      attempts: 210,
      severity: 'high' as const,
      difficulty: 'Hard',
    },
    {
      topic: 'Monotonic Sequences in Stacks',
      subject: 'dsa',
      subjectLabel: 'DSA',
      errorRate: 29,
      attempts: 195,
      severity: 'medium' as const,
      difficulty: 'Medium',
    },
    {
      topic: 'Dynamic Tree Traversal & Balancing',
      subject: 'dsa',
      subjectLabel: 'DSA',
      errorRate: 27,
      attempts: 160,
      severity: 'medium' as const,
      difficulty: 'Medium',
    },
    {
      topic: 'Graph Shortest Paths (Dijkstra)',
      subject: 'dsa',
      subjectLabel: 'DSA',
      errorRate: 33,
      attempts: 140,
      severity: 'high' as const,
      difficulty: 'Hard',
    },
    {
      topic: 'Python MRO & C3 Linearization',
      subject: 'python',
      subjectLabel: 'Python',
      errorRate: 34,
      attempts: 185,
      severity: 'high' as const,
      difficulty: 'Hard',
    },
    {
      topic: 'LEGB Variable Closure Scope',
      subject: 'python',
      subjectLabel: 'Python',
      errorRate: 24,
      attempts: 220,
      severity: 'low' as const,
      difficulty: 'Medium',
    },
    {
      topic: 'Generator Functions & Yield States',
      subject: 'python',
      subjectLabel: 'Python',
      errorRate: 21,
      attempts: 175,
      severity: 'low' as const,
      difficulty: 'Medium',
    },
    {
      topic: 'AsyncIO Event Loop Invariants',
      subject: 'python',
      subjectLabel: 'Python',
      errorRate: 31,
      attempts: 130,
      severity: 'high' as const,
      difficulty: 'Hard',
    },
  ];

  const strugglingTopics = allStrugglingTopics.filter(
    (t) => globalFilters.subject === 'all' || t.subject === globalFilters.subject
  );

  // Dynamic Daily Engagement & XP Trend Chart Data (scaled to active cohort)
  const cohortScale = cohortStudentCount / Math.max(1, students.length);
  const engagementTrendData = [
    { day: 'Mon', active: Math.round(48 * cohortScale), quizzes: Math.round(42 * cohortScale), avgXp: 35 },
    { day: 'Tue', active: Math.round(52 * cohortScale), quizzes: Math.round(46 * cohortScale), avgXp: 38 },
    { day: 'Wed', active: Math.round(49 * cohortScale), quizzes: Math.round(44 * cohortScale), avgXp: 32 },
    { day: 'Thu', active: Math.round(55 * cohortScale), quizzes: Math.round(51 * cohortScale), avgXp: 44 },
    { day: 'Fri', active: Math.round(53 * cohortScale), quizzes: Math.round(49 * cohortScale), avgXp: 40 },
    { day: 'Sat', active: Math.round(44 * cohortScale), quizzes: Math.round(38 * cohortScale), avgXp: 28 },
    { day: 'Sun', active: Math.round(41 * cohortScale), quizzes: Math.round(35 * cohortScale), avgXp: 25 },
  ];

  // Campus Assignment Completion & Academic Metrics
  const [campusNudgeNotice, setCampusNudgeNotice] = useState<string | null>(null);

  const liveHwSubmissions = ledger.filter(
    (l) =>
      (l.actionKey === 'submit_assignment' ||
        l.actionType === 'homework' ||
        l.actionType === 'classwork') &&
      l.status === 'valid'
  ).length;

  const campusAnalytics = [
    {
      campus: 'HI-Tech' as const,
      name: 'HI-Tech Main Campus',
      shortCode: 'HTC',
      studentCount: students.filter((s) => s.campus === 'HI-Tech').length || 18,
      assignmentCompletionRate: 91.8,
      onTimeRate: 94.6,
      attendanceRate: 93.2,
      totalSubmissions: 428 + Math.floor(liveHwSubmissions * 0.35),
      avgStreakDays: 6.8,
      status: 'Exceeding Target' as const,
      statusColor: 'emerald',
      leadTopic: 'Algorithmic Recurrence Relations (Lab 4)',
    },
    {
      campus: 'Rathinam' as const,
      name: 'Rathinam Campus',
      shortCode: 'RAT',
      studentCount: students.filter((s) => s.campus === 'Rathinam').length || 16,
      assignmentCompletionRate: 86.4,
      onTimeRate: 89.2,
      attendanceRate: 88.5,
      totalSubmissions: 394 + Math.floor(liveHwSubmissions * 0.28),
      status: 'On Track' as const,
      statusColor: 'indigo',
      avgStreakDays: 5.9,
      leadTopic: 'Python OOP & Linearization',
    },
    {
      campus: 'JUJ' as const,
      name: 'JUJ Campus',
      shortCode: 'JUJ',
      studentCount: students.filter((s) => s.campus === 'JUJ').length || 14,
      assignmentCompletionRate: 84.2,
      onTimeRate: 87.5,
      attendanceRate: 86.0,
      totalSubmissions: 362 + Math.floor(liveHwSubmissions * 0.22),
      status: 'On Track' as const,
      statusColor: 'indigo',
      avgStreakDays: 5.3,
      leadTopic: 'Tree Traversals & Stacks',
    },
  ].filter(
    (c) => globalFilters.campuses.length === 0 || globalFilters.campuses.includes(c.campus)
  );

  const handleNudgeCampus = (campusName: string) => {
    const studentToNudge = filteredStudents[0]?.id || 'std_rahul_verma';
    sendFacultyNudge(studentToNudge);
    setCampusNudgeNotice(
      `Broadcast reminder successfully dispatched to ${campusName} faculty coordinator and students.`
    );
    setTimeout(() => setCampusNudgeNotice(null), 4000);
  };

  const handleBroadcastNudgeAllQuiet = () => {
    quietStudents.forEach((s) => sendFacultyNudge(s.id));
    setBroadcastNudgeNotice(
      `Non-punitive motivational nudge successfully dispatched to all ${quietStudents.length} quiet students!`
    );
    setTimeout(() => setBroadcastNudgeNotice(null), 4500);
  };

  // AI Question Generation Handler
  const handleGenerateQuestions = async () => {
    setGeneratingAi(true);
    setGenNotice(null);
    try {
      const res = await generateQuizQuestionsFromAI(genSubject, genTopic, 'medium', genCount);

      res.questions.forEach((q) => {
        addQuestion({
          subjectId: genSubject === 'Data Structures & Algorithms' ? 'dsa' : 'python',
          topic: genTopic,
          difficulty: q.difficulty || 'medium',
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          source: 'ai_generated',
          status: 'pending_approval',
          weekNumber: 4,
        });
      });

      setGenNotice(
        `Generated ${res.questions.length} questions for topic "${genTopic}". They are now in your Approval Queue awaiting verification.`
      );
    } catch (e: any) {
      setGenNotice('Failed to generate questions: ' + e.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Manual Question Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQText || manualOptions.some((o) => !o.trim())) return;

    addQuestion({
      subjectId: manualSubject,
      topic: manualTopic,
      difficulty: 'medium',
      questionText: manualQText,
      options: manualOptions,
      correctOptionIndex: manualCorrect,
      explanation: manualExplanation || 'Standard collegiate curriculum invariant.',
      source: 'faculty_upload',
      status: 'approved',
      weekNumber: 4,
    });

    setManualQText('');
    setManualOptions(['', '', '', '']);
    setManualExplanation('');
    setShowManualForm(false);
    alert('Question added directly to active question bank!');
  };

  // Void XP Action
  const handleVoidXp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidLedgerId || !voidReason) return;
    voidLedgerEntry(voidLedgerId, voidReason, activeFaculty.name);
    setVoidNotice(`Ledger entry ${voidLedgerId} voided. Student total XP recomputed.`);
    setVoidLedgerId('');
    setVoidReason('');
    setTimeout(() => setVoidNotice(null), 4000);
  };

  // Export Question Bank CSV
  const handleExportQuestionsCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Subject,Topic,Difficulty,Status,QuestionText,CorrectOption']
        .concat(
          questions.map(
            (q) =>
              `"${q.id}","${q.subjectId}","${q.topic}","${q.difficulty}","${q.status}","${q.questionText.replace(
                /"/g,
                '""'
              )}","${q.options[q.correctOptionIndex]}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MiraiQuest_QuestionBank_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pending questions filtered by subject and topic
  const pendingQuestions = questions.filter((q) => {
    if (q.status !== 'pending_approval') return false;
    if (globalFilters.subject !== 'all' && q.subjectId !== globalFilters.subject) return false;
    if (queueTopicFilter !== 'all' && !q.topic.toLowerCase().includes(queueTopicFilter.toLowerCase()))
      return false;
    return true;
  });

  const approvedQuestions = questions.filter((q) => {
    if (q.status !== 'approved') return false;
    if (globalFilters.subject !== 'all' && q.subjectId !== globalFilters.subject) return false;
    return true;
  });

  // Unique pending topics
  const availableQueueTopics = Array.from(
    new Set(questions.filter((q) => q.status === 'pending_approval').map((q) => q.topic))
  );

  // Compute Per-Topic Student Coding Progress for Faculty (strictly uses filteredStudents)
  const topicProgressMatrix = CODING_TOPICS.filter(
    (t) => globalFilters.subject === 'all' || (t.category === 'core' && globalFilters.subject === 'dsa') || (t.id === 'strings' && globalFilters.subject === 'python') || true
  ).map((topic) => {
    const topicProblems = allCodingProblems.filter((p: any) => p.topicId === topic.id);
    const totalCount = topicProblems.length || 1;
    // Calculate how many filtered students have solved questions in this topic
    const totalSolves = filteredStudents.reduce((sum, s) => {
      const studentSolved = studentSolvedProblems[s.id] || [];
      return sum + topicProblems.filter((p) => studentSolved.includes(p.id)).length;
    }, 0);
    const avgSolvesPerStudent =
      cohortStudentCount > 0 ? Math.round((totalSolves / cohortStudentCount) * 10) / 10 : 0;
    const proficiency =
      cohortStudentCount > 0
        ? Math.min(100, Math.round((totalSolves / (totalCount * cohortStudentCount)) * 100))
        : 0;

    return {
      id: topic.id,
      name: topic.name,
      category: topic.category,
      totalProblems: totalCount,
      totalSolves,
      avgSolvesPerStudent,
      proficiency,
      isStruggling: proficiency < 25,
    };
  });

  // Filtered Ledger entries for the active cohort safely
  const safeLedger = Array.isArray(ledger) ? ledger : [];
  const safeFilteredStudents = Array.isArray(filteredStudents) ? filteredStudents : [];
  const cohortLedger = safeLedger.filter((l) =>
    l && safeFilteredStudents.some((s) => s && s.id === l.studentId)
  );

  if (isLoading || !isSessionReady) {
    return <DashboardOverviewSkeleton isDark={isDark} />;
  }

  return (
    <div className="space-y-6">
      {/* Sticky Global Filter Bar */}
      <GlobalFilterBar />

      {/* Faculty Profile Banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>FACULTY PORTAL · {activeFaculty.campus} CAMPUS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{activeFaculty.name}</h2>
          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {activeFaculty.department} · Assigned Sections: {activeFaculty.assignedSections.join(', ')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportQuestionsCsv}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export Question Bank CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b text-xs font-semibold ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        {[
          { id: 'analytics', label: 'Class Analytics & Trends' },
          { id: 'roster', label: `Student Roster (${cohortStudentCount})` },
          { id: 'coding', label: 'Coding Practice Matrix' },
          { id: 'assignments', label: `Assignment Management (${assignments.length})` },
          { id: 'questions', label: `Question Bank (${approvedQuestions.length})` },
          { id: 'ai_queue', label: `AI Approval Queue (${pendingQuestions.length} Pending)` },
          { id: 'syllabus', label: 'My Classes & Syllabus' },
          { id: 'quiet', label: `Quiet Students (${quietStudents.length})` },
          { id: 'audit', label: 'Faculty XP Override' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Analytics & Trends */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Strip (Respects Active Global Filters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-xl border transition-colors interactive-card ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Daily Active Students
              </div>
              <div className="text-2xl font-bold tabular-nums">
                <CountUp value={activeStudentsCount} /> / {cohortStudentCount}
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                {cohortStudentCount > 0
                  ? Math.round((activeStudentsCount / cohortStudentCount) * 100)
                  : 0}
                % Active in Filtered Cohort
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition-colors interactive-card ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Average Streak Length
              </div>
              <div className="text-2xl font-bold text-orange-500 tabular-nums">
                <CountUp value={avgStreak} suffix=" Days" />
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Filtered Cohort Habit Metric
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition-colors interactive-card ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Quiz Completion Rate
              </div>
              <div className="text-2xl font-bold text-indigo-500 tabular-nums">
                <CountUp value={quizCompletionRate} suffix="%" />
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Daily Micro-Quiz Target
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition-colors interactive-card ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Quiet Students (5+ days)
              </div>
              <div className="text-2xl font-bold text-amber-500 tabular-nums">
                <CountUp value={quietStudents.length} />
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Need Re-engagement
              </div>
            </div>
          </div>

          {/* Toast Notice for Campus Nudge */}
          {campusNudgeNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{campusNudgeNotice}</span>
              </div>
              <button
                onClick={() => setCampusNudgeNotice(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Engagement & XP Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Active & Quizzes Trend */}
            <div
              className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <span>Daily Student Engagement & Quiz Participation</span>
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Active learners and completed micro-quizzes over the past 7 days.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="day" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="active" fill="#6366f1" name="Active Students" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                    <Bar dataKey="quizzes" fill="#10b981" name="Completed Quizzes" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* XP Velocity & Average XP per Student Trend */}
            <div
              className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-500 rotate-180" />
                    <span>Cohort Learning Velocity (Average XP Earned)</span>
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Mean daily academic & practice XP earned per filtered student.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="day" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgXp"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      name="Average XP / Student"
                      dot={{ fill: '#f59e0b', r: 4 }}
                      isAnimationActive={true}
                      animationDuration={600}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* STRUGGLING TOPICS HEATMAP & ERROR RATES */}
          <div
            className={`p-6 rounded-2xl border space-y-5 shadow-xs transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Struggling Topics Diagnostic & Heatmap ({strugglingTopics.length} Topics Identified)</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Based on wrong answer rates in quizzes and failing test cases in sandbox unit tests.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Subject:</span>
                <select
                  value={globalFilters.subject}
                  onChange={(e) => updateGlobalFilter('subject', e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg border outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">All Subjects</option>
                  <option value="dsa">DSA</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </div>

            {/* Visual Heatmap Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {strugglingTopics.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                    st.errorRate >= 30
                      ? isDark
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                        : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : isDark
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      {st.subjectLabel} · {st.difficulty}
                    </span>
                    <span className="text-xs font-black text-rose-500">{st.errorRate}% Error</span>
                  </div>

                  <h5 className="font-bold text-xs line-clamp-2">{st.topic}</h5>

                  {/* Heatmap Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        st.errorRate >= 30 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${st.errorRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] opacity-75">
                    <span>{st.attempts} quiz attempts</span>
                    <span>Review recommended</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CROSS-CAMPUS ASSIGNMENT BENCHMARKS (FILTERED) */}
          <div
            className={`p-6 rounded-2xl border space-y-6 shadow-sm transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-1">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>CROSS-CAMPUS ACADEMIC BENCHMARK</span>
                </div>
                <h3 className="text-lg font-bold">
                  Student Assignment Completion Rates Across Campuses
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aggregated on-time submission compliance, course lab completion, and learning velocity across HI-Tech, Rathinam, and JUJ.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Semester Goal: 80% Min</span>
                </span>
              </div>
            </div>

            {/* Campus Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campusAnalytics.map((c) => (
                <div
                  key={c.campus}
                  className={`p-4 rounded-xl border space-y-3 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{c.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.studentCount} active students
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.statusColor === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        Assignment Completion:
                      </span>
                      <span className="font-bold">{c.assignmentCompletionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>On-Time Rate:</span>
                      <span className="font-bold text-emerald-500">{c.onTimeRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        Average Streak:
                      </span>
                      <span className="font-bold text-amber-500">{c.avgStreakDays} days</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNudgeCampus(c.name)}
                    className="w-full mt-2 py-1.5 text-[11px] font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    Broadcast Nudge to {c.shortCode}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Roster / Class Directory Tab */}
      {activeTab === 'roster' && (
        <div
          className={`p-6 rounded-2xl border space-y-4 shadow-xs transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-bold flex items-center gap-2 text-indigo-500">
                <Users className="w-4 h-4" />
                <span>Class Roster ({cohortStudentCount} Students Matching Filters)</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Student profiles, academic year, section, streak habit, and coding milestones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Sort:</span>
              <select
                value={globalFilters.sortBy}
                onChange={(e) => updateGlobalFilter('sortBy', e.target.value as any)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border outline-hidden ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="xp">Highest Total XP</option>
                <option value="name">Student Name (A-Z)</option>
                <option value="streak">Streak Days</option>
                <option value="activity">Most Recently Active</option>
              </select>
            </div>
          </div>

          {/* 1. Mobile Cards View (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <IllustratedEmptyState
                type="no_results"
                title="No Students Found"
                description="No student profiles match your current campus, year, or search filters."
                isDark={isDark}
              />
            ) : (
              filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {s.rollNumber} · {s.campus} · {s.year}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Sec {s.section}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80 text-center">
                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                      <div className="text-[10px] text-slate-400">Streak</div>
                      <div className="text-xs font-bold text-orange-500 flex items-center justify-center gap-1 mt-0.5">
                        <StreakFlame streakDays={s.streakDays} size="xs" />
                        <span>{s.streakDays}d</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                      <div className="text-[10px] text-slate-400">Level & XP</div>
                      <div className="text-xs font-bold text-indigo-500 mt-0.5">
                        Lvl {s.level} · {s.totalXp}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                      <div className="text-[10px] text-slate-400">Solves</div>
                      <div className="text-xs font-bold text-emerald-500 font-mono mt-0.5">
                        {(studentSolvedProblems[s.id] || []).length}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Active: {s.lastActiveDate}</span>
                    <button
                      onClick={() => sendFacultyNudge(s.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors touch-target cursor-pointer"
                    >
                      Send Nudge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. Tablet & Desktop Table View (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className={`font-semibold border-b ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Campus & Year</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-center">Level & XP</th>
                  <th className="py-3 px-4 text-center">Verified Solves</th>
                  <th className="py-3 px-4 text-center">Last Active</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10">
                      <IllustratedEmptyState
                        type="no_results"
                        title="No Students Found"
                        description="No student profiles match your current campus, year, or search filters."
                        isDark={isDark}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{s.rollNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{s.campus}</span>
                        <div className="text-[10px] text-slate-400">{s.year}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {s.section}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="inline-flex items-center justify-center gap-1 text-orange-500">
                          <StreakFlame streakDays={s.streakDays} size="xs" />
                          <span>{s.streakDays}d</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          Lvl {s.level}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.totalXp.toLocaleString()} XP
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        {(studentSolvedProblems[s.id] || []).length} problems
                      </td>
                      <td className="py-3 px-4 text-center text-[11px] text-slate-400 font-mono">
                        {s.lastActiveDate}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => sendFacultyNudge(s.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          Nudge
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Coding Practice Progress Tab */}
      {activeTab === 'coding' && (
        <div className="space-y-6">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCodingSubTab('matrix')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                codingSubTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Topic Proficiency Matrix
            </button>
            <button
              onClick={() => setCodingSubTab('manager')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                codingSubTab === 'manager'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Coding Question Manager ({allCodingProblems.length})
            </button>
          </div>

          {codingSubTab === 'manager' ? (
            <div
              className={`p-6 rounded-2xl border space-y-4 shadow-xs transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <CodingQuestionManager
                problems={allCodingProblems}
                onAddProblem={addCodingProblem}
                onUpdateProblem={updateCodingProblem}
                onDeleteProblem={deleteCodingProblem}
                onReorderProblems={reorderCodingProblems}
                isDark={isDark}
              />
            </div>
          ) : (
            <>
              {/* Topic Progress Matrix */}
              <div
                className={`p-6 rounded-2xl border space-y-4 shadow-xs transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>Topic-wise Practice Proficiency ({filteredStudents.length} Students)</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Aggregate mastery and solve counts across algorithmic coding topics in the filtered cohort.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  Cohort Target: 60%+ Solves
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topicProgressMatrix.map((tm) => (
                <div
                  key={tm.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold truncate">{tm.name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        tm.isStruggling
                          ? 'bg-rose-500/15 text-rose-500'
                          : tm.proficiency >= 50
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {tm.proficiency}%
                    </span>
                  </div>

                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        tm.isStruggling ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${tm.proficiency}%` }}
                    />
                  </div>

                  <div className={`flex items-center justify-between text-[10px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{tm.totalProblems} Questions</span>
                    <span>{tm.avgSolvesPerStudent} avg solves/std</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student-by-Student Coding Matrix */}
          <div
            className={`p-6 rounded-2xl border space-y-4 shadow-xs transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div>
              <h4 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Student-by-Student Algorithmic Verification Ledger</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Verified unit-test submissions executed inside the sandboxed test runner.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className={`font-semibold border-b ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Campus & Section</th>
                    <th className="py-3 px-4 text-center">Arrays</th>
                    <th className="py-3 px-4 text-center">Strings</th>
                    <th className="py-3 px-4 text-center">Hashing</th>
                    <th className="py-3 px-4 text-center">Trees</th>
                    <th className="py-3 px-4 text-center">Total Verified</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {filteredStudents.map((s) => {
                    const solved = studentSolvedProblems[s.id] || [];
                    const arraysCount = solved.filter((id) => id.includes('arrays')).length;
                    const stringsCount = solved.filter((id) => id.includes('strings')).length;
                    const hashingCount = solved.filter((id) => id.includes('hashing')).length;
                    const treesCount = solved.filter((id) => id.includes('trees')).length;

                    return (
                      <tr key={`matrix-${s.id}`} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-bold">{s.name}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {s.campus} · Sec {s.section}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={arraysCount > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {arraysCount} / 3
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={stringsCount > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {stringsCount} / 2
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={hashingCount > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {hashingCount} / 2
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={treesCount > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {treesCount} / 2
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-500 tabular-nums">
                          {solved.length} Solved
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* 4. Assignment Management Section */}
      {activeTab === 'assignments' && <FacultyAssignmentManager />}

      {/* 5. Question Bank */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>Approved Question Bank ({approvedQuestions.length} Questions)</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Questions actively used in student daily micro-quizzes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchImportModal(true)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                      : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-500 rotate-180" />
                  <span>Batch Import (CSV / JSON)</span>
                </button>

                <button
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showManualForm ? 'Close Form' : 'Upload Question'}</span>
                </button>
              </div>
            </div>

            {batchImportNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{batchImportNotice}</span>
              </div>
            )}

            <QuestionBatchImportModal
              isOpen={showBatchImportModal}
              onClose={() => setShowBatchImportModal(false)}
              existingQuestions={questions}
              onImport={(imported) => {
                batchImportQuestions(imported);
                setBatchImportNotice(`Successfully imported ${imported.length} verified questions into the Question Bank!`);
                setTimeout(() => setBatchImportNotice(null), 4000);
              }}
              isDark={isDark}
            />

            {/* Manual Form */}
            {showManualForm && (
              <form
                onSubmit={handleManualSubmit}
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h5 className="text-xs font-bold uppercase tracking-wider">Manual Question Entry</h5>
                <div>
                  <label className="block text-[11px] mb-1 font-semibold">Question Prompt</label>
                  <textarea
                    value={manualQText}
                    onChange={(e) => setManualQText(e.target.value)}
                    rows={2}
                    className={`w-full border rounded-lg p-2.5 text-xs outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {manualOptions.map((opt, i) => (
                    <div key={i}>
                      <label className="block text-[11px] mb-1 font-semibold">
                        Option {String.fromCharCode(65 + i)}
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...manualOptions];
                          copy[i] = e.target.value;
                          setManualOptions(copy);
                        }}
                        className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1 font-semibold">Correct Option</label>
                    <select
                      value={manualCorrect}
                      onChange={(e) => setManualCorrect(Number(e.target.value))}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] mb-1 font-semibold">Pedagogical Explanation</label>
                    <input
                      type="text"
                      value={manualExplanation}
                      onChange={(e) => setManualExplanation(e.target.value)}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="Why this answer is mathematically / programmatically correct..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save to Question Bank
                </button>
              </form>
            )}

            {/* Questions Table/List */}
            <div className="space-y-3">
              {approvedQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border space-y-2 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 font-bold">{q.topic}</span>
                      <span className="text-slate-400">·</span>
                      <span className="capitalize text-slate-500">{q.difficulty}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                        APPROVED
                      </span>
                    </div>
                  </div>
                  <h5 className="font-bold text-sm">{q.questionText}</h5>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span className="font-semibold text-emerald-500">Correct Answer: </span>
                    {q.options[q.correctOptionIndex]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. AI Approval Queue */}
      {activeTab === 'ai_queue' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>AI Approval Queue ({pendingQuestions.length} Pending Verification)</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Strict Quality Gate: Questions generated by Gemini AI must be verified by faculty before reaching students.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Topic filter for pending queue */}
                {availableQueueTopics.length > 0 && (
                  <select
                    value={queueTopicFilter}
                    onChange={(e) => setQueueTopicFilter(e.target.value)}
                    className={`text-xs px-2.5 py-2 rounded-xl border outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="all">All Topics ({questions.filter((q) => q.status === 'pending_approval').length})</option>
                    {availableQueueTopics.map((top) => (
                      <option key={top} value={top}>
                        {top}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleGenerateQuestions}
                  disabled={generatingAi}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingAi ? 'animate-spin' : ''}`} />
                  <span>{generatingAi ? 'Generating via Gemini...' : 'Generate 3 More via AI'}</span>
                </button>
              </div>
            </div>

            {/* AI Quality Benchmark Metric: % accepted without edits */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-200' : 'bg-indigo-50/80 border-indigo-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-base shrink-0">
                  {percentAcceptedWithoutEdits}%
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{percentAcceptedWithoutEdits}% Accepted Without Edits</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                      Strict Quality Threshold: &gt; 85%
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {approvedWithoutEditsCount} of {approvedAiQuestions.length || 0} approved questions required zero faculty edits ({aiGeneratedQuestions.length} total generated by Gemini AI).
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0">
                <span className="font-semibold text-slate-400">In Verification Gate:</span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold tabular-nums">
                  {pendingQuestions.length}
                </span>
              </div>
            </div>

            {genNotice && (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs">
                {genNotice}
              </div>
            )}

            {pendingQuestions.length === 0 ? (
              <IllustratedEmptyState
                type="all_caught_up"
                title="All Caught Up!"
                description="No peer questions are currently awaiting faculty verification in this view."
                isDark={isDark}
              />
            ) : (
              <div className="space-y-3">
                {pendingQuestions.map((q) => {
                  const isEditing = editingQuestionId === q.id;

                  if (isEditing) {
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border space-y-3 transition-colors ${
                          isDark ? 'bg-slate-950 border-indigo-500/40' : 'bg-white border-indigo-400 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs pb-1 border-b">
                          <span className="font-bold text-indigo-500">Edit Question Before Approving</span>
                          <span className="text-[10px] text-amber-500 font-bold">
                            Will mark as &quot;Edited Before Approval&quot;
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold mb-1">Question Prompt</label>
                          <textarea
                            value={editQText}
                            onChange={(e) => setEditQText(e.target.value)}
                            rows={2}
                            className={`w-full border rounded-lg p-2 text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold">Options & Correct Answer</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {editQOptions.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                                  editQCorrect === oIdx
                                    ? 'border-emerald-500 bg-emerald-500/5'
                                    : isDark
                                    ? 'border-slate-800 bg-slate-900'
                                    : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={editQCorrect === oIdx}
                                  onChange={() => setEditQCorrect(oIdx)}
                                  className="text-emerald-600"
                                />
                                <span className="font-bold text-[11px]">{String.fromCharCode(65 + oIdx)}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const copy = [...editQOptions];
                                    copy[oIdx] = e.target.value;
                                    setEditQOptions(copy);
                                  }}
                                  className={`flex-1 bg-transparent text-xs outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold mb-1">Pedagogical Explanation</label>
                          <input
                            type="text"
                            value={editQExplanation}
                            onChange={(e) => setEditQExplanation(e.target.value)}
                            className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateQuestion(q.id, {
                                questionText: editQText,
                                options: editQOptions,
                                correctOptionIndex: editQCorrect,
                                explanation: editQExplanation,
                                editedBeforeApproval: true,
                              });
                              approveQuestion(q.id, activeFaculty.name, true);
                              setEditingQuestionId(null);
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Save & Approve
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-3 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-500 font-bold">{q.topic}</span>
                          <span className="text-slate-400">·</span>
                          <span className="capitalize">{q.difficulty}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">
                            AI GENERATED
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveQuestion(q.id, activeFaculty.name, false)}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setEditQText(q.questionText);
                              setEditQOptions([...q.options]);
                              setEditQCorrect(q.correctOptionIndex);
                              setEditQExplanation(q.explanation);
                            }}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Edit3 className="w-3 h-3 text-indigo-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => rejectQuestion(q.id, activeFaculty.name)}
                            className="flex items-center gap-1 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      <h5 className="font-bold text-sm">{q.questionText}</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border ${
                              idx === q.correctOptionIndex
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                : isDark
                                ? 'bg-slate-900 border-slate-800 text-slate-300'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        className={`text-[11px] p-2.5 rounded-lg border ${
                          isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold text-indigo-500">Explanation: </span>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Syllabus Management */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div>
              <h4 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Syllabus Pacing & Taught Topics Gatekeeper</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Daily quiz questions are restricted to topics flagged as "Taught" below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {syllabusList.map((subject) => (
                <div
                  key={subject.id}
                  className={`p-4 rounded-xl border space-y-3 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <h5 className="font-bold text-sm">{subject.name}</h5>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {subject.code} · In charge: {subject.facultyInCharge}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {subject.weeks.map((week) => (
                      <div
                        key={week.weekNumber}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">
                            Week {week.weekNumber}: {week.topic}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {week.learningObjectives.join(' · ')}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSyllabusTopicTaught(subject.id, week.weekNumber)}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors shrink-0 ml-2 cursor-pointer ${
                            week.isTaught
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                              : isDark
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {week.isTaught ? 'Taught' : 'Upcoming'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Quiet Students */}
      {activeTab === 'quiet' && (
        <div
          className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-bold flex items-center gap-2 text-amber-500">
                <Clock className="w-4 h-4" />
                <span>Quiet Students Inactive for 5+ Days ({quietStudents.length} Students in Cohort)</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Send supportive non-punitive nudges encouraging students to restart micro-quizzes.
              </p>
            </div>

            {quietStudents.length > 0 && (
              <button
                onClick={handleBroadcastNudgeAllQuiet}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Nudge to All ({quietStudents.length})</span>
              </button>
            )}
          </div>

          {broadcastNudgeNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{broadcastNudgeNotice}</span>
            </div>
          )}

          {quietStudents.length === 0 ? (
            <IllustratedEmptyState
              type="all_caught_up"
              title="Fantastic Engagement!"
              description="Zero students in this filtered group are inactive for 5+ days. Keep up the great mentorship!"
              isDark={isDark}
            />
          ) : (
            <div className="space-y-2">
              {quietStudents.map((s) => (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{s.name}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {s.campus} · {s.year} · Section {s.section} · Last Active: {s.lastActiveDate}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sendFacultyNudge(s.id);
                      setBroadcastNudgeNotice(`Nudge sent to ${s.name}!`);
                      setTimeout(() => setBroadcastNudgeNotice(null), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Nudge</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. Faculty XP Override & Audit Console */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Section A: Auto-Submitted Quiz Attempts Review & Retake Approval */}
          <div
            className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2 text-amber-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Auto-Submitted Quiz Attempts & Retake Authorization</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Review exams auto-submitted when anti-cheat detected tab switching or leaving fullscreen. Authorize retakes when valid extenuating circumstances are established.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                {serverAutoSubmittedAttempts.length} Flagged Attempt(s)
              </div>
            </div>

            {retakeStatusNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{retakeStatusNotice}</span>
              </div>
            )}

            {serverAutoSubmittedAttempts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No active auto-submitted quiz violations found on server.
              </div>
            ) : (
              <div className="space-y-3">
                {serverAutoSubmittedAttempts.map((attempt) => {
                  const recordKey = attempt.id || `${attempt.quizId}_${attempt.studentId}`;
                  const isLocked = attempt.locked && !attempt.retakeGranted;

                  return (
                    <div
                      key={recordKey}
                      className={`p-4 rounded-xl border space-y-3 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-200">{attempt.studentName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-400">{attempt.studentId}</span>
                          <span className="text-slate-400">·</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                            {attempt.campus} Sec {attempt.section}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-amber-500 font-semibold">{attempt.quizTitle}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isLocked
                                ? 'bg-rose-500/15 text-rose-500'
                                : 'bg-emerald-500/15 text-emerald-500'
                            }`}
                          >
                            {isLocked ? 'Exam Locked' : 'Retake Authorized'}
                          </span>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            Violation: <strong className="text-rose-400 uppercase font-mono">{attempt.reason}</strong> ({attempt.switchCount || 1} switch event)
                          </span>
                          <span>Score at lock: {attempt.score} / {attempt.totalQuestions || 5}</span>
                          <span>Logged: {new Date(attempt.submittedAt).toLocaleTimeString()}</span>
                        </div>

                        {attempt.retakeGranted && (
                          <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-800 font-mono">
                            Retake granted by {attempt.grantedByName || 'Faculty'} · Note: &quot;{attempt.retakeReason}&quot;
                          </div>
                        )}
                      </div>

                      {isLocked && (
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Enter documented retake justification (e.g. Proctor confirmed laboratory power trip)..."
                            value={retakeNotes[recordKey] || ''}
                            onChange={(e) =>
                              setRetakeNotes({ ...retakeNotes, [recordKey]: e.target.value })
                            }
                            className={`flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const note = retakeNotes[recordKey] || 'Faculty approved retake after verification';
                              await grantQuizRetake(attempt.quizId, attempt.studentId, note, activeFaculty.name);
                              setRetakeStatusNotice(`Retake granted for ${attempt.studentName}! Notification dispatched to student.`);
                              setServerAutoSubmittedAttempts((prev) =>
                                prev.map((r) =>
                                  (r.id === recordKey || (r.quizId === attempt.quizId && r.studentId === attempt.studentId))
                                    ? { ...r, locked: false, retakeGranted: true, retakeReason: note, grantedByName: activeFaculty.name }
                                    : r
                                )
                              );
                              setTimeout(() => setRetakeStatusNotice(null), 4000);
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                          >
                            Authorize Retake
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Faculty Academic Integrity & XP Void Console */}
          <div
            className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div>
              <h4 className="text-base font-bold flex items-center gap-2 text-rose-500">
                <ShieldAlert className="w-4 h-4" />
                <span>Faculty Academic Integrity & XP Void Console</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Void suspicious XP entries with a mandatory logged reason. The student's XP will be immediately recomputed.
              </p>
            </div>

            {voidNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs">
                {voidNotice}
              </div>
            )}

            <form
              onSubmit={handleVoidXp}
            className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <label className="block text-xs font-bold mb-1">Ledger Entry ID to Void</label>
              <input
                type="text"
                value={voidLedgerId}
                onChange={(e) => setVoidLedgerId(e.target.value)}
                placeholder="e.g. led_1001 or select from recent filtered ledger below"
                className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Official Reason for Voiding</label>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Detected rapid automated speed-clicking without solving"
                className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Void Entry & Recompute Student XP
            </button>
          </form>

          {/* Filtered Student Ledger Entries */}
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Verifiable Ledger Entries for Filtered Cohort ({cohortLedger.length})
            </h5>
            {/* 1. Mobile Cards (< 640px) */}
            <div className="block sm:hidden space-y-3">
              {cohortLedger.slice(0, 15).map((entry) => {
                const student = students.find((s) => s.id === entry.studentId);
                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{entry.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.status === 'valid'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {entry.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs">{student?.name || entry.studentId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student?.campus} · Sec {student?.section} · {entry.actionKey}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-emerald-500 tabular-nums shrink-0">
                        +{entry.points} XP
                      </div>
                    </div>

                    {entry.status === 'valid' && (
                      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setVoidLedgerId(entry.id);
                            setVoidReason('Faculty manual review flag');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 touch-target cursor-pointer"
                        >
                          Select to Void
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 2. Tablet & Desktop Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className={`font-semibold border-b ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <tr>
                    <th className="py-2.5 px-3">Entry ID</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Quick Void</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {cohortLedger.slice(0, 15).map((entry) => {
                    const student = students.find((s) => s.id === entry.studentId);
                    return (
                      <tr key={entry.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{entry.id}</td>
                        <td className="py-2.5 px-3 font-medium">
                          {student?.name || entry.studentId}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {student?.campus} · Sec {student?.section}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{entry.actionKey}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-500 tabular-nums">
                          +{entry.points} XP
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.status === 'valid'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {entry.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {entry.status === 'valid' && (
                            <button
                              type="button"
                              onClick={() => {
                                setVoidLedgerId(entry.id);
                                setVoidReason('Faculty manual review flag');
                              }}
                              className="text-[11px] font-semibold text-rose-500 hover:underline"
                            >
                              Select
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
