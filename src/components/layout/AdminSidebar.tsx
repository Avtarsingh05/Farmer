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
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen fixed top-0 left-0 z-40">
      <div className="flex items-center space-x-2 h-16 px-6 bg-slate-950 cursor-pointer" onClick={() => navigate('/admin')}>
        <Leaf className="h-8 w-8 text-primary" />
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white leading-none">KisanMitra</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-1">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <Icon className={cn('mr-3 flex-shrink-0 h-5 w-5')} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-950">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden border border-slate-600">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-slate-800 hover:text-red-300 w-full transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
