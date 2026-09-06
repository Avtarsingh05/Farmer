import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerOrders } from '@/services/orderService';
import { Order } from '@/types';

export default function FarmerEarningsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        if (!user?.id) return;
        const data = await getFarmerOrders(user.id);
        setOrders(data.filter(o => o.orderStatus === 'delivered'));
      } catch (err: any) {
        setError(err.message || 'Failed to load earnings');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user?.id]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);
  
  const thisMonthEarnings = orders
    .filter(o => { const d = new Date(o.createdAt); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((sum, o) => sum + o.total, 0);

  const lastMonthEarnings = orders
    .filter(o => { const d = new Date(o.createdAt); return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear; })
    .reduce((sum, o) => sum + o.total, 0);

  const avgOrderValue = orders.length > 0 ? totalEarnings / orders.length : 0;

  // Earnings by product
  const productEarnings: Record<string, { name: string, qty: number, total: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productEarnings[item.productId]) {
        productEarnings[item.productId] = { name: item.productName, qty: 0, total: 0 };
      }
      productEarnings[item.productId].qty += item.quantity;
      productEarnings[item.productId].total += (item.unitPrice * item.quantity);
    });
  });

  const productBreakdown = Object.values(productEarnings).sort((a, b) => b.total - a.total);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading earnings...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Earnings Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-lg"><IndianRupee className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Earnings</p>
              <p className="text-2xl font-bold text-neutral-900">₹{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">This Month</p>
              <p className="text-2xl font-bold text-neutral-900">₹{thisMonthEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-100 text-neutral-700 rounded-lg"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Last Month</p>
              <p className="text-2xl font-bold text-neutral-900">₹{lastMonthEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-neutral-900">₹{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Completed Orders</h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 text-sm sticky top-0">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {orders.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-neutral-500">No delivered orders yet.</td></tr>}
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="p-4 font-medium text-neutral-900">#{order.id.slice(0, 8)}</td>
                    <td className="p-4 text-neutral-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-green-700 text-right">+₹{order.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Earnings by Product</h2>
          </div>
          <div className="divide-y divide-neutral-200 max-h-[400px] overflow-y-auto">
            {productBreakdown.length === 0 && <div className="p-4 text-center text-neutral-500">No data available.</div>}
            {productBreakdown.map((prod, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">{prod.name}</p>
                  <p className="text-xs text-neutral-500">{prod.qty} units sold</p>
                </div>
                <div className="text-right font-medium text-neutral-900">
                  ₹{prod.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
