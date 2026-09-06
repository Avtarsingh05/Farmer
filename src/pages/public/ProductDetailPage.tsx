import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, ShieldCheck, ChevronRight, ShoppingCart, AlertCircle,
  Package, ArrowLeft, Zap, CheckCircle2, Truck, BadgePercent, Clock
} from 'lucide-react';
import { getProduct } from '@/services/productService';
import type { Product } from '@/types';
import { formatCurrency, formatPricePerUnit } from '@/utils/currency';
import { useAuth, useCart } from '@/hooks';
import { getProductThumbnail } from '@/services/cloudinaryService';
import { getMandiBenchmark } from '@/services/mockStore';
import { Badge } from '@/components/ui/Badge';

const QUALITY_LABELS: Record<string, string> = {
  A: 'Grade A', B: 'Grade B', C: 'Grade C', mixed: 'Mixed',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, getItem } = useCart();
  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProduct(id)
      .then((data) => {
        if (!data) setError('Product not found.');
        else { setProduct(data); }
      })
      .catch(() => setError('Unable to load product. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId:   product.id,
      productName: product.name,
      farmerId:    product.farmerId,
      farmerName:  product.farmerName,
      unitPrice:   product.price,
      unit:        product.unit,
      quantity,
      maxQuantity: product.quantity,
      imageUrl:    product.images?.[0]?.secureUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  function handleBuyNow() {
    if (!product) return;
    handleAddToCart();
    navigate('/buyer/cart');
  }

  if (loading) {
    return (
      <div className="container-content py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-[4/3] bg-neutral-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="h-10 bg-neutral-200 rounded w-1/3" />
            <div className="h-24 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-content py-16 text-center">
        <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Product not found</h1>
        <p className="text-neutral-600 mb-6">{error ?? 'This product may no longer be available.'}</p>
        <Link to="/market" className="btn-primary btn">
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </Link>
      </div>
    );
  }

  const DEFAULT_PRODUCE_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=80';
  const primaryImage = product.images?.[0];
  const imageUrl = primaryImage?.secureUrl
    || (primaryImage?.publicId ? getProductThumbnail(primaryImage.publicId, 800) : DEFAULT_PRODUCE_IMAGE)
    || DEFAULT_PRODUCE_IMAGE;
  const isAvailable = ['available', 'limited'].includes(product.availabilityStatus);
  const cartItem = getItem(product.id);
  const mandi = getMandiBenchmark(product.id);
  const savings = mandi && mandi.modalPrice > product.price ? mandi.modalPrice - product.price : null;

  return (
    <div className="container-content py-6 md:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500 mb-6">
        <Link to="/market" className="hover:text-primary">Market</Link>
        <ChevronRight className="w-4 h-4" />
        {product.categoryName && (
          <>
            <span className="text-neutral-500">{product.categoryName}</span>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-neutral-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden shadow-sm">
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCE_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src={img.secureUrl || (img.publicId ? getProductThumbnail(img.publicId, 200) : DEFAULT_PRODUCE_IMAGE)}
                    alt={`${product.name} image ${i + 2}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCE_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details & Buy Panel */}
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`badge-${product.availabilityStatus === 'available' ? 'green' : product.availabilityStatus === 'limited' ? 'amber' : 'red'}`}>
                {product.availabilityStatus === 'available' ? 'In Stock' : product.availabilityStatus === 'limited' ? 'Limited Stock' : 'Out of Stock'}
              </span>
              <span className="badge-neutral">{QUALITY_LABELS[product.qualityGrade] || 'Grade A'}</span>
              {product.district && (
                <span className="badge-neutral flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {product.district}, {product.state}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{product.name}</h1>
          </div>

          {/* Price & Mandi Benchmark Comparison */}
          <div className="border border-neutral-200 rounded-xl p-5 bg-gradient-to-b from-white to-neutral-50/70 shadow-sm space-y-3">
            <div className="flex justify-between items-baseline flex-wrap gap-2">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Farmer Asking Price</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                  {formatPricePerUnit(product.price, product.unit)}
                </span>
              </div>
              {savings && savings > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <BadgePercent className="w-3.5 h-3.5" />
                  Save ₹{savings}/{product.unit} direct
                </span>
              )}
            </div>

            {mandi ? (
              <div className="pt-3 border-t border-neutral-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-neutral-600 font-medium">Mandi APMC Benchmark:</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{mandi.modalPrice} / {mandi.unit} ({mandi.mandiName})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 flex-wrap gap-1">
                  <span>Mandi Range: ₹{mandi.minPrice} – ₹{mandi.maxPrice} / {mandi.unit}</span>
                  <span className="text-neutral-400">Source: {mandi.source}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                Direct farm-gate price set directly by verified grower. Zero broker cut.
              </p>
            )}
          </div>

          {/* Farmer Card */}
          <Link
            to={`/farmers/${product.farmerId}`}
            className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-primary-300 bg-white transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-base shrink-0 group-hover:bg-primary-200 transition-colors">
              {product.farmerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-neutral-900 text-sm">{product.farmerName}</p>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Verified farmer" />
              </div>
              {product.district && (
                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  {product.district}{product.state ? `, ${product.state}` : ''}
                </p>
              )}
            </div>
            <span className="text-xs text-primary font-medium group-hover:underline">View Farm →</span>
          </Link>

          {/* Quantity Selector & Action Buttons */}
          {isAvailable && (
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-semibold text-neutral-800">Quantity ({product.unit})</label>
                  <span className="text-xs text-neutral-500">
                    {product.quantity} {product.unit} available
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-40 font-bold"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setQuantity(Math.max(1, Math.min(product.quantity, val)));
                      }}
                      className="w-16 h-10 text-center font-bold text-neutral-900 border-x border-neutral-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-40 font-bold"
                      aria-label="Increase quantity"
                      disabled={quantity >= product.quantity}
                    >+</button>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {[5, 10, 25].filter(preset => preset <= product.quantity).map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                          quantity === preset
                            ? 'border-primary bg-primary-50 text-primary font-bold shadow-sm'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        {preset} {product.unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Subtotal */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary-50/60 border border-primary-100">
                <span className="text-sm text-neutral-700 font-medium">Subtotal ({quantity} {product.unit}):</span>
                <span className="font-extrabold text-xl text-primary">
                  {formatCurrency(product.price * quantity)}
                </span>
              </div>

              {/* Action Buttons: Buy Now + Add to Cart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn-primary btn-lg w-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-bold text-base py-3.5"
                >
                  <Zap className="w-5 h-5 fill-current text-amber-300" />
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`btn-lg w-full flex items-center justify-center gap-2 font-semibold transition-all py-3.5 rounded-lg border ${
                    added
                      ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                      : cartItem
                      ? 'bg-primary-50 border-primary text-primary'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Added to Cart!
                    </>
                  ) : cartItem ? (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      In Cart ({cartItem.quantity} {product.unit})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Trust & Guarantee Badges */}
              <div className="grid grid-cols-2 gap-2 pt-3 text-xs text-neutral-600 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>Direct Farm Dispatch (24–48h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Direct Farmer Gate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Harvested on fresh schedule</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BadgePercent className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cash on Delivery & UPI</span>
                </div>
              </div>
            </div>
          )}

          {!isAvailable && (
            <div className="bg-neutral-100 rounded-lg p-4 text-center text-neutral-600 text-sm">
              This product is currently unavailable.
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-semibold text-neutral-900 mb-2">About this produce</h2>
              <p className="text-neutral-700 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
