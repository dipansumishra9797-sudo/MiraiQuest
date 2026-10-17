import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/appStore';
import {
  X,
  LayoutDashboard,
  Zap,
  Trophy,
  Swords,
  FileText,
  ShieldCheck,
  Sparkles,
  Code,
  Users,
  ShoppingBag,
  User,
  LogOut,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Clock,
  Sliders,
  AlertTriangle,
  FileSpreadsheet,
  Gamepad2,
  Sun,
  Moon,
  CheckCircle2,
  Building2,
  ChevronRight,
} from 'lucide-react';

interface NavigationDrawerProps {
  onOpenQuizModal?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ onOpenQuizModal }) => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    role,
    setRole,
    activeStudent,
    activeFaculty,
    theme,
    setTheme,
    isDark,
    navSection,
    setNavSection,
    openProfileModal,
  } = useApp();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleSelectNav = (sectionId: string) => {
    if (sectionId === 'quiz') {
      setIsDrawerOpen(false);
      if (onOpenQuizModal) {
        onOpenQuizModal();
      }
      return;
    }

    if (sectionId === 'dashboard:profile' || sectionId === 'profile') {
      setIsDrawerOpen(false);
      openProfileModal(undefined, role, 'profile');
      return;
    }

    if (sectionId === 'logout') {
      // Prompt role switcher or switch to student default
      setIsDrawerOpen(false);
      setRole(role === 'student' ? 'faculty' : role === 'faculty' ? 'admin' : 'student');
      setNavSection('dashboard:overview');
      return;
    }

    setNavSection(sectionId);
    setIsDrawerOpen(false);
  };

  // Student menu items
  const studentItems = [
    { id: 'dashboard:overview', label: 'Dashboard', icon: LayoutDashboard, badge: 'Home' },
    { id: 'quiz', label: 'Daily Quiz', icon: Zap, badge: '+15 XP' },
    { id: 'leagues', label: 'Leagues', icon: Trophy, badge: activeStudent.league },
    { id: 'battles', label: 'Team Battles', icon: Swords, badge: 'Live' },
    { id: 'dashboard:assignments', label: 'Coursework and Labs', icon: FileText },
    { id: 'dashboard:ledger', label: 'Verifiable Ledger', icon: ShieldCheck, badge: 'Audit' },
    { id: 'dashboard:badges', label: 'Badges and Quests', icon: Sparkles },
    { id: 'dashboard:coding', label: 'Coding Practice', icon: Code, badge: '16 Topics' },
    { id: 'dashboard:peer_help', label: 'Peer Doubts', icon: Users },
    { id: 'dashboard:store', label: 'Perks Store', icon: ShoppingBag, badge: `${activeStudent.coinsBalance} Coins` },
    { id: 'dashboard:profile', label: 'Profile & Settings', icon: User },
    { id: 'logout', label: 'Logout / Switch Role', icon: LogOut },
  ];

  // Teacher menu items
  const teacherItems = [
    { id: 'faculty:analytics', label: 'Overview', icon: LayoutDashboard },
    { id: 'faculty:assignments', label: 'Assignment Management', icon: FileText, badge: 'Upload & Review' },
    { id: 'faculty:syllabus', label: 'My Classes', icon: BookOpen },
    { id: 'faculty:questions', label: 'Question Bank', icon: HelpCircle },
    { id: 'faculty:ai_queue', label: 'AI Approval Queue', icon: Sparkles, badge: 'Review' },
    { id: 'faculty:audit', label: 'XP Audit', icon: ShieldCheck },
    { id: 'faculty:quiet', label: 'Engagement', icon: Clock, badge: 'At-Risk' },
    { id: 'faculty:battles', label: 'Battles', icon: Swords },
    { id: 'profile', label: 'Faculty Profile', icon: User },
    { id: 'logout', label: 'Logout / Switch Role', icon: LogOut },
  ];

  // Admin menu items
  const adminItems = [
    { id: 'admin:rules', label: 'XP Rules', icon: Sliders },
    { id: 'admin:audit_flags', label: 'Audit and Flags', icon: AlertTriangle, badge: 'Anti-Cheat' },
    { id: 'admin:leagues', label: 'Leagues', icon: Trophy },
    { id: 'admin:battles', label: 'Battles', icon: Swords },
    { id: 'admin:rewards', label: 'Rewards', icon: ShoppingBag },
    { id: 'admin:users', label: 'Users', icon: Users, badge: 'Directory' },
    { id: 'admin:test_report', label: 'Test Report', icon: FileSpreadsheet, badge: 'Validated' },
    { id: 'admin:game_design', label: 'Game Design', icon: Gamepad2, badge: 'Manifest' },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'logout', label: 'Logout / Switch Role', icon: LogOut },
  ];

  const currentItems = role === 'student' ? studentItems : role === 'faculty' ? teacherItems : adminItems;

  const userName =
    role === 'student'
      ? activeStudent.name
      : role === 'faculty'
      ? activeFaculty.name
      : 'Dean Vikram Rao';

  const userCampus =
    role === 'student'
      ? `${activeStudent.campus} Campus`
      : role === 'faculty'
      ? `${activeFaculty.campus} Campus`
      : 'Institutional Governance · 4 Campuses';

  const roleLabel =
    role === 'student'
      ? `Student · Level ${activeStudent.level} Scholar`
      : role === 'faculty'
      ? `Faculty · ${activeFaculty.department}`
      : 'Chief Academic Administrator';

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer container (left side, width responsive) */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-80 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 border-r transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Top User Profile Header (Clickable to open profile) */}
            <div
              className={`p-5 border-b flex items-center justify-between transition-colors ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-slate-200'
              }`}
            >
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  openProfileModal(undefined, role, 'profile');
                }}
                title="Click to view & edit Profile"
                className="flex items-center gap-3 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer group flex-1"
              >
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
                  {userName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm truncate leading-tight group-hover:text-indigo-400 transition-colors">{userName}</h3>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                    {roleLabel}
                  </div>
                  <div className={`text-[10px] truncate flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{userCampus}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className={`p-2 rounded-xl border transition-colors shrink-0 ml-2 cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                }`}
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {role.toUpperCase()} NAVIGATION
              </div>

              {currentItems.map((item) => {
                const Icon = item.icon;
                const isActive = navSection === item.id;
                const isLogout = item.id === 'logout';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                        : isLogout
                        ? isDark
                          ? 'text-rose-400 hover:bg-rose-500/10'
                          : 'text-rose-600 hover:bg-rose-50'
                        : isDark
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isLogout ? 'text-rose-500' : isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Drawer Footer: Theme Selector & Brand */}
            <div
              className={`p-4 border-t space-y-3 transition-colors ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Theme Segmented Switcher */}
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>THEME MODE</span>
                  <span className="capitalize text-indigo-500 font-semibold">{theme}</span>
                </div>

                <div
                  className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Light Mode"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Dark Mode"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Brand watermark */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="font-bold flex items-center gap-1.5 text-indigo-500">
                  <span className="w-2 h-2 rounded-xs bg-indigo-500 inline-block" />
                  MiraiQuest
                </span>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>v2.0 · MSOT</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
