import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { MessageSquare, CheckCircle, Plus, Send, HelpCircle, Shield } from 'lucide-react';

export const PeerHelpBoard: React.FC = () => {
  const { peerPosts, activeStudent, addPeerPost, answerPeerDoubt, acceptPeerAnswer } = useApp();

  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSubject, setNewSubject] = useState('Data Structures & Algorithms');
  const [newTopic, setNewTopic] = useState('Recursion, Call Stacks & Backtracking');

  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Peer Discussion & Doubts Forum</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Earn 15 verified XP when your clear answer is accepted by the asker or faculty (max 3/day · self-answers ineligible).
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post a Learning Doubt</span>
        </button>
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-4">Post a Technical Doubt</h4>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Python Programming">Python Programming</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="e.g. Monotonic Stack, Python MRO"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Doubt Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="What is your core confusion?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Explanation & Code Snippet</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Provide context, what you tried, and expected behavior..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
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
            <div key={post.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              {/* Question Header */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-indigo-400">{post.subject}</span>
                    <span>·</span>
                    <span>{post.topic}</span>
                    <span>·</span>
                    <span className="text-slate-500">{post.authorName} ({post.authorCampus})</span>
                  </div>

                  {hasAcceptedAnswer && (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Solved
                    </span>
                  )}
                </div>

                <h4 className="text-base font-semibold text-white mb-1.5">{post.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
              </div>

              {/* Answers */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-400">
                  {post.answers.length} {post.answers.length === 1 ? 'Answer' : 'Answers'}
                </div>

                {post.answers.map((ans) => {
                  const canAccept = (isAuthor || activeStudent.id === 'fac_priya_nair') && !ans.isAccepted && ans.authorId !== activeStudent.id;

                  return (
                    <div
                      key={ans.id}
                      className={`p-3.5 rounded-xl text-xs space-y-2 border ${
                        ans.isAccepted
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-950 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{ans.authorName}</span>
                          <span className="text-slate-500 text-[10px]">· {ans.authorCampus}</span>
                          {ans.isAccepted && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Accepted Answer (+15 XP Awarded)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{ans.timestamp}</span>
                      </div>

                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ans.body}</p>

                      {canAccept && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => acceptPeerAnswer(post.id, ans.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-md text-[11px] font-semibold transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Accepted & Award 15 XP to {ans.authorName}</span>
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setActiveReplyPostId(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post Answer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveReplyPostId(post.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
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
