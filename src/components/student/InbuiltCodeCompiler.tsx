import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CodingProblem,
  Platform,
  Difficulty,
  SupportedLanguage,
  getLanguageStarter,
} from '../../data/codingProblems';
import {
  runProblemCode,
  runDirectCode,
  RunSummary,
  TestExecutionResult,
} from '../../modules/codeRunner';
import { useApp } from '../../store/appStore';
import { GoogleSearchCodingModal } from './GoogleSearchCodingModal';
import {
  Play,
  Send,
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
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Clock,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export const InbuiltCodeCompiler: React.FC = () => {
  const {
    activeStudent,
    triggerXpEvent,
    allCodingProblems,
    isDark,
    studentDrafts,
    saveStudentDraft,
  } = useApp();

  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    allCodingProblems[0]?.id || 'lc_1'
  );

  // Active problem
  const activeProblem =
    allCodingProblems.find((p) => p.id === selectedProblemId) || allCodingProblems[0];

  // Editor configuration
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(() => {
    const saved = studentDrafts?.[allCodingProblems[0]?.id]?.[selectedLanguage];
    return saved || getLanguageStarter(allCodingProblems[0] || {}, selectedLanguage);
  });

  const [fontSize, setFontSize] = useState<number>(14);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Search in code
  const [showFindBar, setShowFindBar] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [cursorLine, setCursorLine] = useState<number>(1);
  const [cursorCol, setCursorCol] = useState<number>(1);

  // Resizable split dividers
  // Horizontal split (problem vs editor pane) on laptop
  const [splitRatioH, setSplitRatioH] = useState<number>(40);
  const [isDraggingH, setIsDraggingH] = useState<boolean>(false);

  // Vertical split (editor vs output panel)
  const [splitRatioV, setSplitRatioV] = useState<number>(60);
  const [isDraggingV, setIsDraggingV] = useState<boolean>(false);

  // Mobile Workspace Tabs ('problem' | 'code' | 'output')
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'output'>('code');

  // Output panel tabs ('test_cases' | 'output' | 'errors' | 'custom_input')
  const [outputTab, setOutputTab] = useState<'test_cases' | 'output' | 'errors' | 'custom_input'>(
    'test_cases'
  );
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionState, setExecutionState] = useState<'idle' | 'compiling' | 'running' | 'finished'>('idle');
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [failingLine, setFailingLine] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync draft code when problem or language changes
  useEffect(() => {
    if (activeProblem) {
      const saved = studentDrafts?.[activeProblem.id]?.[selectedLanguage];
      setCode(saved || getLanguageStarter(activeProblem, selectedLanguage));
      setRunSummary(null);
      setFailingLine(null);
      setActiveTestCaseIndex(0);
    }
  }, [selectedProblemId, selectedLanguage, activeProblem]);

  // Save draft debounce
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeProblem) {
      saveStudentDraft(activeProblem.id, selectedLanguage, newCode);
    }
  };

  // Keyboard Shortcuts (Ctrl/Cmd + Enter -> Run, Ctrl/Cmd + S -> Save, Ctrl/Cmd + F -> Find)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      } else if (modKey && e.key === 's') {
        e.preventDefault();
        if (activeProblem) {
          saveStudentDraft(activeProblem.id, selectedLanguage, code);
          setToastMessage({ type: 'info', text: 'Draft code saved locally.' });
          setTimeout(() => setToastMessage(null), 2500);
        }
      } else if (modKey && e.key === 'f') {
        e.preventDefault();
        setShowFindBar((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        if (showFindBar) setShowFindBar(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [code, selectedLanguage, activeProblem, isFullscreen, showFindBar]);

  // Draggable Divider Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingH && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const ratio = ((e.clientX - rect.left) / rect.width) * 100;
        if (ratio >= 25 && ratio <= 65) setSplitRatioH(ratio);
      }
      if (isDraggingV && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const ratio = ((e.clientY - rect.top) / rect.height) * 100;
        if (ratio >= 30 && ratio <= 80) setSplitRatioV(ratio);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingH(false);
      setIsDraggingV(false);
    };

    if (isDraggingH || isDraggingV) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingH, isDraggingV]);

  // Enhanced Editor Key Down: Auto-indent, Tab, Auto-closing brackets
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. Tab Indentation (2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      handleCodeChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // 2. Auto-closing brackets and quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key]) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const newCode = code.substring(0, start) + e.key + closeChar + code.substring(end);
      handleCodeChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 3. Auto-indentation on Enter
    if (e.key === 'Enter') {
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLine = code.substring(lineStart, start);
      const matchIndent = currentLine.match(/^\s*/);
      let indent = matchIndent ? matchIndent[0] : '';

      // If line ended with colon (Python) or opening brace (JS/C++/Java), add extra indent
      if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith(':')) {
        indent += '  ';
      }

      e.preventDefault();
      const newCode = code.substring(0, start) + '\n' + indent + code.substring(end);
      handleCodeChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
      }, 0);
    }
  };

  // Cursor position tracking
  const handleCursorMove = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const lines = code.substring(0, pos).split('\n');
    setCursorLine(lines.length);
    setCursorCol(lines[lines.length - 1].length + 1);
  };

  // Run Code (Sample Cases or Custom Input)
  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionState('compiling');
    setMobileTab('output');
    setFailingLine(null);

    // If Custom Input tab active or custom input entered, run direct execution
    if (outputTab === 'custom_input' || customInputText.trim().length > 0) {
      setTimeout(() => setExecutionState('running'), 200);
      const summary = await runDirectCode(selectedLanguage, code, customInputText);
      setRunSummary(summary);
      setIsRunning(false);
      setExecutionState('finished');
      if (summary.errorLine) setFailingLine(summary.errorLine);
      if (summary.errorMessage) setOutputTab('errors');
      else setOutputTab('output');
      return;
    }

    // Otherwise run visible sample test cases
    setTimeout(() => setExecutionState('running'), 250);
    const summary = await runProblemCode(activeProblem, code, selectedLanguage, true);
    setRunSummary(summary);
    setIsRunning(false);
    setExecutionState('finished');

    if (summary.errorLine) setFailingLine(summary.errorLine);
    if (summary.compileError) {
      setOutputTab('errors');
    } else {
      setOutputTab('test_cases');
    }
  };

  // Submit Solution (runs ALL test cases including hidden ones, awards XP)
  const handleSubmitSolution = async () => {
    setIsSubmitting(true);
    setExecutionState('compiling');
    setMobileTab('output');
    setFailingLine(null);

    setTimeout(() => setExecutionState('running'), 250);
    const summary = await runProblemCode(activeProblem, code, selectedLanguage, false);
    setRunSummary(summary);
    setIsSubmitting(false);
    setExecutionState('finished');

    if (summary.errorLine) setFailingLine(summary.errorLine);

    if (summary.compileError) {
      setOutputTab('errors');
      return;
    }

    setOutputTab('test_cases');

    if (summary.allPassed) {
      // Confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'],
        });
      } catch {}

      // Mark solved locally
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
        setToastMessage({
          type: 'success',
          text: `Accepted! +${res.pointsAwarded} Academic XP awarded for "${activeProblem.title}".`,
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
    } else {
      setToastMessage({
        type: 'error',
        text: `Submission Incomplete: ${summary.totalTests - summary.totalPassed} test case(s) failed.`,
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    const fresh = getLanguageStarter(activeProblem, selectedLanguage);
    handleCodeChange(fresh);
    setRunSummary(null);
    setFailingLine(null);
  };

  // Jump editor to specific line number (from compiler error output)
  const jumpToLine = (lineNum: number) => {
    setFailingLine(lineNum);
    if (!textareaRef.current) return;
    const lines = code.split('\n');
    let charIndex = 0;
    for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
      charIndex += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex + (lines[lineNum - 1]?.length || 0));
  };

  // Filtered problem list
  const filteredProblems = allCodingProblems.filter((p) => {
    const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
    const matchesDifficulty = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    return matchesPlatform && matchesDifficulty;
  });

  const lineCount = Math.max(code.split('\n').length, 16);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Find occurrences in code
  const findMatchesCount = useMemo(() => {
    if (!findQuery.trim()) return 0;
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = code.match(regex);
    return matches ? matches.length : 0;
  }, [code, findQuery]);

  const workspaceHeightClass = isFullscreen
    ? 'fixed inset-0 z-50 p-2 sm:p-4 bg-slate-950 overflow-hidden'
    : 'min-h-[calc(100dvh-130px)]';

  return (
    <div className={`space-y-4 ${workspaceHeightClass}`} ref={containerRef}>
      {/* Toast Notice */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 border-emerald-500/60 text-white'
              : toastMessage.type === 'error'
              ? 'bg-slate-900 border-rose-500/60 text-white'
              : 'bg-slate-900 border-indigo-500/60 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Google Search Modal */}
      <GoogleSearchCodingModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Top Workspace Header & Tool Ribbon */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        {/* Left: Problem Selector & Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Code Arena</span>
          </div>

          {/* Problem Dropdown */}
          <select
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
            className={`text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer max-w-[200px] sm:max-w-[260px] truncate ${
              isDark
                ? 'bg-slate-950 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            {filteredProblems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Difficulty Badge */}
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              activeProblem.difficulty === 'easy'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : activeProblem.difficulty === 'medium'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {activeProblem.difficulty} (+{activeProblem.xpReward} XP)
          </span>

          {/* Search External Catalog Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 transition-colors text-xs font-semibold cursor-pointer"
            title="Search LeetCode, HackerRank & Codeforces problem database"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Catalog</span>
          </button>
        </div>

        {/* Right: Language Selector & Editor View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className={`text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-700 text-indigo-300' : 'bg-slate-50 border-slate-300 text-indigo-700'
              }`}
            >
              <option value="python">Python 3 (Pyodide / GCC)</option>
              <option value="javascript">JavaScript (Node.js 18)</option>
              <option value="cpp">C++17 (g++ -O2)</option>
              <option value="c">C11 (gcc -O2)</option>
              <option value="java">Java 17 (OpenJDK)</option>
            </select>
          </div>

          {/* Font Size A- / A+ */}
          <div className="flex items-center border rounded-xl overflow-hidden border-slate-700">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="px-2 py-1 text-xs font-bold hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              className="px-2 py-1 text-xs font-bold hover:bg-slate-800 text-slate-300 cursor-pointer"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Workspace Tabs (< md screens) */}
      <div className="flex md:hidden rounded-xl border border-slate-800 bg-slate-950 p-1">
        {(['problem', 'code', 'output'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
              mobileTab === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Split Workspace Container */}
      <div className="flex flex-col md:flex-row gap-3 h-[calc(100dvh-200px)] min-h-[550px] relative">
        {/* ================= LEFT PANE: Problem Description ================= */}
        <div
          className={`flex-col rounded-2xl border overflow-hidden ${
            mobileTab === 'problem' ? 'flex w-full h-full' : 'hidden md:flex'
          } ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}
          style={{ width: window.innerWidth >= 768 ? `${splitRatioH}%` : '100%' }}
        >
          {/* Problem Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                {activeProblem.platform.toUpperCase()} #{activeProblem.platformProblemNumber || ''}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold mt-0.5">{activeProblem.title}</h3>
            </div>
            {activeProblem.sourceUrl && (
              <a
                href={activeProblem.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold shrink-0"
              >
                <span>Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Problem Body (Scrollable) */}
          <div className="p-4 sm:p-5 overflow-y-auto thin-scrollbar space-y-4 text-xs leading-relaxed">
            {/* Description */}
            <div className="whitespace-pre-line font-normal text-slate-300">
              {activeProblem.description}
            </div>

            {/* Examples */}
            {activeProblem.examples && activeProblem.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400">Examples</div>
                {activeProblem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-[11px] font-mono ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-emerald-400">{ex.input}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400">Output: </span>
                      <span className="text-amber-400">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="mt-1.5 text-slate-400 font-sans text-[11px]">
                        <span className="font-semibold text-slate-300">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {activeProblem.constraints && activeProblem.constraints.length > 0 && (
              <div className="pt-2">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Constraints</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] font-mono text-slate-300">
                  {activeProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {activeProblem.tags && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Draggable Divider (Laptop only) */}
        <div
          onMouseDown={() => setIsDraggingH(true)}
          className="hidden md:flex items-center justify-center w-1.5 hover:w-2 hover:bg-indigo-500/80 transition-all cursor-col-resize select-none shrink-0 rounded-full"
          title="Drag to resize problem and editor panes"
        >
          <div className="w-0.5 h-12 bg-slate-700 rounded-full" />
        </div>

        {/* ================= RIGHT PANE: Code Editor + Output Panel ================= */}
        <div
          className={`flex-col flex-1 rounded-2xl border overflow-hidden ${
            mobileTab !== 'problem' ? 'flex' : 'hidden md:flex'
          } ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Top of Editor: Controls Bar */}
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap bg-slate-950/70 text-xs">
            {/* Left: Editor actions */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'c' ? 'c' : 'java'}</span>
              </span>

              {failingLine && (
                <button
                  onClick={() => jumpToLine(failingLine)}
                  className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 animate-pulse cursor-pointer"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Line {failingLine} Error</span>
                </button>
              )}
            </div>

            {/* Right: Reset, Copy, Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Run Sample Test Cases or Custom Input (Ctrl+Enter)"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isRunning || isSubmitting}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Submit solution to run against all test cases for verified XP"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Find In Code Search Bar */}
          {showFindBar && (
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Find in code..."
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full font-mono text-xs"
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {findMatchesCount} matches
                </span>
              </div>
              <button
                onClick={() => setShowFindBar(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Editor Area (~60% height on desktop, resizable vertically) */}
          <div
            className={`relative flex font-mono overflow-hidden ${
              mobileTab === 'output' ? 'hidden md:flex' : 'flex'
            }`}
            style={{
              height: window.innerWidth >= 768 ? `${splitRatioV}%` : '60%',
              fontSize: `${fontSize}px`,
            }}
          >
            {/* Line Numbers Gutter */}
            <div
              className={`select-none text-right pr-3 pl-2 py-3 border-r overflow-hidden shrink-0 text-slate-500 ${
                isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
              style={{ width: '48px', fontSize: `${Math.max(10, fontSize - 2)}px` }}
            >
              {lineNumbers.map((num) => {
                const isFailing = failingLine === num;
                const isCurrent = cursorLine === num;
                return (
                  <div
                    key={num}
                    onClick={() => jumpToLine(num)}
                    className={`leading-relaxed cursor-pointer transition-colors ${
                      isFailing
                        ? 'text-rose-400 font-bold bg-rose-500/20 rounded px-1'
                        : isCurrent
                        ? 'text-indigo-400 font-bold'
                        : 'hover:text-slate-300'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            {/* Textarea Code Input */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              spellCheck={false}
              className={`w-full h-full p-3 font-mono leading-relaxed resize-none focus:outline-none whitespace-pre overflow-auto thin-scrollbar ${
                isDark
                  ? 'bg-slate-950 text-slate-100 selection:bg-indigo-600/50'
                  : 'bg-white text-slate-900 selection:bg-indigo-200'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              aria-label="Code editor"
            />
          </div>

          {/* Vertical Draggable Splitter Divider */}
          <div
            onMouseDown={() => setIsDraggingV(true)}
            className="hidden md:flex items-center justify-center h-2 hover:h-2.5 hover:bg-indigo-500/80 transition-all cursor-row-resize select-none shrink-0 bg-slate-950 border-y border-slate-800"
            title="Drag to resize editor and output panel"
          >
            <div className="w-12 h-0.5 bg-slate-700 rounded-full" />
          </div>

          {/* ================= OUTPUT PANEL ================= */}
          <div
            className={`flex-col flex-1 border-t md:border-t-0 overflow-hidden ${
              mobileTab === 'code' ? 'hidden md:flex' : 'flex'
            } ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}
          >
            {/* Output Panel Tabs */}
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap bg-slate-900/90 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setOutputTab('test_cases')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    outputTab === 'test_cases'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Cases {runSummary ? `(${runSummary.totalPassed}/${runSummary.totalTests})` : ''}
                </button>

                <button
                  onClick={() => setOutputTab('output')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    outputTab === 'output'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Output (stdout)
                </button>

                <button
                  onClick={() => setOutputTab('errors')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                    outputTab === 'errors'
                      ? 'bg-rose-600 text-white'
                      : runSummary?.errorMessage || runSummary?.compileError
                      ? 'text-rose-400 hover:text-rose-300 font-extrabold animate-pulse'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Errors</span>
                  {(runSummary?.errorMessage || runSummary?.compileError) && (
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                  )}
                </button>

                <button
                  onClick={() => setOutputTab('custom_input')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    outputTab === 'custom_input'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Input (stdin)
                </button>
              </div>

              {/* Execution State & Stats (Time, Memory) */}
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                {executionState === 'compiling' && (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Compiling...
                  </span>
                )}
                {executionState === 'running' && (
                  <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Running tests...
                  </span>
                )}
                {runSummary && (
                  <>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="tabular-nums">{runSummary.overallTimeMs}ms</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-400" />
                      <span className="tabular-nums">{runSummary.memoryMb}MB</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Output Tab Body */}
            <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto thin-scrollbar text-xs font-mono">
              {/* TAB 1: Test Cases */}
              {outputTab === 'test_cases' && (
                <div>
                  {runSummary && runSummary.results.length > 0 ? (
                    <div className="space-y-3">
                      {/* Status Summary Banner */}
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          runSummary.allPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          {runSummary.allPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span>
                            {runSummary.allPassed
                              ? `All ${runSummary.totalTests} Test Cases Passed!`
                              : `${runSummary.totalTests - runSummary.totalPassed} of ${runSummary.totalTests} Test Cases Failed`}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold tabular-nums">
                          {runSummary.totalPassed}/{runSummary.totalTests} Passed
                        </span>
                      </div>

                      {/* Case selector pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {runSummary.results.map((r, idx) => (
                          <button
                            key={r.testCaseId}
                            onClick={() => setActiveTestCaseIndex(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeTestCaseIndex === idx
                                ? 'ring-2 ring-indigo-500 bg-slate-800 text-white'
                                : r.passed
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <span>Case {idx + 1}</span>
                            {r.isHidden && <span className="text-[9px] opacity-75">[Hidden]</span>}
                            {r.passed ? '✓' : '✗'}
                          </button>
                        ))}
                      </div>

                      {/* Active Test Case Detail */}
                      {runSummary.results[activeTestCaseIndex] && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
                          {runSummary.results[activeTestCaseIndex].isHidden ? (
                            <div className="p-3 text-center text-slate-400 space-y-1">
                              <div className="font-bold text-slate-300">Protected Hidden Test Case</div>
                              <div className="text-[11px]">
                                Input and expected output are concealed to verify algorithmic generalizability.
                              </div>
                              <div className="mt-2 text-xs font-bold">
                                Result:{' '}
                                <span
                                  className={
                                    runSummary.results[activeTestCaseIndex].passed
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }
                                >
                                  {runSummary.results[activeTestCaseIndex].passed ? 'PASSED ✓' : 'FAILED ✗'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Input:</div>
                                <div className="mt-1 p-2 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                                  {runSummary.results[activeTestCaseIndex].inputFormatted}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Expected Output:</div>
                                <div className="mt-1 p-2 rounded bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto">
                                  {runSummary.results[activeTestCaseIndex].expectedOutputFormatted}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Actual Output:</div>
                                <div
                                  className={`mt-1 p-2 rounded bg-slate-950 font-mono text-[11px] overflow-x-auto ${
                                    runSummary.results[activeTestCaseIndex].passed
                                      ? 'text-emerald-300'
                                      : 'text-rose-300'
                                  }`}
                                >
                                  {runSummary.results[activeTestCaseIndex].actualOutputFormatted}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500">
                      <Terminal className="w-8 h-8 mb-2 opacity-50" />
                      <div className="font-bold text-xs">Ready to Run</div>
                      <div className="text-[11px] mt-0.5">
                        Click "Run" to test sample cases or "Submit" to test all cases.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Output (stdout) */}
              {outputTab === 'output' && (
                <div>
                  {runSummary?.stdout ? (
                    <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed font-mono text-xs">
                      {runSummary.stdout}
                    </pre>
                  ) : (
                    <div className="text-slate-500 italic">No standard output printed yet.</div>
                  )}
                </div>
              )}

              {/* TAB 3: Errors (stderr / compile_output) */}
              {outputTab === 'errors' && (
                <div>
                  {runSummary?.errorMessage || runSummary?.compileError ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 leading-relaxed font-mono text-xs whitespace-pre-wrap">
                        {runSummary.compileError || runSummary.errorMessage}
                      </div>

                      {runSummary.errorLine && (
                        <button
                          onClick={() => jumpToLine(runSummary.errorLine!)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Jump to Line {runSummary.errorLine}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">No errors detected. Build is clean!</div>
                  )}
                </div>
              )}

              {/* TAB 4: Custom Input (stdin) */}
              {outputTab === 'custom_input' && (
                <div className="space-y-3">
                  <div className="text-slate-400 text-xs font-semibold">
                    Provide custom input data to feed into your program via standard input (`stdin` / `cin` / `sys.stdin`):
                  </div>
                  <textarea
                    rows={4}
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    placeholder="Enter custom stdin lines here..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run with Custom Input</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
