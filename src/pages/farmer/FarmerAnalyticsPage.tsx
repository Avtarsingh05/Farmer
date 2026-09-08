import React, { useEffect, useState } from 'react';
import { BarChart2, PackageOpen, Users, TrendingUp, ShoppingCart, Target } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerProducts } from '@/services/productService';
import { getFarmerOrders } from '@/services/orderService';
import { ProductListItem, Order } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerAnalyticsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [prods, ords] = await Promise.all([
          getFarmerProducts(user.id),
          getFarmerOrders(user.id)
        ]);
        setProducts(prods);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-12 bg-neutral-200/50 rounded-2xl w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-neutral-200/50 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  // Derive Analytics from real data
  const totalProducts = products.length;
  const activeListings = products.filter(p => p.availabilityStatus === 'available' || p.availabilityStatus === 'limited').length;
  const outOfStock = products.filter(p => p.availabilityStatus === 'sold_out').length;

  const currentInventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const uniqueBuyers = new Set(orders.map(o => o.buyerId)).size;
  const totalOrders = orders.length;
  
  const completedOrders = orders.filter(o => o.orderStatus === 'delivered');
  const unitsSold = completedOrders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  // Category breakdown
  const categoryStats: Record<string, { listed: number, sold: number }> = {};
  products.forEach(p => {
    const cat = p.categoryName || p.category || 'Other';
    if (!categoryStats[cat]) categoryStats[cat] = { listed: 0, sold: 0 };
    categoryStats[cat].listed += 1;
  });

  completedOrders.forEach(o => {
    o.items.forEach(item => {
      // We don't have category in item natively, but we can match by productId
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.categoryName || prod?.category || 'Other';
      if (!categoryStats[cat]) categoryStats[cat] = { listed: 0, sold: 0 };
      categoryStats[cat].sold += item.quantity;
    });
  });

  const catArray = Object.entries(categoryStats).sort((a, b) => b[1].sold - a[1].sold);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-neutral-500 mt-2 font-medium">Insights into your inventory, customer base, and store performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-100 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100/80 text-orange-600 flex items-center justify-center">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold">
              {activeListings} Active
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Listings</p>
            <p className="text-4xl font-extrabold text-neutral-900">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-150 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Unique Buyers</p>
            <p className="text-4xl font-extrabold text-neutral-900">{uniqueBuyers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-200 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100/80 text-green-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              {completedOrders.length} Completed
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Units Sold</p>
            <p className="text-4xl font-extrabold text-neutral-900">{unitsSold}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-300">
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Inventory Status</h2>
              <p className="text-sm text-neutral-500 mt-1">Current state of your listed products</p>
            </div>
            <Target className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-neutral-700">Available ({activeListings})</span>
                <span className="text-neutral-900">{totalProducts > 0 ? Math.round((activeListings/totalProducts)*100) : 0}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${totalProducts > 0 ? (activeListings/totalProducts)*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-neutral-700">Out of Stock ({outOfStock})</span>
                <span className="text-neutral-900">{totalProducts > 0 ? Math.round((outOfStock/totalProducts)*100) : 0}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${totalProducts > 0 ? (outOfStock/totalProducts)*100 : 0}%` }}></div>
              </div>
            </div>
            <div className="pt-6 border-t border-neutral-100 mt-6">
              <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-1">Est. Inventory Value</p>
              <p className="text-2xl font-bold text-neutral-900">₹{currentInventoryValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Category Performance</h2>
            <p className="text-sm text-neutral-500 mt-1">Units sold across different categories</p>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {catArray.length === 0 ? (
              <div className="text-center text-neutral-500 py-8">No category data available</div>
            ) : (
              catArray.map(([cat, stats], idx) => (
                <div key={cat} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200/50 flex items-center justify-center font-bold text-neutral-600">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{cat}</p>
                      <p className="text-xs text-neutral-500">{stats.listed} products listed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">{stats.sold}</p>
                    <p className="text-xs text-neutral-500 font-medium">units sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
