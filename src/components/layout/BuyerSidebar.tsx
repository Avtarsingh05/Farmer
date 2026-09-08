import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, ClipboardList, Heart, User, Leaf, LogOut, Settings, Search, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, useCart } from '@/hooks';
import { CartItem } from '@/types';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const BuyerSidebar: React.FC<{ isCollapsed?: boolean; onToggle?: () => void }> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0;

  const navItems = [
    { label: 'Dashboard', path: '/buyer', icon: LayoutDashboard },
    { label: 'Search Produce', path: '/buyer/search', icon: Search },
    { label: 'Cart', path: '/buyer/cart', icon: ShoppingCart, badge: cartItemCount },
    { label: 'Orders', path: '/buyer/orders', icon: ClipboardList },
    { label: 'Favorites', path: '/buyer/favorites', icon: Heart },
    { label: 'Profile', path: '/buyer/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={cn("hidden lg:flex flex-col bg-white text-neutral-900 h-screen fixed top-0 left-0 z-50 border-r border-neutral-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300", isCollapsed ? "w-20" : "w-72")}>
      <div className="flex items-center justify-between h-20 px-4 cursor-pointer bg-neutral-50/50 border-neutral-200/50 backdrop-blur-md border-b">
        <div className="flex items-center space-x-3 overflow-hidden" onClick={() => navigate('buyer')}>
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && <span className="text-2xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">KisanMitra</span>}
        </div>
        {onToggle && (
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-2 hover:bg-neutral-500/10 rounded-lg shrink-0">
            {isCollapsed ? <ChevronRight className="w-5 h-5 text-neutral-500" /> : <ChevronLeft className="w-5 h-5 text-neutral-500" />}
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
        {!isCollapsed && <div className="px-4 mb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Buyer Menu</div>}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/buyer'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group',
                  isCollapsed ? 'px-0 justify-center' : 'px-4',
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary hover:translate-x-1'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <div className={cn("flex items-center", isCollapsed ? "justify-center w-full relative" : "")}>
                    <Icon className={cn('flex-shrink-0 h-5 w-5 transition-transform duration-300', !isCollapsed && 'mr-3.5', isActive ? 'scale-110' : 'group-hover:scale-110')} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </div>
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full transition-colors",
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn("p-4 bg-neutral-50/50 border-t border-neutral-100 mt-auto", isCollapsed ? "items-center flex flex-col" : "")}>
        <div className={cn("flex items-center mb-4", isCollapsed ? "justify-center px-0" : "px-2")}>
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 shadow-sm shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 font-medium truncate">Buyer Account</p>
            </div>
          )}
        </div>
        <div className={cn("flex flex-col space-y-1.5 w-full", isCollapsed ? "items-center" : "")}>
          <button 
            onClick={() => navigate('/buyer/settings')}
            className={cn("flex items-center py-2.5 text-sm font-medium text-neutral-600 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 w-full transition-colors group", isCollapsed ? "justify-center px-0" : "px-4")}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className={cn("h-4 w-4 group-hover:rotate-90 transition-transform duration-300", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button 
            onClick={handleLogout}
            className={cn("flex items-center py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 w-full transition-colors group", isCollapsed ? "justify-center px-0" : "px-4")}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-4 w-4 transition-transform duration-300", !isCollapsed && "mr-3 group-hover:-translate-x-1")} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
