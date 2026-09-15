import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ShieldCheck } from 'lucide-react';
import { ProductListItem } from '@/types';
import { formatPricePerUnit } from '@/utils/currency';
import { Badge } from '@/components/ui/Badge';
import { useAuth, useCart } from '@/hooks';
import { getOptimizedImageUrl } from '@/services/cloudinaryService';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: ProductListItem;
  loading?: boolean;
}

export function ProductCard({ product, loading }: ProductCardProps) {
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (loading) {
    return (
      <div className="card overflow-hidden animate-pulse flex flex-col h-full aspect-square p-0 border-0 bg-neutral-200" />
    );
  }

  const imageUrl = getOptimizedImageUrl(product.images?.[0], 400);
  const DEFAULT_PRODUCE_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  const inCart = items.some(item => item.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 600);
    addItem({
      productId: product.id,
      productName: product.name,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      unitPrice: product.price,
      unit: product.unit,
      quantity: 1,
      maxQuantity: product.quantity,
      imageUrl: imageUrl,
    });
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="card p-0 border border-neutral-200 overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer block w-full bg-white rounded-2xl sm:rounded-3xl shadow-xs flex flex-col aspect-square relative"
    >
      {/* Top: Image container */}
      <div className="relative w-full flex-1 min-h-0 bg-neutral-100 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCE_IMAGE;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Left: Grade Badge */}
        {product.qualityGrade && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="blue" className="bg-white shadow-xs px-2 py-0.5 text-[10px] sm:text-xs font-bold border border-neutral-200 text-neutral-800">
              <ShieldCheck className="w-3 h-3 mr-1 text-primary" />
              Grade {product.qualityGrade}
            </Badge>
          </div>
        )}

        {/* Top Right: Favorite Button */}
        <button 
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white rounded-full shadow-xs hover:bg-neutral-50 hover:scale-105 active:scale-95 transition-all z-10 border border-neutral-200"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-neutral-500")} />
        </button>

        {/* Inactive / Sold Out Overlay */}
        {product.availabilityStatus !== 'available' && (
          <div className="absolute inset-0 bg-neutral-900/70 z-20 flex items-center justify-center">
            <Badge variant="neutral" className="bg-white text-neutral-900 shadow-md uppercase font-bold tracking-wider text-[10px] sm:text-xs px-2.5 py-1">
              {product.availabilityStatus}
            </Badge>
          </div>
        )}
      </div>

      {/* Bottom Solid White Pane */}
      <div className="p-2.5 sm:p-3.5 bg-white flex items-center justify-between gap-2 border-t border-neutral-100 shrink-0">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-neutral-900 text-xs sm:text-base leading-tight truncate mb-0.5" title={product.name}>
            {product.name}
          </h3>
          <div className="font-extrabold text-primary text-xs sm:text-base leading-none">
            {formatPricePerUnit(product.price, product.unit)}
          </div>
        </div>

        {/* Add to Cart Button */}
        {product.availabilityStatus === 'available' && (
          <button
            onClick={handleAddToCart}
            disabled={inCart}
            className={cn(
              "p-2 sm:p-2.5 rounded-full border transition-all flex items-center justify-center active:scale-95 duration-200 shrink-0 shadow-xs",
              inCart 
                ? "bg-primary text-white border-primary" 
                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-primary hover:text-white hover:border-primary",
              isAddingToCart ? "scale-110" : ""
            )}
            title={inCart ? "In cart" : "Add to cart"}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </Link>
  );
}
