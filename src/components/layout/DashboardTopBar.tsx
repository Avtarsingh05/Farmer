import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, useNotifications, useClickOutside } from '@/hooks';
import { AppNotification } from '@/types';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

interface DashboardTopBarProps {
  title: string;
  onMenuClick?: () => void;
  showMobileMenuBtn?: boolean;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  title, 
  onMenuClick,
  showMobileMenuBtn = true
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 h-16 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
      <div className="flex items-center">
        {showMobileMenuBtn && (
          <button
            onClick={onMenuClick}
            className="lg:hidden text-neutral-500 hover:text-neutral-900 focus:outline-none mr-4 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search - Desktop only */}
        <div className="hidden md:block relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="form-input pl-10 h-10 text-sm w-64 rounded-2xl bg-neutral-100/50 border-transparent focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all duration-300"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 text-neutral-500 hover:text-primary rounded-xl hover:bg-primary/5 focus:outline-none transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100/50 focus:outline-none z-50 animate-fade-up overflow-hidden origin-top-right">
              <div className="px-5 py-4 border-b border-neutral-100/80 flex justify-between items-center bg-white/50">
                <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      markAllAsRead();
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[24rem] overflow-y-auto scrollbar-hide">
                {notifications.length > 0 ? (
                  notifications.map((notification: AppNotification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "px-5 py-4 border-b border-neutral-50/50 flex gap-4 transition-colors hover:bg-neutral-50/50 cursor-pointer",
                        !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : ""
                      )}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        if (notification.actionUrl) navigate(notification.actionUrl);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm mb-0.5", !notification.isRead ? "font-semibold text-neutral-900" : "font-medium text-neutral-700")}>{notification.title}</p>
                        <p className="text-sm text-neutral-500 line-clamp-2 leading-snug">{notification.message}</p>
                        <p className="text-xs text-neutral-400 mt-2 font-medium">{formatTime(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 flex items-center">
                          <span className="h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(45,80,22,0.6)]"></span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center flex flex-col items-center justify-center">
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

        {/* User Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-neutral-100/50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 shadow-sm ring-2 ring-white">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100/50 focus:outline-none z-50 animate-fade-up overflow-hidden origin-top-right">
              <div className="px-5 py-4 border-b border-neutral-100/80 bg-white/50">
                <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate capitalize font-medium mt-0.5">{user?.role?.toLowerCase()}</p>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    navigate(getProfilePath());
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-primary/5 rounded-xl flex items-center transition-colors"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  Your Profile
                </button>
                <button
                  onClick={() => {
                    navigate(getSettingsPath());
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-primary/5 rounded-xl flex items-center transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </button>
                <div className="h-px bg-neutral-100 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
