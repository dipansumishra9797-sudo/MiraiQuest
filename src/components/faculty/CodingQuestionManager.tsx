import React, { useState } from 'react';
import {
  Code,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { CodingProblem, SupportedLanguage, TestCase } from '../../data/codingProblems';
import { getCppStarterTemplate } from '../../data/codingProblems';

interface CodingQuestionManagerProps {
  problems: CodingProblem[];
  onAddProblem: (problem: CodingProblem) => void;
  onUpdateProblem: (id: string, updates: Partial<CodingProblem>) => void;
  onDeleteProblem: (id: string) => void;
  onReorderProblems: (ids: string[]) => void;
  isDark: boolean;
}

export const CodingQuestionManager: React.FC<CodingQuestionManagerProps> = ({
  problems,
  onAddProblem,
  onUpdateProblem,
  onDeleteProblem,
  onReorderProblems,
  isDark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<SupportedLanguage>('python');

  // Form states for add / edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Arrays');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formXpReward, setFormXpReward] = useState(20);
  const [formFunctionName, setFormFunctionName] = useState('solve');
  const [formDescription, setFormDescription] = useState('');
  const [formConstraints, setFormConstraints] = useState('1 <= n <= 10^5');
  const [starterPy, setStarterPy] = useState('def solve(nums):\n    # TODO: Implement solution\n    return []');
  const [starterJs, setStarterJs] = useState('function solve(nums) {\n  // TODO: Implement solution\n  return [];\n}');
  const [starterC, setStarterC] = useState('// C solution\nvoid solve() {\n}');
  const [starterCpp, setStarterCpp] = useState(() => getCppStarterTemplate('Algorithmic Challenge', 'solve'));
  const [starterJava, setStarterJava] = useState('class Solution {\n    public void solve() {\n    }\n}');

  // Test cases state
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'tc_1',
      input: [[2, 7, 11, 15], 9],
      inputFormatted: 'nums = [2, 7, 11, 15], target = 9',
      expectedOutput: [0, 1],
      expectedOutputFormatted: '[0, 1]',
      isHidden: false,
    },
    {
      id: 'tc_hidden_1',
      input: [[3, 2, 4], 6],
      inputFormatted: 'nums = [3, 2, 4], target = 6',
      expectedOutput: [1, 2],
      expectedOutputFormatted: '[1, 2]',
      isHidden: true,
      explanation: 'Hidden evaluation test checking boundary resolution.',
    },
  ]);

  const openEditModal = (p: CodingProblem) => {
    setEditingProblem(p);
    setIsCreating(false);
    setFormTitle(p.title);
    setFormCategory(p.category || 'General');
    setFormDifficulty(p.difficulty);
    setFormXpReward(p.xpReward || 20);
    setFormFunctionName(p.functionName || 'solve');
    setFormDescription(p.description);
    setFormConstraints(p.constraints?.join('\n') || '1 <= n <= 10^5');
    setStarterPy(p.starterCode?.python || 'def solve(): pass');
    setStarterJs(p.starterCode?.javascript || 'function solve() {}');
    setStarterC(p.starterCode?.c || '// C code');
    setStarterCpp(p.starterCode?.cpp || getCppStarterTemplate(p.title, p.functionName));
    setStarterJava(p.starterCode?.java || 'class Solution {}');
    setTestCases(p.testCases || []);
  };

  const openCreateModal = () => {
    setEditingProblem(null);
    setIsCreating(true);
    setFormTitle('');
    setFormCategory('Arrays');
    setFormDifficulty('medium');
    setFormXpReward(20);
    setFormFunctionName('solution');
    setFormDescription('Given an input, return the optimal algorithmic result satisfying runtime constraints.');
    setFormConstraints('1 <= n <= 10^5\nO(n) time, O(1) extra space');
    setStarterPy('def solution(nums):\n    # TODO: Implement solution\n    pass');
    setStarterJs('function solution(nums) {\n  // TODO: Implement solution\n}');
    setStarterC('// C solution\nvoid solution() {\n}');
    setStarterCpp(getCppStarterTemplate('New Problem', 'solution'));
    setStarterJava('class Solution {\n    public void solution() {\n    }\n}');
    setTestCases([
      {
        id: `tc_${Date.now()}_1`,
        input: [1],
        inputFormatted: 'n = 1',
        expectedOutput: 1,
        expectedOutputFormatted: '1',
        isHidden: false,
      },
      {
        id: `tc_${Date.now()}_hidden`,
        input: [1000],
        inputFormatted: 'n = 1000',
        expectedOutput: 1000,
        expectedOutputFormatted: '1000',
        isHidden: true,
        explanation: 'Hidden benchmark test case.',
      },
    ]);
  };

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const constraintsArray = formConstraints
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    const problemData: CodingProblem = {
      id: editingProblem ? editingProblem.id : `problem_custom_${Date.now()}`,
      title: formTitle.trim(),
      platform: 'leetcode',
      difficulty: formDifficulty,
      xpReward: formXpReward,
      category: formCategory.trim(),
      tags: [formCategory.trim(), 'Faculty-Curated'],
      description: formDescription.trim(),
      constraints: constraintsArray,
      examples: [
        {
          input: testCases[0]?.inputFormatted || 'nums = [1, 2]',
          output: testCases[0]?.expectedOutputFormatted || '[1]',
        },
      ],
      starterCode: {
        python: starterPy,
        javascript: starterJs,
        c: starterC,
        cpp: starterCpp,
        java: starterJava,
      },
      functionName: formFunctionName.trim() || 'solve',
      testCases,
    };

    if (editingProblem) {
      onUpdateProblem(editingProblem.id, problemData);
    } else {
      onAddProblem(problemData);
    }

    setEditingProblem(null);
    setIsCreating(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= problems.length) return;

    const copy = [...problems];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    onReorderProblems(copy.map((p) => p.id));
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="text-base font-bold flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-500" />
            <span>Coding Question Manager ({problems.length} Curated Challenges)</span>
          </h4>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage algorithmic challenges, multi-language starter scaffolds (Python, JS, C, C++, Java), and hidden verification suites.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Coding Challenge</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problem title or category..."
            className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Cards Table */}
      <div className="space-y-2">
        {filteredProblems.map((prob, idx) => {
          const sampleCount = (prob.testCases || []).filter((tc) => !tc.isHidden).length;
          const hiddenCount = (prob.testCases || []).filter((tc) => tc.isHidden).length;

          return (
            <div
              key={prob.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs">{prob.title}</span>
                  <span className="text-slate-400">·</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      prob.difficulty === 'easy'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : prob.difficulty === 'hard'
                        ? 'bg-rose-500/15 text-rose-500'
                        : 'bg-amber-500/15 text-amber-500'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono font-bold">
                    +{prob.xpReward || 20} XP
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-[11px] text-slate-400">{prob.category}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-indigo-400" />
                    <span>Starter: JS, PY, C, C++, Java</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-emerald-500" />
                    <span>{sampleCount} Sample</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-amber-500" />
                    <span>{hiddenCount} Hidden</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1.5 rounded-lg border border-slate-700/60 disabled:opacity-30 hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === filteredProblems.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 rounded-lg border border-slate-700/60 disabled:opacity-30 hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(prob)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete coding challenge "${prob.title}"?`)) {
                      onDeleteProblem(prob.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {(editingProblem || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-2xl max-h-[92vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                <span>{isCreating ? 'Create New Coding Challenge' : `Edit Challenge: ${formTitle}`}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingProblem(null);
                  setIsCreating(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold mb-1">Problem Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => {
                      const diff = e.target.value as 'easy' | 'medium' | 'hard';
                      setFormDifficulty(diff);
                      setFormXpReward(diff === 'easy' ? 10 : diff === 'medium' ? 20 : 40);
                    }}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="easy">Easy (10 XP)</option>
                    <option value="medium">Medium (20 XP)</option>
                    <option value="hard">Hard (40 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Category / Topic</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1">Function Scaffold Name</label>
                  <input
                    type="text"
                    value={formFunctionName}
                    onChange={(e) => setFormFunctionName(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Problem Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className={`w-full border rounded-lg p-2.5 text-xs outline-none leading-relaxed ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Constraints (one per line)</label>
                <textarea
                  value={formConstraints}
                  onChange={(e) => setFormConstraints(e.target.value)}
                  rows={2}
                  className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Starter Code Multi-Language Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold">Starter Code Scaffolds</label>
                  <div className="flex items-center gap-1">
                    {(['python', 'javascript', 'cpp', 'java', 'c'] as SupportedLanguage[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLangTab(lang)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          activeLangTab === lang
                            ? 'bg-indigo-600 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {activeLangTab === 'python' && (
                  <textarea
                    value={starterPy}
                    onChange={(e) => setStarterPy(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                )}
                {activeLangTab === 'javascript' && (
                  <textarea
                    value={starterJs}
                    onChange={(e) => setStarterJs(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                )}
                {activeLangTab === 'cpp' && (
                  <textarea
                    value={starterCpp}
                    onChange={(e) => setStarterCpp(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                )}
                {activeLangTab === 'java' && (
                  <textarea
                    value={starterJava}
                    onChange={(e) => setStarterJava(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                )}
                {activeLangTab === 'c' && (
                  <textarea
                    value={starterC}
                    onChange={(e) => setStarterC(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                )}
              </div>

              {/* Test Cases Editor (Sample + Hidden) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold">Verification Test Cases</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTestCases((prev) => [
                        ...prev,
                        {
                          id: `tc_${Date.now()}`,
                          input: [0],
                          inputFormatted: 'nums = [0]',
                          expectedOutput: 0,
                          expectedOutputFormatted: '0',
                          isHidden: false,
                        },
                      ]);
                    }}
                    className="text-[11px] text-indigo-500 font-bold hover:underline cursor-pointer"
                  >
                    + Add Test Case
                  </button>
                </div>

                <div className="space-y-2">
                  {testCases.map((tc, i) => (
                    <div
                      key={tc.id || i}
                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                        tc.isHidden
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : isDark
                          ? 'border-slate-800 bg-slate-950'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">
                          Test Case #{i + 1} {tc.isHidden ? '(Hidden Suite)' : '(Sample)'}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={tc.isHidden || false}
                              onChange={(e) => {
                                const copy = [...testCases];
                                copy[i] = { ...copy[i], isHidden: e.target.checked };
                                setTestCases(copy);
                              }}
                              className="rounded text-amber-500"
                            />
                            <span>Hidden from student</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setTestCases((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-rose-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Input Format</span>
                          <input
                            type="text"
                            value={tc.inputFormatted}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[i] = { ...copy[i], inputFormatted: e.target.value };
                              setTestCases(copy);
                            }}
                            className={`w-full border rounded px-2 py-1 text-[11px] outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Expected Output</span>
                          <input
                            type="text"
                            value={tc.expectedOutputFormatted}
                            onChange={(e) => {
                              const copy = [...testCases];
                              copy[i] = { ...copy[i], expectedOutputFormatted: e.target.value };
                              setTestCases(copy);
                            }}
                            className={`w-full border rounded px-2 py-1 text-[11px] outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProblem(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isCreating ? 'Publish Problem' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
