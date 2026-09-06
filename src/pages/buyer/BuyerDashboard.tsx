import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getBuyerOrders } from '@/services/orderService';
import { getUserFavorites } from '@/services/favoritesService';
import { getProduct } from '@/services/productService';
import { Order, Product, OrderStatus } from '@/types';
import { ShoppingCart, Heart, ClipboardList, Store, Loader2, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const getBadgeClass = (s: OrderStatus) => {
    switch (s) {
      case 'pending': return 'badge-amber';
      case 'accepted':
      case 'processing': return 'badge-blue';
      case 'ready_for_dispatch':
      case 'out_for_delivery': return 'badge-blue';
      case 'delivered': return 'badge-green';
      case 'cancelled':
      case 'rejected': return 'badge-red';
      default: return 'badge-neutral';
    }
  };

  return (
    <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', getBadgeClass(status))}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;
        setLoading(true);
        
        const allOrders = await getBuyerOrders(user.id);
        const active = allOrders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.orderStatus));
        setActiveOrders(active.slice(0, 5));

        const userFavs = await getUserFavorites(user.id);
        const favProducts = [];
        for (const fav of userFavs.slice(0, 4)) {
          const prod = await getProduct(fav.productId);
          if (prod) favProducts.push(prod);
        }
        setFavorites(favProducts);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 container-content py-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {user?.name || 'Buyer'}!</h1>
        <p className="text-neutral-600 mt-1">Here is what's happening with your farm fresh purchases.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/buyer/search" className="card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Search className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Search Produce</span>
        </Link>
        <Link to="/buyer/orders" className="card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">My Orders</span>
        </Link>
        <Link to="/buyer/cart" className="card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
          <div className="p-3 bg-amber-50 rounded-full text-accent">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Cart</span>
        </Link>
        <Link to="/buyer/favorites" className="card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
          <div className="p-3 bg-red-50 rounded-full text-red-500">
            <Heart className="w-6 h-6" />
          </div>
          <span className="font-medium text-sm">Favorites</span>
        </Link>
      </div>

      {/* Active Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Active Orders</h2>
          <Link to="/buyer/orders" className="text-primary text-sm font-medium hover:underline flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {activeOrders.length === 0 ? (
          <div className="card p-8 text-center text-neutral-500">
            You don't have any active orders right now.
            <div className="mt-4">
              <Link to="/buyer/search" className="btn-primary text-sm">Start Shopping</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeOrders.map(order => (
              <div key={order.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">Order #{order.id.slice(0,8)}</span>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                  <div className="text-sm text-neutral-600 flex flex-wrap gap-x-4">
                    <span>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                    <span>{order.items.length} items</span>
                    <span className="font-medium text-neutral-900">₹{order.total}</span>
                  </div>
                </div>
                <div>
                  <Link to={`/buyer/orders/${order.id}`} className="btn-secondary btn-sm whitespace-nowrap w-full sm:w-auto">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Favorites */}
      {favorites.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recent Favorites</h2>
            <Link to="/buyer/favorites" className="text-primary text-sm font-medium hover:underline flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.map(product => (
              <div key={product.id} className="card overflow-hidden flex flex-col">
                <div className="aspect-square bg-neutral-100 overflow-hidden">
                  <img 
                    src={product.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-lg font-bold text-neutral-900 mt-1">₹{product.price}<span className="text-xs text-neutral-500 font-normal">/{product.unit}</span></p>
                  <Link to={`/products/${product.id}`} className="btn-secondary btn-sm mt-3 w-full text-center">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
