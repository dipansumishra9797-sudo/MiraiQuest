import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { MessageSquare, CheckCircle, Plus, Send, HelpCircle, Shield } from 'lucide-react';

export const PeerHelpBoard: React.FC = () => {
  const { peerPosts, activeStudent, role, addPeerPost, answerPeerDoubt, acceptPeerAnswer, isDark } = useApp();

  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSubject, setNewSubject] = useState('Data Structures & Algorithms');
  const [newTopic, setNewTopic] = useState('Recursion, Call Stacks & Backtracking');

  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAcceptAnswer = async (postId: string, answerId: string) => {
    setActionMessage(null);
    const result = await acceptPeerAnswer(postId, answerId);
    if (result.success) {
      setActionMessage({ type: 'success', text: result.message });
    } else {
      setActionMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setActionMessage(null), 6000);
  };

  const isFaculty = role === 'faculty' || role === 'admin';

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    addPeerPost(newTitle.trim(), newBody.trim(), newSubject, newTopic);
    setNewTitle('');
    setNewBody('');
    setShowAskModal(false);
  };

  const handleSendReply = (postId: string) => {
    if (!replyText.trim()) return;
    answerPeerDoubt(postId, replyText.trim());
    setReplyText('');
    setActiveReplyPostId(null);
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';
  const inputBg = isDark
    ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${cardBg}`}>
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Peer Discussion & Doubts Forum</span>
          </h4>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Asker accepts the best solution (15 XP awarded to accepted helper, max 3/day). Once awarded, choice is locked.
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post a Learning Doubt</span>
        </button>
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

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg border rounded-2xl p-6 shadow-2xl transition-colors ${cardBg}`}>
            <h4 className="text-base font-bold mb-4">Post a Technical Doubt</h4>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs outline-hidden ${inputBg}`}
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
                  className={`w-full border rounded-lg px-3 py-2 text-xs outline-hidden ${inputBg}`}
                  placeholder="e.g. Monotonic Stack, Python MRO"
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Doubt Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs outline-hidden ${inputBg}`}
                  placeholder="What is your core confusion?"
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Explanation & Code Snippet</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  className={`w-full border rounded-lg px-3 py-2 text-xs outline-hidden ${inputBg}`}
                  placeholder="Provide context, what you tried, and expected behavior..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className={`px-3.5 py-2 text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Publish Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doubts List */}
      <div className="space-y-4">
        {peerPosts.map((post) => {
          const isAuthor = post.studentId === activeStudent.id;
          const hasAcceptedAnswer = post.answers.some((a) => a.isAccepted);

          return (
            <div key={post.id} className={`p-5 rounded-xl border space-y-4 transition-colors ${cardBg}`}>
              {/* Question Header */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="font-semibold text-indigo-500">{post.subject}</span>
                    <span>·</span>
                    <span>{post.topic}</span>
                    <span>·</span>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{post.authorName} ({post.authorCampus})</span>
                  </div>

                  {hasAcceptedAnswer && (
                    <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Solved
                    </span>
                  )}
                </div>

                <h4 className="text-base font-semibold mb-1.5">{post.title}</h4>
                <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{post.body}</p>
              </div>

              {/* Answers */}
              <div className={`pt-3 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className={`text-xs font-semibold flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>
                    {post.answers.length} {post.answers.length === 1 ? 'Answer' : 'Answers'}
                  </span>
                  {post.isLocked && (
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-500" /> Resolution Locked (XP Awarded)
                    </span>
                  )}
                </div>

                {[...post.answers]
                  .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0))
                  .map((ans) => {
                    const canAccept =
                      (isAuthor || isFaculty) &&
                      !ans.isAccepted &&
                      ans.authorId !== activeStudent.id &&
                      !post.isLocked;

                    return (
                      <div
                        key={ans.id}
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
                            <span className="font-bold">{ans.authorName}</span>
                            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>· {ans.authorCampus}</span>
                            {ans.isAccepted && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> Accepted Answer (+15 XP Awarded)
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ans.timestamp}</span>
                        </div>

                        <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{ans.body}</p>

                        {canAccept && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleAcceptAnswer(post.id, ans.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Accept Answer (Award +15 XP)</span>
                            </button>
                          </div>
                        )}
                      </div>
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
                        className={`px-3 py-1 text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post Answer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveReplyPostId(post.id)}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
                  >
                    + Answer this Doubt
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
