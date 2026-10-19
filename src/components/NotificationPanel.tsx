import React, { useRef, useEffect } from 'react';
import { useApp } from '../store/appStore';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Flame,
  Trophy,
  Swords,
  Sparkles,
  Zap,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    isDark,
    openProfileModal,
    role,
  } = useApp();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click (for tablet & desktop popover mode)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'league':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'battle':
        return <Swords className="w-4 h-4 text-indigo-500" />;
      case 'quiz':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'peer_accept':
      case 'doubt':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'badge':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'anti_cheat':
        return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop (full-screen modal) */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Container */}
      <div
        ref={panelRef}
        className={`fixed inset-0 sm:inset-auto sm:absolute sm:right-0 sm:top-12 z-50 sm:w-96 max-w-full sm:max-h-[520px] flex flex-col border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        } sm:rounded-2xl`}
      >
        {/* Panel Header */}
        <div
          className={`px-4 py-3 sm:py-3.5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Live learning updates and campus quests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Read all</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              aria-label="Close notifications panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 thin-scrollbar pb-safe">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <div className="text-sm font-semibold">All caught up!</div>
              <p className={`text-xs mt-1 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                You have no active alerts. Complete quizzes, solve coding challenges, and check back soon.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationAsRead(notif.id);
                }}
                className={`p-3.5 sm:p-3 flex items-start gap-3 transition-colors cursor-pointer relative group ${
                  !notif.read
                    ? isDark
                      ? 'bg-indigo-950/25 hover:bg-indigo-950/40'
                      : 'bg-indigo-50/60 hover:bg-indigo-50/90'
                    : isDark
                    ? 'hover:bg-slate-800/40'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700/80'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  {getNotifIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${!notif.read ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                  </div>
                </div>

                {/* Delete action button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  title="Dismiss notification"
                  className="absolute right-2.5 top-3 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div
          className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <button
            onClick={() => {
              onClose();
              openProfileModal(undefined, role, 'profile');
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
          >
            <span>Notification Settings</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-slate-400">MiraiQuest Realtime Hub</span>
        </div>
      </div>
    </>
  );
};
