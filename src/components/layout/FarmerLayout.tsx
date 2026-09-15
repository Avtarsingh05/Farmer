import { cn } from '@/utils/cn';
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FarmerSidebar } from './FarmerSidebar';
import { FarmerBottomNav } from './FarmerBottomNav';
import { DashboardTopBar } from './DashboardTopBar';
import { useLanguage } from '@/i18n';

export const FarmerLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/farmer') return t.nav.farmer.dashboard;
    if (path.includes('/farmer/products/new')) return 'Add Product';
    if (path.includes('/farmer/products/')) return 'Edit Product';
    if (path.includes('/farmer/products')) return t.nav.farmer.products;
    if (path.includes('/farmer/orders')) return t.nav.farmer.orders;
    if (path.includes('/farmer/inventory')) return t.nav.farmer.inventory;
    if (path.includes('/farmer/earnings')) return t.nav.farmer.earnings;
    if (path.includes('/farmer/analytics')) return t.nav.farmer.analytics;
    if (path.includes('/farmer/profile')) return t.nav.farmer.profile;
    if (path.includes('/farmer/settings')) return t.common.settings;
    return 'KisanMitra';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop sidebar */}
      <FarmerSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Mobile full-screen drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-neutral-900 h-full shadow-2xl animate-slide-in-left">
            <FarmerSidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
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

      <FarmerBottomNav />
    </div>
  );
};
