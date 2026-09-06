import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, ClipboardList, Heart, User, Leaf, LogOut, Settings, Search, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, useCart } from '@/hooks';
import { CartItem } from '@/types';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const BuyerSidebar: React.FC = () => {
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
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 h-screen fixed top-0 left-0 z-40">
      <div className="flex items-center space-x-2 h-16 px-6 border-b border-neutral-200 cursor-pointer" onClick={() => navigate('/buyer')}>
        <Leaf className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-primary">KisanMitra</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/buyer'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors sidebar-link',
                  isActive ? 'bg-primary/10 text-primary sidebar-link-active' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                )
              }
            >
              <div className="flex items-center">
                <Icon className={cn('mr-3 flex-shrink-0 h-5 w-5')} />
                {item.label}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
            <p className="text-xs text-neutral-500 truncate">Buyer</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => navigate('/buyer/settings')}
            className="flex items-center px-3 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-neutral-100 w-full"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
