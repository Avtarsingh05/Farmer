import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getUserFavorites, removeFavorite } from '@/services/favoritesService';
import { getProduct } from '@/services/productService';
import { Product } from '@/types';
import { Loader2, Heart, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (!user) return;
        setLoading(true);
        const userFavs = await getUserFavorites(user.uid);
        const products = [];
        for (const fav of userFavs) {
          const product = await getProduct(fav.productId);
          if (product) {
            products.push(product);
          }
        }
        setFavorites(products);
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [user]);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    const confirm = window.confirm("Remove this item from favorites?");
    if (!confirm) return;
    try {
      await removeFavorite(user.uid, productId);
      setFavorites(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error("Failed to remove favorite", err);
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
    <div className="container-content py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <Heart className="w-12 h-12 text-neutral-300 mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No saved products yet</h2>
          <p className="text-neutral-500 mb-6 max-w-md">Browse the market and click the heart icon to save your favorite fresh produce.</p>
          <Link to="/buyer/search" className="btn-primary">Browse Market</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(product => (
            <div key={product.id} className="card overflow-hidden flex flex-col relative group">
              <button 
                onClick={() => handleRemove(product.id)}
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-red-500 rounded-full shadow-sm z-10 transition-colors"
                title="Remove from favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="aspect-square bg-neutral-100 overflow-hidden">
                <img 
                  src={product.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">{product.categoryName}</p>
                <h3 className="font-medium text-neutral-900 line-clamp-1 flex-1">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-bold text-neutral-900">₹{product.price}<span className="text-xs text-neutral-500 font-normal">/{product.unit}</span></p>
                </div>
                <Link to={`/products/${product.id}`} className="btn-secondary btn-sm w-full text-center mt-3">View Product</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
