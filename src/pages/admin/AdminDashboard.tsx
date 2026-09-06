import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { getAllUsers } from '@/services/userService';
import { getAllFarmers } from '@/services/farmerService';
import { getAllProducts } from '@/services/productService';
import { getAllOrders } from '@/services/orderService';
import { 
  Users, Tractor, Box, ShoppingBag, Loader2, Database, RefreshCw, Sparkles, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useToast } from '@/components/ui/Toast';
import { 
  seedFirestoreContainers, 
  checkFirebaseStatus, 
  type FirebaseConnectionStatus 
} from '@/services/firebaseInit';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    users: 0,
    farmers: 0,
    products: 0,
    orders: 0
  });
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>({
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'farmer-bfd33',
    isConfigured: true,
    isConnected: false,
    collections: { categories: 0, products: 0, farmers: 0, orders: 0 },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [users, farmers, productsData, orders, fbStatus] = await Promise.all([
        getAllUsers?.() || [],
        getAllFarmers?.() || [],
        getAllProducts?.() || { items: [] },
        getAllOrders?.() || [],
        checkFirebaseStatus(),
      ]);

      const products = Array.isArray(productsData) ? productsData : ((productsData as any).items || []);

      setStats({
        users: users.length,
        farmers: farmers.length,
        products: products.length,
        orders: orders.length
      });

      setFirebaseStatus(fbStatus);
      setPendingFarmers(farmers.filter((f: any) => f.verificationStatus === 'pending').slice(0, 5) as never[]);
      
      const sortedOrders = [...orders].sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      setRecentOrders(sortedOrders.slice(0, 5) as never[]);
      
    } catch (err) {
      console.error("Error loading admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefreshStatus = async () => {
    setIsChecking(true);
    try {
      const fbStatus = await checkFirebaseStatus();
      setFirebaseStatus(fbStatus);
      toast({
        type: fbStatus.isConnected ? 'success' : 'info',
        message: fbStatus.isConnected 
          ? `Connected to Firebase project: ${fbStatus.projectId}` 
          : 'Operating with robust client-side storage mode.'
      });
    } catch (err) {
      toast({ type: 'error', message: 'Failed to verify Firebase connection' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedFirestoreContainers();
      if (result.success) {
        setSeedMessage(`Containers initialized successfully: ${result.counts.categories} categories, ${result.counts.products} products, ${result.counts.farmers} farmers, ${result.counts.inventory} inventory records.`);
        toast({
          type: 'success',
          message: 'Firebase collections populated successfully!',
        });
        await loadData();
      } else {
        toast({
          type: 'warning',
          message: result.message || 'Seeding completed with warnings (fallback active)',
        });
        setSeedMessage(result.message);
      }
    } catch (err) {
      toast({ type: 'error', message: 'Seeding error. Fallback storage remains active.' });
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 container-content py-8 animate-fade-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Command Center</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitor platform metrics, manage users, and oversee operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="btn-secondary bg-white hover:bg-neutral-50 text-neutral-700 rounded-full px-4 py-2 shadow-sm border-neutral-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Metric Cards - Ultra Modern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/users" className="group block bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-neutral-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-neutral-900" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-4xl font-extrabold text-neutral-900">{stats.users}</p>
          </div>
        </Link>
        
        <Link to="/admin/farmers" className="group block bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Tractor className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Tractor className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Active Farmers</p>
            <p className="text-4xl font-extrabold text-neutral-900">{stats.farmers}</p>
          </div>
        </Link>

        <Link to="/admin/products" className="group block bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="w-16 h-16 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Products Listed</p>
            <p className="text-4xl font-extrabold text-neutral-900">{stats.products}</p>
          </div>
        </Link>

        <Link to="/admin/orders" className="group block bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-amber-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingBag className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-4xl font-extrabold text-neutral-900">{stats.orders}</p>
          </div>
        </Link>
      </div>

      {/* Firebase Control Panel - High Tech Style */}
      <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 overflow-hidden text-neutral-100">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className="p-3 bg-neutral-800 rounded-xl shrink-0 h-fit">
                <Database className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">System Database Control</h2>
                  <span className={cn(
                    "px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full flex items-center gap-1.5 border",
                    firebaseStatus.isConnected 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full", firebaseStatus.isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400")}></span>
                    {firebaseStatus.isConnected ? 'Connected' : 'Standby'}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 max-w-xl">
                  Project: <code className="text-indigo-300 font-mono bg-indigo-900/30 px-1.5 py-0.5 rounded">{firebaseStatus.projectId}</code> • Sync and populate live database collections.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefreshStatus}
                disabled={isSeeding || isChecking}
                className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isChecking && "animate-spin")} />
                Ping Status
              </button>
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-md shadow-indigo-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Seed Collections
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800">
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Categories</p>
              <p className="text-2xl font-bold text-white">{firebaseStatus.collections.categories}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Products</p>
              <p className="text-2xl font-bold text-white">{firebaseStatus.collections.products}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Farmers</p>
              <p className="text-2xl font-bold text-white">{firebaseStatus.collections.farmers}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Orders</p>
              <p className="text-2xl font-bold text-white">{firebaseStatus.collections.orders}</p>
            </div>
          </div>

          {seedMessage && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-900/50 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200 leading-relaxed">{seedMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Farmers */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Action Required: Verifications</h2>
            <Link to="/admin/farmers" className="text-sm font-semibold text-neutral-900 hover:text-primary transition-colors">View All →</Link>
          </div>
          <div className="flex-1 p-2">
            {pendingFarmers.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Tractor className="w-12 h-12 text-neutral-200 mb-3" />
                <p className="text-neutral-500 font-medium">No pending verifications</p>
                <p className="text-sm text-neutral-400">All caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {pendingFarmers.map((farmer: any) => (
                  <li key={farmer.userId} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors rounded-xl m-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {farmer.displayName?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{farmer.displayName || 'Unknown Farm'}</p>
                        <p className="text-xs text-neutral-500 font-medium">{farmer.district}, {farmer.state}</p>
                      </div>
                    </div>
                    <Link to={`/admin/farmers`} className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all">
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Recent Transactions</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-neutral-900 hover:text-primary transition-colors">View All →</Link>
          </div>
          <div className="flex-1 p-2">
            {recentOrders.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-12 h-12 text-neutral-200 mb-3" />
                <p className="text-neutral-500 font-medium">No recent orders</p>
                <p className="text-sm text-neutral-400">Orders will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recentOrders.map((order: any) => (
                  <li key={order.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors rounded-xl m-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">Order #{order.id.slice(0,8)}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-emerald-600">₹{order.total}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                          <span className="text-xs font-medium text-neutral-500 capitalize">{order.orderStatus}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/admin/orders`} className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all">
                      Details
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
