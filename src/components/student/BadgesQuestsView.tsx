import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../store/appStore';
import { Badge, Quest } from '../../types';
import { BadgeEmblem, BadgeRarity, MedalShape } from '../common/BadgeEmblem';
import { BadgeDetailModal } from './BadgeDetailModal';
import { fireConfetti } from '../../utils/confetti';
import { ClosedChestIcon, OpenChestIcon } from '../common/ChestIcons';
import { BadgesSkeleton } from '../common/Skeletons';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  Sparkles,
  Award,
  Target,
  Lock,
  CheckCircle2,
  Zap,
  Coins,
  Gift,
  Clock,
  BookOpen,
  Code2,
  Calendar,
  Share2,
  ExternalLink,
} from 'lucide-react';

export const BadgesQuestsView: React.FC = () => {
  const {
    activeStudent,
    badges,
    quests,
    triggerConfetti,
    triggerXpEvent,
    isDark,
    triggerChestReward,
    claimedRewardIds,
    isSessionReady,
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [unlockingBadgeId, setUnlockingBadgeId] = useState<string | null>(null);

  // Claim Quest State
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [claimedQuestIds, setClaimedQuestIds] = useState<Set<string>>(new Set());
  const [questRewardToast, setQuestRewardToast] = useState<{
    title: string;
    xp: number;
    coins: number;
  } | null>(null);

  const safeBadges = Array.isArray(badges) ? badges : [];
  const safeUnlockedBadges = Array.isArray(activeStudent?.unlockedBadgeIds)
    ? activeStudent.unlockedBadgeIds
    : [];

  const filteredBadges = safeBadges.filter((b) => {
    if (!b) return false;
    if (filterCategory === 'all') return true;
    return b.category === filterCategory;
  });

  if (isLoading || !isSessionReady) {
    return <BadgesSkeleton isDark={isDark} />;
  }

  const handleBadgeClick = (badge: Badge) => {
    const isUnlocked = safeUnlockedBadges.includes(badge.id);
    if (!isUnlocked) {
      // Show detail modal so student sees progress criteria
      setSelectedBadge(badge);
      setIsDetailModalOpen(true);
    } else {
      setSelectedBadge(badge);
      setIsDetailModalOpen(true);
      fireConfetti();
    }
  };

  const handleClaimQuest = (quest: Quest) => {
    if (
      claimedRewardIds.includes(quest.id) ||
      claimedQuestIds.has(quest.id) ||
      quest.currentProgress < quest.targetCount
    ) {
      return;
    }

    setClaimedQuestIds((prev) => new Set(prev).add(quest.id));

    // Trigger full-screen 3.5s to 4.5s chest reward animation with sound & counter pulse
    triggerChestReward({
      id: quest.id,
      title: quest.title,
      subtitle: `${quest.subject} Syllabus Quest Completed!`,
      rarity: (quest.rewardXp || 0) >= 60 ? 'gold' : 'silver',
      items: [
        { type: 'xp', amount: quest.rewardXp || 50, label: 'Quest XP' },
        { type: 'coins', amount: quest.rewardCoins || 20, label: 'Quest Coins' },
      ],
    });
  };

  const getQuestIcon = (iconName?: string) => {
    switch (iconName) {
      case 'code':
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 'puzzle':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      default:
        return <Target className="w-4 h-4 text-indigo-400" />;
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  return (
    <div className="space-y-8">
      {/* Toast Notification for Claimed Rewards */}
      <AnimatePresence>
        {questRewardToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3.5 ${
              isDark ? 'bg-slate-900 border-amber-500/50 text-white' : 'bg-white border-amber-400 text-slate-900'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-amber-400">Quest Reward Claimed!</div>
              <div className="text-[11px] text-slate-300">
                +{questRewardToast.xp} XP & +{questRewardToast.coins} Coins awarded for "{questRewardToast.title}".
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          isUnlocked={activeStudent.unlockedBadgeIds.includes(selectedBadge.id)}
          unlockedAt="Oct 14, 2026"
          progressPercent={
            selectedBadge.maxProgress
              ? Math.min(100, Math.round(((selectedBadge.currentProgress || 0) / selectedBadge.maxProgress) * 100))
              : 60
          }
          currentProgress={
            selectedBadge.maxProgress
              ? `${selectedBadge.currentProgress || 0} / ${selectedBadge.maxProgress}`
              : undefined
          }
          studentName={activeStudent.name}
          isDark={isDark}
        />
      )}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {quests.map((q) => {
            const isClaimed = claimedRewardIds.includes(q.id) || claimedQuestIds.has(q.id);
            const isCompleted = q.currentProgress >= q.targetCount;
            const progressPercent = Math.min(100, Math.round((q.currentProgress / q.targetCount) * 100));

            return (
              <div
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between interactive-card relative overflow-hidden ${
                  isCompleted
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/40 text-white'
                      : 'bg-white border-emerald-300 text-slate-900 shadow-xs'
                    : cardBg
                }`}
              >
                {/* Top Row: Icon + Subject Tag + Completion */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-[11px]">
                      {getQuestIcon(q.icon)}
                      <span>{q.subject}</span>
                    </span>

                    {isClaimed ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1.5 text-[11px]">
                        <OpenChestIcon size={18} rarity="gold" />
                        <span>Claimed</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="text-amber-400 font-extrabold flex items-center gap-1.5 text-[11px] animate-pulse">
                        <ClosedChestIcon size={18} rarity="gold" glow={true} />
                        <span>Ready to Claim!</span>
                      </span>
                    ) : (
                      <span className={`tabular-nums text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {q.currentProgress}/{q.targetCount}
                      </span>
                    )}
                  </div>

                  <h5 className="font-extrabold text-sm mb-1.5 leading-snug">{q.title}</h5>
                  <p className={`text-xs mb-4 line-clamp-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {q.description}
                  </p>

                  {/* Gradient Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>Progress</span>
                      <span className="tabular-nums">{progressPercent}%</span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden border ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300'
                            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Rewards Chips + Claim / Status Button */}
                <div className="pt-3 border-t border-slate-800/40 flex items-center justify-between gap-2 flex-wrap">
                  {/* Reward Chips */}
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>+{q.rewardXp} XP</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                      <Coins className="w-3 h-3 fill-current" />
                      <span>+{q.rewardCoins || 20}</span>
                    </span>
                  </div>

                  {/* Claim Button with Animated Chest */}
                  {isCompleted && !isClaimed ? (
                    <button
                      type="button"
                      onClick={() => handleClaimQuest(q)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs tracking-wide shadow-md shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClosedChestIcon size={16} rarity="gold" glow={true} />
                      <span>Claim Reward</span>
                    </button>
                  ) : isClaimed ? (
                    <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                      <OpenChestIcon size={16} rarity="gold" />
                      <span>Claimed</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {q.expiresInDays ? `${q.expiresInDays}d left` : 'Ongoing'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Gallery Section */}
      <div>
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b pb-3.5 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>MSOT Official Badge Showcase</span>
            </h4>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Illustrated metallic medals with Bronze, Silver, Gold, Platinum, and Diamond rarity tiers
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
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
                className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors touch-target cursor-pointer shrink-0 pressable-btn ${
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

        {/* Badge Grid: 2 cols on mobile, 3-4 on tablet, 4-6 on laptop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = activeStudent.unlockedBadgeIds.includes(badge.id);
            const progressPercent = badge.maxProgress
              ? Math.min(100, Math.round(((badge.currentProgress || 0) / badge.maxProgress) * 100))
              : isUnlocked
              ? 100
              : 40;

            const rarity: BadgeRarity = (badge.rarity as BadgeRarity) || 'bronze';
            const shape: MedalShape = (badge.shape as MedalShape) || 'shield';

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between interactive-card select-none group cursor-pointer relative ${
                  isUnlocked
                    ? isDark
                      ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 shadow-sm text-white'
                      : 'bg-white border-slate-200 hover:border-indigo-400 shadow-xs text-slate-900'
                    : isDark
                    ? 'bg-slate-950/70 border-slate-900/90 text-slate-500'
                    : 'bg-slate-50/90 border-slate-200/90 text-slate-400'
                }`}
              >
                {/* Rarity & XP Chip */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                      rarity === 'diamond'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : rarity === 'platinum'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : rarity === 'gold'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : rarity === 'silver'
                        ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    }`}
                  >
                    {rarity}
                  </span>

                  <span className="text-[10px] font-bold tabular-nums text-emerald-500">
                    +{badge.xpReward} XP
                  </span>
                </div>

                {/* Illustrated SVG Emblem */}
                <div className="flex justify-center my-2">
                  <BadgeEmblem
                    iconType={badge.iconType || badge.title}
                    rarity={rarity}
                    shape={shape}
                    size="md"
                    isLocked={!isUnlocked}
                  />
                </div>

                {/* Badge Title & Short Description */}
                <div className="text-center mt-1">
                  <h5 className="font-extrabold text-xs truncate leading-tight mb-1 flex items-center justify-center gap-1">
                    <span>{badge.title}</span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                    )}
                  </h5>
                  <p className={`text-[11px] line-clamp-2 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar towards unlocking if locked, or unlocked status */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-800/40">
                  {isUnlocked ? (
                    <div className="text-center text-[10px] font-bold text-emerald-500 flex items-center justify-center gap-1">
                      <span>✓ Unlocked</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[9px] mb-1 font-semibold text-slate-500">
                        <span>Progress</span>
                        <span>
                          {badge.currentProgress !== undefined && badge.maxProgress
                            ? `${badge.currentProgress}/${badge.maxProgress}`
                            : `${progressPercent}%`}
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
