import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getBuyerOrders } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { Loader2, Search, Filter } from 'lucide-react';
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

  const getBadgeClass = (s: OrderStatus) => {
    switch (s) {
      case 'pending': return 'badge-amber';
      case 'accepted':
      case 'processing': return 'badge-blue';
      case 'ready_for_dispatch':
      case 'out_for_delivery': return 'badge-blue';
      case 'delivered': return 'badge-green';
      case 'cancelled':
      case 'rejected': return 'badge-red';
      default: return 'badge-neutral';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
          <p className="text-neutral-600 text-sm mt-1">Track and manage your purchases</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-neutral-200 overflow-x-auto no-scrollbar pb-px">
        {(['all', 'active', 'delivered', 'cancelled'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center text-neutral-500">
            <Filter className="w-12 h-12 mb-4 text-neutral-300" />
            <p className="font-medium text-neutral-900 text-lg mb-1">No orders found</p>
            <p className="text-sm">You don't have any orders matching this filter.</p>
            {activeTab !== 'all' && (
              <button onClick={() => setActiveTab('all')} className="btn-secondary mt-4">
                View All Orders
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="card p-4 sm:p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-neutral-900">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className={cn('px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize', getBadgeClass(order.orderStatus))}>
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold tracking-wider mb-1">Date</p>
                    <p className="font-medium">{format((order.createdAt as any).toDate ? (order.createdAt as any).toDate() : new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold tracking-wider mb-1">Total Amount</p>
                    <p className="font-medium">₹{order.total}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold tracking-wider mb-1">Items</p>
                    <p className="font-medium">{order.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase font-semibold tracking-wider mb-1">Farmer</p>
                    <p className="font-medium truncate">{order.farmerId.slice(0,6)}...</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:w-auto">
                <Link to={`/buyer/orders/${order.id}`} className="btn-secondary whitespace-nowrap text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
