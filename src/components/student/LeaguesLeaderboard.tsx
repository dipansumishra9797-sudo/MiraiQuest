import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Campus, LeagueTier, StudentProfile } from '../../types';
import { Trophy, ArrowUp, ArrowDown, Shield, Eye, EyeOff, UserX, Download, Play, TrendingUp, Sparkles } from 'lucide-react';

export const LeaguesLeaderboard: React.FC = () => {
  const {
    students,
    activeStudent,
    toggleAnonymousMode,
    toggleOptOutOfLeaderboards,
    simulateWeekEnd,
    isDark,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'league' | 'campus' | 'batch' | 'personal_best'>('league');
  const [selectedLeague, setSelectedLeague] = useState<LeagueTier>(activeStudent.league);
  const [selectedCampus, setSelectedCampus] = useState<Campus>(activeStudent.campus);
  const [simulationResult, setSimulationResult] = useState<{ promotedCount: number; relegatedCount: number } | null>(null);

  // Filter students who have NOT opted out
  const publicStudents = students.filter((s) => !s.optOutOfLeaderboards);

  // League rankings
  const leagueStudents = publicStudents
    .filter((s) => s.league === selectedLeague)
    .sort((a, b) => b.weeklyXp - a.weeklyXp);

  // Campus rankings
  const campusStudents = publicStudents
    .filter((s) => s.campus === selectedCampus)
    .sort((a, b) => b.weeklyXp - a.weeklyXp);

  // Personal Best / Improvement rankings: (% improvement over last week)
  const personalBestStudents = [...publicStudents]
    .map((s) => {
      const prev = Math.max(15, s.previousWeeklyXp);
      const diff = s.weeklyXp - s.previousWeeklyXp;
      const percent = Math.round((diff / prev) * 100);
      return { ...s, improvementPercent: percent, diffXp: diff };
    })
    .sort((a, b) => b.improvementPercent - a.improvementPercent);

  const handleSimulateWeekEnd = () => {
    const res = simulateWeekEnd();
    setSimulationResult(res);
  };

  const handleExportCsv = () => {
    let dataset: StudentProfile[] = [];
    if (activeTab === 'league') dataset = leagueStudents;
    else if (activeTab === 'campus') dataset = campusStudents;
    else dataset = publicStudents;

    const headers = ['Rank', 'Display Name', 'Campus', 'Section', 'League', 'Weekly XP', 'Total XP', 'Streak Days'];
    const rows = dataset.map((s, idx) => {
      const displayName = s.isAnonymous ? s.anonymousNickname : s.name;
      return [
        idx + 1,
        `"${displayName}"`,
        s.campus,
        s.section,
        s.league,
        s.weeklyXp,
        s.totalXp,
        s.streakDays,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leaderboard_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';
  const tableHeaderBg = isDark
    ? 'bg-slate-950 text-slate-400 border-slate-800'
    : 'bg-slate-100 text-slate-600 border-slate-200';
  const tableBorder = isDark ? 'divide-slate-800/60' : 'divide-slate-200';

  return (
    <div className="space-y-6">
      {/* Privacy & Opt-Out Controls */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${cardBg}`}>
        <div>
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Inclusive & Private By Design</span>
          </div>
          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            You control your visibility. Leveled leagues compare you only against peers of similar rank; leaderboards reset weekly.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Anonymous Mode Button */}
          <button
            onClick={() => toggleAnonymousMode(activeStudent.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeStudent.isAnonymous
                ? isDark
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : isDark
                ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {activeStudent.isAnonymous ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Anonymous: {activeStudent.isAnonymous ? activeStudent.anonymousNickname : 'OFF'}</span>
          </button>

          {/* Opt-out of leaderboard entirely */}
          <button
            onClick={() => toggleOptOutOfLeaderboards(activeStudent.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeStudent.optOutOfLeaderboards
                ? isDark
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
                : isDark
                ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>{activeStudent.optOutOfLeaderboards ? 'Leaderboards: OPTED OUT' : 'Opt Out'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Simulate Week End */}
          <button
            onClick={handleSimulateWeekEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Simulate Week End</span>
          </button>
        </div>
      </div>

      {simulationResult && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          isDark
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Week ended simulated! {simulationResult.promotedCount} students promoted, {simulationResult.relegatedCount} relegated. Weekly XP has cleanly reset for a fresh cycle!
            </span>
          </div>
          <button onClick={() => setSimulationResult(null)} className={`text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          {[
            { id: 'league', label: 'Similar-Level Leagues' },
            { id: 'personal_best', label: 'Personal Best (Improvement)' },
            { id: 'campus', label: 'Campus Leaderboard' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tier sub-selector for Leagues tab */}
        {activeTab === 'league' && (
          <div className="flex items-center gap-1">
            {(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as LeagueTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedLeague(tier)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedLeague === tier
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        )}

        {/* Campus sub-selector for Campus tab */}
        {activeTab === 'campus' && (
          <div className="flex items-center gap-1">
            {(['HI-Tech', 'Rathinam', 'JUJ'] as Campus[]).map((camp) => (
              <button
                key={camp}
                onClick={() => setSelectedCampus(camp)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedCampus === camp
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {camp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Table Container */}
      <div className={`rounded-xl border overflow-hidden transition-colors ${cardBg}`}>
        {/* Promotion/Relegation Zone Legend */}
        {activeTab === 'league' && (
          <div className={`px-4 py-2 border-b text-[11px] flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/60 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUp className="w-3 h-3" /> Top 3 Promoted to Next League
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <ArrowDown className="w-3 h-3" /> Bottom 3 Relegated
              </span>
            </div>
            <span>Reset Cycle: 5 Days Remaining</span>
          </div>
        )}

        {activeTab === 'personal_best' && (
          <div className={`px-4 py-2 border-b text-[11px] flex items-center gap-2 ${
            isDark
              ? 'bg-slate-950/60 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              Fairness Ranking: Compares every student against their OWN previous week. Even students starting behind can top this board!
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-medium border-b ${tableHeaderBg}`}>
              <tr>
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Campus & Section</th>
                {activeTab === 'personal_best' ? (
                  <>
                    <th className="py-3 px-4 text-right">Last Week</th>
                    <th className="py-3 px-4 text-right">This Week</th>
                    <th className="py-3 px-4 text-right">Personal Growth</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-right">Streak</th>
                    <th className="py-3 px-4 text-right">Weekly XP</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className={`divide-y ${tableBorder}`}>
              {(activeTab === 'league'
                ? leagueStudents
                : activeTab === 'campus'
                ? campusStudents
                : personalBestStudents
              ).slice(0, 20).map((std: any, idx) => {
                const isCurrent = std.id === activeStudent.id;
                const isPromoted = activeTab === 'league' && idx < 3;
                const isRelegated = activeTab === 'league' && idx >= 15;
                const displayName = std.isAnonymous ? std.anonymousNickname : std.name;

                return (
                  <tr
                    key={std.id}
                    className={`transition-colors ${
                      isCurrent
                        ? isDark
                          ? 'bg-indigo-950/40 font-medium'
                          : 'bg-indigo-50/70 font-medium'
                        : isDark
                        ? 'hover:bg-slate-800/30'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        {isPromoted && <ArrowUp className="w-3 h-3 text-emerald-500 shrink-0" />}
                        {isRelegated && <ArrowDown className="w-3 h-3 text-rose-500 shrink-0" />}
                        <span className={`font-semibold ${idx < 3 ? 'text-amber-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          #{idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Student */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            <span>{displayName}</span>
                            {std.isAnonymous && (
                              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(Anonymous)</span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-500 font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Campus & Section */}
                    <td className={`py-3 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>{std.campus}</span>
                      <span className="mx-1 opacity-50">·</span>
                      <span>{std.section}</span>
                    </td>

                    {activeTab === 'personal_best' ? (
                      <>
                        <td className={`py-3 px-4 text-right tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {std.previousWeeklyXp} XP
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums">
                          {std.weeklyXp} XP
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          <span
                            className={`font-bold ${
                              std.improvementPercent >= 0 ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {std.improvementPercent >= 0 ? `+${std.improvementPercent}%` : `${std.improvementPercent}%`}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`py-3 px-4 text-right tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {std.streakDays > 0 ? `${std.streakDays}d 🔥` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                          {std.weeklyXp} XP
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
