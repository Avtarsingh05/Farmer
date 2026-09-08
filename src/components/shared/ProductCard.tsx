import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, MapPin, ShieldCheck } from 'lucide-react';
import { ProductListItem } from '@/types';
import { formatPricePerUnit } from '@/utils/currency';
import { Badge } from '@/components/ui/Badge';
import { useAuth, useCart } from '@/hooks';
import { getProductThumbnail } from '@/services/cloudinaryService';
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
      <div className="card overflow-hidden animate-pulse flex flex-col h-full">
        <div className="aspect-[3/2] bg-neutral-200 w-full" />
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-neutral-200 rounded w-1/3" />
            <div className="h-8 bg-neutral-200 rounded w-8" />
          </div>
        </div>
      </div>
    );
  }

  const DEFAULT_PRODUCE_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  const imageUrl = product.images?.[0]?.secureUrl 
    || (product.images?.[0]?.publicId ? getProductThumbnail(product.images[0].publicId, 400) : DEFAULT_PRODUCE_IMAGE)
    || DEFAULT_PRODUCE_IMAGE;

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
      className="card overflow-hidden flex flex-col group h-full hover:shadow-md transition-shadow duration-200 cursor-pointer relative"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-100">
        <img 
          src={imageUrl} 
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCE_IMAGE;
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.qualityGrade && (
            <Badge variant="blue" className="bg-white/90 backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Grade {product.qualityGrade}
            </Badge>
          )}
        </div>
        <button 
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("w-4 h-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-neutral-500")} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-semibold text-neutral-900 line-clamp-1 flex-1" title={product.name}>
            {product.name}
          </h3>
          <Badge variant={product.availabilityStatus === 'available' ? 'green' : 'neutral'} className="capitalize shrink-0">
            {product.availabilityStatus}
          </Badge>
        </div>

        <div className="flex items-center text-sm text-neutral-600 mb-3 gap-1">
          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">
            {product.district ? `${product.district}, ${product.state}` : product.state || 'Local Farm'}
          </span>
          <span className="mx-1">·</span>
          <span className="truncate text-neutral-500">{product.farmerName}</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-3">
          <div>
            <span className="text-xs text-neutral-500 block">Price</span>
            <span className="font-bold text-neutral-900 text-lg">
              {formatPricePerUnit(product.price, product.unit)}
            </span>
          </div>

          {product.availabilityStatus === 'available' && (
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={cn(
                "p-2 rounded-lg border transition-all flex items-center justify-center active:scale-95 duration-300",
                inCart 
                  ? "bg-green-50 border-green-500 text-green-600 shadow-sm" 
                  : "bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary hover:shadow-md",
                isAddingToCart ? "animate-[bounce_0.5s_ease-in-out] bg-primary text-white border-primary" : ""
              )}
              title={inCart ? "In cart" : "Add to cart"}
            >
              <ShoppingCart className={cn("w-4 h-4 transition-transform duration-300", isAddingToCart ? "scale-110" : "")} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
