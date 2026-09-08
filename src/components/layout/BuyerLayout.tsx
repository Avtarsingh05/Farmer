import { cn } from '@/utils/cn';
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BuyerSidebar } from './BuyerSidebar';
import { BuyerBottomNav } from './BuyerBottomNav';
import { DashboardTopBar } from './DashboardTopBar';

export const BuyerLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/buyer') return 'Browse Market';
    if (path.includes('/buyer/search')) return 'Search';
    if (path.includes('/buyer/cart')) return 'Shopping Cart';
    if (path.includes('/buyer/checkout')) return 'Checkout';
    if (path.includes('/buyer/orders')) return 'My Orders';
    if (path.includes('/buyer/favorites')) return 'Favorites';
    if (path.includes('/buyer/profile')) return 'Profile';
    if (path.includes('/buyer/settings')) return 'Settings';
    return 'KisanMitra Market';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <BuyerSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-neutral-900 slide-in-left shadow-2xl">
            <BuyerSidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className={cn("flex flex-col min-h-screen pb-16 lg:pb-0 transition-all duration-300", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        <DashboardTopBar 
          title={getPageTitle()} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <BuyerBottomNav />
    </div>
  );
};
