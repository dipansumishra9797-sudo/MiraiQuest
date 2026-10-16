import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/appStore';
import { Header } from './components/Header';
import { LevelUpModal } from './components/LevelUpModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LeaguesLeaderboard } from './components/student/LeaguesLeaderboard';
import { TeamBattlesView } from './components/student/TeamBattlesView';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DailyQuizModal } from './components/student/DailyQuizModal';

const AppContent: React.FC = () => {
  const { role, theme } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showDirectQuiz, setShowDirectQuiz] = useState<boolean>(false);

  const isDark = theme === 'dark';

  // If role is faculty or admin, keep on dashboard only
  useEffect(() => {
    if (role !== 'student' && currentTab !== 'dashboard') {
      setCurrentTab('dashboard');
    }
  }, [role, currentTab]);

  const handleTabChange = (tab: string) => {
    if (role !== 'student') {
      setCurrentTab('dashboard');
      return;
    }

    if (tab === 'quiz') {
      setCurrentTab('dashboard');
      setShowDirectQuiz(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar (Wordmark · Role-Aware Nav Links · Role Switcher) */}
      <Header currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Faculty Perspective: Dashboard Only */}
        {role === 'faculty' && <FacultyDashboard />}

        {/* Admin Perspective: Dashboard Only */}
        {role === 'admin' && <AdminDashboard />}

        {/* Student Perspective */}
        {role === 'student' && currentTab === 'dashboard' && <StudentDashboard />}
        {role === 'student' && currentTab === 'leagues' && <LeaguesLeaderboard />}
        {role === 'student' && currentTab === 'battles' && <TeamBattlesView />}
      </main>

      {/* Global Modals for Student */}
      {role === 'student' && (
        <>
          <LevelUpModal />
          <DailyQuizModal isOpen={showDirectQuiz} onClose={() => setShowDirectQuiz(false)} />
        </>
      )}

      {/* Quiet Clean Footer */}
      <footer
        className={`border-t text-xs py-6 mt-12 transition-colors ${
          isDark
            ? 'border-slate-900 bg-slate-950 text-slate-500'
            : 'border-slate-200 bg-white text-slate-600 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-medium">LevelUp MSOT · Collegiate Gamified Learning Platform</span>
            <span className="mx-2">·</span>
            <span>4 Campuses: HI-Tech, Rathinam, RGIB, JUJ</span>
          </div>
          <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Points never alter official grades. Built for authentic learning habits.
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
