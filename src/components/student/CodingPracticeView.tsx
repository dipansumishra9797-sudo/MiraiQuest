import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { InbuiltCodeCompiler } from './InbuiltCodeCompiler';
import { Code, ExternalLink, RefreshCw, CheckCircle2, Shield, Terminal, Globe } from 'lucide-react';

export const CodingPracticeView: React.FC = () => {
  const { activeStudent, simulateExternalCodingSync, triggerXpEvent } = useApp();
  const [activeTab, setActiveTab] = useState<'compiler' | 'sync'>('compiler');

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [manualProblemTitle, setManualProblemTitle] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [manualProblemId, setManualProblemId] = useState('');

  const handleSyncPlatform = (platform: 'leetcode' | 'codeforces' | 'github') => {
    setSyncing(true);
    setSyncMessage(null);
    setTimeout(() => {
      const res = simulateExternalCodingSync(platform);
      setSyncMessage(res.message);
      setSyncing(false);
    }, 800);
  };

  const handleManualSolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProblemTitle || !manualProblemId) return;

    const res = triggerXpEvent({
      eventId: `ev_code_manual_${Date.now()}`,
      studentId: activeStudent.id,
      actionKey: 'solve_coding',
      timestamp: new Date().toISOString(),
      metadata: {
        problemId: manualProblemId,
        difficulty: manualDifficulty,
        problemTitle: manualProblemTitle,
        verificationSource: 'LevelUp Sandbox Unit-Test Suite Passed',
      },
    });

    if (res.success) {
      setSyncMessage(`Passed all automated test suites! Earned +${res.pointsAwarded} XP for "${manualProblemTitle}".`);
      setManualProblemTitle('');
      setManualProblemId('');
    } else {
      setSyncMessage(`Submission Rejected: ${res.rejectedReason}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Segmented Navigation: Inbuilt Compiler vs External Sync */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('compiler')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'compiler'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Inbuilt Code Compiler & Practice Arena</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'sync'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>External Profile Handles & Verification</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'compiler' ? (
        <InbuiltCodeCompiler />
      ) : (
        <div className="space-y-6">
          {/* External Platform Sync Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>EXTERNAL COMPETITIVE HANDLES</span>
                </div>
                <h3 className="text-xl font-bold text-white">Platform Account Verification</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect and synchronize external competitive handles. Easy (10 XP) · Medium (20 XP) · Hard (40 XP) · Max 10 problems/day.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Total Solves Verified</div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {activeStudent.codingHandles.verifiedProblemsCount}
                </div>
              </div>
            </div>

            {/* Sync Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* LeetCode */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-white mb-1 flex items-center justify-between">
                    <span>LeetCode</span>
                    <span className="text-[10px] text-amber-400 font-normal">Active</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-3 font-mono">
                    @{activeStudent.codingHandles.leetcode || 'unlinked'}
                  </div>
                </div>
                <button
                  onClick={() => handleSyncPlatform('leetcode')}
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Verify & Sync</span>
                </button>
              </div>

              {/* GitHub */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-white mb-1 flex items-center justify-between">
                    <span>GitHub Repos</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Connected</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-3 font-mono">
                    @{activeStudent.codingHandles.github || 'unlinked'}
                  </div>
                </div>
                <button
                  onClick={() => handleSyncPlatform('github')}
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Verify Commits</span>
                </button>
              </div>

              {/* Codeforces */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-white mb-1 flex items-center justify-between">
                    <span>Codeforces</span>
                    <span className="text-[10px] text-blue-400 font-normal">Available</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-3 font-mono">
                    @{activeStudent.codingHandles.codeforces || 'not linked'}
                  </div>
                </div>
                <button
                  onClick={() => handleSyncPlatform('codeforces')}
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Contest</span>
                </button>
              </div>
            </div>

            {syncMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          {/* Manual Coding Sandbox Submission */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-1">Manual Problem Validation Test</h4>
            <p className="text-xs text-slate-400 mb-4">
              Test duplicate check, difficulty tiering, and daily cap enforcement in real time.
            </p>

            <form onSubmit={handleManualSolve} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Problem ID (Unique)</label>
                <input
                  type="text"
                  value={manualProblemId}
                  onChange={(e) => setManualProblemId(e.target.value)}
                  placeholder="e.g. LC_206"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Problem Title</label>
                <input
                  type="text"
                  value={manualProblemTitle}
                  onChange={(e) => setManualProblemTitle(e.target.value)}
                  placeholder="e.g. Invert Binary Tree"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Difficulty</label>
                <select
                  value={manualDifficulty}
                  onChange={(e) => setManualDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="easy">Easy (10 XP)</option>
                  <option value="medium">Medium (20 XP)</option>
                  <option value="hard">Hard (40 XP)</option>
                </select>
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Submit & Verify Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
