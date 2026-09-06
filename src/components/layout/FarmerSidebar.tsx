import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Archive, IndianRupee, BarChart2, Leaf, LogOut, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/hooks';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const FarmerSidebar: React.FC = () => {
  const { user, logout } = useAuth();
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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 h-screen fixed top-0 left-0 z-40">
      <div className="flex items-center space-x-2 h-16 px-6 border-b border-neutral-200 cursor-pointer" onClick={() => navigate('/farmer')}>
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
              end={item.path === '/farmer'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors sidebar-link',
                  isActive ? 'bg-primary/10 text-primary sidebar-link-active' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                )
              }
            >
              <Icon className={cn('mr-3 flex-shrink-0 h-5 w-5')} />
              {item.label}
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
            <p className="text-xs text-neutral-500 truncate">Farmer</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => navigate('/farmer/settings')}
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
