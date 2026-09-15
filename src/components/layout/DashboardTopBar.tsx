import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User as UserIcon, Settings, LogOut, Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, useNotifications, useClickOutside } from '@/hooks';
import { AppNotification } from '@/types';
import { useLanguage } from '@/i18n';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

interface DashboardTopBarProps {
  title: string;
  onMenuClick?: () => void;
  showMobileMenuBtn?: boolean;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  title,
  onMenuClick,
  showMobileMenuBtn = true,
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setIsProfileOpen(false));
  useClickOutside(notificationsRef, () => setIsNotificationsOpen(false));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getProfilePath = () => {
    if (user?.role === 'admin') return '/admin/settings';
    if (user?.role === 'farmer') return '/farmer/profile';
    return '/buyer/profile';
  };

  const getSettingsPath = () => {
    if (user?.role === 'admin') return '/admin/settings';
    if (user?.role === 'farmer') return '/farmer/settings';
    return '/buyer/settings';
  };

  const formatTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <>
      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] bg-white flex flex-col">
          <div className="flex items-center gap-3 px-4 h-16 border-b border-neutral-100">
            <Search className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder={t.common.searchPlaceholder}
              className="flex-1 text-base outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
            />
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-400 text-sm">Start typing to search...</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-5 lg:px-6 transition-all duration-300 shadow-xs">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-2 min-w-0">
          {showMobileMenuBtn && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-1 rounded-xl text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 transition-colors shrink-0"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight truncate">
            {title}
          </h1>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Desktop search */}
          <div className="hidden lg:flex items-center relative group mr-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder={t.common.searchPlaceholder}
              className="form-input pl-10 h-9 text-sm w-56 xl:w-72 rounded-2xl bg-neutral-100/60 border-transparent focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all duration-300"
            />
          </div>

          {/* Mobile search button */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Language selector — hidden on smallest screens */}
          <div className="hidden sm:block">
            <LanguageSelector showLabel={false} />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
              className="relative p-2 rounded-xl text-neutral-500 hover:text-primary hover:bg-primary/5 active:bg-primary/10 focus:outline-none transition-all duration-200"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 overflow-hidden origin-top-right animate-fade-up">
                <div className="px-4 py-3.5 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                  <h3 className="text-sm font-bold text-neutral-900">Notifications {unreadCount > 0 && <span className="ml-1.5 bg-primary/10 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => { markAllAsRead(); setIsNotificationsOpen(false); }} className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((notification: AppNotification) => (
                    <div
                      key={notification.id}
                      className={cn('px-4 py-3.5 border-b border-neutral-50 flex gap-3 cursor-pointer transition-colors active:bg-neutral-50', !notification.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-neutral-50/50')}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        if (notification.actionUrl) navigate(notification.actionUrl);
                        setIsNotificationsOpen(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm mb-0.5 leading-snug', !notification.isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700')}>{notification.title}</p>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{notification.message}</p>
                        <p className="text-[10px] text-neutral-400 mt-1.5 font-medium">{formatTime(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && <div className="shrink-0 flex items-center"><span className="h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(45,80,22,0.5)]" /></div>}
                    </div>
                  )) : (
                    <div className="py-10 text-center flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                        <Bell className="h-5 w-5 text-neutral-300" />
                      </div>
                      <p className="text-neutral-500 text-sm font-medium">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
              className="flex items-center focus:outline-none p-0.5 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
                {user?.avatar
                  ? <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                  : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 overflow-hidden origin-top-right animate-fade-up">
                <div className="px-4 py-3.5 border-b border-neutral-200 bg-neutral-50">
                  <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 capitalize font-medium mt-0.5">{user?.role?.toLowerCase()}</p>
                </div>
                {/* Language selector inside profile on mobile */}
                <div className="sm:hidden px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-2">Language</p>
                  <LanguageSelector showLabel={true} />
                </div>
                <div className="p-2 space-y-0.5">
                  <button onClick={() => { navigate(getProfilePath()); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-primary/5 rounded-xl flex items-center transition-colors active:bg-primary/10">
                    <UserIcon className="mr-3 h-4 w-4" />{t.common.profile}
                  </button>
                  <button onClick={() => { navigate(getSettingsPath()); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-primary/5 rounded-xl flex items-center transition-colors active:bg-primary/10">
                    <Settings className="mr-3 h-4 w-4" />{t.common.settings}
                  </button>
                  <div className="h-px bg-neutral-100 my-1 mx-2" />
                  <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center transition-colors active:bg-red-100">
                    <LogOut className="mr-3 h-4 w-4" />{t.common.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
