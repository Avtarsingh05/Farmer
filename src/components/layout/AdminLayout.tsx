import { cn } from '@/utils/cn';
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingBag, Settings } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const cn2 = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

const AdminBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const navItems = [
    { label: t.nav.admin.dashboard, path: '/admin', icon: LayoutDashboard },
    { label: t.nav.admin.users, path: '/admin/users', icon: Users },
    { label: t.nav.admin.products, path: '/admin/products', icon: Package },
    { label: t.nav.admin.orders, path: '/admin/orders', icon: ShoppingBag },
    { label: t.common.settings, path: '/admin/settings', icon: Settings },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10 pb-safe z-50 shadow-2xl">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn2(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  isActive ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return t.nav.admin.dashboard;
    if (path.includes('/admin/users')) return t.nav.admin.users;
    if (path.includes('/admin/farmers')) return t.nav.admin.farmers;
    if (path.includes('/admin/products')) return t.nav.admin.products;
    if (path.includes('/admin/orders')) return t.nav.admin.orders;
    if (path.includes('/admin/categories')) return t.nav.admin.categories;
    if (path.includes('/admin/reports')) return t.nav.admin.reports;
    if (path.includes('/admin/settings')) return t.nav.admin.settings;
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-neutral-900 h-full shadow-2xl animate-slide-in-left">
            <AdminSidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className={cn(
        'flex flex-col min-h-screen transition-all duration-300',
        'pb-20 lg:pb-0',
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      )}>
        <DashboardTopBar
          title={getPageTitle()}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-5 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
};
