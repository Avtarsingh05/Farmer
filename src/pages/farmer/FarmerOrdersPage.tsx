import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerOrders } from '@/services/orderService';
import { Order } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerOrdersPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'all';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        if (!user?.id) return;
        const data = await getFarmerOrders(user.id);
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user?.id]);

  const filteredOrders = orders.filter(o => {
    if (currentTab === 'all') return true;
    return o.orderStatus === currentTab;
  });

  const tabs: { id: string, label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'processing', label: 'Processing' },
    { id: 'ready_for_dispatch', label: 'Ready' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': case 'processing': case 'ready_for_dispatch': return <Package className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': case 'processing': case 'ready_for_dispatch': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200 flex overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ status: tab.id })}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap",
                currentTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center animate-pulse">Loading orders...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Package className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No orders found</h3>
            <p className="text-neutral-500 mb-4">You have no orders matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Buyer</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="p-4 font-medium text-neutral-900">#{order.id.slice(0, 8)}</td>
                    <td className="p-4">{order.buyerName}</td>
                    <td className="p-4 text-neutral-500">{order.items.length} items</td>
                    <td className="p-4 font-medium">₹{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                        getStatusColor(order.orderStatus)
                      )}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Link to={`/farmer/orders/${order.id}`} className="btn-sm btn-ghost inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View
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
  );
}
