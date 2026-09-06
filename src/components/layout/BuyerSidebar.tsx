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
    <aside className="hidden lg:flex flex-col w-72 bg-white text-neutral-900 h-screen fixed top-0 left-0 z-50 border-r border-neutral-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center space-x-3 h-20 px-8 cursor-pointer bg-white border-b border-neutral-100" onClick={() => navigate('/buyer')}>
        <div className="bg-primary/10 p-2 rounded-xl">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-neutral-900">KisanMitra</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
        <div className="px-4 mb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Buyer Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/buyer'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group',
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary hover:translate-x-1'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center">
                    <Icon className={cn('mr-3.5 flex-shrink-0 h-5 w-5 transition-transform duration-300', isActive ? 'scale-110' : 'group-hover:scale-110')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
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

      <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 mt-auto">
        <div className="flex items-center mb-4 px-2">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 shadow-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
            <p className="text-xs text-neutral-500 font-medium truncate">Buyer Account</p>
          </div>
        </div>
        <div className="flex flex-col space-y-1.5">
          <button 
            onClick={() => navigate('/buyer/settings')}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-neutral-600 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 w-full transition-colors group"
          >
            <Settings className="mr-3 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 w-full transition-colors group"
          >
            <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
