import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
        <div className="h-16 bg-neutral-200 rounded w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-neutral-200 rounded"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">
          {getGreeting()}, {profile?.displayName || user?.name || 'Farmer'}
        </h1>
        <div className="flex gap-2">
          <Link to="/farmer/products/new" className="btn-primary">Add New Product</Link>
          <Link to="/farmer/orders" className="btn-secondary">View All Orders</Link>
        </div>
      </div>

      {profile && profile.verificationStatus !== 'verified' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Your account is pending verification.</h3>
            <p className="text-amber-700 text-sm mt-1">Complete your profile to get verified and start selling to more buyers.</p>
            <Link to="/farmer/profile" className="text-amber-700 text-sm font-medium underline mt-2 inline-block">Complete Profile</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/farmer/products?status=active" className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-lg"><Package className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Listings</p>
              <p className="text-2xl font-bold text-neutral-900">{activeListings}</p>
            </div>
          </div>
        </Link>
        
        <Link to="/farmer/orders?status=pending" className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg"><ShoppingCart className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{pendingOrders.length}</p>
            </div>
          </div>
        </Link>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">This Month Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{thisMonthOrders.length}</p>
            </div>
          </div>
        </div>

        <Link to="/farmer/earnings" className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg"><IndianRupee className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">This Month Earnings</p>
              <p className="text-2xl font-bold text-neutral-900">₹{thisMonthEarnings.toLocaleString()}</p>
            </div>
          </div>
        </Link>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-red-50">
            <h2 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Products Needing Attention
            </h2>
            <Link to="/farmer/inventory" className="text-sm font-medium text-red-700 hover:underline">Manage Inventory</Link>
          </div>
          <div className="divide-y divide-neutral-200">
            {lowStockItems.map(item => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={item.productId} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-red-600">Low Stock: {item.availableQty} {product?.unit || 'units'} remaining (Threshold: {item.lowStockThreshold})</p>
                  </div>
                  <Link to={`/farmer/products/${item.productId}`} className="btn-sm btn-secondary">Update Stock</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
          <Link to="/farmer/orders" className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No recent orders.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Buyer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="p-4 font-medium text-neutral-900">#{order.id.slice(0, 8)}</td>
                    <td className="p-4">{order.buyerName}</td>
                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'cancelled' || order.orderStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      )}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 font-medium">₹{order.total.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <Link to={`/farmer/orders/${order.id}`} className="btn-sm btn-ghost">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
