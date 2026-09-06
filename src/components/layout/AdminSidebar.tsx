import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Sprout, Package, ShoppingBag, Tag, Flag, Settings, Leaf, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/hooks';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Farmers', path: '/admin/farmers', icon: Sprout },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Tag },
    { label: 'Reports', path: '/admin/reports', icon: Flag },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-neutral-900 text-white h-screen fixed top-0 left-0 z-50 shadow-2xl">
      <div className="flex items-center space-x-3 h-20 px-8 cursor-pointer bg-neutral-950/80 backdrop-blur-md border-b border-white/5" onClick={() => navigate('/admin')}>
        <div className="bg-accent p-2 rounded-xl shadow-lg shadow-accent/20">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white leading-none tracking-tight">KisanMitra</span>
          <span className="text-[10px] text-accent font-bold tracking-widest uppercase mt-1">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
        <div className="px-4 mb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Management</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden',
                  isActive 
                    ? 'bg-accent text-white shadow-md shadow-accent/20' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('mr-3.5 flex-shrink-0 h-5 w-5 transition-transform duration-300', isActive ? 'scale-110' : 'group-hover:scale-110')} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 bg-neutral-950/80 backdrop-blur-md border-t border-white/5 mt-auto">
        <div className="flex items-center mb-4 px-2">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-white/10 border border-white/5">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-xs text-neutral-400 font-medium truncate">Administrator</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 w-full transition-colors group"
        >
          <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Logout
        </button>
      </div>
    </aside>
  );
};
