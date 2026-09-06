import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RequireAuth, RequireGuest } from './RouteGuards';

// Layouts
import { PublicLayout } from '@/components/layout';
import { FarmerLayout } from '@/components/layout';
import { BuyerLayout } from '@/components/layout';
import { AdminLayout } from '@/components/layout';

// ─── Lazy-loaded public pages ─────────────────────────────────────────────────
const HomePage             = lazy(() => import('@/pages/public/HomePage'));
const MarketPage           = lazy(() => import('@/pages/public/MarketPage'));
const ProductDetailPage    = lazy(() => import('@/pages/public/ProductDetailPage'));
const FarmersPage          = lazy(() => import('@/pages/public/FarmersPage'));
const FarmerProfilePage    = lazy(() => import('@/pages/public/FarmerProfilePage'));
const AboutPage            = lazy(() => import('@/pages/public/AboutPage'));
const HowItWorksPage       = lazy(() => import('@/pages/public/HowItWorksPage'));

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage            = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage         = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage   = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// ─── Farmer pages ─────────────────────────────────────────────────────────────
const FarmerDashboard      = lazy(() => import('@/pages/farmer/FarmerDashboard'));
const FarmerProductsPage   = lazy(() => import('@/pages/farmer/FarmerProductsPage'));
const FarmerProductFormPage= lazy(() => import('@/pages/farmer/FarmerProductFormPage'));
const FarmerOrdersPage     = lazy(() => import('@/pages/farmer/FarmerOrdersPage'));
const FarmerOrderDetailPage= lazy(() => import('@/pages/farmer/FarmerOrderDetailPage'));
const FarmerInventoryPage  = lazy(() => import('@/pages/farmer/FarmerInventoryPage'));
const FarmerEarningsPage   = lazy(() => import('@/pages/farmer/FarmerEarningsPage'));
const FarmerProfilePage2   = lazy(() => import('@/pages/farmer/FarmerProfilePage'));

// ─── Buyer pages ──────────────────────────────────────────────────────────────
const BuyerDashboard       = lazy(() => import('@/pages/buyer/BuyerDashboard'));
const BuyerSearchPage      = lazy(() => import('@/pages/buyer/BuyerSearchPage'));
const BuyerOrdersPage      = lazy(() => import('@/pages/buyer/BuyerOrdersPage'));
const BuyerOrderDetailPage = lazy(() => import('@/pages/buyer/BuyerOrderDetailPage'));
const CartPage             = lazy(() => import('@/pages/buyer/CartPage'));
const FavoritesPage        = lazy(() => import('@/pages/buyer/FavoritesPage'));
const BuyerProfilePage     = lazy(() => import('@/pages/buyer/BuyerProfilePage'));

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboard       = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage       = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminFarmersPage     = lazy(() => import('@/pages/admin/AdminFarmersPage'));
const AdminProductsPage    = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminCategoriesPage  = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminOrdersPage      = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminSettingsPage    = lazy(() => import('@/pages/admin/AdminSettingsPage'));

// ─── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const router = createBrowserRouter([
  // ─── Public routes ────────────────────────────────────────────────────────
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true,           element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: 'market',        element: <Suspense fallback={<PageLoader />}><MarketPage /></Suspense> },
      { path: 'products',      element: <Navigate to="/market" replace /> },
      { path: 'cart',          element: <Navigate to="/buyer/cart" replace /> },
      { path: 'products/:id',  element: <Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense> },
      { path: 'farmers',       element: <Suspense fallback={<PageLoader />}><FarmersPage /></Suspense> },
      { path: 'farmers/:id',   element: <Suspense fallback={<PageLoader />}><FarmerProfilePage /></Suspense> },
      { path: 'about',         element: <Suspense fallback={<PageLoader />}><AboutPage /></Suspense> },
      { path: 'how-it-works',  element: <Suspense fallback={<PageLoader />}><HowItWorksPage /></Suspense> },
      { path: 'privacy',       element: <div className="container-content py-16"><h1 className="page-title">Privacy Policy</h1><p className="mt-4 text-neutral-600">Policy details will be added here.</p></div> },
      { path: 'terms',         element: <div className="container-content py-16"><h1 className="page-title">Terms of Service</h1><p className="mt-4 text-neutral-600">Terms details will be added here.</p></div> },
      { path: 'contact',       element: <div className="container-content py-16"><h1 className="page-title">Contact Us</h1><p className="mt-4 text-neutral-600">contact@kisanmitra.in</p></div> },
    ],
  },

  // ─── Auth routes ──────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <RequireGuest><Suspense fallback={<PageLoader />}><LoginPage /></Suspense></RequireGuest>,
  },
  {
    path: '/register',
    element: <RequireGuest><Suspense fallback={<PageLoader />}><RegisterPage /></Suspense></RequireGuest>,
  },
  {
    path: '/forgot-password',
    element: <RequireGuest><Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense></RequireGuest>,
  },

  // ─── Farmer routes ────────────────────────────────────────────────────────
  {
    path: '/farmer',
    element: <RequireAuth role="farmer"><FarmerLayout /></RequireAuth>,
    children: [
      { index: true,                element: <Suspense fallback={<PageLoader />}><FarmerDashboard /></Suspense> },
      { path: 'products',           element: <Suspense fallback={<PageLoader />}><FarmerProductsPage /></Suspense> },
      { path: 'products/new',       element: <Suspense fallback={<PageLoader />}><FarmerProductFormPage /></Suspense> },
      { path: 'products/:id',       element: <Suspense fallback={<PageLoader />}><FarmerProductFormPage /></Suspense> },
      { path: 'orders',             element: <Suspense fallback={<PageLoader />}><FarmerOrdersPage /></Suspense> },
      { path: 'orders/:id',         element: <Suspense fallback={<PageLoader />}><FarmerOrderDetailPage /></Suspense> },
      { path: 'inventory',          element: <Suspense fallback={<PageLoader />}><FarmerInventoryPage /></Suspense> },
      { path: 'earnings',           element: <Suspense fallback={<PageLoader />}><FarmerEarningsPage /></Suspense> },
      { path: 'profile',            element: <Suspense fallback={<PageLoader />}><FarmerProfilePage2 /></Suspense> },
      { path: 'analytics',          element: <Suspense fallback={<PageLoader />}><FarmerEarningsPage /></Suspense> },
      { path: 'settings',           element: <Suspense fallback={<PageLoader />}><FarmerProfilePage2 /></Suspense> },
    ],
  },

  // ─── Buyer routes ─────────────────────────────────────────────────────────
  {
    path: '/buyer',
    element: <RequireAuth role="buyer"><BuyerLayout /></RequireAuth>,
    children: [
      { index: true,                element: <Suspense fallback={<PageLoader />}><BuyerDashboard /></Suspense> },
      { path: 'search',             element: <Suspense fallback={<PageLoader />}><BuyerSearchPage /></Suspense> },
      { path: 'orders',             element: <Suspense fallback={<PageLoader />}><BuyerOrdersPage /></Suspense> },
      { path: 'orders/:id',         element: <Suspense fallback={<PageLoader />}><BuyerOrderDetailPage /></Suspense> },
      { path: 'cart',               element: <Suspense fallback={<PageLoader />}><CartPage /></Suspense> },
      { path: 'favorites',          element: <Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense> },
      { path: 'profile',            element: <Suspense fallback={<PageLoader />}><BuyerProfilePage /></Suspense> },
      { path: 'settings',           element: <Suspense fallback={<PageLoader />}><BuyerProfilePage /></Suspense> },
    ],
  },

  // ─── Admin routes ─────────────────────────────────────────────────────────
  {
    path: '/admin',
    element: <RequireAuth role="admin"><AdminLayout /></RequireAuth>,
    children: [
      { index: true,                element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense> },
      { path: 'users',              element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
      { path: 'farmers',            element: <Suspense fallback={<PageLoader />}><AdminFarmersPage /></Suspense> },
      { path: 'products',           element: <Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense> },
      { path: 'categories',         element: <Suspense fallback={<PageLoader />}><AdminCategoriesPage /></Suspense> },
      { path: 'orders',             element: <Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense> },
      { path: 'settings',           element: <Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense> },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '/account-suspended',
    element: (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Account Suspended</h1>
          <p className="text-neutral-600 mb-6">Your account has been suspended. Contact support for assistance.</p>
          <a href="mailto:support@kisanmitra.in" className="btn-primary btn">Contact Support</a>
        </div>
      </div>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
