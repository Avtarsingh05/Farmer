import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, IndianRupee, ArrowRight, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerProfile } from '@/services/farmerService';
import { getFarmerProducts } from '@/services/productService';
import { getFarmerOrders } from '@/services/orderService';
import { getFarmerInventory } from '@/services/inventoryService';
import { FarmerProfile, Product, Order, InventoryItem } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (!user?.id) return;
        
        const [profileData, productsData, ordersData, inventoryData] = await Promise.all([
          getFarmerProfile(user.id),
          getFarmerProducts(user.id),
          getFarmerOrders(user.id),
          getFarmerInventory(user.id)
        ]);
        
        setProfile(profileData);
        setProducts(productsData);
        setOrders(ordersData);
        setInventory(inventoryData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-12 bg-neutral-200/50 rounded-2xl w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-neutral-200/50 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 shadow-sm animate-fade-up">
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  const activeListings = products.filter(p => p.availabilityStatus === 'available').length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const thisMonthEarnings = thisMonthOrders
    .filter(o => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockItems = inventory.filter(i => i.availableQty <= i.lowStockThreshold);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-1">{currentDate}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {getGreeting()}, <span className="text-primary">{profile?.displayName || user?.name || 'Farmer'}</span>
          </h1>
          <p className="text-neutral-600 mt-2 max-w-2xl">Here is what's happening with your farm today. You have {pendingOrders.length} orders to fulfill.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/farmer/products/new" className="btn-primary rounded-full px-6 shadow-[0_8px_30px_rgb(45,80,22,0.2)] hover:-translate-y-0.5 transition-transform">
            + New Product
          </Link>
          <Link to="/farmer/orders" className="btn-secondary rounded-full px-6 hover:-translate-y-0.5 transition-transform">
            View Orders
          </Link>
        </div>
      </div>

      {profile && profile.verificationStatus !== 'verified' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-5 rounded-3xl flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-75">
          <div className="p-2 bg-amber-100/50 rounded-2xl text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Action Required: Verify Account</h3>
            <p className="text-amber-700 mt-1">Complete your profile to get verified and start selling to our network of premium buyers.</p>
            <Link to="/farmer/profile" className="text-amber-800 font-semibold underline mt-3 inline-flex items-center gap-1 hover:text-amber-900 transition-colors">
              Complete Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/farmer/products?status=active" className="block group animate-fade-up delay-100">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full blur-2xl group-hover:bg-green-100 transition-colors"></div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100/80 text-green-700 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-neutral-900 mb-1">{activeListings}</p>
                <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Active Listings</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/farmer/orders?status=pending" className="block group animate-fade-up delay-150">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-neutral-900 mb-1">{pendingOrders.length}</p>
                <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Pending Orders</p>
              </div>
            </div>
          </div>
        </Link>
        
        <div className="block group animate-fade-up delay-200">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-neutral-900 mb-1">{thisMonthOrders.length}</p>
                <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Orders This Month</p>
              </div>
            </div>
          </div>
        </div>

        <Link to="/farmer/earnings" className="block group animate-fade-up delay-300">
          <div className="bg-gradient-to-br from-primary to-emerald-800 p-6 rounded-3xl shadow-[0_8px_30px_rgb(45,80,22,0.2)] group-hover:shadow-[0_8px_30px_rgb(45,80,22,0.3)] group-hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white mb-1">₹{thisMonthEarnings.toLocaleString()}</p>
                <p className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Earnings This Month</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-400">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Recent Orders</h2>
              <Link to="/farmer/orders" className="text-primary font-medium hover:text-primary/80 flex items-center text-sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                <ShoppingCart className="w-12 h-12 text-neutral-300 mb-3" />
                <p className="text-neutral-500 font-medium">No recent orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Buyer</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="group hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-4 font-bold text-neutral-900 rounded-l-2xl border-y border-l border-transparent group-hover:border-neutral-100 bg-white group-hover:bg-neutral-50/50">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-4 font-medium text-neutral-700 border-y border-transparent group-hover:border-neutral-100 bg-white group-hover:bg-neutral-50/50">
                          {order.buyerName}
                        </td>
                        <td className="px-4 py-4 text-neutral-500 border-y border-transparent group-hover:border-neutral-100 bg-white group-hover:bg-neutral-50/50">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-4 border-y border-transparent group-hover:border-neutral-100 bg-white group-hover:bg-neutral-50/50">
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center",
                            order.orderStatus === 'pending' ? 'bg-amber-100/80 text-amber-800' :
                            order.orderStatus === 'delivered' ? 'bg-green-100/80 text-green-800' :
                            order.orderStatus === 'cancelled' || order.orderStatus === 'rejected' ? 'bg-red-100/80 text-red-800' :
                            'bg-blue-100/80 text-blue-800'
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full mr-2",
                              order.orderStatus === 'pending' ? 'bg-amber-600' :
                              order.orderStatus === 'delivered' ? 'bg-green-600' :
                              order.orderStatus === 'cancelled' || order.orderStatus === 'rejected' ? 'bg-red-600' :
                              'bg-blue-600'
                            )}></span>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-neutral-900 text-right border-y border-transparent group-hover:border-neutral-100 bg-white group-hover:bg-neutral-50/50">
                          ₹{order.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right rounded-r-2xl border-y border-r border-transparent group-hover:border-neutral-100 bg-white group-hover:bg-neutral-50/50">
                          <Link to={`/farmer/orders/${order.id}`} className="btn-ghost rounded-full w-8 h-8 p-0 inline-flex items-center justify-center">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6 animate-fade-up delay-500">
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Inventory Alerts</h2>
              {lowStockItems.length > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {lowStockItems.length} items
                </span>
              )}
            </div>

            {lowStockItems.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-neutral-900 font-bold text-lg mb-1">Stock looks good!</p>
                <p className="text-neutral-500 text-sm">No items are running low on inventory.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl hover:bg-red-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{product?.name || 'Unknown'}</p>
                          <p className="text-xs font-semibold text-red-600">
                            Only {item.availableQty} {product?.unit || 'units'} left
                          </p>
                        </div>
                      </div>
                      <Link to={`/farmer/products/${item.productId}`} className="btn-sm btn-ghost hover:bg-white bg-white/50 text-red-700 rounded-full">
                        Update
                      </Link>
                    </div>
                  );
                })}
                {lowStockItems.length > 5 && (
                  <Link to="/farmer/inventory" className="block w-full text-center py-3 text-sm font-semibold text-primary hover:text-primary/80 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                    View all {lowStockItems.length} alerts
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
