import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getOrder, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { ArrowLeft, Loader2, CheckCircle, Package, Truck, Home, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getOrder(id);
        if (data && data.buyerId === user?.id) {
          setOrder(data as Order);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Error loading order", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, user]);

  const handleCancelOrder = async () => {
    if (!order || order.orderStatus !== 'pending') return;
    const confirm = window.confirm("Are you sure you want to cancel this order?");
    if (!confirm) return;

    try {
      setCancelling(true);
      const uid = user?.uid || user?.id || '';
      await updateOrderStatus(order.id, uid, 'buyer', 'cancelled');
      setOrder({ ...order, orderStatus: 'cancelled' } as Order);
    } catch (err) {
      console.error("Failed to cancel order", err);
      alert("Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-content py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-neutral-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/buyer/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  // Define steps for progress
  const steps = ['pending', 'accepted', 'processing', 'ready_for_dispatch', 'out_for_delivery', 'delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = ['cancelled', 'rejected'].includes(order.orderStatus);

  return (
    <div className="space-y-6 container-content py-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-neutral-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Placed on {format((order.createdAt as any).toDate ? (order.createdAt as any).toDate() : new Date(order.createdAt), 'MMMM dd, yyyy h:mm a')}
          </p>
        </div>
        {order.orderStatus === 'pending' && (
          <button 
            onClick={handleCancelOrder} 
            disabled={cancelling}
            className="btn-danger btn-sm whitespace-nowrap self-start md:self-auto"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Cancel Order
          </button>
        )}
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="card p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-200 z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500"
                style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` }}
              ></div>

              {[
                { key: 'pending', label: 'Order Placed', icon: Package },
                { key: 'processing', label: 'Processing', icon: Package },
                { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
                { key: 'delivered', label: 'Delivered', icon: Home }
              ].map((step, idx) => {
                let stepPassed = false;
                if (step.key === 'pending') stepPassed = currentStepIndex >= 0;
                if (step.key === 'processing') stepPassed = currentStepIndex >= 1;
                if (step.key === 'out_for_delivery') stepPassed = currentStepIndex >= 4;
                if (step.key === 'delivered') stepPassed = currentStepIndex >= 5;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors",
                      stepPassed ? "bg-primary text-white" : "bg-neutral-200 text-neutral-400"
                    )}>
                      {stepPassed ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      stepPassed ? "text-primary" : "text-neutral-400"
                    )}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="card p-4 border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">This order was {order.orderStatus}.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h3 className="font-bold text-neutral-900">Order Items</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                     <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">IMG</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900">{item.productName}</h4>
                    <p className="text-sm text-neutral-500">₹{item.unitPrice} / {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">₹{item.unitPrice * item.quantity}</p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-4 space-y-4">
            <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹{order.total - (order.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {order.deliveryType === 'delivery' && order.deliveryAddress && (
            <div className="card p-4 space-y-4">
              <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Delivery Information</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.deliveryAddress.name}</p>
                <p className="text-neutral-600">{order.deliveryAddress.line1}</p>
                {order.deliveryAddress.line2 && <p className="text-neutral-600">{order.deliveryAddress.line2}</p>}
                <p className="text-neutral-600">{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
                <p className="text-neutral-600 mt-2">Phone: {order.deliveryAddress.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
