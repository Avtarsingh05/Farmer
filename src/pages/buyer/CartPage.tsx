import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '@/hooks';
import { useToast } from '@/components/ui/Toast';
import type { CartItem } from '@/types';
import {
  ShoppingCart, Trash2, Loader2, Minus, Plus, AlertCircle,
  CheckCircle2, ShieldCheck, ArrowRight, Banknote, Smartphone,
  Truck, Store, Sparkles, MapPin, CreditCard
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrder } from '@/services/orderService';
import { formatCurrency, formatPricePerUnit } from '@/utils/currency';
import { getPlatformSettings } from '@/services/settingsService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

const deliveryAddressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  line1: z.string().min(5, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit pincode required'),
});

type DeliveryFormData = z.infer<typeof deliveryAddressSchema>;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, itemCount, total, removeItem, updateQty, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'razorpay'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      line1: '',
      line2: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    }
  });

  const platformSettings = getPlatformSettings();
  const isFreeDelivery = total >= platformSettings.freeDeliveryThreshold;
  const deliveryFee = deliveryType === 'delivery' 
    ? (isFreeDelivery ? 0 : platformSettings.deliveryFlatFee) 
    : 0;
  const finalTotal = total + deliveryFee;

  // Group items by farmer
  const groupedItems = items.reduce((acc: Record<string, CartItem[]>, item: CartItem) => {
    const fid = item.farmerId || 'farmer-direct';
    if (!acc[fid]) acc[fid] = [];
    acc[fid].push(item);
    return acc;
  }, {});

  const handleQuickFill = () => {
    setValue('name', user?.name || 'Priya Sharma');
    setValue('phone', '9812345678');
    setValue('line1', 'Flat 402, Green Acre Heights, Pali Hill');
    setValue('line2', 'Near Bandra Police Station');
    setValue('city', 'Mumbai');
    setValue('state', 'Maharashtra');
    setValue('pincode', '400050');
  };

  const executeOrderCreation = async (data: DeliveryFormData, paymentId?: string) => {
    const buyerId = user?.uid || user?.id || 'buyer-' + Date.now();
    const buyerName = data.name || user?.name || 'Verified Buyer';

    const farmerIds = Object.keys(groupedItems);
    let lastCreatedOrderId = '';

    for (const farmerId of farmerIds) {
      const farmerItems = groupedItems[farmerId];
      const farmerName = farmerItems[0]?.farmerName || 'Verified Farmer';
      
      let paymentText = 'Cash on Delivery (COD)';
      if (paymentMethod === 'razorpay') {
        paymentText = `Paid via Razorpay (Txn: ${paymentId})`;
      }

      const newId = await createOrder({
        buyerId,
        buyerName,
        farmerId,
        farmerName,
        items: farmerItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          subtotal: item.quantity * item.unitPrice
        })),

        
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? {
          name: data.name,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || undefined,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        } : undefined,
        notes: `Payment: ${paymentText} — Direct farm-to-table delivery`,
      });

      lastCreatedOrderId = newId;
    }

    clearCart();
    setPlacedOrderId(lastCreatedOrderId);
  };

  const handlePlaceOrder = async (data: DeliveryFormData) => {
    if (items.length === 0) return;

    try {
      setIsPlacingOrder(true);
      setError(null);

      if (paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Razorpay SDK failed to load. Are you offline?');
          setIsPlacingOrder(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_TEST_KEY || 'rzp_test_YourFallbackKey',
          amount: Math.round(finalTotal * 100), // amount in paisa
          currency: 'INR',
          name: 'KisanMitra',
          description: 'Farm fresh produce purchase',
          handler: async function (response: any) {
            try {
              setIsPlacingOrder(true);
              await executeOrderCreation(data, response.razorpay_payment_id);
            } catch (err: any) {
              setError(err.message || 'Error saving order after payment.');
            } finally {
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: data.name || user?.name || '',
            contact: data.phone || user?.phone || '',
          },
          theme: {
            color: '#16a34a'
          },
          modal: {
            ondismiss: function() {
              setIsPlacingOrder(false);
              setError('Payment cancelled by user.');
              toast({ type: 'warning', message: 'Payment cancelled.' });
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(`Payment Failed: ${response.error.description}`);
          toast({ type: 'error', message: `Payment Failed: ${response.error.description}` });
          setIsPlacingOrder(false);
        });
        rzp.open();
      } else {
        await executeOrderCreation(data);
        setIsPlacingOrder(false);
      }
    } catch (err: unknown) {
      console.error('Failed to place order:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'An error occurred while placing the order.');
      setIsPlacingOrder(false);
    }
  };

  // Order Success Screen
  if (placedOrderId) {
    return (
      <div className="container-content py-20 max-w-2xl text-center animate-fade-up">
        <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 shadow-xl shadow-emerald-100">
          <CheckCircle2 className="w-14 h-14" />
        </div>
        <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">Order Confirmed!</h1>
        <p className="text-neutral-500 text-lg mb-10 max-w-lg mx-auto">
          Your direct farm harvest order <strong className="text-neutral-900 font-mono bg-neutral-100 px-2 py-1 rounded">#{placedOrderId}</strong> has been sent to the farmer.
        </p>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100 text-left space-y-4 mb-10 transform hover:-translate-y-1 transition-transform">
          <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-4 mb-4">Order Summary</h3>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Payment</span>
            <span className="font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
              {paymentMethod === 'razorpay' ? 'Paid Online' : 'Pay on Delivery'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500 font-medium">Method</span>
            <span className="font-bold text-neutral-800 capitalize flex items-center gap-1">
              {deliveryType === 'delivery' ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              {deliveryType}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-dashed border-neutral-200 pt-4 mt-2">
            <span className="font-bold text-neutral-900">Total Payable</span>
            <span className="font-extrabold text-2xl text-primary">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/buyer/orders')}
            className="bg-neutral-900 text-white px-8 py-4 rounded-full font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            Track Order <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/market"
            className="bg-white border-2 border-neutral-200 text-neutral-800 px-8 py-4 rounded-full font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="container-content py-24 flex flex-col items-center justify-center text-center animate-fade-up">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
          <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-neutral-100 rotate-3">
            <ShoppingCart className="w-14 h-14 text-neutral-300 -rotate-3" />
          </div>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-neutral-500 text-lg mb-10 max-w-md">
          Explore fresh produce straight from verified farms across India with transparent pricing.
        </p>
        <Link to="/market" className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-2">
          Browse Farm Market <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-content py-8 sm:py-12 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm font-bold text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1 bg-neutral-100 px-4 py-2 rounded-full w-fit"
        >
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 border border-red-100 shadow-sm animate-fade-up">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Grouped Items */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {Object.keys(groupedItems).map((farmerId, idx) => {
            const farmerGroup = groupedItems[farmerId];
            const farmerName = farmerGroup[0]?.farmerName || 'Verified Farm';

            return (
              <div key={farmerId} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Farmer Group Header */}
                <div className="px-6 py-4 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-neutral-800">
                      Dispatched by <span className="text-neutral-900">{farmerName}</span>
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Farm Direct
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-50">
                  {farmerGroup.map((item) => (
                    <div key={item.productId} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-neutral-50/50 transition-colors">
                      <div className="w-full sm:w-28 aspect-square bg-neutral-100 rounded-2xl overflow-hidden shrink-0 border border-neutral-200/50">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link
                              to={`/products/${item.productId}`}
                              className="font-extrabold text-neutral-900 text-lg sm:text-xl line-clamp-1 hover:text-primary transition-colors mb-1"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-neutral-500 font-medium">
                              {formatPricePerUnit(item.unitPrice, item.unit)}
                            </p>
                          </div>
                          <span className="font-extrabold text-neutral-900 text-xl">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        {/* Quantity & Delete */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-neutral-100 rounded-xl overflow-hidden p-1">
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-neutral-600 hover:text-primary transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-sm font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-neutral-600 hover:text-primary transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="flex items-center gap-1.5 text-sm font-bold text-neutral-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Panel */}
        <div className="lg:col-span-5 xl:col-span-4 relative">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 sticky top-24 shadow-2xl shadow-neutral-200/50 border border-neutral-100 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-extrabold text-neutral-900 mb-6">
              Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-neutral-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 font-medium">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">FREE</strong> : <span className="font-bold text-neutral-900">{formatCurrency(deliveryFee)}</span>}</span>
              </div>
              <div className="border-t border-dashed border-neutral-200 pt-4 flex justify-between items-end">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="font-black text-3xl text-primary">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-6">
              {/* Delivery Type Switch */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  How to get it?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={cn(
                      "py-3 px-4 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all border-2",
                      deliveryType === 'delivery'
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-neutral-100 text-neutral-500 hover:border-neutral-200 bg-white"
                    )}
                  >
                    <Truck className={cn("w-6 h-6", deliveryType === 'delivery' ? "text-primary" : "text-neutral-400")} />
                    <span>Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={cn(
                      "py-3 px-4 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all border-2",
                      deliveryType === 'pickup'
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-neutral-100 text-neutral-500 hover:border-neutral-200 bg-white"
                    )}
                  >
                    <Store className={cn("w-6 h-6", deliveryType === 'pickup' ? "text-primary" : "text-neutral-400")} />
                    <span>Farm Pickup</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Switch */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Payment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      "py-3 px-4 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all border-2",
                      paymentMethod === 'cod'
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-neutral-100 text-neutral-500 hover:border-neutral-200 bg-white"
                    )}
                  >
                    <Banknote className={cn("w-6 h-6", paymentMethod === 'cod' ? "text-primary" : "text-neutral-400")} />
                    <span>Cash / COD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={cn(
                      "py-3 px-4 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all border-2",
                      paymentMethod === 'razorpay'
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-neutral-100 text-neutral-500 hover:border-neutral-200 bg-white"
                    )}
                  >
                    <CreditCard className={cn("w-6 h-6", paymentMethod === 'razorpay' ? "text-primary" : "text-neutral-400")} />
                    <span>Pay Online (Razorpay)</span>
                  </button>
                </div>
              </div>

              {/* Address Form (if Delivery) */}
              {deliveryType === 'delivery' && (
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-700">
                      <MapPin className="w-4 h-4" />
                      <h3 className="font-bold text-sm">Shipping Address</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-fill
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        {...register('name')}
                        placeholder="Full Name"
                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      {errors.name && <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <input
                        {...register('phone')}
                        placeholder="Phone Number"
                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      {errors.phone && <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <input
                        {...register('line1')}
                        placeholder="Flat, Building, Street"
                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      {errors.line1 && <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.line1.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          {...register('city')}
                          placeholder="City"
                          className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {errors.city && <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <input
                          {...register('pincode')}
                          placeholder="PIN Code"
                          className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {errors.pincode && <p className="text-xs font-bold text-red-500 mt-1.5 ml-1">{errors.pincode.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full bg-primary text-white rounded-2xl py-4 text-lg font-extrabold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
              >
                {isPlacingOrder ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Processing...
                  </span>
                ) : (
                  `Checkout • ${formatCurrency(finalTotal)}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
