import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Archive, User, IndianRupee } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '@/i18n';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const FarmerBottomNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { label: t.nav.farmer.dashboard, path: '/farmer', icon: LayoutDashboard },
    { label: t.nav.farmer.products, path: '/farmer/products', icon: Package },
    { label: t.nav.farmer.orders, path: '/farmer/orders', icon: ShoppingBag },
    { label: t.nav.farmer.earnings, path: '/farmer/earnings', icon: IndianRupee },
    { label: t.nav.farmer.profile, path: '/farmer/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 shadow-lg">
      <div className="flex justify-around items-stretch h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/farmer'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-2 gap-1 rounded-xl mx-0.5 my-1.5 transition-all duration-200',
                  isActive
                    ? 'bg-primary/8 text-primary'
                    : 'text-neutral-400 hover:text-neutral-700 active:bg-neutral-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110')} />
                  <span className={cn('text-[10px] font-semibold tracking-wide truncate max-w-[56px] text-center', isActive ? 'text-primary' : 'text-neutral-400')}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
