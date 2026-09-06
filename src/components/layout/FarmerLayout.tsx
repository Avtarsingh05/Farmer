import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FarmerSidebar } from './FarmerSidebar';
import { FarmerBottomNav } from './FarmerBottomNav';
import { DashboardTopBar } from './DashboardTopBar';

export const FarmerLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Simple title mapper based on pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/farmer') return 'Dashboard';
    if (path.includes('/farmer/products/new')) return 'Add Product';
    if (path.includes('/farmer/products/')) return 'Edit Product';
    if (path.includes('/farmer/products')) return 'Products';
    if (path.includes('/farmer/orders')) return 'Orders';
    if (path.includes('/farmer/inventory')) return 'Inventory';
    if (path.includes('/farmer/earnings')) return 'Earnings';
    if (path.includes('/farmer/analytics')) return 'Analytics';
    if (path.includes('/farmer/profile')) return 'Profile';
    if (path.includes('/farmer/settings')) return 'Settings';
    return 'Farmer Dashboard';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <FarmerSidebar />
      
      {/* Mobile Drawer (visible only when toggled on mobile) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white slide-in-left">
            <FarmerSidebar />
          </div>
        </div>
      )}

      <div className="lg:pl-72 flex flex-col min-h-screen pb-16 lg:pb-0">
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

      <FarmerBottomNav />
    </div>
  );
};
