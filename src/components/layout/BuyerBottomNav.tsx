import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCart } from '@/hooks';
import { CartItem } from '@/types';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export const BuyerBottomNav: React.FC = () => {
  const { cart } = useCart();
  
  const cartItemCount = cart?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0;

  const navItems = [
    { label: 'Home', path: '/buyer', icon: Home },
    { label: 'Search', path: '/buyer/search', icon: Search },
    { label: 'Cart', path: '/buyer/cart', icon: ShoppingCart, badge: cartItemCount },
    { label: 'Orders', path: '/buyer/orders', icon: ClipboardList },
    { label: 'Profile', path: '/buyer/profile', icon: User },
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
              end={item.path === '/buyer'}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center w-full h-full space-y-1 bottom-nav-item',
                  isActive ? 'text-primary bottom-nav-item-active' : 'text-neutral-500 hover:text-neutral-900'
                )
              }
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
