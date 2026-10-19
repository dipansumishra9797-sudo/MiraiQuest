import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../store/appStore';
import { XpRule, Campus, LeagueTier } from '../../types';
import { GlobalFilterBar } from '../GlobalFilterBar';
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
  Trophy,
  Swords,
  ShoppingBag,
  Users,
  Search,
  Filter,
  Flame,
  Zap,
  Play,
  Award,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { IllustratedEmptyState } from '../common/GameIcons';
import { DraggableGridDemo } from '@/components/ui/demo';

export const AdminDashboard: React.FC = () => {
  const {
    rules,
    ruleAuditLogs,
    updateRule,
    toggleRuleActive,
    auditFlags,
    resolveAuditFlag,
    students,
    filteredStudents,
    globalFilters,
    updateGlobalFilter,
    ledger,
    voidLedgerEntry,
    battles,
    rewardItems,
    redemptions,
    isDark,
    navSection,
    setNavSection,
  } = useApp();

  type AdminTab =
    | 'rules'
    | 'audit_flags'
    | 'xp_spikes'
    | 'rule_logs'
    | 'leagues'
    | 'battles'
    | 'rewards'
    | 'users'
    | 'observability';

  const [activeTab, setActiveTab] = useState<AdminTab>('rules');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editXpValue, setEditXpValue] = useState<number>(0);
  const [editCap, setEditCap] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);

  // Sync with navSection from Drawer
  useEffect(() => {
    if (navSection.startsWith('admin:')) {
      const section = navSection.replace('admin:', '') as AdminTab;
      if (
        [
          'rules',
          'audit_flags',
          'xp_spikes',
          'rule_logs',
          'leagues',
          'battles',
          'rewards',
          'users',
          'observability',
        ].includes(section)
      ) {
        setActiveTab(section);
      }
    }
  }, [navSection]);

  const handleTabClick = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setNavSection(`admin:${tabId}`);
  };

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

  // Card & surface style helpers
  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';
  const headerBg = isDark
    ? 'bg-slate-900/80 text-slate-400 border-slate-800'
    : 'bg-slate-100 text-slate-600 border-slate-200';
  const tableBorder = isDark ? 'divide-slate-800/60' : 'divide-slate-200';

  // Filtered Audit Flags (strictly respects global filter student cohort and campus)
  const filteredAuditFlags = auditFlags.filter((flag) => {
    if (
      globalFilters.campuses.length > 0 &&
      !globalFilters.campuses.includes(flag.campus as any)
    ) {
      return false;
    }
    if (globalFilters.searchQuery.trim()) {
      const q = globalFilters.searchQuery.toLowerCase();
      const matchName = flag.studentName.toLowerCase().includes(q);
      const matchReason = flag.reason.toLowerCase().includes(q);
      if (!matchName && !matchReason) return false;
    }
    return true;
  });

  // Filtered XP Spikes: Large point entries (>= 40 XP) from filtered students
  const filteredSpikeEntries = ledger.filter((entry) => {
    const belongsToCohort = filteredStudents.some((s) => s.id === entry.studentId);
    if (!belongsToCohort) return false;
    return entry.points >= 40 || entry.actionKey === 'solve_coding';
  });

  // Filtered Redemptions: Redemptions from students in filtered cohort
  const filteredRedemptions = redemptions.filter((red) =>
    filteredStudents.some((s) => s.id === red.studentId)
  );

  // Filtered Battles: Battles involving selected campuses
  const filteredBattles = battles.filter((b) => {
    if (globalFilters.campuses.length === 0) return true;
    return b.teams.some((t) =>
      globalFilters.campuses.some((c) => t.campusOrSection.includes(c))
    );
  });

  return (
    <div className="space-y-6">
      {/* Sticky Global Filter Bar */}
      <GlobalFilterBar />

      {/* Admin Title Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${cardBg}`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>INSTITUTIONAL GOVERNANCE CONSOLE</span>
          </div>
          <h2 className="text-xl font-bold">Dean Vikram Rao (MSOT Admin)</h2>
          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Governing 3 Campuses (HI-Tech, Rathinam, JUJ) · Configurable XP Rules, Anti-Gaming Audit & Integrity Engine
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-xl border font-mono font-medium ${isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            Engine v2.4 · 100% Healthy
          </span>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs Row (Scrolls cleanly on mobile without clipping) */}
      <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b text-xs font-medium ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {[
          { id: 'rules', label: 'XP Rules Engine', icon: Sliders },
          { id: 'audit_flags', label: `Anti-Gaming Audit (${filteredAuditFlags.filter(f => f.status === 'pending').length} Pending)`, icon: AlertTriangle },
          { id: 'xp_spikes', label: `XP Spike Audit (${filteredSpikeEntries.length} Events)`, icon: Zap },
          { id: 'rule_logs', label: `Modification Logs (${ruleAuditLogs.length})`, icon: History },
          { id: 'leagues', label: `Leagues & Leaderboards (${filteredStudents.length})`, icon: Trophy },
          { id: 'battles', label: `Battles Control (${filteredBattles.length})`, icon: Swords },
          { id: 'rewards', label: `Rewards & Redemptions (${filteredRedemptions.length})`, icon: ShoppingBag },
          { id: 'users', label: `Users Directory (${filteredStudents.length})`, icon: Users },
          { id: 'observability', label: 'AI Observability & Tiler', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30'
                  : isDark
                  ? 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Rules Management Table */}
      {activeTab === 'rules' && (
        <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-500">
                <Sliders className="w-4 h-4" />
                <span>Configurable XP Economy Rules & Guardrails</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Values and daily anti-abuse caps take effect in real time. Changes are logged to the immutable ledger.
              </p>
            </div>
          </div>

          {/* 1. Mobile Cards View (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {rules.map((rule) => {
              const isEditing = editingRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border space-y-3 transition-colors ${subCardBg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{rule.label}</div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {rule.actionKey}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        rule.category === 'academic'
                          ? 'bg-blue-500/10 text-blue-500'
                          : rule.category === 'practice'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : rule.category === 'engagement'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {rule.category}
                      </span>

                      <button
                        onClick={() => toggleRuleActive(rule.id, 'Dean Vikram Rao')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold touch-target cursor-pointer ${
                          rule.active
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : isDark
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rule.active ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 mb-0.5">Base Points</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editXpValue}
                          onChange={(e) => setEditXpValue(Number(e.target.value))}
                          className={`w-full border rounded px-2 py-1 text-center text-xs ${
                            isDark
                              ? 'bg-slate-900 border-indigo-500 text-white'
                              : 'bg-white border-indigo-500 text-slate-900'
                          }`}
                        />
                      ) : (
                        <span className="font-bold text-emerald-500">{rule.xpValue} XP</span>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 mb-0.5">Daily Cap</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCap}
                          onChange={(e) => setEditCap(Number(e.target.value))}
                          className={`w-full border rounded px-2 py-1 text-center text-xs ${
                            isDark
                              ? 'bg-slate-900 border-indigo-500 text-white'
                              : 'bg-white border-indigo-500 text-slate-900'
                          }`}
                        />
                      ) : (
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          {rule.dailyCap ? `${rule.dailyCap}/day` : 'None'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Verification: {rule.verificationSource}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className={`px-3 py-1.5 rounded-lg text-xs touch-target cursor-pointer ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveRule(rule.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold touch-target cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(rule)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 touch-target cursor-pointer"
                      >
                        Edit Rule
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Tablet & Desktop Table View (>= 640px) */}
          <div className={`hidden sm:block rounded-xl border overflow-hidden ${subCardBg}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`font-medium border-b ${headerBg}`}>
                  <tr>
                    <th className="py-3 px-4">Action Label & Key</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Base XP</th>
                    <th className="py-3 px-4 text-center">Daily Cap</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {rules.map((rule) => {
                    const isEditing = editingRuleId === rule.id;

                    return (
                      <tr key={rule.id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/60'}`}>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-sm">{rule.label}</div>
                          <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {rule.actionKey} · {rule.verificationSource}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            rule.category === 'academic'
                              ? 'bg-blue-500/10 text-blue-500'
                              : rule.category === 'practice'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : rule.category === 'engagement'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {rule.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editXpValue}
                              onChange={(e) => setEditXpValue(Number(e.target.value))}
                              className={`w-16 border rounded px-2 py-1 text-center text-xs ${
                                isDark
                                  ? 'bg-slate-900 border-indigo-500 text-white'
                                  : 'bg-white border-indigo-500 text-slate-900'
                              }`}
                            />
                          ) : (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
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
                              className={`w-16 border rounded px-2 py-1 text-center text-xs ${
                                isDark
                                  ? 'bg-slate-900 border-indigo-500 text-white'
                                  : 'bg-white border-indigo-500 text-slate-900'
                              }`}
                            />
                          ) : (
                            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                              {rule.dailyCap ? `${rule.dailyCap}/day` : 'None'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleRuleActive(rule.id, 'Dean Vikram Rao')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rule.active
                                ? isDark
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : isDark
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
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
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRuleId(null)}
                                className={`px-2 py-1 rounded text-[11px] ${
                                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(rule)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                              Edit
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

      {/* 2. Anti-Gaming Audit Flags */}
      {activeTab === 'audit_flags' && (
        <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Automated Integrity Spikes & Collusion Warnings ({filteredAuditFlags.length} Flags)</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Triggered automatically by rolling anomaly detectors (Spike &gt; 3x average, rapid fire answers, identical timestamps). Filtered by active campus and cohort.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAuditFlags.length === 0 ? (
              <IllustratedEmptyState
                type="no_results"
                title="Integrity Assured"
                description="No active integrity flags found in this filtered cohort."
                isDark={isDark}
              />
            ) : (
              filteredAuditFlags.map((flag) => {
                const isPending = flag.status === 'pending';

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    key={flag.id}
                    className={`p-4 rounded-xl border space-y-3 transition-colors interactive-card ${
                      isPending
                        ? isDark
                          ? 'bg-slate-950 border-amber-500/40'
                          : 'bg-amber-50/50 border-amber-300'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 opacity-60'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs">{flag.studentName}</span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({flag.campus})
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-amber-500 font-semibold text-xs">{flag.reason}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(flag.timestamp).toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            flag.severity === 'high'
                              ? isDark
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isDark
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {flag.severity.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {flag.details}
                    </p>

                    <div
                      className={`text-[11px] p-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                        Suggested Action:{' '}
                      </strong>
                      {flag.suggestedAction}
                    </div>

                    {isPending ? (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() =>
                            resolveAuditFlag(
                              flag.id,
                              'dismiss',
                              'Dean Vikram Rao',
                              'Reviewed as legitimate study sprint'
                            )
                          }
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer pressable-btn ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          Dismiss Flag
                        </button>
                        <button
                          onClick={() =>
                            resolveAuditFlag(
                              flag.id,
                              'void',
                              'Dean Vikram Rao',
                              'Confirmed collusion or rapid bot answering'
                            )
                          }
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer pressable-btn"
                        >
                          Void Suspicious XP
                        </button>
                      </div>
                    ) : (
                      <div className={`text-[11px] pt-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Resolved: <span className="font-semibold">{flag.status.toUpperCase()}</span> by {flag.reviewedBy}</span>
                        {flag.reviewNote && ` (${flag.reviewNote})`}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. XP Spike & Sudden Burst Audit */}
      {activeTab === 'xp_spikes' && (
        <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                <Zap className="w-4 h-4" />
                <span>Large XP Spikes & High Velocity Transactions ({filteredSpikeEntries.length} Events)</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Audit student transactions gaining 40+ XP in a single event or high-frequency coding verifications.
              </p>
            </div>
          </div>

          <div className={`rounded-xl border overflow-hidden ${subCardBg}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`font-medium border-b ${headerBg}`}>
                  <tr>
                    <th className="py-3 px-4">Timestamp & ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Action Key</th>
                    <th className="py-3 px-4 text-right">Points</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {filteredSpikeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No XP spike events detected for the active cohort.
                      </td>
                    </tr>
                  ) : (
                    filteredSpikeEntries.map((entry) => {
                      const student = students.find((s) => s.id === entry.studentId);
                      return (
                        <tr key={entry.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/60'}>
                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-slate-400">{entry.id}</div>
                            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold">{student?.name || entry.studentId}</span>
                            <div className="text-[10px] text-slate-400">
                              {student?.campus} · {student?.year} · Sec {student?.section}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">{entry.actionKey}</td>
                          <td className="py-3 px-4 text-right font-black text-amber-500 tabular-nums">
                            +{entry.points} XP
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                entry.status === 'valid'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-rose-500/10 text-rose-500'
                              }`}
                            >
                              {entry.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {entry.status === 'valid' ? (
                              <button
                                onClick={() => {
                                  voidLedgerEntry(entry.id, 'Admin audit spike override', 'Dean Vikram Rao');
                                  setNotice(`Voided entry ${entry.id}. Student total XP recomputed.`);
                                  setTimeout(() => setNotice(null), 4000);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                              >
                                Void XP
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Voided</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Rules Modification Logs */}
      {activeTab === 'rule_logs' && (
        <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${cardBg}`}>
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-500" />
            <span>Immutable Rule Configuration Audit Log</span>
          </h4>

          {ruleAuditLogs.length === 0 ? (
            <IllustratedEmptyState
              type="no_data"
              title="Audit Log Invariant"
              description="No rule adjustments made yet this session. Edit any rule in the table to view the audit log entry."
              isDark={isDark}
            />
          ) : (
            <div className={`rounded-xl border overflow-hidden ${subCardBg}`}>
              <table className="w-full text-left text-xs">
                <thead className={`font-medium border-b ${headerBg}`}>
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Key</th>
                    <th className="py-3 px-4">Changed By</th>
                    <th className="py-3 px-4">Previous Value</th>
                    <th className="py-3 px-4 text-right">New Value</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {ruleAuditLogs.map((log) => (
                    <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/60'}`}>
                      <td className={`py-3 px-4 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{log.actionKey}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{log.changedBy}</td>
                      <td className={`py-3 px-4 tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{log.oldValue} XP</td>
                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{log.newValue} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Leagues & Leaderboards Overview */}
      {activeTab === 'leagues' && (
        <div className={`p-5 rounded-2xl border space-y-5 transition-colors ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                <Trophy className="w-4 h-4" />
                <span>Institutional League Tiers & Weekly Redistribution</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Showing distribution for active filtered cohort ({filteredStudents.length} students). Weekly top 20% promote, bottom 20% relegate.
              </p>
            </div>
          </div>

          {/* Tier Cards computed from filtered cohort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { tier: 'Bronze', range: '0 - 499 XP', count: filteredStudents.filter(s => s.league === 'Bronze').length, color: 'text-amber-700 bg-amber-500/10 border-amber-600/30' },
              { tier: 'Silver', range: '500 - 1,499 XP', count: filteredStudents.filter(s => s.league === 'Silver').length, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
              { tier: 'Gold', range: '1,500 - 3,499 XP', count: filteredStudents.filter(s => s.league === 'Gold').length, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
              { tier: 'Platinum', range: '3,500 - 6,999 XP', count: filteredStudents.filter(s => s.league === 'Platinum').length, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
              { tier: 'Diamond', range: '7,000+ XP', count: filteredStudents.filter(s => s.league === 'Diamond').length, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
            ].map((t) => (
              <div key={t.tier} className={`p-4 rounded-xl border flex flex-col justify-between ${t.color}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{t.tier} Tier</span>
                    <Trophy className="w-4 h-4 opacity-75" />
                  </div>
                  <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.range}</div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-black">{t.count}</span>
                  <span className="text-[10px] font-semibold opacity-80">Students</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filtered League Leaderboard Table */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ranked Leaderboard for Filtered Cohort ({filteredStudents.length} Students)
            </h5>
            <div className={`rounded-xl border overflow-hidden ${subCardBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`font-medium border-b ${headerBg}`}>
                    <tr>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Campus & Year</th>
                      <th className="py-3 px-4 text-center">Streak</th>
                      <th className="py-3 px-4 text-center">Total XP</th>
                      <th className="py-3 px-4 text-center">Weekly XP</th>
                      <th className="py-3 px-4 text-center">Tier</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorder}`}>
                    {filteredStudents.map((s, idx) => (
                      <tr key={`lb-${s.id}`} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/60'}>
                        <td className="py-3 px-4 text-center font-bold text-indigo-500">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{s.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{s.rollNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{s.campus}</span>
                          <span className="block text-[10px] text-slate-400">{s.year} · Sec {s.section}</span>
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums">
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {s.streakDays}d
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {s.totalXp.toLocaleString()} XP
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-indigo-500 tabular-nums">
                          +{s.weeklyXp} XP
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                            {s.league}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Battles Control Tab */}
      {activeTab === 'battles' && (
        <div className={`p-5 rounded-2xl border space-y-5 transition-colors ${cardBg}`}>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-500">
              <Swords className="w-4 h-4" />
              <span>Inter-Campus Battle Coordination ({filteredBattles.length} Matches)</span>
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Cooperative cohort team battles across HI-Tech, Rathinam, and JUJ. Participation yields pooled cohort perks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBattles.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs italic text-slate-400">
                No active battles match the selected campus filter.
              </div>
            ) : (
              filteredBattles.map((b) => (
                <div key={b.id} className={`p-4 rounded-xl border space-y-3 ${subCardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{b.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.status === 'active'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      Matchup: <span className="font-semibold text-indigo-500">{b.teams.map((t) => t.teamName).join(' vs ')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {b.teams.map((t) => (
                        <div key={t.teamId} className="flex items-center gap-1 text-xs">
                          <span className="font-semibold">{t.campusOrSection}:</span>
                          <span className="font-bold text-emerald-500 font-mono">{t.normalizedScore} pts</span>
                        </div>
                      ))}
                    </div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Ends: {new Date(b.endTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. Rewards Store & Redemption Requests */}
      {activeTab === 'rewards' && (
        <div className={`p-5 rounded-2xl border space-y-5 transition-colors ${cardBg}`}>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
              <ShoppingBag className="w-4 h-4" />
              <span>Institutional Perks & Non-Academic Rewards Catalog</span>
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Perks are purchased exclusively with Perk Coins earned from learning milestones. Academic marks and course grades are strictly insulated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewardItems.map((reward) => (
              <div key={reward.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${subCardBg}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{reward.title}</span>
                    <span className="text-amber-500 font-bold text-xs">{reward.costCoins} Coins</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{reward.description}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-700/30">
                  <span className="font-mono text-indigo-500">{reward.category.toUpperCase()}</span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{reward.stock > 0 ? `${reward.stock} in stock` : 'Out of stock'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Redemption Requests Queue Filtered by Cohort */}
          <div className="space-y-3 pt-3 border-t border-slate-700/30">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Perk Redemptions for Active Cohort ({filteredRedemptions.length})
            </h5>
            <div className={`rounded-xl border overflow-hidden ${subCardBg}`}>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-700/20">
                {filteredRedemptions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    No perk redemption requests found in the active cohort.
                  </div>
                ) : (
                  filteredRedemptions.map((red) => (
                    <div key={red.id} className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-xs">{red.studentName}</div>
                          <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{red.itemTitle}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold shrink-0">
                          {red.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-amber-500 font-bold">{red.costCoins} Coins</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {new Date(red.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`font-medium border-b ${headerBg}`}>
                    <tr>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Perk Title</th>
                      <th className="py-2.5 px-4 text-center">Cost</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorder}`}>
                    {filteredRedemptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          No perk redemption requests found in the active cohort.
                        </td>
                      </tr>
                    ) : (
                      filteredRedemptions.map((red) => (
                        <tr key={red.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/60'}>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                            {new Date(red.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 font-semibold">{red.studentName}</td>
                          <td className="py-2.5 px-4">{red.itemTitle}</td>
                          <td className="py-2.5 px-4 text-center text-amber-500 font-bold">{red.costCoins} Coins</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                              {red.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Users Directory Tab (Directly respects GlobalFilterBar) */}
      {activeTab === 'users' && (
        <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-500">
                <Users className="w-4 h-4" />
                <span>Cross-Campus Student Directory ({filteredStudents.length} Students)</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Audit student level standing, streaks, and campus distribution. Controlled by the top filter bar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Sort by:</span>
              <select
                value={globalFilters.sortBy}
                onChange={(e) => updateGlobalFilter('sortBy', e.target.value as any)}
                className={`py-1.5 px-3 text-xs rounded-lg border outline-hidden ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="xp">Total XP</option>
                <option value="name">Name (A-Z)</option>
                <option value="streak">Streak Days</option>
                <option value="activity">Most Recently Active</option>
              </select>
            </div>
          </div>

          <div className={`rounded-xl border overflow-hidden ${subCardBg}`}>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-slate-700/20">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  No students matching current filters.
                </div>
              ) : (
                filteredStudents.map((s) => (
                  <div key={s.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs">{s.name}</div>
                        <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {s.rollNumber} · {s.email}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 shrink-0">
                        {s.league}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-medium text-xs">{s.campus}</span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.year}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Sec {s.section}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500 ml-auto">
                        Lvl {s.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-700/20">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {s.streakDays}d
                      </span>
                      <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {s.totalXp.toLocaleString()} XP
                      </span>
                      <span className="text-[10px]">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          {s.shareSocialLinksWithBatchmates ? 'Social Shared' : 'Social Private'}
                        </span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`font-medium border-b ${headerBg}`}>
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Campus & Year</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4 text-center">Level</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-center">Total XP</th>
                    <th className="py-3 px-4 text-center">League</th>
                    <th className="py-3 px-4 text-right">Social Sharing</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tableBorder}`}>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No students matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100/60'}`}>
                        <td className="py-3 px-4">
                          <div className="font-semibold">{s.name}</div>
                          <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.rollNumber} · {s.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{s.campus}</span>
                          <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.year}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Sec {s.section}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-bold text-indigo-500">
                          Lvl {s.level}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums">
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {s.streakDays}d
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                          {s.totalXp.toLocaleString()} XP
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                            {s.league}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[10px]">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            {s.shareSocialLinksWithBatchmates ? 'Shared with Batch' : 'Private'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. AI Agent Observability & Draggable Widget Grid */}
      {activeTab === 'observability' && (
        <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-500">
                <Activity className="w-4 h-4" />
                <span>Real-Time AI Observability & Dynamic Widget Grid</span>
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Gap-free rectangular tiler with spring physics. Drag widgets or hold Alt + Arrow keys to customize your operations layout.
              </p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <DraggableGridDemo embedded />
          </div>
        </div>
      )}
    </div>
  );
};
