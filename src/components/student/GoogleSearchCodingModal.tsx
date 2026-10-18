import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { searchCodingProblems, SearchProblemResult } from '../../modules/geminiService';
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
  RefreshCw,
  ChevronRight,
  LayoutGrid,
  Tag,
  Link,
} from 'lucide-react';

interface GoogleSearchCodingModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowAssign?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  hard: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

const PLATFORM_COLORS: Record<string, string> = {
  leetcode: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  hackerrank: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  codeforces: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
};

function SkeletonRow({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`p-4 rounded-xl border animate-pulse space-y-2 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-4 w-16 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>
      <div className={`h-5 w-3/4 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      <div className={`h-4 w-full rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
    </div>
  );
}

export const GoogleSearchCodingModal: React.FC<GoogleSearchCodingModalProps> = ({
  isOpen,
  onClose,
  allowAssign = false,
}) => {
  const { createAssignment, activeFaculty, isDark } = useApp();

  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'all' | 'leetcode' | 'hackerrank' | 'codeforces'>('all');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<SearchProblemResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Assign flow
  const [assigningProblem, setAssigningProblem] = useState<SearchProblemResult | null>(null);
  const [assignCampus, setAssignCampus] = useState('All Campuses');
  const [assignYear, setAssignYear] = useState('All Years');
  const [assignSection, setAssignSection] = useState('All Sections');
  const [assignDueDate, setAssignDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [assignXp, setAssignXp] = useState(25);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickSearches = [
    { label: 'Arrays', q: 'arrays', t: 'Arrays' },
    { label: 'Strings', q: 'strings', t: 'Strings' },
    { label: 'Graphs', q: 'graphs', t: 'Graphs' },
    { label: 'Dynamic Programming', q: 'dp', t: 'DP' },
    { label: 'Trees', q: 'trees', t: 'Trees' },
    { label: 'Hashing', q: 'hashing', t: 'Hashing' },
  ];

  const handleSearch = async (
    searchQuery?: string,
    searchTopic?: string,
    targetPlatform?: typeof platform,
    targetDifficulty?: typeof difficulty,
    page = 1,
    append = false
  ) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    const t = searchTopic !== undefined ? searchTopic : topic;
    const p = targetPlatform !== undefined ? targetPlatform : platform;
    const d = targetDifficulty !== undefined ? targetDifficulty : difficulty;

    if (!q.trim() && !t.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setAssignSuccess(null);
    setAssigningProblem(null);

    console.log(`[Modal] Searching: query="${q}" topic="${t}" platform="${p}" difficulty="${d}" page=${page}`);

    const result = await searchCodingProblems(q, t, p, d, page, 10);
    setLoading(false);
    setHasSearched(true);
    setCurrentPage(page);

    if (!result.success) {
      setErrorMessage(result.error || 'Search failed. Please try again.');
      if (!append) setProblems([]);
      return;
    }

    if (append) {
      setProblems((prev) => [...prev, ...result.problems]);
    } else {
      setProblems(result.problems);
    }
    setTotalCount(result.totalCount);
    setHasMore(result.hasMore);
  };

  const handleLoadMore = () => {
    handleSearch(query, topic, platform, difficulty, currentPage + 1, true);
  };

  const handleAssign = () => {
    if (!assigningProblem) return;
    createAssignment({
      title: `[${assigningProblem.platform.toUpperCase()}] ${assigningProblem.title}`,
      subject: 'Data Structures & Algorithms',
      campus: assignCampus as any,
      section: assignSection,
      dueDate: assignDueDate,
      dueTime: '23:59',
      pointsXp: assignXp,
      description: assigningProblem.descriptionSummary,
      instructions: [
        `Solve "${assigningProblem.title}" on ${assigningProblem.platform.toUpperCase()}.`,
        'Test your solution against all sample and hidden test cases.',
        'Submit your passing code in the Inbuilt Compiler Sandbox to earn verified XP.',
      ],
      type: 'coding',
      platformLink: assigningProblem.sourceUrl,
      language: 'javascript',
      createdByName: activeFaculty.name,
      status: 'published',
    });

    setAssignSuccess(
      `"${assigningProblem.title}" assigned to ${assignCampus} / ${assignYear} / ${assignSection}!`
    );
    setAssigningProblem(null);
    setTimeout(() => setAssignSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* ─── Header ─── */}
        <div
          className={`p-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-sm">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Search LeetCode / HackerRank</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Fetch competitive programming problems — all results come from our secure backend.
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

        {/* ─── Search Bar & Filters ─── */}
        <div
          className={`p-4 border-b space-y-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/30'
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query, topic, platform, difficulty, 1, false);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or keyword (e.g. 'Two Sum', 'Knapsack', 'Island')…"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border transition-colors outline-hidden ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
                }`}
              />
            </div>

            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <option value="">Any Topic</option>
              {['Arrays', 'Strings', 'Graphs', 'DP', 'Trees', 'Hashing'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading || (!query.trim() && !topic.trim())}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Searching…' : 'Search'}</span>
            </button>
          </form>

          {/* Platform & Difficulty chips */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Platform:</span>
              {(['all', 'leetcode', 'hackerrank', 'codeforces'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlatform(p);
                    if (query.trim() || topic.trim()) handleSearch(query, topic, p, difficulty, 1, false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    platform === p
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {p === 'all' ? 'Both' : p === 'leetcode' ? 'LeetCode' : p === 'hackerrank' ? 'HackerRank' : 'Codeforces'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Difficulty:</span>
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDifficulty(d);
                    if (query.trim() || topic.trim()) handleSearch(query, topic, platform, d, 1, false);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    difficulty === d
                      ? 'bg-slate-700 text-white'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d === 'all' ? 'All' : d}
                </button>
              ))}
            </div>
          </div>

          {/* Quick topic chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className={`text-[11px] shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Quick:</span>
            {quickSearches.map((qs) => (
              <button
                key={qs.label}
                type="button"
                onClick={() => {
                  setQuery(qs.q);
                  setTopic(qs.t);
                  handleSearch(qs.q, qs.t, platform, difficulty, 1, false);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {qs.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Results Body ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Error */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold mb-0.5">Search failed</div>
                <div>{errorMessage}</div>
              </div>
              <button
                onClick={() => handleSearch(query, topic, platform, difficulty, 1, false)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}

          {/* Assign success */}
          {assignSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{assignSuccess}</span>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && problems.length === 0 && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} isDark={isDark} />)}
            </div>
          )}

          {/* Results header */}
          {!loading && hasSearched && problems.length > 0 && (
            <div className={`flex items-center justify-between text-xs pb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>
                  Showing {problems.length} of {totalCount} result{totalCount !== 1 ? 's' : ''}
                </span>
              </div>
              {totalCount > 0 && (
                <span className="font-medium">
                  {platform !== 'all' ? platform.toUpperCase() : 'All Platforms'} ·{' '}
                  {difficulty !== 'all' ? difficulty : 'All Difficulties'}
                </span>
              )}
            </div>
          )}

          {/* Problem list */}
          {problems.map((prob) => (
            <ProblemRow
              key={prob.id}
              prob={prob}
              isDark={isDark}
              allowAssign={allowAssign}
              onAssign={() => setAssigningProblem(prob)}
            />
          ))}

          {/* Load more */}
          {!loading && hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1
                border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/10 hover:border-indigo-500/50"
            >
              <ChevronRight className="w-4 h-4" />
              Load More Problems
            </button>
          )}
          {loading && problems.length > 0 && (
            <div className="text-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mx-auto" />
            </div>
          )}

          {/* Empty state */}
          {!loading && hasSearched && problems.length === 0 && !errorMessage && (
            <div className="py-16 text-center space-y-3">
              <Search className={`w-10 h-10 mx-auto ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              <div className="text-sm font-semibold">No questions found</div>
              <div className={`text-xs max-w-xs mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Try different keywords, a broader topic, or switch platform to "Both".
              </div>
            </div>
          )}

          {/* Initial state */}
          {!loading && !hasSearched && (
            <div className="py-14 text-center space-y-2">
              <Search className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter a keyword or choose a quick topic above to search problems.
              </div>
            </div>
          )}
        </div>

        {/* ─── Assign Modal Overlay ─── */}
        {assigningProblem && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm rounded-2xl">
            <div
              className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">Assign as Coursework</h4>
                <button
                  onClick={() => setAssigningProblem(null)}
                  className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-[10px] font-bold uppercase mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Problem</div>
                <div className="font-semibold">{assigningProblem.title}</div>
                <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {assigningProblem.platform.toUpperCase()} · {assigningProblem.difficulty} · {assigningProblem.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Campus</label>
                  <select
                    value={assignCampus}
                    onChange={(e) => setAssignCampus(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option>All Campuses</option>
                    <option>HI-Tech</option>
                    <option>Rathinam</option>
                    <option>JUJ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Year</label>
                  <select
                    value={assignYear}
                    onChange={(e) => setAssignYear(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option>All Years</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Section</label>
                  <select
                    value={assignSection}
                    onChange={(e) => setAssignSection(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option>All Sections</option>
                    <option>CS-A</option>
                    <option>CS-B</option>
                    <option>IT-A</option>
                    <option>IT-B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">XP Reward</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={assignXp}
                    onChange={(e) => setAssignXp(Number(e.target.value))}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Due Date</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => setAssigningProblem(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Publish Assignment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Individual Problem Row ───
const ProblemRow: React.FC<{
  prob: SearchProblemResult;
  isDark: boolean;
  allowAssign: boolean;
  onAssign: () => void;
}> = ({ prob, isDark, allowAssign, onAssign }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all ${
        isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PLATFORM_COLORS[prob.platform] ?? ''}`}>
                {prob.platform}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_COLORS[prob.difficulty] ?? ''}`}>
                {prob.difficulty}
              </span>
              {prob.platformProblemNumber && (
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  #{prob.platformProblemNumber}
                </span>
              )}
              <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                +{prob.xpReward} XP
              </span>
            </div>

            <div className="font-semibold text-sm">{prob.title}</div>
            <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {prob.category}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={prob.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open on platform"
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setExpanded((x) => !x)}
              className={`p-1.5 rounded-lg transition-colors text-[11px] font-medium ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              title={expanded ? 'Collapse' : 'See description'}
            >
              {expanded ? 'Less' : 'More'}
            </button>
            {allowAssign && (
              <button
                onClick={onAssign}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Assign
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className={`pt-1 space-y-2 text-xs animate-in fade-in duration-150`}>
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
              {prob.descriptionSummary}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-slate-400" />
              {prob.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={prob.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium w-fit"
            >
              <Link className="w-3 h-3" />
              View on {prob.platform.toUpperCase()}
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
