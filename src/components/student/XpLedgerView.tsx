import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { auditStudentTotalXp } from '../../modules/xpEngine';
import { Filter, Download, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';

export const XpLedgerView: React.FC = () => {
  const { activeStudent, ledger } = useApp();
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

  return (
    <div className="space-y-6">
      {/* Integrity Audit Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isAuditMatch ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
      }`}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-white text-xs">
              Cryptographic XP Ledger Audit: {isAuditMatch ? 'VERIFIED MATCH' : 'DISCREPANCY DETECTED'}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Profile XP ({activeStudent.totalXp} XP) equals exact sum of valid ledger entries ({calculatedTotal} XP). {validEntriesCount} valid events, {voidedEntriesCount} voided overrides.
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {actionTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterType === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Source Category</th>
                <th className="py-3 px-4">Verifiable Learning Action</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No ledger entries matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isVoided = entry.status === 'voided';
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isVoided ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {entry.date} <span className="text-slate-500">{entry.timestamp.split('T')[1]?.slice(0, 5)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-300 font-medium">
                          {entry.actionType.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-200">
                        <div>{entry.sourceDescription}</div>
                        {isVoided && entry.voidedReason && (
                          <div className="text-[10px] text-rose-400 no-underline not-italic mt-0.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Voided by {entry.voidedBy || 'Faculty'}: {entry.voidedReason}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                        <span className={isVoided ? 'text-slate-500' : 'text-emerald-400'}>
                          +{entry.points} XP
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isVoided ? (
                          <span className="text-[11px] text-rose-400 font-semibold">
                            VOIDED
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">
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
