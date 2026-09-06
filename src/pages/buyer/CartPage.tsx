import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '@/hooks';
import type { CartItem } from '@/types';
import {
  ShoppingCart, Trash2, Loader2, Minus, Plus, AlertCircle,
  CheckCircle2, ShieldCheck, ArrowRight, Banknote, Smartphone,
  Truck, Store, Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrder } from '@/services/orderService';
import { formatCurrency, formatPricePerUnit } from '@/utils/currency';
import { getPlatformSettings } from '@/services/settingsService';

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

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, itemCount, total, removeItem, updateQty, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
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

  const handlePlaceOrder = async (data: DeliveryFormData) => {
    if (items.length === 0) return;

    try {
      setIsPlacingOrder(true);
      setError(null);

      const buyerId = user?.uid || user?.id || 'buyer-' + Date.now();
      const buyerName = data.name || user?.name || 'Verified Buyer';

      const farmerIds = Object.keys(groupedItems);
      let lastCreatedOrderId = '';

      for (const farmerId of farmerIds) {
        const farmerItems = groupedItems[farmerId];
        const farmerName = farmerItems[0]?.farmerName || 'Verified Farmer';

        const newId = await createOrder({
          buyerId,
          buyerName,
          farmerId,
          farmerName,
          items: farmerItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            subtotal: item.unitPrice * item.quantity,
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
          notes: `Payment: ${paymentMethod === 'upi' ? 'UPI (Verified)' : 'Cash on Delivery (COD)'} · Direct farm-to-table delivery`,
        });

        lastCreatedOrderId = newId;
      }

      clearCart();
      setPlacedOrderId(lastCreatedOrderId);
    } catch (err: unknown) {
      console.error('Failed to place order:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Order Success Screen
  if (placedOrderId) {
    return (
      <div className="container-content py-16 max-w-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">Order Confirmed!</h1>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          Your direct farm harvest order <strong className="text-neutral-900 font-mono">#{placedOrderId}</strong> has been transmitted directly to the farmer. You will receive real-time dispatch and harvesting status updates.
        </p>

        <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 text-left text-sm space-y-2 mb-8">
          <div className="flex justify-between">
            <span className="text-neutral-500">Order Reference:</span>
            <span className="font-mono font-bold text-neutral-900">{placedOrderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Payment Status:</span>
            <span className="font-semibold text-emerald-700">
              {paymentMethod === 'upi' ? 'Paid via UPI' : 'Pay on Delivery (COD)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Delivery Method:</span>
            <span className="font-semibold text-neutral-800 capitalize">{deliveryType}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-base">
            <span>Total Payable:</span>
            <span className="text-primary">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/buyer/orders')}
            className="btn-primary btn-lg inline-flex items-center justify-center gap-2"
          >
            Track Order Status <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/market"
            className="btn-secondary btn-lg inline-flex items-center justify-center"
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
      <div className="container-content py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-400">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
        <p className="text-neutral-500 mb-8 max-w-md">
          Explore fresh produce straight from verified farms across India with transparent pricing.
        </p>
        <Link to="/market" className="btn-primary btn-lg inline-flex items-center gap-2 shadow-md">
          Browse Farm Market <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-content py-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Direct harvest items dispatched from farm origin.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-neutral-500 hover:text-red-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Grouped Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.keys(groupedItems).map((farmerId) => {
            const farmerGroup = groupedItems[farmerId];
            const farmerName = farmerGroup[0]?.farmerName || 'Verified Farm';

            return (
              <div key={farmerId} className="card p-0 overflow-hidden shadow-sm border border-neutral-200">
                {/* Farmer Group Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-neutral-800 text-sm">
                      Produce from: <strong className="text-neutral-900">{farmerName}</strong>
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    Direct Farm Gate
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100">
                  {farmerGroup.map((item) => (
                    <div key={item.productId} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <Link
                              to={`/products/${item.productId}`}
                              className="font-bold text-neutral-900 text-base sm:text-lg line-clamp-1 hover:text-primary transition-colors"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-neutral-500 text-xs sm:text-sm">
                              {formatPricePerUnit(item.unitPrice, item.unit)}
                            </p>
                          </div>
                          <span className="font-extrabold text-neutral-900 text-base sm:text-lg">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        {/* Quantity & Delete */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                              className="p-1.5 sm:p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.quantity + 1)}
                              className="p-1.5 sm:p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-neutral-400 hover:text-red-500 p-2 rounded-md transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Produce Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Direct Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-semibold">FREE (Pickup)</strong> : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between font-extrabold text-xl text-neutral-900">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-5">
              {/* Delivery Type Switch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                  Delivery Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-primary bg-primary-50 text-primary shadow-sm'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Delivery ({isFreeDelivery ? 'FREE' : formatCurrency(platformSettings.deliveryFlatFee)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-primary bg-primary-50 text-primary shadow-sm'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    Farm Pickup
                  </button>
                </div>
              </div>

              {/* Payment Method Switch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary-50 text-primary shadow-sm'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary-50 text-primary shadow-sm'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    UPI / QR
                  </button>
                </div>
              </div>

              {/* Address Form (if Delivery) */}
              {deliveryType === 'delivery' && (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-neutral-700 uppercase tracking-wider">
                      Shipping Details
                    </h3>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Quick Demo Fill
                    </button>
                  </div>

                  <div>
                    <input
                      {...register('name')}
                      placeholder="Receiver's Full Name"
                      className="form-input text-sm py-2"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <input
                      {...register('phone')}
                      placeholder="10-digit Phone Number"
                      className="form-input text-sm py-2"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <input
                      {...register('line1')}
                      placeholder="Address Line 1 (Flat, Building, Street)"
                      className="form-input text-sm py-2"
                    />
                    {errors.line1 && <p className="text-xs text-red-600 mt-1">{errors.line1.message}</p>}
                  </div>

                  <div>
                    <input
                      {...register('line2')}
                      placeholder="Landmark (Optional)"
                      className="form-input text-sm py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        {...register('city')}
                        placeholder="City"
                        className="form-input text-sm py-2"
                      />
                      {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register('state')}
                        placeholder="State"
                        className="form-input text-sm py-2"
                      />
                      {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
                    </div>
                  </div>

                  <div>
                    <input
                      {...register('pincode')}
                      placeholder="6-digit PIN Code"
                      className="form-input text-sm py-2"
                    />
                    {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
              )}

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isPlacingOrder ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting Order...
                  </span>
                ) : (
                  `Place Order • ${formatCurrency(finalTotal)}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
