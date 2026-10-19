import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../store/appStore';
import { PAST_BATTLE_MATCHES } from '../../data/mockData';
import {
  Swords,
  Users,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  Info,
  Trophy,
  Crown,
  Medal,
  Award,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const TeamBattlesView: React.FC = () => {
  const { battles, simulateBatchSubmissions, activeStudent, triggerXpEvent, isDark } = useApp();
  const [simulationMetrics, setSimulationMetrics] = useState<{
    totalSubmitted: number;
    processed: number;
    duplicatesRejected: number;
    p95LatencyMs: number;
  } | null>(null);

  const activeBattle = battles.find((b) => b.status === 'active') || battles[0];

  const handleSimulateStressTest = () => {
    const res = simulateBatchSubmissions(300);
    setSimulationMetrics(res);
  };

  const handleQuickSubmitSolution = () => {
    triggerXpEvent({
      eventId: `ev_battle_${Date.now()}`,
      studentId: activeStudent.id,
      actionKey: 'solve_coding',
      timestamp: new Date().toISOString(),
      metadata: {
        problemId: `battle_prob_${Date.now()}`,
        difficulty: 'medium',
        problemTitle: 'Live Algothon: Longest Common Subsequence',
      },
    });
  };

  const maxScore = Math.max(...activeBattle.teams.map((t) => t.normalizedScore), 1);

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6">
      {/* Hero Battle Banner */}
      <div className={`relative p-6 rounded-2xl border overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800 text-white'
          : 'bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white border-indigo-100 text-slate-900 shadow-xs'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs text-indigo-500 font-semibold mb-2">
              <Swords className="w-4 h-4 text-amber-500" />
              <span>COLLEGIATE TEAM BATTLE · LIVE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {activeBattle.title}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {activeBattle.description}
            </p>

            {/* Normalization Formula Callout */}
            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                : 'bg-white/90 border-slate-200 text-slate-600'
            }`}>
              <div className="font-semibold flex items-center gap-1.5 text-indigo-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Fair Normalization Formula</span>
              </div>
              <p className={`leading-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeBattle.normalizationFormulaDescription}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 shrink-0">
            <button
              onClick={handleQuickSubmitSolution}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Submit Solution for {activeStudent.campus} (+20 XP)</span>
            </button>

            {/* Concurrency Stress Test Button */}
            <button
              onClick={handleSimulateStressTest}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs border transition-colors flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate 300 Students Submitting at Once</span>
            </button>
          </div>
        </div>
      </div>

      {/* 300-Student Concurrency Results Panel */}
      {simulationMetrics && (
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          isDark
            ? 'bg-slate-900 border-indigo-500/30 text-white'
            : 'bg-indigo-50/70 border-indigo-200 text-slate-900 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>High-Concurrency Stress Test Result (300 Concurrent Submissions)</span>
            </div>
            <button onClick={() => setSimulationMetrics(null)} className={`text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-2.5 rounded-lg border ${subCardBg}`}>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Inbound</div>
              <div className="text-lg font-bold tabular-nums">{simulationMetrics.totalSubmitted}</div>
            </div>
            <div className={`p-2.5 rounded-lg border ${subCardBg}`}>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Processed (Zero Loss)</div>
              <div className="text-lg font-bold text-emerald-500 tabular-nums">{simulationMetrics.processed}</div>
            </div>
            <div className={`p-2.5 rounded-lg border ${subCardBg}`}>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Idempotency Filtered</div>
              <div className="text-lg font-bold text-amber-500 tabular-nums">{simulationMetrics.duplicatesRejected}</div>
            </div>
            <div className={`p-2.5 rounded-lg border ${subCardBg}`}>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>p95 Queue Latency</div>
              <div className="text-lg font-bold text-indigo-500 tabular-nums">{simulationMetrics.p95LatencyMs} ms</div>
            </div>
          </div>

          <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Engine verified: Idempotency keys prevent duplicate credit. Submissions streamed and normalized across 4 campus standings in under 100ms.
          </div>
        </div>
      )}

      {/* Live Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Bars (2 Columns) */}
        <div className={`lg:col-span-2 space-y-4 p-5 rounded-2xl border transition-colors ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold uppercase tracking-wider">
              Live Campus Standings (Normalized Score)
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live feed · 2s refresh</span>
          </div>

          <div className="space-y-4">
            {activeBattle.teams
              .sort((a, b) => b.normalizedScore - a.normalizedScore)
              .map((team, idx) => {
                const widthPercent = Math.min(100, Math.round((team.normalizedScore / maxScore) * 100));
                const isUserCampus = team.campusOrSection === activeStudent.campus;

                return (
                  <div key={team.teamId} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`w-5 text-left sm:text-center font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{idx + 1}</span>
                        <span className="font-semibold">{team.teamName}</span>
                        {isUserCampus && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold shrink-0">
                            YOUR CAMPUS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                        <span className={`text-[10px] sm:text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {team.participantCount}/{team.eligibleStudentCount} Students · {team.totalRawXp} Raw XP
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums text-xs sm:text-sm shrink-0">
                          {team.normalizedScore} pts
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-amber-400 shadow-xs'
                            : idx === 1
                            ? 'bg-indigo-500'
                            : isDark ? 'bg-slate-600' : 'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Submissions Feed (1 Column) */}
        <div className={`p-5 rounded-2xl border flex flex-col transition-colors ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              Recent Battle Solves
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Streamed</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[300px] flex-1">
            {activeBattle.recentSubmissions.map((sub) => (
              <motion.div
                layout
                key={sub.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors interactive-card ${subCardBg}`}
              >
                <div>
                  <div className="font-medium">{sub.studentName}</div>
                  <div className={`text-[11px] truncate max-w-[160px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {sub.problemTitle}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub.timestamp}</div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">+{sub.points} XP</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Team Battles Summary Widget */}
      <div className={`p-6 rounded-2xl border space-y-6 transition-colors ${cardBg}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
              <Trophy className="w-4 h-4" />
              <span>MATCH ARCHIVES · LAST THREE CONTESTS</span>
            </div>
            <h3 className="text-lg font-bold">Recent Team Battles Summary</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Verified outcomes, collective team XP distributions, and official MVP titles awarded to exceptional contributors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>3 Matches Completed</span>
            </span>
          </div>
        </div>

        {/* 3 Matches Summary Cards Grid: 1 col on mobile, 2 on tablet, 3 on laptop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {PAST_BATTLE_MATCHES.map((match) => {
            const totalScore = match.winnerTeam.score + match.runnerUpTeam.score;
            const winnerWidthPercent = Math.round((match.winnerTeam.score / totalScore) * 100);

            return (
              <div
                key={match.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-5 transition-colors ${subCardBg}`}
              >
                {/* Match Header */}
                <div>
                  <div className={`flex items-center justify-between text-[11px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="text-indigo-500 font-semibold">{match.date}</span>
                    <span className="capitalize">
                      {match.type === 'campus_vs_campus' ? 'Campus vs Campus' : 'Section vs Section'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold leading-snug mb-1">
                    {match.title}
                  </h4>

                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{match.totalXpPoolAwarded.toLocaleString()} Total XP Pool Distributed</span>
                  </div>
                </div>

                {/* Scoreboard Showdown */}
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900 border-slate-800/90' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    {/* Winner */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                        <Crown className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1">
                          <span>{match.winnerTeam.name}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">WINNER</span>
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {match.winnerTeam.campusOrSection} · +{match.winnerXpBonusPerStudent} XP team bonus
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-amber-500 tabular-nums">
                      {match.winnerTeam.score} pts
                    </span>
                  </div>

                  {/* Relative Score Bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden flex ${
                    isDark ? 'bg-slate-950' : 'bg-slate-200'
                  }`}>
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${winnerWidthPercent}%` }}
                    />
                    <div
                      className={`h-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
                      style={{ width: `${100 - winnerWidthPercent}%` }}
                    />
                  </div>

                  {/* Runner Up */}
                  <div className={`flex items-center justify-between text-xs pt-1 border-t ${
                    isDark ? 'border-slate-800/60' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        <Medal className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-xs">
                          {match.runnerUpTeam.name}
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {match.runnerUpTeam.campusOrSection}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {match.runnerUpTeam.score} pts
                    </span>
                  </div>
                </div>

                {/* MVP Titles Awarded */}
                <div className="space-y-2">
                  <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Awarded MVPs</span>
                  </div>

                  <div className="space-y-1.5">
                    {match.mvps.map((mvp) => (
                      <div
                        key={mvp.studentId}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 ${
                          isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold truncate">{mvp.studentName}</span>
                            <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>({mvp.campusOrSection})</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">+{mvp.xpAwarded} XP</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-indigo-500 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {mvp.mvpTitle}
                          </span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{mvp.problemsSolved} Solves</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Summary Footer */}
                <div className={`pt-2 border-t text-[11px] ${
                  isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}>
                  <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Outcome: </span>
                  {match.summaryNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
