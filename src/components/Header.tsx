import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/appStore';
import { NavigationDrawer } from './NavigationDrawer';
import { NotificationPanel } from './NotificationPanel';
import {
  Menu,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  User,
  Bell,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuizModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, onOpenQuizModal }) => {
  const {
    role,
    setRole,
    activeStudent,
    setActiveStudentId,
    activeFaculty,
    resetAllData,
    theme,
    toggleTheme,
    isDark,
    toggleDrawer,
    setNavSection,
    openProfileModal,
    notifications,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRinging, setIsRinging] = useState(false);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const prevUnreadRef = useRef(unreadNotifCount);

  useEffect(() => {
    if (role === 'student' && unreadNotifCount > prevUnreadRef.current) {
      setIsRinging(true);
      const timer = setTimeout(() => setIsRinging(false), 850);
      return () => clearTimeout(timer);
    }
    prevUnreadRef.current = unreadNotifCount;
  }, [unreadNotifCount, role]);

  const currentUserName =
    role === 'student' ? activeStudent.name : role === 'faculty' ? activeFaculty.name : 'Dean Vikram Rao';
  const currentUserInitial = currentUserName.charAt(0);

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          role === 'student'
            ? isDark
              ? 'bg-slate-950/80 border-slate-800/80 text-slate-100'
              : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-xs'
            : isDark
            ? 'bg-slate-950/90 border-slate-800 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 h-16">
          {/* Zone 1: Hamburger Menu + Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Icon immediately to the LEFT of the MiraiQuest logo */}
            <button
              onClick={toggleDrawer}
              title="Open Navigation Menu"
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer touch-target ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 shadow-2xs'
              }`}
              aria-label="Open navigation menu drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* MiraiQuest Logo */}
            <button
              onClick={() => {
                setNavSection('dashboard:overview');
                onTabChange('dashboard');
              }}
              className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block shadow-xs shadow-indigo-500/50" />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>MiraiQuest</span>
              <span className={`text-[11px] sm:text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>· MSOT</span>
            </button>
          </div>

          {/* Zone 2: Actions, Notifications (Student Only), Theme Toggle, User Name (Profile), Role Switcher */}
          <div className="relative flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Notification Bell Button (STUDENTS ONLY) */}
            {role === 'student' && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className={`relative p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer touch-target pressable-btn ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-200/80 shadow-xs'
                }`}
                aria-label="View notifications"
              >
                <Bell className={`w-4 h-4 transition-transform ${isRinging ? 'animate-bell-ring text-indigo-500' : ''}`} />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-extrabold rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-200">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark / Light Mode Sun/Moon Toggle: Always visible for teacher/admin; visible on tablet/laptop for student */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              className={`${
                role === 'student' ? 'hidden sm:flex' : 'flex'
              } p-2 rounded-xl border transition-all items-center justify-center cursor-pointer touch-target ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-indigo-600 hover:text-indigo-800 hover:border-slate-300 hover:bg-slate-200/80 shadow-xs'
              }`}
              aria-label="Toggle light and dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* User Profile Avatar / Name Trigger -> Opens Profile Modal */}
            {/* Mobile View: Avatar circle only */}
            <button
              onClick={() => openProfileModal(undefined, role, 'profile')}
              title={`Open ${currentUserName}'s profile`}
              className="sm:hidden w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition-opacity touch-target"
              aria-label="Open profile modal"
            >
              {currentUserInitial}
            </button>

            {/* Tablet & Desktop View: Avatar icon + Name */}
            <button
              onClick={() => openProfileModal(undefined, role, 'profile')}
              title={`Open ${currentUserName}'s profile`}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-xl transition-all whitespace-nowrap cursor-pointer touch-target ${
                isDark
                  ? 'text-slate-200 bg-slate-900 border-slate-800 hover:border-indigo-500 hover:bg-slate-800/90 hover:text-indigo-300'
                  : 'text-slate-800 bg-slate-100 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 shadow-xs'
              }`}
            >
              <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-semibold truncate max-w-[130px] md:max-w-[170px]">
                {currentUserName}
              </span>
            </button>

            {/* Role Dropdown Trigger (Hidden on mobile; mobile switches in drawer) */}
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-target ${
                isDark
                  ? 'text-slate-300 bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  : 'text-slate-700 bg-slate-100 border-slate-200 hover:border-slate-300 hover:bg-slate-200/80 shadow-xs'
              }`}
              title="Switch demo perspective"
            >
              {role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />}
              {role === 'faculty' && <UserCheck className="w-3.5 h-3.5 text-blue-500" />}
              {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
              <span className="capitalize hidden md:inline">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Quick Reset Button (Hidden on mobile; in drawer on mobile) */}
            <button
              onClick={resetAllData}
              title="Reset demo data to initial state"
              className={`hidden sm:flex p-2 border rounded-xl transition-colors cursor-pointer touch-target ${
                isDark
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-900 border-slate-800 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200 hover:bg-slate-200/80 shadow-xs'
              }`}
              aria-label="Reset demo data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Notifications Popover / Panel (STUDENTS ONLY) */}
            {role === 'student' && (
              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}

            {/* Role Dropdown Menu */}
            {showRoleMenu && (
              <div
                className={`absolute right-0 top-12 w-72 rounded-xl border shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                }`}
              >
                <div className={`text-xs font-semibold px-2 py-1 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  SWITCH DEMO ROLE
                </div>

                {/* Student Role */}
                <div className="mb-2">
                  <button
                    onClick={() => {
                      setRole('student');
                      setNavSection('dashboard:overview');
                      onTabChange('dashboard');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                      role === 'student'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : isDark
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Student Perspective</span>
                    </div>
                    {role === 'student' && <span className="text-[10px] text-indigo-400 font-bold">ACTIVE</span>}
                  </button>

                  {role === 'student' && (
                    <div className="mt-1 pl-4 space-y-1">
                      <div className={`text-[10px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select demo persona:</div>
                      {[
                        { id: 'std_rahul_verma', name: 'Rahul Verma (Bottom-quartile comeback)', tag: 'Rathinam · Lvl 2' },
                        { id: 'std_maya_sharma', name: 'Maya Sharma (Top scholar)', tag: 'HI-Tech · Lvl 6' },
                        { id: 'std_arjun_patel', name: 'Arjun Patel (Gold League)', tag: 'HI-Tech · Lvl 4' },
                        { id: 'std_sneha_kulkarni', name: 'Sneha Kulkarni (Consistent Scholar)', tag: 'Rathinam · Lvl 3' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveStudentId(s.id);
                            setNavSection('dashboard:overview');
                            onTabChange('dashboard');
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors cursor-pointer ${
                            activeStudent.id === s.id
                              ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                              : isDark
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <div className="truncate">{s.name}</div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.tag}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Faculty Role */}
                <button
                  onClick={() => {
                    setRole('faculty');
                    setNavSection('faculty:analytics');
                    onTabChange('dashboard');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left mb-1 cursor-pointer ${
                    role === 'faculty'
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Faculty (Prof. Priya Nair)</span>
                  </div>
                  {role === 'faculty' && <span className="text-[10px] text-indigo-400 font-bold">ACTIVE</span>}
                </button>

                {/* Admin Role */}
                <button
                  onClick={() => {
                    setRole('admin');
                    setNavSection('admin:rules');
                    onTabChange('dashboard');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    role === 'admin'
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin (Dean Vikram Rao)</span>
                  </div>
                  {role === 'admin' && <span className="text-[10px] text-indigo-400 font-bold">ACTIVE</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-In Navigation Drawer Component */}
      <NavigationDrawer onOpenQuizModal={onOpenQuizModal} />
    </>
  );
};
