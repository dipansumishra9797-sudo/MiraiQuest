import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { XpRule } from '../../types';
import {
  ShieldCheck,
  Sliders,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    rules,
    ruleAuditLogs,
    updateRule,
    toggleRuleActive,
    auditFlags,
    resolveAuditFlag,
    students,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rules' | 'audit_flags' | 'rule_logs'>('rules');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editXpValue, setEditXpValue] = useState<number>(0);
  const [editCap, setEditCap] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);

  const startEdit = (rule: XpRule) => {
    setEditingRuleId(rule.id);
    setEditXpValue(rule.xpValue);
    setEditCap(rule.dailyCap);
  };

  const handleSaveRule = (ruleId: string) => {
    updateRule(
      ruleId,
      { xpValue: editXpValue, dailyCap: editCap },
      'Dean Vikram Rao (Admin)'
    );
    setEditingRuleId(null);
    setNotice(`Rule updated successfully! Future events will immediately evaluate with new parameters.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>INSTITUTIONAL GOVERNANCE CONSOLE</span>
          </div>
          <h2 className="text-xl font-bold text-white">Dean Vikram Rao (MSOT Admin)</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Governing 4 Campuses (HI-Tech, Rathinam, RGIB, JUJ) · Configurable XP Rules Engine & Anti-Gaming Audit
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-medium">
        {[
          { id: 'rules', label: 'Configurable XP Rules Engine' },
          { id: 'audit_flags', label: `Anti-Gaming Audit Spikes (${auditFlags.filter(f => f.status === 'pending').length} Pending)` },
          { id: 'rule_logs', label: `Rules Modification Logs (${ruleAuditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Rules Engine Table */}
      {activeTab === 'rules' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Points Economy Rules Table (No Code Deploy Required)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust points, daily caps, or toggle active state. Changes take effect on all future events immediately and are logged.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Action Key</th>
                    <th className="py-3 px-4">Description & Verification</th>
                    <th className="py-3 px-4 text-center">XP Value</th>
                    <th className="py-3 px-4 text-center">Daily Cap</th>
                    <th className="py-3 px-4 text-center">Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rules.map((rule) => {
                    const isEditing = editingRuleId === rule.id;

                    return (
                      <tr key={rule.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-300">
                          {rule.actionKey}
                        </td>

                        <td className="py-3 px-4 text-slate-300 max-w-sm">
                          <div className="font-semibold text-white">{rule.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{rule.description}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Source: {rule.verificationSource}</div>
                        </td>

                        <td className="py-3 px-4 text-center tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editXpValue}
                              onChange={(e) => setEditXpValue(Number(e.target.value))}
                              className="w-16 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-center text-xs text-white"
                            />
                          ) : (
                            <span className="font-bold text-emerald-400 text-sm">
                              {rule.xpValue} XP
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editCap}
                              onChange={(e) => setEditCap(Number(e.target.value))}
                              className="w-16 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-center text-xs text-white"
                            />
                          ) : (
                            <span className="text-slate-300">
                              {rule.dailyCap ? `${rule.dailyCap}/day` : 'None'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleRuleActive(rule.id, 'Dean Vikram Rao')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rule.active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {rule.active ? 'ACTIVE' : 'DISABLED'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveRule(rule.id)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRuleId(null)}
                                className="px-2 py-1 text-slate-400 hover:text-white text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(rule)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
                            >
                              Edit Rule
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Anti-Gaming Audit Spikes */}
      {activeTab === 'audit_flags' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Automated Integrity Spikes & Collusion Warnings</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Triggered automatically by rolling anomaly detectors (Spike &gt; 3x average, rapid fire answers, identical timestamps).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {auditFlags.map((flag) => {
              const isPending = flag.status === 'pending';

              return (
                <div
                  key={flag.id}
                  className={`p-4 rounded-xl border space-y-3 ${
                    isPending
                      ? 'bg-slate-950 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{flag.studentName}</span>
                      <span className="text-[10px] text-slate-400">({flag.campus})</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-400 font-semibold text-xs">{flag.reason}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(flag.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        flag.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {flag.severity.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{flag.details}</p>

                  <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-slate-300">Suggested Action: </strong>
                    {flag.suggestedAction}
                  </div>

                  {isPending ? (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => resolveAuditFlag(flag.id, 'dismiss', 'Dean Vikram Rao', 'Reviewed as legitimate study sprint')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => resolveAuditFlag(flag.id, 'void', 'Dean Vikram Rao', 'Confirmed collusion or rapid bot answering')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Void Suspicious XP
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 pt-1">
                      Resolved: <span className="font-semibold text-white">{flag.status.toUpperCase()}</span> by {flag.reviewedBy}
                      {flag.reviewNote && ` (${flag.reviewNote})`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Rules Modification Logs */}
      {activeTab === 'rule_logs' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Immutable Rule Configuration Audit Log</span>
          </h4>

          {ruleAuditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No rule adjustments made yet this session. Edit any rule in the table to view the audit log entry.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Key</th>
                    <th className="py-3 px-4">Changed By</th>
                    <th className="py-3 px-4">Previous Value</th>
                    <th className="py-3 px-4 text-right">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ruleAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-white font-mono">{log.actionKey}</td>
                      <td className="py-3 px-4 text-slate-300">{log.changedBy}</td>
                      <td className="py-3 px-4 text-slate-400 tabular-nums">{log.oldValue} XP</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold tabular-nums">{log.newValue} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
