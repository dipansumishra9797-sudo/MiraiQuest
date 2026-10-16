import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { searchCodingProblemViaGoogle } from '../../modules/geminiService';
import { CodingProblem, Platform, Difficulty } from '../../data/codingProblems';
import {
  Search,
  Globe,
  Sparkles,
  ExternalLink,
  Code,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Flame,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface GoogleSearchCodingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem?: (problem: CodingProblem) => void;
  allowAssign?: boolean;
}

export const GoogleSearchCodingModal: React.FC<GoogleSearchCodingModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  allowAssign = false,
}) => {
  const { theme, importCodingProblem, createAssignment, activeFaculty } = useApp();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<'all' | Platform>('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<CodingProblem | null>(null);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [isGrounded, setIsGrounded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const popularQueries = [
    { label: 'Watermelon (Codeforces 4A)', q: 'Watermelon Codeforces 4A', platform: 'codeforces' as const },
    { label: 'Valid Parentheses (LeetCode 20)', q: 'Valid Parentheses LeetCode 20', platform: 'leetcode' as const },
    { label: 'Compare Triplets (HackerRank)', q: 'Compare the Triplets HackerRank', platform: 'hackerrank' as const },
    { label: 'Domino Piling (Codeforces 50A)', q: 'Domino Piling Codeforces 50A', platform: 'codeforces' as const },
    { label: 'Climbing Stairs (LeetCode 70)', q: 'Climbing Stairs LeetCode 70', platform: 'leetcode' as const },
    { label: 'Coin Change (LeetCode 322)', q: 'Coin Change LeetCode 322', platform: 'leetcode' as const },
    { label: 'Next Round (Codeforces 158A)', q: 'Next Round Codeforces 158A', platform: 'codeforces' as const },
    { label: 'Left Rotation (HackerRank)', q: 'Left Rotation Arrays HackerRank', platform: 'hackerrank' as const },
  ];

  const handleSearch = async (searchQueryText?: string, targetPlatform?: 'all' | Platform) => {
    const q = searchQueryText !== undefined ? searchQueryText : query;
    const p = targetPlatform !== undefined ? targetPlatform : platform;

    if (!q.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSearchResult(null);
    setAssignSuccess(null);

    try {
      const res = await searchCodingProblemViaGoogle(q, p, difficulty);
      if (res.success && res.problem) {
        setSearchResult(res.problem);
        setSearchQueries(res.searchQueries || []);
        setSources(res.sources || []);
        setIsGrounded(res.isGrounded);
      } else {
        setErrorMessage('Could not retrieve problem details. Please refine your query.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportAndPractice = () => {
    if (!searchResult) return;
    importCodingProblem(searchResult);
    if (onSelectProblem) {
      onSelectProblem(searchResult);
    }
    onClose();
  };

  const handleCreateAssignmentFromProblem = () => {
    if (!searchResult) return;
    importCodingProblem(searchResult);
    const asgn = createAssignment({
      title: `${searchResult.platform.toUpperCase()}: ${searchResult.title}`,
      subject: 'Data Structures & Algorithms',
      campus: 'All Campuses',
      section: 'All Sections',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      dueTime: '23:59',
      pointsXp: searchResult.xpReward || 25,
      description: searchResult.description,
      instructions: [
        `Solve the official ${searchResult.platform.toUpperCase()} problem "${searchResult.title}".`,
        'Test your solution thoroughly against sample and edge test cases.',
        'Submit passing code in the Inbuilt Compiler to claim verified XP.',
      ],
      type: 'coding',
      platformLink: searchResult.sourceUrl || `https://${searchResult.platform}.com`,
      problemId: searchResult.id,
      starterCode: searchResult.starterCode?.javascript || '',
      language: 'javascript',
      createdByName: activeFaculty.name,
      status: 'published',
    });

    setAssignSuccess(`Assignment "${asgn.title}" published for All Campuses & Sections!`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-xs">
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950' : 'bg-white'
                }`}
              >
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Google Search Live Question Fetcher</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>LeetCode · HackerRank · Codeforces</span>
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Fetch genuine competitive programming challenges, constraints, starter templates, and test cases via Google Search.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div
          className={`p-5 border-b space-y-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/30'
          }`}
        >
          {/* Input & Search Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search problem title or topic (e.g. 'Watermelon', 'Climbing Stairs', 'Bit++', 'Subarray Sum')..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-colors outline-hidden ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching Google...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Fetch Problem</span>
                </>
              )}
            </button>
          </form>

          {/* Platform & Difficulty Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Platform:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'leetcode', label: 'LeetCode' },
                { id: 'hackerrank', label: 'HackerRank' },
                { id: 'codeforces', label: 'Codeforces' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPlatform(p.id as any);
                    if (query.trim()) handleSearch(query, p.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    platform === p.id
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Difficulty:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id as any)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    difficulty === d.id
                      ? 'bg-slate-700 text-white font-semibold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className={`shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try:</span>
            {popularQueries.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setQuery(item.q);
                  setPlatform(item.platform);
                  handleSearch(item.q, item.platform);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {assignSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{assignSuccess}</span>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
                <Globe className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-sm font-semibold">Executing Google Search Grounding...</div>
              <div className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Querying official LeetCode, HackerRank, and Codeforces indices for problem statement, test cases, and starter templates.
              </div>
            </div>
          )}

          {!loading && searchResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Grounding Source Info */}
              <div
                className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-400">
                    {isGrounded ? 'Google Search Grounded Result' : 'Verified Competitive Spec Fetched'}
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    via {searchResult.platform.toUpperCase()}
                  </span>
                </div>

                {searchResult.sourceUrl && (
                  <a
                    href={searchResult.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <span>View Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Problem Card */}
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Title & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          searchResult.platform === 'leetcode'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : searchResult.platform === 'hackerrank'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {searchResult.platform}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          searchResult.difficulty === 'easy'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : searchResult.difficulty === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {searchResult.difficulty}
                      </span>

                      <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span>+{searchResult.xpReward || 20} XP</span>
                      </span>
                    </div>

                    <h4 className="text-lg font-bold">
                      {searchResult.platformProblemNumber && (
                        <span className={`mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          #{searchResult.platformProblemNumber}
                        </span>
                      )}
                      {searchResult.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {searchResult.category && (
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                          isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {searchResult.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Preview */}
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed max-h-44 overflow-y-auto whitespace-pre-line font-sans ${
                    isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {searchResult.description}
                </div>

                {/* Constraints */}
                {searchResult.constraints && searchResult.constraints.length > 0 && (
                  <div>
                    <div className={`text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Constraints
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      {searchResult.constraints.map((c, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 font-mono">
                          <span className="w-1 h-1 rounded-full bg-indigo-400" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples */}
                {searchResult.examples && searchResult.examples.length > 0 && (
                  <div>
                    <div className={`text-[11px] font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Sample Test Cases ({searchResult.testCases?.length || 0} Test Suites Ready)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {searchResult.examples.slice(0, 2).map((ex, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border font-mono text-[11px] ${
                            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div><span className="text-slate-500">Input: </span>{ex.input}</div>
                          <div><span className="text-emerald-500">Output: </span>{ex.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                {allowAssign && (
                  <button
                    onClick={handleCreateAssignmentFromProblem}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Assign as Faculty Coursework</span>
                  </button>
                )}

                <button
                  onClick={handleImportAndPractice}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Code className="w-4 h-4" />
                  <span>Import & Practice in Sandbox Compiler</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {!loading && !searchResult && !errorMessage && (
            <div className="py-12 text-center space-y-2">
              <Search className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              <div className="text-xs font-medium">Enter a competitive programming problem name or select a suggestion above.</div>
              <div className={`text-[11px] max-w-sm mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Supports LeetCode question names/numbers, HackerRank algorithms challenges, and Codeforces round problem sets.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
