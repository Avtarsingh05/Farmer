import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import type { UserRole } from '@/types';

interface RequireAuthProps {
  children: React.ReactNode;
  role?: UserRole;
  redirectTo?: string;
}

/**
 * Route guard that redirects to login if not authenticated,
 * or to the appropriate home if the wrong role.
 */
export function RequireAuth({ children, role, redirectTo = '/login' }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to their correct dashboard
    const dashboards: Record<UserRole, string> = {
      farmer: '/farmer',
      buyer:  '/buyer',
      admin:  '/admin',
    };
    return <Navigate to={dashboards[user.role]} replace />;
  }

  if (user.status === 'suspended' || user.status === 'banned') {
    return <Navigate to="/account-suspended" replace />;
  }

  return <>{children}</>;
}

/**
 * Redirect authenticated users away from auth pages.
 */
export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    const dashboards: Record<UserRole, string> = {
      farmer: '/farmer',
      buyer:  '/buyer',
      admin:  '/admin',
    };
    return <Navigate to={dashboards[user.role]} replace />;
  }

  return <>{children}</>;
}
