import React from 'react';
import { useApp } from '../store/appStore';
import {
  LayoutDashboard,
  Zap,
  Code2,
  Trophy,
  User,
} from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuizModal?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  onOpenQuizModal,
}) => {
  const {
    role,
    navSection,
    setNavSection,
    openProfileModal,
    isDark,
    activeStudent,
  } = useApp();

  // Only render for student on mobile
  if (role !== 'student') return null;

  const isHomeActive =
    (currentTab === 'dashboard' || !currentTab) &&
    (navSection === 'dashboard:overview' || !navSection.startsWith('dashboard:coding'));
  const isPracticeActive = navSection === 'dashboard:coding';
  const isLeaguesActive = navSection === 'leagues' || currentTab === 'leagues';

  const handleNavClick = (key: string) => {
    if (key === 'home') {
      setNavSection('dashboard:overview');
      onTabChange('dashboard');
    } else if (key === 'quiz') {
      if (onOpenQuizModal) {
        onOpenQuizModal();
      }
    } else if (key === 'practice') {
      setNavSection('dashboard:coding');
      onTabChange('dashboard');
    } else if (key === 'leagues') {
      setNavSection('leagues');
      onTabChange('leagues');
    } else if (key === 'profile') {
      openProfileModal(undefined, 'student', 'profile');
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: LayoutDashboard,
      isActive: isHomeActive,
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: Zap,
      isActive: false, // Quiz opens modal
      badge: '+15 XP',
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: Code2,
      isActive: isPracticeActive,
    },
    {
      id: 'leagues',
      label: 'Leagues',
      icon: Trophy,
      isActive: isLeaguesActive,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      isActive: false, // Opens modal
      avatarChar: activeStudent?.name?.charAt(0) || 'U',
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-40 sm:hidden border-t backdrop-blur-xl transition-colors select-none ${
        isDark
          ? 'bg-slate-950/70 border-slate-800/60 text-slate-300'
          : 'bg-white/70 border-slate-200/60 text-slate-700 shadow-lg'
      }`}
      style={{
        paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-label="Student Mobile Navigation Bar"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center h-full relative cursor-pointer transition-all duration-150 touch-target ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white opacity-85 hover:opacity-100'
              }`}
              aria-label={item.label}
            >
              {/* Active Indicator Top Accent Bar */}
              {active && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}

              {/* Icon Container with optional badge */}
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3.5 px-1 py-0.2 rounded-full text-[8px] font-extrabold bg-amber-500 text-slate-950 shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Text Label */}
              <span className={`text-[10px] mt-1 leading-none ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
