import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, CheckCircle, XCircle, Truck, Package, Clock } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getOrder, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        if (!id) return;
        const data = await getOrder(id);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    if (newStatus === 'rejected' || newStatus === 'accepted') {
      const confirmMsg = newStatus === 'rejected' 
        ? 'Are you sure you want to REJECT this order? This cannot be undone.'
        : 'Are you sure you want to ACCEPT this order?';
      if (!window.confirm(confirmMsg)) return;
    }

    try {
      setUpdating(true);
      const uid = user?.uid || user?.id || '';
      await updateOrderStatus(order.id, uid, 'farmer', newStatus);
      const updated = await getOrder(order.id);
      if (updated) setOrder(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading order details...</div>;
  if (error || !order) return <div className="p-8 text-center text-red-600">{error || 'Order not found'}</div>;

  const isDelivery = order.deliveryType === 'delivery';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-neutral-500 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-2",
          order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
          order.orderStatus === 'cancelled' || order.orderStatus === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        )}>
          {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-sm text-neutral-500 border-b">
                  <tr>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Qty</th>
                    <th className="pb-3 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {order.items.map(item => (
                    <tr key={item.productId}>
                      <td className="py-4">
                        <p className="font-medium text-neutral-900">{item.productName}</p>
                      </td>
                      <td className="py-4 text-neutral-600">₹{item.unitPrice}/{item.unit}</td>
                      <td className="py-4 text-neutral-900">{item.quantity}</td>
                      <td className="py-4 text-right font-medium text-neutral-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-neutral-600 text-sm">
                <span>Subtotal</span>
                <span>₹{order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toLocaleString()}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-neutral-600 text-sm">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Actions</h2>
            <div className="flex flex-col gap-3">
              {order.orderStatus === 'pending' && (
                <>
                  <button onClick={() => handleUpdateStatus('accepted')} disabled={updating} className="btn-primary w-full flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Accept Order
                  </button>
                  <button onClick={() => handleUpdateStatus('rejected')} disabled={updating} className="btn-danger w-full flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject Order
                  </button>
                </>
              )}
              {order.orderStatus === 'accepted' && (
                <button onClick={() => handleUpdateStatus('processing')} disabled={updating} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" /> Mark Processing
                </button>
              )}
              {order.orderStatus === 'processing' && (
                <button onClick={() => handleUpdateStatus('ready_for_dispatch')} disabled={updating} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" /> Mark Ready for Dispatch
                </button>
              )}
              {order.orderStatus === 'ready_for_dispatch' && isDelivery && (
                <button onClick={() => handleUpdateStatus('out_for_delivery')} disabled={updating} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Truck className="w-4 h-4" /> Mark Dispatched
                </button>
              )}
              {(order.orderStatus === 'out_for_delivery' || (order.orderStatus === 'ready_for_dispatch' && !isDelivery)) && (
                <button onClick={() => handleUpdateStatus('delivered')} disabled={updating} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded w-full flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Mark Delivered
                </button>
              )}
              
              {['delivered', 'cancelled', 'rejected'].includes(order.orderStatus) && (
                <p className="text-sm text-neutral-500 text-center">No further actions available for this order.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Buyer Info</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">{order.buyerName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">
                    {isDelivery ? 'Delivery Requested' : 'Self-Pickup'}
                  </p>
                </div>
              </div>

              {isDelivery && order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600">{order.deliveryAddress.line1}</p>
                    <p className="text-sm text-neutral-600">{order.deliveryAddress.district}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
