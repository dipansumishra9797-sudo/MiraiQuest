import React from 'react';

interface SkeletonProps {
  className?: string;
  isDark?: boolean;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = '', isDark }) => (
  <div
    className={`rounded-xl animate-pulse ${
      isDark
        ? 'bg-slate-800/80 border border-slate-700/50'
        : 'bg-slate-200/80 border border-slate-300/40'
    } ${className}`}
  />
);

// 1. Peer Doubts Skeleton Loader
export const PeerDoubtsSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    {/* Header Banner Skeleton */}
    <div
      className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="space-y-2 max-w-lg">
        <SkeletonBox isDark={isDark} className="h-5 w-48 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-80 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-9 w-40 rounded-xl" />
    </div>

    {/* Filter Chips Bar Skeleton */}
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <SkeletonBox isDark={isDark} className="h-8 w-24 rounded-lg" />
      <SkeletonBox isDark={isDark} className="h-8 w-44 rounded-lg" />
      <SkeletonBox isDark={isDark} className="h-8 w-36 rounded-lg" />
      <div className="ml-auto hidden sm:block">
        <SkeletonBox isDark={isDark} className="h-8 w-48 rounded-lg" />
      </div>
    </div>

    {/* 3 Doubt Cards Skeletons */}
    <div className="space-y-4">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {/* Tag + Author metadata row */}
          <div className="flex items-center gap-3">
            <SkeletonBox isDark={isDark} className="h-4 w-32 rounded-full" />
            <SkeletonBox isDark={isDark} className="h-4 w-24 rounded-full" />
            <SkeletonBox isDark={isDark} className="h-4 w-28 rounded-full ml-auto" />
          </div>

          {/* Title and Body */}
          <SkeletonBox isDark={isDark} className="h-5 w-3/4 rounded-md" />
          <div className="space-y-1.5">
            <SkeletonBox isDark={isDark} className="h-3.5 w-full rounded-md" />
            <SkeletonBox isDark={isDark} className="h-3.5 w-5/6 rounded-md" />
          </div>

          {/* Answer Preview Row */}
          <div
            className={`pt-3 border-t flex items-center justify-between ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            <SkeletonBox isDark={isDark} className="h-4 w-20 rounded-md" />
            <SkeletonBox isDark={isDark} className="h-7 w-32 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 2. Coursework & Labs Skeleton
export const AssignmentsSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-5 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-5 w-44 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-72 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-8 w-28 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl border space-y-3.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <SkeletonBox isDark={isDark} className="h-4 w-24 rounded-full" />
            <SkeletonBox isDark={isDark} className="h-4 w-16 rounded-full" />
          </div>
          <SkeletonBox isDark={isDark} className="h-5 w-3/4 rounded-md" />
          <SkeletonBox isDark={isDark} className="h-3.5 w-full rounded-md" />
          <div className="pt-2 flex justify-between items-center">
            <SkeletonBox isDark={isDark} className="h-3.5 w-24 rounded-md" />
            <SkeletonBox isDark={isDark} className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 3. Ledger Skeleton
export const LedgerSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-5 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-5 w-52 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-80 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-8 w-24 rounded-xl" />
    </div>

    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
            <div className="flex items-center gap-3">
              <SkeletonBox isDark={isDark} className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <SkeletonBox isDark={isDark} className="h-4 w-40 rounded-md" />
                <SkeletonBox isDark={isDark} className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <SkeletonBox isDark={isDark} className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 4. Badges and Quests Skeleton
export const BadgesSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-5 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-5 w-44 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-64 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-8 w-32 rounded-xl" />
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl border text-center flex flex-col items-center space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <SkeletonBox isDark={isDark} className="h-16 w-16 rounded-2xl" />
          <SkeletonBox isDark={isDark} className="h-4 w-20 rounded-md" />
          <SkeletonBox isDark={isDark} className="h-3 w-28 rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

// 5. Coding Practice Skeleton
export const CodingPracticeSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-5 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-5 w-48 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-72 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-8 w-36 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox key={i} isDark={isDark} className="h-14 w-full rounded-xl" />
        ))}
      </div>
      <div className="md:col-span-2 space-y-4">
        <SkeletonBox isDark={isDark} className="h-48 w-full rounded-2xl" />
        <SkeletonBox isDark={isDark} className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

// 6. Perks Store Skeleton
export const PerksStoreSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-6 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-5 w-40 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-60 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-10 w-28 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <SkeletonBox isDark={isDark} className="h-10 w-10 rounded-xl" />
          <SkeletonBox isDark={isDark} className="h-5 w-32 rounded-md" />
          <SkeletonBox isDark={isDark} className="h-3.5 w-full rounded-md" />
          <div className="pt-2 flex justify-between items-center">
            <SkeletonBox isDark={isDark} className="h-4 w-16 rounded-md" />
            <SkeletonBox isDark={isDark} className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 7. Leagues Leaderboard Skeleton
export const LeaguesSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-6 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-6 w-48 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-64 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-10 w-36 rounded-xl" />
    </div>

    <div
      className={`p-4 rounded-2xl border space-y-3 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
          <div className="flex items-center gap-3">
            <SkeletonBox isDark={isDark} className="h-6 w-6 rounded-md" />
            <SkeletonBox isDark={isDark} className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <SkeletonBox isDark={isDark} className="h-4 w-36 rounded-md" />
              <SkeletonBox isDark={isDark} className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <SkeletonBox isDark={isDark} className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

// 8. Team Battles Skeleton
export const TeamBattlesSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    <div
      className={`p-6 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="space-y-2">
        <SkeletonBox isDark={isDark} className="h-6 w-52 rounded-md" />
        <SkeletonBox isDark={isDark} className="h-3.5 w-72 rounded-md" />
      </div>
      <SkeletonBox isDark={isDark} className="h-10 w-36 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonBox isDark={isDark} className="h-64 rounded-2xl" />
      <SkeletonBox isDark={isDark} className="h-64 rounded-2xl" />
    </div>
  </div>
);

// 9. Faculty / Admin Dashboard Skeleton
export const DashboardOverviewSkeleton: React.FC<{ isDark?: boolean }> = ({ isDark }) => (
  <div className="space-y-6 animate-in fade-in duration-150">
    {/* KPI Stats Row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <SkeletonBox isDark={isDark} className="h-4 w-20 rounded-md" />
          <SkeletonBox isDark={isDark} className="h-7 w-28 rounded-md" />
        </div>
      ))}
    </div>

    {/* Big Chart Skeleton */}
    <div
      className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <SkeletonBox isDark={isDark} className="h-5 w-48 rounded-md" />
      <SkeletonBox isDark={isDark} className="h-56 w-full rounded-xl" />
    </div>
  </div>
);
