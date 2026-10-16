import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';

export const TeamBattlesView: React.FC = () => {
  const { battles, simulateBatchSubmissions, activeStudent, triggerXpEvent } = useApp();
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
    // Quick test submission for active student's campus
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

  // Find leading score to normalize visual bar width
  const maxScore = Math.max(...activeBattle.teams.map((t) => t.normalizedScore), 1);

  return (
    <div className="space-y-6">
      {/* Hero Battle Banner */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>COLLEGIATE TEAM BATTLE · LIVE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {activeBattle.title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              {activeBattle.description}
            </p>

            {/* Normalization Formula Callout */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fair Normalization Formula</span>
              </div>
              <p className="text-slate-400 leading-normal">
                {activeBattle.normalizationFormulaDescription}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 shrink-0">
            <button
              onClick={handleQuickSubmitSolution}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Submit Solution for {activeStudent.campus} (+20 XP)</span>
            </button>

            {/* Concurrency Stress Test Button */}
            <button
              onClick={handleSimulateStressTest}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate 300 Students Submitting at Once</span>
            </button>
          </div>
        </div>
      </div>

      {/* 300-Student Concurrency Results Panel */}
      {simulationMetrics && (
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>High-Concurrency Stress Test Result (300 Concurrent Submissions)</span>
            </div>
            <button onClick={() => setSimulationMetrics(null)} className="text-slate-400 hover:text-white text-xs">
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Total Inbound</div>
              <div className="text-lg font-bold text-white tabular-nums">{simulationMetrics.totalSubmitted}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Processed (Zero Loss)</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">{simulationMetrics.processed}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Idempotency Filtered</div>
              <div className="text-lg font-bold text-amber-400 tabular-nums">{simulationMetrics.duplicatesRejected}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">p95 Queue Latency</div>
              <div className="text-lg font-bold text-indigo-400 tabular-nums">{simulationMetrics.p95LatencyMs} ms</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Engine verified: Idempotency keys prevent duplicate credit. Submissions streamed and normalized across 4 campus standings in under 100ms.
          </div>
        </div>
      )}

      {/* Live Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Bars (2 Columns) */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Live Campus Standings (Normalized Score)
            </div>
            <span className="text-[11px] text-slate-400">Live feed · 2s refresh</span>
          </div>

          <div className="space-y-4">
            {activeBattle.teams
              .sort((a, b) => b.normalizedScore - a.normalizedScore)
              .map((team, idx) => {
                const widthPercent = Math.min(100, Math.round((team.normalizedScore / maxScore) * 100));
                const isUserCampus = team.campusOrSection === activeStudent.campus;

                return (
                  <div key={team.teamId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-semibold text-white">{team.teamName}</span>
                        {isUserCampus && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            YOUR CAMPUS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">
                          {team.participantCount}/{team.eligibleStudentCount} Students · {team.totalRawXp} Raw XP
                        </span>
                        <span className="text-emerald-400 font-bold tabular-nums text-sm">
                          {team.normalizedScore} pts
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          idx === 0
                            ? 'bg-amber-400 shadow-sm shadow-amber-400/30'
                            : idx === 1
                            ? 'bg-indigo-500'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Submissions Feed (1 Column) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Battle Solves
            </span>
            <span className="text-[10px] text-slate-400">Streamed</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[300px] flex-1">
            {activeBattle.recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-medium">{sub.studentName}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                    {sub.problemTitle}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{sub.timestamp}</div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold tabular-nums">+{sub.points} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Team Battles Summary Widget */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>MATCH ARCHIVES · LAST THREE CONTESTS</span>
            </div>
            <h3 className="text-lg font-bold text-white">Recent Team Battles Summary</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified outcomes, collective team XP distributions, and official MVP titles awarded to exceptional contributors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>3 Matches Completed</span>
            </span>
          </div>
        </div>

        {/* 3 Matches Summary Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PAST_BATTLE_MATCHES.map((match, idx) => {
            const isWinnerSelected = match.winnerTeam.campusOrSection.includes(activeStudent.campus) ||
              match.winnerTeam.campusOrSection.includes(activeStudent.section);
            const totalScore = match.winnerTeam.score + match.runnerUpTeam.score;
            const winnerWidthPercent = Math.round((match.winnerTeam.score / totalScore) * 100);

            return (
              <div
                key={match.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-5 hover:border-slate-700 transition-colors"
              >
                {/* Match Header */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="text-indigo-400 font-semibold">{match.date}</span>
                    <span className="capitalize">
                      {match.type === 'campus_vs_campus' ? 'Campus vs Campus' : 'Section vs Section'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug mb-1">
                    {match.title}
                  </h4>

                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+{match.totalXpPoolAwarded.toLocaleString()} Total XP Pool Distributed</span>
                  </div>
                </div>

                {/* Scoreboard Showdown */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    {/* Winner */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Crown className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1">
                          <span>{match.winnerTeam.name}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold">WINNER</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {match.winnerTeam.campusOrSection} · +{match.winnerXpBonusPerStudent} XP team bonus
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                      {match.winnerTeam.score} pts
                    </span>
                  </div>

                  {/* Relative Score Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden flex">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${winnerWidthPercent}%` }}
                    />
                    <div
                      className="h-full bg-slate-700"
                      style={{ width: `${100 - winnerWidthPercent}%` }}
                    />
                  </div>

                  {/* Runner Up */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <Medal className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-300 text-xs">
                          {match.runnerUpTeam.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {match.runnerUpTeam.campusOrSection}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tabular-nums">
                      {match.runnerUpTeam.score} pts
                    </span>
                  </div>
                </div>

                {/* MVP Titles Awarded */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Awarded MVPs</span>
                  </div>

                  <div className="space-y-1.5">
                    {match.mvps.map((mvp) => (
                      <div
                        key={mvp.studentId}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-white truncate">{mvp.studentName}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">({mvp.campusOrSection})</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-emerald-400 font-bold tabular-nums">+{mvp.xpAwarded} XP</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-indigo-300 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            {mvp.mvpTitle}
                          </span>
                          <span className="text-slate-500 text-[10px]">{mvp.problemsSolved} Solves</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Summary Footer */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-medium">Outcome: </span>
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
