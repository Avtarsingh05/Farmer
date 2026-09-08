import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock, Box, ChevronLeft, Calendar } from 'lucide-react';
import { getFarmerProfile } from '@/services/farmerService';
import { getFarmerProducts } from '@/services/productService';
import { FarmerProfile, ProductListItem } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';

export default function FarmerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmerData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        const farmerData = await getFarmerProfile(id);
        setFarmer(farmerData);
        
        const farmerProducts = await getFarmerProducts(id);
        setProducts(farmerProducts.filter(p => p.availabilityStatus === 'available' || p.availabilityStatus === 'limited'));
      } catch (err) {
        setError('Could not load farmer profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-neutral-100 mb-10">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="skeleton w-40 h-40 rounded-full shrink-0" />
              <div className="space-y-6 w-full pt-4">
                <div className="skeleton h-10 w-1/3" />
                <div className="skeleton h-6 w-1/4" />
                <div className="skeleton h-24 w-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
               <div key={i} className="skeleton h-[350px] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-neutral-50">
        <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">?</span>
        </div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Profile Not Found</h2>
        <p className="text-neutral-600 mb-8 max-w-md text-lg">{error || 'This farmer profile is unavailable or has been removed.'}</p>
        <Link to="/farmers" className="btn-primary flex items-center gap-2 px-6 py-3">
          <ChevronLeft className="w-5 h-5" /> Back to Farmers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Cover Image Placeholder */}
      <div className="h-64 md:h-80 w-full bg-primary/10 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1586771107445-d3af111162b7?w=2000&auto=format&fit=crop&q=80"
          className="w-full h-full object-cover mix-blend-overlay opacity-50"
          alt="Farm Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 md:p-12 mb-12 animate-fade-up">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center text-4xl font-bold shrink-0 border-8 border-white shadow-lg overflow-hidden -mt-20 md:-mt-24 z-20 relative bg-neutral-100">
              <img 
                src={farmer.photoURL || farmer.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'} 
                alt={farmer.displayName || 'Farmer'} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                    {farmer.displayName || 'Independent Farmer'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-neutral-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      {[farmer.district, farmer.state].filter(Boolean).join(', ') || 'Location not provided'}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      Member since {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
                
                <div className="shrink-0">
                  {farmer.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-200 shadow-sm">
                      <ShieldCheck className="w-5 h-5" /> Verified Profile
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-bold border border-amber-200 shadow-sm">
                      <Clock className="w-5 h-5" /> Verification Pending
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-neutral-100">
                <h3 className="text-lg font-bold text-neutral-900 mb-3">About the Farm</h3>
                <p className="text-neutral-600 text-lg leading-relaxed max-w-3xl">
                  {farmer.bio || 
                   'This farmer has not provided a detailed description yet. They are a registered producer on KisanMitra, bringing fresh produce directly to the market.'}
                </p>
                {farmer.farmCount !== undefined && (
                  <div className="mt-6 flex gap-8">
                    <div className="bg-neutral-50 px-6 py-4 rounded-2xl border border-neutral-100">
                      <p className="text-sm text-neutral-500 font-medium mb-1">Total Farms</p>
                      <p className="text-2xl font-bold text-neutral-900">{farmer.farmCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Farmer's Products */}
        <div className="animate-fade-up animate-delay-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">Available Produce</h2>
            <Link to="/market" className="text-primary font-semibold hover:underline flex items-center gap-1">
              View Market <ChevronLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-100 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Box className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">No active listings</h3>
              <p className="text-neutral-500 text-lg max-w-md mx-auto">This farmer currently doesn't have any produce listed for sale. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
