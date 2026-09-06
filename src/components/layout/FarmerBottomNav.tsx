import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Archive, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const FarmerBottomNav: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/farmer', icon: LayoutDashboard },
    { label: 'Products', path: '/farmer/products', icon: Package },
    { label: 'Orders', path: '/farmer/orders', icon: ShoppingBag },
    { label: 'Inventory', path: '/farmer/inventory', icon: Archive },
    { label: 'Profile', path: '/farmer/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/farmer'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 bottom-nav-item',
                  isActive ? 'text-primary bottom-nav-item-active' : 'text-neutral-500 hover:text-neutral-900'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
