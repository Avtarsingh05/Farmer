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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 container-content py-6">
      <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="card p-6 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.users}</p>
          </div>
        </Link>
        <Link to="/admin/farmers" className="card p-6 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer">
          <div className="p-4 bg-green-50 text-green-600 rounded-full">
            <Tractor className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Farmers</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.farmers}</p>
          </div>
        </Link>
        <Link to="/admin/products" className="card p-6 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
            <Box className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Active Products</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.products}</p>
          </div>
        </Link>
        <Link to="/admin/orders" className="card p-6 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.orders}</p>
          </div>
        </Link>
      </div>

      {/* Firebase Firestore Containers & Live Control */}
      <div className="card p-6 bg-gradient-to-br from-amber-500/5 via-white to-primary/5 border border-amber-200/70 shadow-sm rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-neutral-900">Firebase Firestore Containers</h2>
              <span className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-md border flex items-center gap-1.5",
                firebaseStatus.isConnected 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-amber-50 text-amber-800 border-amber-200"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", firebaseStatus.isConnected ? "bg-green-600 animate-pulse" : "bg-amber-600")}></span>
                {firebaseStatus.isConnected ? 'Connected to Firebase' : 'Demo / Standby Mode'}
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              Active Project: <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-800 font-mono text-xs">{firebaseStatus.projectId}</code> • Sync and populate live database collections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshStatus}
              disabled={isSeeding || isChecking}
              className="btn-secondary btn-sm flex items-center gap-1.5"
              title="Test connection and refresh document counts"
            >
              <RefreshCw className={cn("w-4 h-4", isChecking && "animate-spin")} />
              Check Status
            </button>
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="btn-primary btn-sm flex items-center gap-1.5 bg-primary hover:bg-primary-600 shadow-sm"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Seeding Containers...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Seed Firestore Containers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Container Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-neutral-100">
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">Categories Container</p>
            <p className="text-lg font-bold text-neutral-900">{firebaseStatus.collections.categories} docs</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">Products Container</p>
            <p className="text-lg font-bold text-neutral-900">{firebaseStatus.collections.products} docs</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">Farmers Container</p>
            <p className="text-lg font-bold text-neutral-900">{firebaseStatus.collections.farmers} docs</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">Orders Container</p>
            <p className="text-lg font-bold text-neutral-900">{firebaseStatus.collections.orders} docs</p>
          </div>
        </div>

        {seedMessage && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span>{seedMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
            <h2 className="font-bold text-neutral-900">Pending Farmers</h2>
            <Link to="/admin/farmers" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="flex-1 p-4">
            {pendingFarmers.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4 text-center">No pending verifications.</p>
            ) : (
              <div className="space-y-3">
                {pendingFarmers.map((farmer: any) => (
                  <div key={farmer.userId} className="flex justify-between items-center p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50">
                    <div>
                      <p className="font-medium text-sm">{farmer.displayName || 'Unknown Farm'}</p>
                      <p className="text-xs text-neutral-500">{farmer.district}, {farmer.state}</p>
                    </div>
                    <Link to="/admin/farmers" className="btn-secondary btn-sm">Review</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
            <h2 className="font-bold text-neutral-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          <div className="flex-1 p-4">
            {recentOrders.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4 text-center">No recent orders.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50">
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0,8)}</p>
                      <p className="text-xs text-neutral-500">₹{order.total} - {order.orderStatus}</p>
                    </div>
                    <Link to="/admin/orders" className="btn-secondary btn-sm">View</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
