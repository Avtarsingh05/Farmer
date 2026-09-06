import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { DashboardTopBar } from './DashboardTopBar';

export const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/admin/users')) return 'Manage Users';
    if (path.includes('/admin/farmers')) return 'Farmers';
    if (path.includes('/admin/products')) return 'Products';
    if (path.includes('/admin/orders')) return 'Orders';
    if (path.includes('/admin/categories')) return 'Categories';
    if (path.includes('/admin/reports')) return 'Reports';
    if (path.includes('/admin/settings')) return 'Settings';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar />
      
      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 slide-in-left">
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
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
    </div>
  );
};
