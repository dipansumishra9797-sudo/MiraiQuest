import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CodingProblem,
  Platform,
  Difficulty,
  SupportedLanguage,
} from '../../data/codingProblems';
import { runProblemCode, RunSummary } from '../../modules/codeRunner';
import { useApp } from '../../store/appStore';
import { GoogleSearchCodingModal } from './GoogleSearchCodingModal';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Copy,
  Terminal,
  Zap,
  Sparkles,
  ExternalLink,
  Code2,
  Filter,
  Check,
  ChevronRight,
  Flame,
  Award,
  Search,
  Globe,
} from 'lucide-react';

export const InbuiltCodeCompiler: React.FC = () => {
  const { activeStudent, triggerXpEvent, allCodingProblems, theme } = useApp();
  const isDark = theme === 'dark';

  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(allCodingProblems[0]?.id || 'lc_1');

  // Active problem & editor state
  const activeProblem =
    allCodingProblems.find((p) => p.id === selectedProblemId) || allCodingProblems[0];

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(activeProblem?.starterCode?.javascript || '');
  const [activeTestTab, setActiveTestTab] = useState<number>(0);
  const [customInputText, setCustomInputText] = useState<string>('');

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
  const [submissionSuccessToast, setSubmissionSuccessToast] = useState<{
    points: number;
    title: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync starter code when problem or language changes
  useEffect(() => {
    setCode(activeProblem.starterCode[selectedLanguage]);
    setRunSummary(null);
    setActiveTestTab(0);
  }, [selectedProblemId, selectedLanguage]);

  // Filtered problems list
  const filteredProblems = allCodingProblems.filter((p) => {
    const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
    const matchesDifficulty = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    return matchesPlatform && matchesDifficulty;
  });

  // Handle Tab key in code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    setCode(activeProblem.starterCode[selectedLanguage]);
    setRunSummary(null);
  };

  // Run visible sample test cases
  const handleRunSampleCases = async () => {
    setIsRunning(true);
    const summary = await runProblemCode(activeProblem, code, selectedLanguage, true);
    setRunSummary(summary);
    setIsRunning(false);
  };

  // Submit Solution (runs all cases including hidden, awards XP)
  const handleSubmitSolution = async () => {
    setIsSubmitting(true);
    const summary = await runProblemCode(activeProblem, code, selectedLanguage, false);
    setRunSummary(summary);
    setIsSubmitting(false);

    if (summary.allPassed) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Safe fallback
      }

      // Mark problem as solved locally
      setSolvedProblemIds((prev) => new Set(prev).add(activeProblem.id));

      // Trigger verified XP Event
      const res = triggerXpEvent({
        eventId: `ev_compiler_${Date.now()}`,
        studentId: activeStudent.id,
        actionKey: 'solve_coding',
        timestamp: new Date().toISOString(),
        metadata: {
          problemId: activeProblem.id,
          difficulty: activeProblem.difficulty,
          problemTitle: activeProblem.title,
          platform: activeProblem.platform,
          language: selectedLanguage,
          verificationSource: `Inbuilt Compiler: Verified ${activeProblem.platform.toUpperCase()} Test Suite Passed`,
        },
      });

      if (res.success) {
        setSubmissionSuccessToast({
          points: res.pointsAwarded,
          title: activeProblem.title,
        });
        setTimeout(() => setSubmissionSuccessToast(null), 5000);
      }
    }
  };

  // Platform visual badges
  const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case 'leetcode':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            LeetCode
          </span>
        );
      case 'hackerrank':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            HackerRank
          </span>
        );
      case 'codeforces':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Codeforces
          </span>
        );
    }
  };

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return <span className="text-emerald-400 font-semibold text-[11px]">Easy (+10 XP)</span>;
      case 'medium':
        return <span className="text-amber-400 font-semibold text-[11px]">Medium (+20 XP)</span>;
      case 'hard':
        return <span className="text-rose-400 font-semibold text-[11px]">Hard (+40 XP)</span>;
    }
  };

  // Line numbers calculation
  const lineCount = Math.max(code.split('\n').length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {submissionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">Accepted & Verified!</div>
            <div className="text-[11px] text-emerald-300">
              +{submissionSuccessToast.points} XP awarded for "{submissionSuccessToast.title}".
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>INBUILT ALGORITHMIC PRACTICE IDE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Competitive Code Arena</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-normal border border-indigo-500/40">
              Compiler Sandbox
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Practice curated algorithmic challenges from LeetCode, HackerRank, and Codeforces directly inside MSOT LevelUp.
            Execute unit tests in real time and submit verified solutions for official XP.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Problems Solved</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">
              {solvedProblemIds.size + (activeStudent.codingHandles.verifiedProblemsCount || 0)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified XP Rate</div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">
              10-40 <span className="text-xs font-normal text-slate-400">XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Platform Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-medium mr-1 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Filter className="w-3.5 h-3.5" /> Platform:
          </span>
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'leetcode', label: 'LeetCode' },
            { id: 'hackerrank', label: 'HackerRank' },
            { id: 'codeforces', label: 'Codeforces' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedPlatform(item.id as any)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedPlatform === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter & Google Search Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap mr-1">
            <span className={`font-medium mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Difficulty:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'easy', label: 'Easy' },
              { id: 'medium', label: 'Medium' },
              { id: 'hard', label: 'Hard' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedDifficulty(item.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedDifficulty === item.id
                    ? isDark
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'bg-slate-200 text-slate-900 border border-slate-300 font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-emerald-200" />
            <span>Google Search Fetch</span>
          </button>
        </div>
      </div>

      {/* Main IDE Workspace: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Browser & Statement (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Problem Selector Dropdown / Quick Switcher */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Select Practice Problem ({filteredProblems.length} available)
            </label>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
            >
              {filteredProblems.map((p) => {
                const isSolved = solvedProblemIds.has(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {isSolved ? '✓ ' : ''}[{p.platform.toUpperCase()}] {p.title} ({p.difficulty.toUpperCase()} · +{p.xpReward} XP)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Problem Statement Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getPlatformBadge(activeProblem.platform)}
                  {activeProblem.platformProblemNumber && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{activeProblem.platformProblemNumber}
                    </span>
                  )}
                </div>
                <div>{getDifficultyBadge(activeProblem.difficulty)}</div>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{activeProblem.title}</span>
                  {solvedProblemIds.has(activeProblem.id) && (
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Solved
                    </span>
                  )}
                </h3>
                <span className="text-xs font-bold text-emerald-400">+{activeProblem.xpReward} XP</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800">
                  {activeProblem.category}
                </span>
                {activeProblem.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed border-t border-slate-800/80 pt-3">
              {activeProblem.description}
            </div>

            {/* Examples */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sample Test Cases & Scenarios
              </div>
              {activeProblem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5 font-mono"
                >
                  <div className="text-[10px] font-sans font-semibold text-indigo-400">Example {idx + 1}:</div>
                  <div className="text-slate-300">
                    <span className="text-slate-500 font-sans">Input: </span>
                    {ex.input}
                  </div>
                  <div className="text-emerald-300">
                    <span className="text-slate-500 font-sans">Output: </span>
                    {ex.output}
                  </div>
                  {ex.explanation && (
                    <div className="text-[11px] font-sans text-slate-400 pt-0.5 leading-normal">
                      <span className="text-slate-500">Explanation: </span>
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Constraints
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 font-mono">
                {activeProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Inbuilt Code Editor & Test Console (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Code Editor Container */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="javascript">JavaScript (Node ES2024)</option>
                  <option value="python">Python 3.12</option>
                  <option value="cpp">C++ (GCC 13)</option>
                  <option value="java">Java (OpenJDK 21)</option>
                </select>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  title="Reset to boilerplate"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors border border-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  title="Copy code"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors border border-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Editor Body with Line Numbers */}
            <div className="flex bg-slate-950/90 min-h-[340px] max-h-[460px] overflow-y-auto font-mono text-xs text-slate-200">
              {/* Line Numbers Bar */}
              <div className="py-4 pl-3 pr-2 text-right text-slate-600 select-none bg-slate-950 border-r border-slate-800/80 shrink-0 min-w-[38px]">
                {lineNumbers.map((num) => (
                  <div key={num} className="leading-6">
                    {num}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 p-4 bg-transparent text-slate-100 resize-none outline-none leading-6 font-mono overflow-x-auto whitespace-pre tab-2"
                rows={lineCount}
              />
            </div>

            {/* Run & Submit Action Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Compiler Sandbox Ready</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Run Sample Cases */}
                <button
                  onClick={handleRunSampleCases}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running Tests...' : 'Run Code'}</span>
                </button>

                {/* Submit Solution */}
                <button
                  onClick={handleSubmitSolution}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-bounce' : ''}`} />
                  <span>{isSubmitting ? 'Evaluating Full Suite...' : 'Submit Solution (+XP)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Case & Diagnostics Console */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Test Execution & Verdict</span>
              </div>

              {runSummary && (
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      runSummary.allPassed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {runSummary.allPassed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Accepted ({runSummary.totalPassed}/{runSummary.totalTests})</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Wrong Answer ({runSummary.totalPassed}/{runSummary.totalTests})</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {runSummary.overallTimeMs} ms · {runSummary.memoryMb} MB
                  </span>
                </div>
              )}
            </div>

            {/* Error banner if any */}
            {runSummary?.errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono whitespace-pre-wrap">
                {runSummary.errorMessage}
              </div>
            )}

            {/* Test Case Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
              {activeProblem.testCases.map((tc, idx) => {
                const result = runSummary?.results.find((r) => r.testCaseId === tc.id);
                const hasResult = !!result;
                const passed = result?.passed;

                return (
                  <button
                    key={tc.id}
                    onClick={() => setActiveTestTab(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      activeTestTab === idx
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900'
                    }`}
                  >
                    <span>Case {idx + 1}</span>
                    {hasResult && (
                      <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Test Case Detail */}
            {activeProblem.testCases[activeTestTab] && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2.5 font-mono">
                <div>
                  <div className="text-[10px] font-sans text-slate-500 uppercase font-semibold mb-0.5">
                    Input Parameters
                  </div>
                  <div className="text-slate-200 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {activeProblem.testCases[activeTestTab].inputFormatted}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] font-sans text-slate-500 uppercase font-semibold mb-0.5">
                      Expected Output
                    </div>
                    <div className="text-emerald-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                      {activeProblem.testCases[activeTestTab].expectedOutputFormatted}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-sans text-slate-500 uppercase font-semibold mb-0.5">
                      Your Output
                    </div>
                    <div
                      className={`p-2 rounded-lg border font-mono ${
                        runSummary?.results[activeTestTab]
                          ? runSummary.results[activeTestTab].passed
                            ? 'bg-slate-900 text-emerald-400 border-slate-800'
                            : 'bg-rose-950/30 text-rose-400 border-rose-500/30'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {runSummary?.results[activeTestTab]
                        ? runSummary.results[activeTestTab].actualOutputFormatted
                        : 'Click "Run Code" or "Submit Solution" to test'}
                    </div>
                  </div>
                </div>

                {/* Stdout / Console logs if any */}
                {runSummary?.results[activeTestTab]?.stdout &&
                  runSummary.results[activeTestTab].stdout.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] font-sans text-slate-500 uppercase font-semibold mb-0.5">
                        Captured Standard Output (stdout)
                      </div>
                      <div className="text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px] whitespace-pre-wrap">
                        {runSummary.results[activeTestTab].stdout.join('\n')}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Search Problem Importer Modal */}
      <GoogleSearchCodingModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectProblem={(p) => {
          setSelectedProblemId(p.id);
        }}
      />
    </div>
  );
};
