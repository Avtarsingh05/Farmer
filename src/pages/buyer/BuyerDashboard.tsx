import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { getBuyerOrders } from '@/services/orderService';
import { getUserFavorites } from '@/services/favoritesService';
import { getProduct } from '@/services/productService';
import { Order, Product, OrderStatus } from '@/types';
import { ShoppingCart, Heart, ClipboardList, Store, Loader2, ChevronRight, Search, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const getBadgeClass = (s: OrderStatus) => {
    switch (s) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accepted':
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready_for_dispatch':
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <span className={cn('px-3 py-1 text-xs font-bold rounded-full capitalize border shadow-sm', getBadgeClass(status))}>
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 container-content py-8 pb-20">
      {/* Welcoming Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-900 p-8 sm:p-12 shadow-xl animate-fade-up" style={{ animationDelay: '0ms' }}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Store className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Welcome back, {user?.name || 'Buyer'}!
          </h1>
          <p className="text-emerald-50 text-lg sm:text-xl font-medium opacity-90 max-w-xl leading-relaxed">
            Discover the freshest farm produce directly from the fields to your table. Support local farmers today.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/buyer/search" className="bg-white text-primary px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              <Search className="w-5 h-5" /> Explore Market
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
        {[
          { to: "/buyer/search", icon: Search, label: "Search Produce", color: "text-primary", bg: "bg-primary/10", border: "hover:border-primary" },
          { to: "/buyer/orders", icon: ClipboardList, label: "My Orders", color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-500" },
          { to: "/buyer/cart", icon: ShoppingCart, label: "Shopping Cart", color: "text-accent", bg: "bg-amber-50", border: "hover:border-accent" },
          { to: "/buyer/favorites", icon: Heart, label: "Favorites", color: "text-red-500", bg: "bg-red-50", border: "hover:border-red-500" },
        ].map((action, idx) => (
          <Link key={idx} to={action.to} className={cn("bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm border border-neutral-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300", action.border)}>
            <div className={cn("p-4 rounded-2xl", action.bg, action.color)}>
              <action.icon className="w-8 h-8" />
            </div>
            <span className="font-bold text-neutral-700">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Active Orders Section */}
      <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Active Orders</h2>
            <p className="text-neutral-500 text-sm mt-1">Track your ongoing deliveries</p>
          </div>
          <Link to="/buyer/orders" className="text-primary text-sm font-bold hover:text-primary/80 flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-full transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Clock className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No Active Orders</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">You don't have any ongoing deliveries right now. Time to stock up on fresh veggies!</p>
            <Link to="/buyer/search" className="btn-primary rounded-full px-8 py-3">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-6 pt-2 px-2 -mx-2 snap-x snap-mandatory hide-scrollbar">
            {activeOrders.map(order => (
              <div key={order.id} className="snap-start shrink-0 w-[340px] sm:w-[400px] bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200">
                      <span className="font-mono font-bold text-neutral-700 text-sm">#{order.id.slice(0,8)}</span>
                    </div>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Placed on</span>
                      <span className="font-semibold text-neutral-800">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Items</span>
                      <span className="font-semibold text-neutral-800">{order.items.length} products</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-dashed border-neutral-200">
                      <span className="font-bold text-neutral-700">Total</span>
                      <span className="font-extrabold text-primary text-lg">₹{order.total}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/buyer/orders/${order.id}`} className="w-full bg-neutral-50 text-neutral-700 font-bold py-3 rounded-xl text-center group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
                  Track Delivery <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Favorites Section - Masonry-like grid */}
      {favorites.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-between items-end mb-6 px-2">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Your Favorites</h2>
              <p className="text-neutral-500 text-sm mt-1">Quick access to produce you love</p>
            </div>
            <Link to="/buyer/favorites" className="text-primary text-sm font-bold hover:text-primary/80 flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-full transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product, idx) => (
              <Link to={`/products/${product.id}`} key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-500">
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                  <img 
                    src={product.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-500 shadow-sm">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-neutral-800 line-clamp-1 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-extrabold text-neutral-900">₹{product.price}</span>
                    <span className="text-sm text-neutral-500 font-medium mb-1">/{product.unit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
