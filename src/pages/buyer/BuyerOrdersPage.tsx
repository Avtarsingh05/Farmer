import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getBuyerOrders } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { Loader2, Search, Filter, Box, Truck, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!user?.id) return;
        setLoading(true);
        const data = await getBuyerOrders(user.id);
        // Sort descending by date
        data.sort((a, b) => {
          const timeA = (a.createdAt as any).toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt).getTime();
          const timeB = (b.createdAt as any).toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        setOrders(data);
      } catch (error) {
        console.error("Error loading orders", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return !['delivered', 'cancelled', 'rejected'].includes(order.orderStatus);
    if (activeTab === 'delivered') return order.orderStatus === 'delivered';
    if (activeTab === 'cancelled') return ['cancelled', 'rejected'].includes(order.orderStatus);
    return true;
  });

  const getStatusConfig = (s: OrderStatus) => {
    switch (s) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Pending' };
      case 'accepted':
      case 'processing': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Box, label: 'Processing' };
      case 'ready_for_dispatch':
      case 'out_for_delivery': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Truck, label: 'On the way' };
      case 'delivered': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, label: 'Delivered' };
      case 'cancelled':
      case 'rejected': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'Cancelled' };
      default: return { color: 'text-neutral-600', bg: 'bg-neutral-50', border: 'border-neutral-200', icon: Clock, label: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 container-content py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">My Orders</h1>
          <p className="text-neutral-500 text-lg mt-2">Track your fresh produce deliveries</p>
        </div>
      </div>

      {/* Tabs - Pill style */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
        {(['all', 'active', 'delivered', 'cancelled'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 text-sm font-bold rounded-full whitespace-nowrap transition-all duration-300",
              activeTab === tab 
                ? "bg-neutral-900 text-white shadow-md scale-105" 
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            {tab === 'all' ? 'All Orders' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-neutral-100 shadow-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
              <Filter className="w-10 h-10 text-neutral-300" />
            </div>
            <p className="font-extrabold text-neutral-900 text-2xl mb-2">No orders found</p>
            <p className="text-neutral-500 max-w-md">You don't have any orders matching this filter in your history.</p>
            {activeTab !== 'all' && (
              <button onClick={() => setActiveTab('all')} className="mt-8 bg-neutral-900 text-white px-6 py-3 rounded-full font-bold hover:bg-neutral-800 transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order, idx) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 group animate-fade-up"
                style={{ animationDelay: `${200 + (idx * 50)}ms` }}
              >
                <div className="space-y-5 flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", statusConfig.bg, statusConfig.color)}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-neutral-500 text-sm block mb-0.5">ORDER #{order.id.slice(0, 8).toUpperCase()}</span>
                        <h3 className="font-extrabold text-lg text-neutral-900">{statusConfig.label}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <div>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-neutral-900">{format((order.createdAt as any).toDate ? (order.createdAt as any).toDate() : new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Amount</p>
                      <p className="font-extrabold text-primary text-base">₹{order.total}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Items</p>
                      <p className="font-semibold text-neutral-900">{order.items.length} items</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Farmer ID</p>
                      <p className="font-mono font-semibold text-neutral-700 truncate">{order.farmerId.slice(0,6)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full lg:w-auto mt-2 lg:mt-0">
                  <Link 
                    to={`/buyer/orders/${order.id}`} 
                    className="w-full lg:w-auto bg-white border-2 border-neutral-200 text-neutral-800 font-bold py-3 px-8 rounded-xl text-center hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
