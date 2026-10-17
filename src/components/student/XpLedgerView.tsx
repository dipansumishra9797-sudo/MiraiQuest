import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { auditStudentTotalXp } from '../../modules/xpEngine';
import { Filter, Download, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';

export const XpLedgerView: React.FC = () => {
  const { activeStudent, ledger, isDark } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const studentLedger = ledger.filter((e) => e.studentId === activeStudent.id);

  const filteredEntries = studentLedger.filter((entry) => {
    if (filterType !== 'all' && entry.actionType !== filterType) return false;
    if (dateFilter && entry.date !== dateFilter) return false;
    return true;
  });

  const { calculatedTotal, validEntriesCount, voidedEntriesCount } = auditStudentTotalXp(
    activeStudent.id,
    ledger
  );

  const isAuditMatch = calculatedTotal === activeStudent.totalXp;

  const handleExportCsv = () => {
    const displayName = activeStudent.isAnonymous ? activeStudent.anonymousNickname : activeStudent.name;
    const headers = ['Date', 'Timestamp', 'Student', 'Action Type', 'Source Description', 'Points', 'Status', 'Void Reason'];
    const rows = filteredEntries.map((e) => [
      e.date,
      e.timestamp,
      displayName,
      e.actionType,
      `"${e.sourceDescription.replace(/"/g, '""')}"`,
      e.points,
      e.status,
      e.voidedReason ? `"${e.voidedReason.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `xp_ledger_${activeStudent.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = [
    { id: 'all', label: 'All Sources' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'classwork', label: 'Classwork' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'test', label: 'Test Marks' },
    { id: 'coding', label: 'Coding' },
    { id: 'club', label: 'Club' },
    { id: 'streak', label: 'Streak' },
    { id: 'peer_help', label: 'Peer Help' },
  ];

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const headerBg = isDark
    ? 'bg-slate-950/80 border-slate-800 text-slate-400'
    : 'bg-slate-100 border-slate-200 text-slate-600';
  const tableBorder = isDark ? 'divide-slate-800/60' : 'divide-slate-200';

  return (
    <div className="space-y-6">
      {/* Integrity Audit Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isAuditMatch
          ? isDark
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : isDark
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <div className="font-semibold text-xs">
              Cryptographic XP Ledger Audit: {isAuditMatch ? 'VERIFIED MATCH' : 'DISCREPANCY DETECTED'}
            </div>
            <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Profile XP ({activeStudent.totalXp} XP) equals exact sum of valid ledger entries ({calculatedTotal} XP). {validEntriesCount} valid events, {voidedEntriesCount} voided overrides.
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shrink-0 ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-indigo-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${cardBg}`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {actionTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterType === t.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`rounded-lg px-2.5 py-1 text-xs focus:outline-hidden focus:border-indigo-500 border ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className={`text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className={`rounded-xl border overflow-hidden transition-colors ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-medium ${headerBg}`}>
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Source Category</th>
                <th className="py-3 px-4">Verifiable Learning Action</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tableBorder}`}>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No ledger entries matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isVoided = entry.status === 'voided';
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isVoided
                          ? 'opacity-50 line-through'
                          : isDark
                          ? 'hover:bg-slate-800/30'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`py-3 px-4 font-mono text-[11px] whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {entry.date} <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{entry.timestamp.split('T')[1]?.slice(0, 5)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize font-medium">
                          {entry.actionType.replace('_', ' ')}
                        </span>
                      </td>

                      <td className={`py-3 px-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <div>{entry.sourceDescription}</div>
                        {isVoided && entry.voidedReason && (
                          <div className="text-[10px] text-rose-500 no-underline not-italic mt-0.5 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Voided by {entry.voidedBy || 'Faculty'}: {entry.voidedReason}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                        <span className={isVoided ? (isDark ? 'text-slate-500' : 'text-slate-400') : 'text-emerald-600 dark:text-emerald-400'}>
                          +{entry.points} XP
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isVoided ? (
                          <span className="text-[11px] text-rose-500 font-semibold">
                            VOIDED
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            VALID
                          </span>
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
  );
};
