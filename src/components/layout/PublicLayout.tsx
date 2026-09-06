import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PublicTopNav } from './PublicTopNav';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PublicTopNav />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      {!isAuthPage && <PublicFooter />}
    </div>
  );
};
