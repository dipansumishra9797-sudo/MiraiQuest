import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './store/appStore';
import { Header } from './components/Header';
import { LevelAscensionModal } from './components/LevelAscensionModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LeaguesLeaderboard } from './components/student/LeaguesLeaderboard';
import { TeamBattlesView } from './components/student/TeamBattlesView';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DailyQuizModal } from './components/student/DailyQuizModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { BottomNavBar } from './components/BottomNavBar';
import { StudentAnimatedBackground } from './components/common/StudentAnimatedBackground';
import { RewardChestModal } from './components/common/RewardChestModal';
import { OpenSourceGuideView } from './components/OpenSourceGuideView';
import { LoginModal } from './components/auth/LoginModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const getNavSectionFromPathname = (pathname: string, userRole: string): string | null => {
  if (pathname === '/open-source-guide') {
    return userRole === 'admin' ? 'admin:rules' : 'open_source_guide';
  }
  if (pathname === '/peer-help' || pathname === '/peer-doubts') {
    return 'dashboard:peer_help';
  }
  if (pathname === '/assignments' || pathname === '/coursework') {
    return userRole === 'faculty' ? 'faculty:assignments' : 'dashboard:assignments';
  }
  if (pathname === '/ledger') {
    return 'dashboard:ledger';
  }
  if (pathname === '/badges' || pathname === '/quests') {
    return 'dashboard:badges';
  }
  if (pathname === '/coding') {
    return userRole === 'faculty' ? 'faculty:coding' : 'dashboard:coding';
  }
  if (pathname === '/store') {
    return 'dashboard:store';
  }
  if (pathname === '/leagues') {
    return userRole === 'admin' ? 'admin:leagues' : 'leagues';
  }
  if (pathname === '/battles') {
    return userRole === 'student' ? 'battles' : userRole === 'faculty' ? 'faculty:battles' : 'admin:battles';
  }
  return null;
};

const AppContent: React.FC = () => {
  const {
    role,
    isDark,
    navSection,
    setNavSection,
    setIsFocusCriticalActive,
    activeChestReward,
    closeChestReward,
    isLoginModalOpen,
    closeLoginModal,
  } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showDirectQuiz, setShowDirectQuiz] = useState<boolean>(false);

  // Sync focus-critical mode when daily quiz is opened directly
  useEffect(() => {
    if (showDirectQuiz) {
      setIsFocusCriticalActive(true);
      return () => setIsFocusCriticalActive(false);
    }
  }, [showDirectQuiz, setIsFocusCriticalActive]);

  // Sync URL pathname with navSection on mount and browser popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const matched = getNavSectionFromPathname(window.location.pathname, role);
    if (matched) {
      if (window.location.pathname === '/open-source-guide' && role === 'admin') {
        window.history.replaceState({}, '', '/');
        setNavSection('admin:rules');
      } else {
        setNavSection(matched);
      }
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const navTarget = getNavSectionFromPathname(currentPath, role);
      if (navTarget) {
        setNavSection(navTarget);
      } else if (navSection === 'open_source_guide') {
        setNavSection(role === 'faculty' ? 'faculty:analytics' : 'dashboard:overview');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [role, setNavSection]);

  // Update browser URL when navSection changes to /open-source-guide or away
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (navSection === 'open_source_guide') {
      if (role === 'admin') {
        window.history.replaceState({}, '', '/');
        setNavSection('admin:rules');
      } else if (window.location.pathname !== '/open-source-guide') {
        window.history.pushState({}, '', '/open-source-guide');
      }
    } else if (window.location.pathname === '/open-source-guide') {
      window.history.pushState({}, '', '/');
    }
  }, [navSection, role, setNavSection]);

  // Keep currentTab in sync with navSection
  useEffect(() => {
    if (navSection === 'leagues') {
      setCurrentTab('leagues');
    } else if (
      navSection === 'battles' ||
      navSection === 'faculty:battles' ||
      navSection === 'admin:battles'
    ) {
      setCurrentTab('battles');
    } else if (navSection.startsWith('dashboard:') || navSection === 'dashboard') {
      setCurrentTab('dashboard');
    }
  }, [navSection]);

  // Redirect legacy admin observability route to admin rules
  useEffect(() => {
    if (navSection === 'admin:observability') {
      setNavSection('admin:rules');
    }
  }, [navSection, setNavSection]);

  // Tab change handler from Header or BottomNavBar
  const handleTabChange = (tab: string) => {
    if (tab === 'quiz') {
      setShowDirectQuiz(true);
      return;
    }
    setCurrentTab(tab);
    if (role === 'student') {
      if (tab === 'leagues') setNavSection('leagues');
      else if (tab === 'battles') setNavSection('battles');
      else setNavSection('dashboard:overview');
    } else if (role === 'faculty') {
      if (tab === 'battles') setNavSection('faculty:battles');
      else setNavSection('faculty:analytics');
    } else if (role === 'admin') {
      if (tab === 'leagues') setNavSection('admin:leagues');
      else if (tab === 'battles') setNavSection('admin:battles');
      else setNavSection('admin:rules');
    }
  };

  const isStudentLeagues = role === 'student' && navSection === 'leagues';
  const isStudentBattles = role === 'student' && navSection === 'battles';
  const isFacultyBattles = role === 'faculty' && navSection === 'faculty:battles';
  const isAdminLeagues = role === 'admin' && navSection === 'admin:leagues';
  const isAdminBattles = role === 'admin' && navSection === 'admin:battles';

  const activeViewKey = `${role}-${navSection}-${currentTab}`;

  return (
    <div
      className={`min-h-screen min-h-[100dvh] flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white relative ${
        role === 'student'
          ? isDark
            ? 'student-portal dark bg-transparent text-slate-100'
            : 'student-portal light bg-transparent text-slate-900'
          : isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-[#F6F7FB] text-slate-900'
      }`}
    >
      {/* Subtle Quest Animated Background for Student Portal Only */}
      {role === 'student' && <StudentAnimatedBackground />}

      {/* Top Bar with Hamburger Drawer Trigger · MiraiQuest Logo · Role Switcher */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenQuizModal={() => setShowDirectQuiz(true)}
      />

      {/* Main Content Area with ErrorBoundary */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 relative z-10 ${
        role === 'student' ? 'pb-24 sm:pb-8' : 'pb-8'
      }`}>
        <ErrorBoundary
          fallbackTitle="View encountered an error"
          fallbackMessage="MiraiQuest encountered a problem displaying this section. Click below to try again or return to the overview."
          onReset={() => setNavSection(role === 'faculty' ? 'faculty:analytics' : 'dashboard:overview')}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeViewKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {/* Open Source Guide View (Accessible only for Student & Faculty; Admin forbidden) */}
              {navSection === 'open_source_guide' && role !== 'admin' ? (
                <OpenSourceGuideView />
              ) : role === 'faculty' ? (
                isFacultyBattles ? <TeamBattlesView /> : <FacultyDashboard />
              ) : role === 'admin' ? (
                isAdminLeagues ? (
                  <LeaguesLeaderboard />
                ) : isAdminBattles ? (
                  <TeamBattlesView />
                ) : (
                  <AdminDashboard />
                )
              ) : role === 'student' ? (
                isStudentLeagues ? (
                  <LeaguesLeaderboard />
                ) : isStudentBattles ? (
                  <TeamBattlesView />
                ) : (
                  <StudentDashboard />
                )
              ) : null}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Global Modals */}
      <UserProfileModal />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />

      {/* Global Modals for Student */}
      {role === 'student' && (
        <>
          <LevelAscensionModal />
          <DailyQuizModal isOpen={showDirectQuiz} onClose={() => setShowDirectQuiz(false)} />
          {activeChestReward && (
            <RewardChestModal
              isOpen={activeChestReward.isOpen}
              onClose={closeChestReward}
              title={activeChestReward.title}
              subtitle={activeChestReward.subtitle}
              rarity={activeChestReward.rarity}
              items={activeChestReward.items}
              onFlyComplete={activeChestReward.onFlyComplete}
            />
          )}
        </>
      )}

      {/* Student Mobile Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenQuizModal={() => setShowDirectQuiz(true)}
      />

      {/* Footer */}
      <footer
        className={`border-t text-xs py-6 transition-colors relative z-10 ${
          role === 'student' ? 'mb-16 sm:mb-0' : ''
        } ${
          role === 'student'
            ? isDark
              ? 'border-slate-800/60 bg-slate-950/70 backdrop-blur-md text-slate-400'
              : 'border-slate-200/60 bg-white/70 backdrop-blur-md text-slate-600'
            : isDark
            ? 'border-slate-900 bg-slate-950 text-slate-500'
            : 'border-slate-200 bg-white text-slate-600 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">MiraiQuest MSOT</span>
            <span className="mx-2">·</span>
            <span>Collegiate Gamified Learning Platform</span>
            <span className="mx-2">·</span>
            <span className="text-slate-500">Campuses: HI-Tech, Rathinam, JUJ</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Points never alter official marks. Built for authentic collegiate learning habits.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
