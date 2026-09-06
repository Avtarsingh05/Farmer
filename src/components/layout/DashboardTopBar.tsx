import React, { useState, useRef } from 'react';
import { Menu, Bell, Search, User as UserIcon, Settings, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    <header className="bg-white border-b border-neutral-200 h-16 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        {showMobileMenuBtn && (
          <button
            onClick={onMenuClick}
            className="lg:hidden text-neutral-500 hover:text-neutral-900 focus:outline-none mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search - Desktop only */}
        <div className="hidden md:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="form-input pl-10 h-9 text-sm w-64 rounded-full"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 focus:outline-none"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 border border-neutral-200 focus:outline-none z-50">
              <div className="px-4 py-2 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      markAllAsRead();
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification: AppNotification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "px-4 py-3 border-b border-neutral-50 flex gap-3",
                        !notification.isRead ? "bg-primary/5" : ""
                      )}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        if (notification.actionUrl) navigate(notification.actionUrl);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                        <p className="text-sm text-neutral-500 truncate">{notification.message}</p>
                        <p className="text-xs text-neutral-400 mt-1">{formatTime(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 flex items-center">
                          <span className="h-2 w-2 bg-primary rounded-full"></span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                    No notifications
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
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-neutral-200 focus:outline-none z-50">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button
                onClick={() => {
                  navigate(getProfilePath());
                  setIsProfileOpen(false);
                }}
                className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Your Profile
              </button>
              <button
                onClick={() => {
                  navigate(getSettingsPath());
                  setIsProfileOpen(false);
                }}
                className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </button>
              <div className="border-t border-neutral-100"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
