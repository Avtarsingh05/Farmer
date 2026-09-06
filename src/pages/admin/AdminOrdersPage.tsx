import React, { useEffect, useState } from 'react';
import { getAllOrders } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { Loader2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders?.() || [];
        data.sort((a, b) => {
          const timeA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt).getTime();
          const timeB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        setOrders(data);
      } catch (err) {
        console.error("Error loading orders", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o => statusFilter === 'all' || o.orderStatus === statusFilter);

  const getBadgeClass = (s: OrderStatus) => {
    switch (s) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'accepted':
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'ready_for_dispatch':
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 container-content py-6">
      <h1 className="text-2xl font-bold text-neutral-900">Orders Overview</h1>

      <div className="card p-4 flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-neutral-400" />
          <select className="form-input w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="ready_for_dispatch">Ready for Dispatch</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled/Rejected</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="table-th">Order ID</th>
              <th className="table-th">Date</th>
              <th className="table-th">Buyer / Farmer</th>
              <th className="table-th">Amount</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-neutral-500">No orders found.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="table-td font-medium font-mono text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="table-td text-sm text-neutral-600">
                    {format((order.createdAt as any)?.toDate ? (order.createdAt as any).toDate() : new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="table-td text-sm">
                    <div className="flex flex-col">
                      <span className="text-neutral-900" title={order.buyerId}>B: {order.buyerId.slice(0,6)}...</span>
                      <span className="text-neutral-500" title={order.farmerId}>F: {order.farmerId.slice(0,6)}...</span>
                    </div>
                  </td>
                  <td className="table-td font-medium">₹{order.total}</td>
                  <td className="table-td">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="table-td text-right text-sm text-neutral-600">
                    {order.items.length} items
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
