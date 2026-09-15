import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCart } from '@/hooks';
import { CartItem } from '@/types';
import { useLanguage } from '@/i18n';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const BuyerBottomNav: React.FC = () => {
  const { cart } = useCart();
  const { t } = useLanguage();
  const cartItemCount = cart?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0;

  const navItems = [
    { label: t.nav.buyer.dashboard, path: '/buyer', icon: Home, badge: 0 },
    { label: t.nav.buyer.search, path: '/buyer/search', icon: Search, badge: 0 },
    { label: t.nav.buyer.cart, path: '/buyer/cart', icon: ShoppingCart, badge: cartItemCount },
    { label: t.nav.buyer.orders, path: '/buyer/orders', icon: ClipboardList, badge: 0 },
    { label: t.nav.buyer.profile, path: '/buyer/profile', icon: User, badge: 0 },
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
              end={item.path === '/buyer'}
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
                  <div className="relative">
                    <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110')} />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full shadow-sm">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
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
