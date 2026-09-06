import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, Calendar, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerOrders } from '@/services/orderService';
import { Order } from '@/types';
import { cn } from '@/utils/cn';

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

  const monthOverMonthChange = lastMonthEarnings > 0 
    ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
    : (thisMonthEarnings > 0 ? 100 : 0);

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

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-12 bg-neutral-200/50 rounded-2xl w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-neutral-200/50 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-3xl font-medium">{error}</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Earnings Overview</h1>
          <p className="text-neutral-500 mt-2 font-medium">Track your revenue, sales performance, and top products.</p>
        </div>
        <button className="btn-secondary rounded-full bg-white shadow-sm border border-neutral-200 px-6 font-semibold flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
          <Calendar className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary to-emerald-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(45,80,22,0.2)] animate-fade-up delay-100 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-100 uppercase tracking-wider mb-1">Total Earnings</p>
              <p className="text-4xl font-extrabold text-white">₹{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-150 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full blur-xl group-hover:bg-blue-100 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1", 
                monthOverMonthChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {monthOverMonthChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(monthOverMonthChange).toFixed(1)}% vs last
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">This Month</p>
              <p className="text-3xl font-extrabold text-neutral-900">₹{thisMonthEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-200 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-neutral-50 rounded-bl-full blur-xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 opacity-75" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Last Month</p>
              <p className="text-3xl font-extrabold text-neutral-700">₹{lastMonthEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-300 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full blur-xl group-hover:bg-purple-100 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">{orders.length} orders</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Avg. Order Value</p>
              <p className="text-3xl font-extrabold text-neutral-900">₹{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up delay-400">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Completed Orders Revenue</h2>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto no-scrollbar rounded-2xl border border-neutral-50">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-xl">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right rounded-tr-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-neutral-500 font-medium">No delivered orders yet.</td></tr>}
                {orders.map((order, i) => (
                  <tr key={order.id} className={cn("hover:bg-neutral-50/80 transition-colors group", i !== orders.length - 1 && "border-b border-neutral-100 block table-row")}>
                    <td className="px-6 py-5 font-bold text-neutral-900 border-b border-neutral-100 group-last:border-none">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-5 text-neutral-500 font-medium border-b border-neutral-100 group-last:border-none">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-5 font-bold text-emerald-600 text-right border-b border-neutral-100 group-last:border-none flex items-center justify-end gap-1">
                      +₹{order.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Earnings by Product</h2>
            <p className="text-sm text-neutral-500 font-medium mt-1">Your top performing items</p>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] no-scrollbar space-y-4">
            {productBreakdown.length === 0 && (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <BarChart3 className="w-12 h-12 text-neutral-200 mb-3" />
                <p className="text-neutral-500 font-medium">No sales data available yet.</p>
              </div>
            )}
            
            {productBreakdown.map((prod, idx) => {
              const percentage = totalEarnings > 0 ? (prod.total / totalEarnings) * 100 : 0;
              
              return (
                <div key={idx} className="p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 line-clamp-1">{prod.name}</p>
                        <p className="text-xs font-semibold text-neutral-500">{prod.qty} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">₹{prod.total.toLocaleString()}</p>
                      <p className="text-xs font-bold text-primary">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-200/50 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
