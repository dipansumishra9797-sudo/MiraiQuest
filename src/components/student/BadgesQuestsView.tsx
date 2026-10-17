import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Badge, Quest } from '../../types';
import {
  Sparkles,
  Flame,
  Shield,
  Code2,
  Award,
  TrendingUp,
  Zap,
  Rocket,
  Crown,
  Lock,
  CheckCircle2,
  Target,
} from 'lucide-react';

export const BadgesQuestsView: React.FC = () => {
  const { activeStudent, badges, quests, triggerConfetti, isDark } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Shield': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-indigo-500" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Rocket': return <Rocket className="w-5 h-5 text-rose-500" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-500" />;
      default: return <Award className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredBadges = badges.filter((b) => {
    if (filterCategory === 'all') return true;
    return b.category === filterCategory;
  });

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-8">
      {/* Active Quests Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>Active Syllabus Topic Quests</span>
            </h4>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Goal-oriented learning milestones tied directly to course topics
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quests.map((q) => {
            const isCompleted = q.currentProgress >= q.targetCount;
            const progressPercent = Math.min(100, Math.round((q.currentProgress / q.targetCount) * 100));

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/30 text-white'
                      : 'bg-white border-emerald-300 text-slate-900 shadow-xs'
                    : cardBg
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-indigo-500 font-semibold">{q.subject}</span>
                  {isCompleted ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </span>
                  ) : (
                    <span className={`tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {q.currentProgress}/{q.targetCount} Steps
                    </span>
                  )}
                </div>

                <h5 className="font-bold text-sm mb-1">{q.title}</h5>
                <p className={`text-xs mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{q.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 mb-3">
                  <div className={`w-full h-2 rounded-full overflow-hidden border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Reward: +{q.rewardXp} XP</span>
                  {q.expiresInDays && <span>{q.expiresInDays} days left</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Gallery Section */}
      <div>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b pb-3 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>MSOT Badge Showcase</span>
            </h4>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Includes Improvement & Comeback badges so students who are behind can earn awards
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'improvement', label: 'Improvement & Comeback' },
              { id: 'milestone', label: 'Milestones' },
              { id: 'streak', label: 'Streaks' },
              { id: 'mastery', label: 'Mastery' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = activeStudent.unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isUnlocked) triggerConfetti();
                }}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? isDark
                      ? 'bg-slate-900 border-slate-700/80 hover:border-indigo-500/50 cursor-pointer shadow-sm text-white'
                      : 'bg-white border-slate-200 hover:border-indigo-400 cursor-pointer shadow-xs text-slate-900'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-900 opacity-60 text-slate-400'
                    : 'bg-slate-50 border-slate-200 opacity-60 text-slate-500'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? isDark
                          ? 'bg-slate-800 border-slate-700 shadow-md'
                          : 'bg-indigo-50/60 border-indigo-100 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-600'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h5 className="font-bold text-xs truncate">{badge.title}</h5>
                      <span className={`text-[10px] font-semibold tabular-nums shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        +{badge.xpReward} XP
                      </span>
                    </div>

                    <p className={`text-[11px] mb-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {badge.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{badge.conditionDescription}</span>
                      {isUnlocked && (
                        <span className="text-emerald-500 font-semibold">UNLOCKED</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
