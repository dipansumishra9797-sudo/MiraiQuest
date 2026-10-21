import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../store/appStore';
import {
  MessageSquare,
  CheckCircle,
  Plus,
  Send,
  HelpCircle,
  Shield,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { PeerDoubtsSkeleton } from '../common/Skeletons';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const PeerHelpBoard: React.FC = () => {
  const {
    peerPosts,
    activeStudent,
    role,
    addPeerPost,
    answerPeerDoubt,
    acceptPeerAnswer,
    isDark,
    isSessionReady,
    refreshSession,
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Subject and topic filter state (persisted across re-renders)
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newSubject, setNewSubject] = useState('Data Structures & Algorithms');
  const [newTopic, setNewTopic] = useState('Recursion, Call Stacks & Backtracking');

  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initial loading simulation/hydration sync
  useEffect(() => {
    let isMounted = true;
    // Brief settling delay on initial mount / refresh so skeleton displays smoothly even on fast networks
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleRetryLoad = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      if (refreshSession) {
        await refreshSession();
      }
    } catch (e: any) {
      setLoadError(e?.message || 'Could not refresh data. Please check network.');
    } finally {
      setTimeout(() => setIsLoading(false), 200);
    }
  };

  const handleAcceptAnswer = async (postId: string, answerId: string) => {
    setActionMessage(null);
    try {
      const result = await acceptPeerAnswer(postId, answerId);
      if (result.success) {
        setActionMessage({ type: 'success', text: result.message });
      } else {
        setActionMessage({ type: 'error', text: result.message });
      }
      setTimeout(() => setActionMessage(null), 6000);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to accept answer.' });
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const isFaculty = role === 'faculty' || role === 'admin';

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const title = newQuestion.trim().slice(0, 70) + (newQuestion.trim().length > 70 ? '...' : '');
    addPeerPost(title, newQuestion.trim(), newSubject, newTopic);
    setNewQuestion('');
    setShowAskModal(false);
  };

  const handleSendReply = (postId: string) => {
    if (!replyText.trim()) return;
    answerPeerDoubt(postId, replyText.trim());
    setReplyText('');
    setActiveReplyPostId(null);
  };

  // Safe normalized posts array
  const safePeerPosts = useMemo(() => {
    return Array.isArray(peerPosts) ? peerPosts : [];
  }, [peerPosts]);

  // Filtered posts based on selected subject and search query
  const filteredPosts = useMemo(() => {
    return safePeerPosts.filter((post) => {
      if (!post) return false;
      if (selectedSubject !== 'all' && post.subject !== selectedSubject) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(q);
        const bodyMatch = post.body?.toLowerCase().includes(q);
        const topicMatch = post.topic?.toLowerCase().includes(q);
        const authorMatch = post.authorName?.toLowerCase().includes(q);
        if (!titleMatch && !bodyMatch && !topicMatch && !authorMatch) {
          return false;
        }
      }
      return true;
    });
  }, [safePeerPosts, selectedSubject, searchFilter]);

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';
  const inputBg = isDark
    ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500';

  const currentStudentId = activeStudent?.id || '';

  // Show Skeleton if loading or if session is still restoring
  if (isLoading || !isSessionReady) {
    return <PeerDoubtsSkeleton isDark={isDark} />;
  }

  return (
    <ErrorBoundary
      fallbackTitle="Peer Doubts Error"
      fallbackMessage="An unexpected issue occurred while rendering the Peer Doubts board. Click retry to reload the doubts forum."
      onReset={handleRetryLoad}
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${cardBg}`}>
          <div>
            <h4 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              <span>Peer Discussion & Doubts Forum</span>
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Asker accepts the best solution (15 XP awarded to accepted helper, max 3/day). Once awarded, choice is locked.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setShowAskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer touch-target"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post a Learning Doubt</span>
            </button>
          </div>
        </div>

        {/* Action Notification Banner */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center justify-between animate-in fade-in ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-bold underline cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{loadError}</span>
            </div>
            <button
              onClick={handleRetryLoad}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Subject & Search Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'Data Structures & Algorithms', label: 'DSA' },
              { id: 'Python Programming', label: 'Python' },
            ].map((sub) => {
              const active = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search doubts or topics..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-hidden transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-2xs'
              }`}
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Ask Question Modal */}
        {showAskModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className={`w-full sm:max-w-lg border-0 sm:border rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl transition-colors pb-safe ${cardBg}`}>
              <h4 className="text-base font-bold mb-4">Post a Technical Doubt</h4>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs outline-hidden ${inputBg}`}
                  >
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Python Programming">Python Programming</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs outline-hidden ${inputBg}`}
                    placeholder="e.g. Monotonic Stack, Python MRO"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Question</label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs outline-hidden ${inputBg}`}
                    placeholder="State your technical question, doubt, code snippet, or conceptual confusion..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className={`px-4 py-2.5 text-xs rounded-xl touch-target cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs touch-target cursor-pointer"
                  >
                    Publish Doubt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State when no doubts match */}
        {filteredPosts.length === 0 ? (
          <div
            className={`p-8 sm:p-12 rounded-2xl border text-center flex flex-col items-center justify-center space-y-3 transition-colors ${cardBg}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold">No Doubts Found</h4>
            <p className={`text-xs max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {searchFilter || selectedSubject !== 'all'
                ? 'No peer discussions match your active search or subject filters. Try clearing filters to see all doubts.'
                : 'No student has posted a technical doubt yet. Be the first to ask and earn helpful explanations!'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              {searchFilter || selectedSubject !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('all');
                    setSearchFilter('');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowAskModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ask a Doubt</span>
              </button>
            </div>
          </div>
        ) : (
          /* Doubts List */
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              if (!post) return null;
              const isAuthor = Boolean(currentStudentId && post.studentId === currentStudentId);
              const postAnswers = Array.isArray(post.answers) ? post.answers : [];
              const hasAcceptedAnswer = postAnswers.some((a) => a?.isAccepted);

              return (
                <div key={post.id} className={`p-5 rounded-xl border space-y-4 transition-colors ${cardBg}`}>
                  {/* Question Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className={`flex items-center gap-2 text-xs flex-wrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="font-semibold text-indigo-500">{post.subject || 'General'}</span>
                        <span>·</span>
                        <span>{post.topic || 'General Topic'}</span>
                        <span>·</span>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                          {post.authorName || 'Anonymous'} ({post.authorCampus || 'MSOT'})
                        </span>
                      </div>

                      {hasAcceptedAnswer && (
                        <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Solved
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-semibold mb-1.5">{post.title}</h4>
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {post.body}
                    </p>
                  </div>

                  {/* Answers */}
                  <div className={`pt-3 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`text-xs font-semibold flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>
                        {postAnswers.length} {postAnswers.length === 1 ? 'Answer' : 'Answers'}
                      </span>
                      {post.isLocked && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-500" /> Resolution Locked (XP Awarded)
                        </span>
                      )}
                    </div>

                    {[...postAnswers]
                      .sort((a, b) => (b?.isAccepted ? 1 : 0) - (a?.isAccepted ? 1 : 0))
                      .map((ans) => {
                        if (!ans) return null;
                        const canAccept =
                          (isAuthor || isFaculty) &&
                          !ans.isAccepted &&
                          ans.authorId !== currentStudentId &&
                          !post.isLocked;

                        return (
                          <motion.div
                            layout
                            key={ans.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className={`p-3.5 rounded-xl text-xs space-y-2 border transition-all ${
                              ans.isAccepted
                                ? isDark
                                  ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30'
                                  : 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs'
                                : subCardBg
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold">{ans.authorName || 'Peer Helper'}</span>
                                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  · {ans.authorCampus || 'Campus'}
                                </span>
                                {ans.isAccepted && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 border-2 border-emerald-500 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs animate-stamp">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Accepted (+15 XP)
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {ans.timestamp || 'Recent'}
                              </span>
                            </div>

                            <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {ans.body}
                            </p>

                            {canAccept && (
                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => handleAcceptAnswer(post.id, ans.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer pressable-btn"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Accept Answer (Award +15 XP)</span>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}

                    {/* Reply Input */}
                    {activeReplyPostId === post.id ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your constructive explanation..."
                          rows={3}
                          className={`w-full border rounded-xl p-3 text-xs outline-hidden ${inputBg}`}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveReplyPostId(null);
                              setReplyText('');
                            }}
                            className={`px-3 py-1 text-xs cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Post Answer</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyPostId(post.id)}
                        className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer"
                      >
                        + Answer this Doubt
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
