import React, { useState } from 'react';
import { useApp } from '../store/appStore';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, GraduationCap, ChevronDown, RefreshCw, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { role, setRole, activeStudent, setActiveStudentId, resetAllData, theme, toggleTheme } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Student has student features; Faculty & Admin only have Dashboard
  const navLinks =
    role === 'student'
      ? [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'quiz', label: 'Daily Quiz' },
          { id: 'leagues', label: 'Leagues' },
          { id: 'battles', label: 'Team Battles' },
        ]
      : [{ id: 'dashboard', label: 'Dashboard' }];

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isDark
          ? 'bg-slate-950/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 h-16">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block shadow-xs shadow-indigo-500/50" />
          <span className={isDark ? 'text-white' : 'text-slate-900'}>LevelUp</span>
          <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>· MSOT</span>
        </button>

        {/* Zone 2: Navigation Links */}
        {navLinks.length > 1 && (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    isActive
                      ? isDark
                        ? 'text-white border-indigo-500 font-semibold'
                        : 'text-indigo-600 border-indigo-600 font-semibold'
                      : isDark
                      ? 'border-transparent text-slate-400 hover:text-slate-200'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Primary Action / Theme Switcher / Role Switcher */}
        <div className="relative flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark / Light Mode Switcher Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:border-slate-700 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:text-indigo-800 hover:border-slate-300 hover:bg-slate-200/80 shadow-xs'
            }`}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Role Dropdown Trigger */}
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isDark
                ? 'text-slate-200 bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                : 'text-slate-800 bg-slate-100 border-slate-200 hover:border-slate-300 hover:bg-slate-200/80 shadow-xs'
            }`}
          >
            {role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />}
            {role === 'faculty' && <UserCheck className="w-3.5 h-3.5 text-blue-500" />}
            {role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
            <span className="capitalize">{role}:</span>
            <span className={`font-semibold truncate max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {role === 'student' ? activeStudent.name : role === 'faculty' ? 'Prof. Priya' : 'Admin Vikram'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Quick Reset */}
          <button
            onClick={resetAllData}
            title="Reset demo data to initial state"
            className={`p-2 border rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-900 border-slate-800 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200 hover:bg-slate-200/80 shadow-xs'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

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
                    onTabChange('dashboard');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                    role === 'student' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Student Perspective</span>
                  </div>
                  {role === 'student' && <span className="text-[10px] text-indigo-400">ACTIVE</span>}
                </button>

                {role === 'student' && (
                  <div className="mt-1 pl-4 space-y-1">
                    <div className="text-[10px] text-slate-400 mb-1">Select demo persona:</div>
                    {[
                      { id: 'std_rahul_verma', name: 'Rahul Verma (Bottom-quartile comeback)', tag: 'Rathinam · Lvl 2' },
                      { id: 'std_maya_sharma', name: 'Maya Sharma (Top scholar)', tag: 'HI-Tech · Lvl 6' },
                      { id: 'std_arjun_patel', name: 'Arjun Patel (Anonymous mode demo)', tag: 'HI-Tech · Lvl 4' },
                      { id: 'std_sneha_kulkarni', name: 'Sneha K. (Opted-out of rankings)', tag: 'RGIB · Lvl 3' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveStudentId(s.id);
                          onTabChange('dashboard');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors ${
                          activeStudent.id === s.id
                            ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.tag}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Faculty Role */}
              <button
                onClick={() => {
                  setRole('faculty');
                  onTabChange('dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left mb-1 ${
                  role === 'faculty' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Faculty (Prof. Priya Nair)</span>
                </div>
                {role === 'faculty' && <span className="text-[10px] text-indigo-400">ACTIVE</span>}
              </button>

              {/* Admin Role */}
              <button
                onClick={() => {
                  setRole('admin');
                  onTabChange('dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                  role === 'admin' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin (Dean Vikram Rao)</span>
                </div>
                {role === 'admin' && <span className="text-[10px] text-indigo-400">ACTIVE</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav bar - only if more than 1 tab */}
      {navLinks.length > 1 && (
        <div className="lg:hidden flex items-center justify-around border-t border-slate-900 bg-slate-950 px-2 py-2 overflow-x-auto text-xs">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`px-2.5 py-1 whitespace-nowrap rounded ${
                currentTab === link.id ? 'text-white font-semibold bg-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
