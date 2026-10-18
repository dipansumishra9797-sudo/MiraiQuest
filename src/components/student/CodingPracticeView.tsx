import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/appStore';
import { CODING_TOPICS, TopicMetadata } from '../../data/codingPracticeCatalog';
import { runProblemCode, RunSummary } from '../../modules/codeRunner';
import { SupportedLanguage, getLanguageStarter } from '../../data/codingProblems';
import {
  Code,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Play,
  ArrowRight,
  Terminal,
  Zap,
  HelpCircle,
  Trophy,
  LayoutGrid,
  Hash,
  Type,
  Maximize2,
  Repeat,
  ArrowUpDown,
  Link2,
  Layers,
  GitBranch,
  Share2,
  Cpu,
  Binary,
  Calculator,
  GitFork,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Flame,
} from 'lucide-react';

const TOPIC_ICON_MAP: Record<string, React.ElementType> = {
  arrays: LayoutGrid,
  strings: Type,
  hashing: Hash,
  two_pointers: GitFork,
  sliding_window: Maximize2,
  recursion: Repeat,
  sorting_searching: ArrowUpDown,
  linked_lists: Link2,
  stacks_queues: Layers,
  trees: GitBranch,
  graphs: Share2,
  dynamic_programming: Cpu,
  greedy: Sparkles,
  bit_manipulation: Binary,
  math: Calculator,
  python_basics: Code,
};

export const CodingPracticeView: React.FC = () => {
  const {
    activeStudent,
    allCodingProblems,
    studentSolvedProblems,
    solveCodingProblem,
    generateAiTopicQuestions,
    ledger,
    isDark,
    studentDrafts,
    saveStudentDraft,
  } = useApp();

  const solvedIds = useMemo(() => {
    return new Set(studentSolvedProblems[activeStudent.id] || []);
  }, [studentSolvedProblems, activeStudent.id]);

  // Filters
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsolved' | 'solved'>('all');

  // Active coding question inside the embedded sandbox
  const [activeProblemId, setActiveProblemId] = useState<string>(allCodingProblems[0]?.id || 'mq_arrays_1');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [userCode, setUserCode] = useState<string>('');
  const [activeTestTab, setActiveTestTab] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);

  const activeProblem = useMemo(() => {
    return allCodingProblems.find((p) => p.id === activeProblemId) || allCodingProblems[0];
  }, [allCodingProblems, activeProblemId]);

  // Sync starter code or student draft when active problem or language changes
  React.useEffect(() => {
    if (activeProblem) {
      const saved = studentDrafts?.[activeProblem.id]?.[selectedLanguage];
      setUserCode(saved || getLanguageStarter(activeProblem, selectedLanguage));
      setRunSummary(null);
      setActiveTestTab(0);
      setShowHints(false);
    }
  }, [activeProblemId, selectedLanguage, activeProblem]);

  // Daily solves count
  const today = new Date().toISOString().split('T')[0];
  const todaySolves = useMemo(() => {
    return ledger.filter(
      (e) =>
        e.studentId === activeStudent.id &&
        e.actionKey === 'solve_coding' &&
        e.date === today &&
        e.status === 'valid'
    ).length;
  }, [ledger, activeStudent.id, today]);

  // Topic Statistics (Solved vs Total)
  const topicStats = useMemo(() => {
    return CODING_TOPICS.map((t) => {
      const topicProblems = allCodingProblems.filter((p: any) => p.topicId === t.id);
      const solvedInTopic = topicProblems.filter((p) => solvedIds.has(p.id));
      const totalCount = topicProblems.length || 1;
      const solvedCount = solvedInTopic.length;
      const percentage = Math.round((solvedCount / totalCount) * 100);
      return {
        ...t,
        totalCount,
        solvedCount,
        percentage,
        isMastered: percentage >= 60,
      };
    });
  }, [allCodingProblems, solvedIds]);

  // Dynamically find weakest topic for the "Recommended for you" row
  const recommendedProblem = useMemo(() => {
    // Sort topics by lowest percentage solved
    const sortedWeakestTopics = [...topicStats].sort((a, b) => a.percentage - b.percentage);
    for (const top of sortedWeakestTopics) {
      const topicProblems = allCodingProblems.filter((p: any) => p.topicId === top.id);
      const unsolved = topicProblems.find((p) => !solvedIds.has(p.id));
      if (unsolved) {
        return { problem: unsolved, topic: top };
      }
    }
    // Fallback to first unsolved problem overall
    const anyUnsolved = allCodingProblems.find((p) => !solvedIds.has(p.id));
    return anyUnsolved ? { problem: anyUnsolved, topic: topicStats[0] } : null;
  }, [topicStats, allCodingProblems, solvedIds]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return allCodingProblems.filter((p: any) => {
      const matchesTopic = selectedTopicId === 'all' || p.topicId === selectedTopicId;
      const matchesDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
      const isSolved = solvedIds.has(p.id);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'solved' && isSolved) ||
        (statusFilter === 'unsolved' && !isSolved);
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTopic && matchesDifficulty && matchesStatus && matchesSearch;
    });
  }, [allCodingProblems, selectedTopicId, difficultyFilter, statusFilter, searchQuery, solvedIds]);

  // Run tests without submitting
  const handleRunCode = async () => {
    if (!activeProblem) return;
    setIsRunning(true);
    setRunSummary(null);

    try {
      const summary = await runProblemCode(activeProblem, userCode, selectedLanguage);
      setRunSummary(summary);
      if (summary.allPassed) {
        setFeedbackToast({
          message: `All ${summary.totalTests} tests passed in sandbox! Click "Submit Solution" to earn XP.`,
          type: 'success',
        });
      } else {
        setFeedbackToast({
          message: `${summary.totalPassed}/${summary.totalTests} tests passed. Check test case outputs below.`,
          type: 'info',
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        message: err?.message || 'Error running code sandbox.',
        type: 'error',
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setFeedbackToast(null), 4000);
    }
  };

  // Submit verified solution for XP
  const handleSubmitSolution = async () => {
    if (!activeProblem) return;
    setIsSubmitting(true);

    try {
      const summary = await runProblemCode(activeProblem, userCode, selectedLanguage);
      setRunSummary(summary);

      if (!summary.allPassed) {
        setFeedbackToast({
          message: `Verification failed: ${summary.totalPassed}/${summary.totalTests} tests passed. Fix errors before official XP can be awarded.`,
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      // Claim verified solve XP
      const res = solveCodingProblem(activeStudent.id, activeProblem.id);
      if (res.success) {
        setFeedbackToast({
          message: res.message,
          type: 'success',
        });
        // Auto-update to next recommended problem if available!
        if (res.nextProblemId) {
          setTimeout(() => {
            setActiveProblemId(res.nextProblemId!);
          }, 1200);
        }
      } else {
        setFeedbackToast({
          message: res.message,
          type: 'error',
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        message: err?.message || 'Submission verification failed.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackToast(null), 5000);
    }
  };

  // Generate 10 AI Questions for topic
  const handleGenerateAiQuestions = async (topicId: string) => {
    setGeneratingTopicId(topicId);
    const res = await generateAiTopicQuestions(topicId, 10);
    setGeneratingTopicId(null);
    setFeedbackToast({
      message: res.message,
      type: res.success ? 'success' : 'error',
    });
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-md ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : feedbackToast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-300'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{feedbackToast.message}</span>
        </div>
      )}

      {/* Header & Quota Banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-1">
            <Code className="w-4 h-4 text-emerald-500" />
            <span>TOPIC-WISE COMPETITIVE PRACTICE ARENA · 16 TOPICS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Algorithmic Mastery & Sandboxed Unit-Tests</h2>
          <p className={`text-xs mt-0.5 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Solve curated topic challenges across 16 collegiate foundational subjects. Verified submissions log directly to your cryptographically auditable XP ledger.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`p-3.5 rounded-xl border text-center min-w-[120px] transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Daily Cap
            </div>
            <div className="text-xl font-extrabold tabular-nums mt-0.5 text-indigo-600 dark:text-indigo-400">
              {todaySolves} / 10
            </div>
            <div className="text-[10px] text-emerald-500 font-medium">Max 10 Solves/Day</div>
          </div>

          <div
            className={`p-3.5 rounded-xl border text-center min-w-[120px] transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Solved
            </div>
            <div className="text-xl font-extrabold text-emerald-500 tabular-nums mt-0.5">
              {solvedIds.size} / {allCodingProblems.length}
            </div>
            <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {Math.round((solvedIds.size / Math.max(1, allCodingProblems.length)) * 100)}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* Recommended For You Row */}
      {recommendedProblem && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark
              ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30 text-slate-100'
              : 'bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 border-indigo-200 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Recommended For You
                </span>
                <span className="text-xs font-semibold text-indigo-500">
                  Target Weakest Topic: {recommendedProblem.topic.name} ({recommendedProblem.topic.percentage}% Mastered)
                </span>
              </div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{recommendedProblem.problem.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    recommendedProblem.problem.difficulty === 'easy'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : recommendedProblem.problem.difficulty === 'medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {recommendedProblem.problem.difficulty} (+{recommendedProblem.problem.xpReward} XP)
                </span>
              </h3>
              <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {recommendedProblem.problem.description}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveProblemId(recommendedProblem.problem.id);
                setSelectedTopicId(recommendedProblem.topic.id);
                window.scrollTo({ top: 750, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
            >
              <span>Solve & Verify in Compiler</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 16 Topic Cards Grid with Progress Rings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            SELECT FROM 16 TOPICS ({CODING_TOPICS.length} TOTAL)
          </h3>
          {selectedTopicId !== 'all' && (
            <button
              onClick={() => setSelectedTopicId('all')}
              className="text-xs font-semibold text-indigo-500 hover:underline cursor-pointer"
            >
              Reset Topic Filter (View All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {topicStats.map((topic) => {
            const Icon = TOPIC_ICON_MAP[topic.id] || Code;
            const isSelected = selectedTopicId === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(isSelected ? 'all' : topic.id)}
                className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div>
                  <div className="mx-auto w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold truncate leading-tight">{topic.name}</div>
                  <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {topic.solvedCount} / {topic.totalCount}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <div className="text-[9px] font-bold text-emerald-500 mt-1 tabular-nums">
                    {topic.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name, category, or keyword..."
            className={`w-full bg-transparent text-xs outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty filter */}
          <div className="flex items-center rounded-lg border p-0.5 text-xs font-medium">
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  difficultyFilter === diff
                    ? 'bg-indigo-600 text-white font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center rounded-lg border p-0.5 text-xs font-medium">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'unsolved', label: 'Unsolved' },
              { id: 'solved', label: 'Solved' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Add 10 with AI button */}
          <button
            onClick={() => handleGenerateAiQuestions(selectedTopicId === 'all' ? 'arrays' : selectedTopicId)}
            disabled={generatingTopicId !== null}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="Generate 10 topic questions with Gemini AI for Teacher Approval Queue"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generatingTopicId ? 'animate-spin' : ''}`} />
            <span>{generatingTopicId ? 'Generating...' : '+ Add 10 More Questions with AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane View: Problem List (Left) + Sandboxed Code Compiler (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Question List (5 columns) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Showing {filteredProblems.length} Problems
            </span>
            <span className="text-indigo-500 font-bold">
              Topic: {selectedTopicId === 'all' ? 'All Topics' : selectedTopicId.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredProblems.length === 0 ? (
              <div
                className={`p-8 rounded-xl border text-center ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                No problems match your current filter. Try adjusting difficulty or search criteria.
              </div>
            ) : (
              filteredProblems.map((p: any) => {
                const isSolved = solvedIds.has(p.id);
                const isSelected = activeProblemId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProblemId(p.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-500/10 ring-1 ring-indigo-500/50'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                            •
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate">{p.title}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              p.difficulty === 'easy'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : p.difficulty === 'medium'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {p.category} · +{p.xpReward} XP
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSolved ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                          Solved
                        </span>
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Embedded Sandboxed Mini Code Compiler (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className={`p-5 rounded-2xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            {/* Problem Header Inside Editor */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      activeProblem.difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : activeProblem.difficulty === 'medium'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-indigo-500">
                    +{activeProblem.xpReward} XP Reward
                  </span>
                  {solvedIds.has(activeProblem.id) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      ✓ Already Solved
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold">{activeProblem.title}</h3>
                <div className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {activeProblem.description}
                </div>
              </div>

              {/* Language Switcher: JS, Python, C, C++17, Java */}
              <div className="flex items-center gap-1 rounded-lg border p-0.5 text-xs font-semibold shrink-0 flex-wrap">
                {[
                  { id: 'javascript', label: 'JS' },
                  { id: 'python', label: 'Python' },
                  { id: 'c', label: 'C' },
                  { id: 'cpp', label: 'C++17' },
                  { id: 'java', label: 'Java' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLanguage(item.id as SupportedLanguage)}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer text-xs font-semibold ${
                      selectedLanguage === item.id
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Constraints & Hints toggles */}
            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Function: <code className="font-mono text-indigo-500">{activeProblem.functionName}()</code>
              </span>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-indigo-500 hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHints ? 'Hide Hints' : 'Need a Hint?'}</span>
              </button>
            </div>

            {showHints && (
              <div
                className={`p-3 rounded-xl border text-xs mb-3 space-y-1 ${
                  isDark ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Pedagogical Hints:
                </div>
                {activeProblem.hints?.map((h: string, i: number) => (
                  <div key={i}>• {h}</div>
                )) || <div>Consider boundary conditions and time vs memory trade-offs.</div>}
              </div>
            )}

            {/* Code Editor Textarea */}
            <div className="relative rounded-xl overflow-hidden border">
              <div
                className={`px-3 py-1.5 text-[10px] font-mono border-b flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <span>Solution Sandbox ({selectedLanguage.toUpperCase()})</span>
                <span>Tab inserts 2 spaces</span>
              </div>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={11}
                spellCheck={false}
                className={`w-full p-3 font-mono text-xs outline-none resize-y leading-relaxed ${
                  isDark ? 'bg-slate-950 text-emerald-300' : 'bg-[#1E1E1E] text-emerald-400'
                }`}
              />
            </div>

            {/* Test Case Tab Bar */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Test Cases & Assertions
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeProblem.testCases?.length || 0} Test Cases
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2">
                {activeProblem.testCases?.map((tc, idx) => (
                  <button
                    key={tc.id || idx}
                    onClick={() => setActiveTestTab(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTestTab === idx
                        ? 'bg-indigo-600 text-white'
                        : isDark
                        ? 'bg-slate-950 text-slate-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>

              {activeProblem.testCases?.[activeTestTab] && (
                <div
                  className={`p-3 rounded-xl border font-mono text-xs space-y-1.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-slate-500 text-[11px]">Input: </span>
                    <span>{activeProblem.testCases[activeTestTab].inputFormatted}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Expected: </span>
                    <span className="text-emerald-500 font-bold">
                      {activeProblem.testCases[activeTestTab].expectedOutputFormatted}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Run Output Display if available */}
            {runSummary && (
              <div
                className={`mt-3 p-3.5 rounded-xl border text-xs font-mono animate-in fade-in duration-150 ${
                  runSummary.allPassed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-1">
                  <span>{runSummary.allPassed ? '✓ All Tests Passed' : '✗ Tests Failed'}</span>
                  <span>
                    {runSummary.totalPassed}/{runSummary.totalTests} passed · {runSummary.overallTimeMs}ms
                  </span>
                </div>
                {runSummary.results?.[activeTestTab] && (
                  <div className="text-[11px] mt-1 space-y-0.5">
                    <div>Actual Output: {runSummary.results[activeTestTab].actualOutputFormatted}</div>
                    {runSummary.results[activeTestTab].error && (
                      <div className="text-rose-400 font-bold">Error: {runSummary.results[activeTestTab].error}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions: Run Tests vs Submit Solution */}
            <div className="mt-5 pt-3 border-t flex items-center justify-end gap-3">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRunning ? 'Running Tests...' : 'Run in Sandbox'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting || isRunning}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : `Submit Solution (+${activeProblem.xpReward} XP)`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
