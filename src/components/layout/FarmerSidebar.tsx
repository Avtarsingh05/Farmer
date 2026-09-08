import { getPlatformSettings } from '@/services/settingsService';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Archive, IndianRupee, BarChart2, LogOut, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/hooks';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export interface FarmerSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const FarmerSidebar: React.FC<FarmerSidebarProps> = ({ isCollapsed, onToggle, isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const { logoUrl } = getPlatformSettings();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/farmer', icon: LayoutDashboard },
    { label: 'Products', path: '/farmer/products', icon: Package },
    { label: 'Orders', path: '/farmer/orders', icon: ShoppingBag },
    { label: 'Inventory', path: '/farmer/inventory', icon: Archive },
    { label: 'Earnings', path: '/farmer/earnings', icon: IndianRupee },
    { label: 'Analytics', path: '/farmer/analytics', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    if (onClose) onClose();
    navigate(path);
  };

  return (
    <aside className={cn(
      "flex-col bg-neutral-900 text-white shadow-2xl transition-all duration-300",
      isMobile 
        ? "flex w-full h-full" 
        : cn("hidden lg:flex h-screen fixed top-0 left-0 z-50", isCollapsed ? "w-20" : "w-72")
    )}>
      {!isMobile && onToggle && (
        <button 
          onClick={onToggle} 
          className="absolute -right-3.5 top-7 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-300 rounded-full w-7 h-7 flex items-center justify-center z-50 shadow-md transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 mr-0.5" />}
        </button>
      )}

      <div className={cn(
        "flex items-center h-20 cursor-pointer bg-neutral-950/50 border-white/5 backdrop-blur-md border-b transition-all duration-300",
        isMobile 
          ? "justify-between px-6" 
          : (isCollapsed ? "justify-center px-0" : "justify-start px-6")
      )}>
        <div className="flex items-center space-x-3 overflow-hidden" onClick={() => handleNavClick('/farmer')}>
          <div className="bg-primary w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 shrink-0 overflow-hidden">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain bg-white" /> : <span className="text-white font-black text-xl">K</span>}
          </div>
          {(isMobile || !isCollapsed) && (
            <span className="text-2xl font-bold tracking-tight text-white whitespace-nowrap animate-fade-in">KisanMitra</span>
          )}
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
        {(isMobile || !isCollapsed) && (
          <div className="px-4 mb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Farmer Menu</div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/farmer'}
              onClick={() => isMobile && onClose && onClose()}
              className={({ isActive }) =>
                cn(
                  'flex items-center py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden',
                  (!isMobile && isCollapsed) ? 'justify-center px-0' : 'px-4',
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                )
              }
              title={(!isMobile && isCollapsed) ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('flex-shrink-0 h-5 w-5 transition-transform duration-300', (!isMobile && isCollapsed) ? '' : 'mr-3.5', isActive ? 'scale-110' : 'group-hover:scale-110')} />
                  {(isMobile || !isCollapsed) && <span className="relative z-10">{item.label}</span>}
                  {isActive && (isMobile || !isCollapsed) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn("p-4 bg-neutral-950/50 backdrop-blur-md border-t border-white/5 mt-auto", (!isMobile && isCollapsed) ? "items-center flex flex-col" : "")}>
        <div className={cn("flex items-center mb-4", (!isMobile && isCollapsed) ? "justify-center px-0" : "px-2")}>
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-white/10 shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'F'
            )}
          </div>
          {(isMobile || !isCollapsed) && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Farmer'}</p>
              <p className="text-xs text-neutral-400 font-medium truncate">Farmer Account</p>
            </div>
          )}
        </div>
        <div className={cn("flex flex-col space-y-1.5 w-full", (!isMobile && isCollapsed) ? "items-center" : "")}>
          <button 
            onClick={() => handleNavClick('/farmer/settings')}
            className={cn("flex items-center py-2.5 text-sm font-medium text-neutral-400 rounded-xl hover:bg-white/5 hover:text-white w-full transition-colors group", (!isMobile && isCollapsed) ? "justify-center px-0" : "px-4")}
            title={(!isMobile && isCollapsed) ? "Settings" : undefined}
          >
            <Settings className={cn("h-4 w-4 transition-transform duration-300 group-hover:rotate-90", (!isMobile && isCollapsed) ? "" : "mr-3")} />
            {(isMobile || !isCollapsed) && <span>Settings</span>}
          </button>
          <button 
            onClick={handleLogout}
            className={cn("flex items-center py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 w-full transition-colors group", (!isMobile && isCollapsed) ? "justify-center px-0" : "px-4")}
            title={(!isMobile && isCollapsed) ? "Logout" : undefined}
          >
            <LogOut className={cn("h-4 w-4 transition-transform duration-300", (!isMobile && isCollapsed) ? "" : "mr-3 group-hover:-translate-x-1")} />
            {(isMobile || !isCollapsed) && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
