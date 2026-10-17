import React, { useState, useEffect } from 'react';
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

const AppContent: React.FC = () => {
  const { role, isDark, navSection, setNavSection } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showDirectQuiz, setShowDirectQuiz] = useState<boolean>(false);

  // Sync navSection with currentTab
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
    }
  };

  const isStudentLeagues = role === 'student' && (navSection === 'leagues' || currentTab === 'leagues');
  const isStudentBattles = role === 'student' && (navSection === 'battles' || currentTab === 'battles');
  const isFacultyBattles = role === 'faculty' && navSection === 'faculty:battles';
  const isAdminLeagues = role === 'admin' && navSection === 'admin:leagues';
  const isAdminBattles = role === 'admin' && navSection === 'admin:battles';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#F6F7FB] text-slate-900'
      }`}
    >
      {/* Top Bar with Hamburger Drawer Trigger · MiraiQuest Logo · Role Switcher */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenQuizModal={() => setShowDirectQuiz(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Faculty Perspective */}
        {role === 'faculty' && (
          isFacultyBattles ? <TeamBattlesView /> : <FacultyDashboard />
        )}

        {/* Admin Perspective */}
        {role === 'admin' && (
          isAdminLeagues ? (
            <LeaguesLeaderboard />
          ) : isAdminBattles ? (
            <TeamBattlesView />
          ) : (
            <AdminDashboard />
          )
        )}

        {/* Student Perspective */}
        {role === 'student' && (
          isStudentLeagues ? (
            <LeaguesLeaderboard />
          ) : isStudentBattles ? (
            <TeamBattlesView />
          ) : (
            <StudentDashboard />
          )
        )}
      </main>

      {/* Global Modals */}
      <UserProfileModal />

      {/* Global Modals for Student */}
      {role === 'student' && (
        <>
          <LevelAscensionModal />
          <DailyQuizModal isOpen={showDirectQuiz} onClose={() => setShowDirectQuiz(false)} />
        </>
      )}

      {/* Footer */}
      <footer
        className={`border-t text-xs py-6 mt-12 transition-colors ${
          isDark
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
