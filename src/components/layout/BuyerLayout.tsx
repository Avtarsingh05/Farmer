import { cn } from '@/utils/cn';
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BuyerSidebar } from './BuyerSidebar';
import { BuyerBottomNav } from './BuyerBottomNav';
import { DashboardTopBar } from './DashboardTopBar';
import { useLanguage } from '@/i18n';

export const BuyerLayout: React.FC = () => {
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
    if (path === '/buyer') return t.nav.buyer.dashboard;
    if (path.includes('/buyer/search')) return t.nav.buyer.search;
    if (path.includes('/buyer/cart')) return t.nav.buyer.cart;
    if (path.includes('/buyer/checkout')) return 'Checkout';
    if (path.includes('/buyer/orders')) return t.nav.buyer.orders;
    if (path.includes('/buyer/favorites')) return t.nav.buyer.favorites;
    if (path.includes('/buyer/profile')) return t.nav.buyer.profile;
    if (path.includes('/buyer/settings')) return t.common.settings;
    return 'KisanMitra';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <BuyerSidebar
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
            <BuyerSidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
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

      <BuyerBottomNav />
    </div>
  );
};
