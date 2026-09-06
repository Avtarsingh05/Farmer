import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock, Box } from 'lucide-react';
import { getFarmerProfile } from '@/services/farmerService';
import { getFarmerProducts } from '@/services/productService';
import { FarmerProfile, ProductListItem } from '@/types';

const SimpleProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
  <Link to={`/products/${product.id}`} className="card p-4 hover:shadow-md transition-all group block">
    <div className="aspect-square bg-neutral-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
      <img 
        src={product.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
        }}
      />
    </div>
    <div>
      <h4 className="font-medium text-neutral-900 truncate">{product.name}</h4>
      <p className="text-sm text-neutral-500 mb-2">{product.categoryName || product.category || ''}</p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-primary">₹{product.price}/{product.unit}</span>
        {product.availabilityStatus === 'available' ? (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">In Stock</span>
        ) : (
          <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">Out</span>
        )}
      </div>
    </div>
  </Link>
);

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
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="skeleton w-32 h-32 rounded-full shrink-0" />
              <div className="space-y-4 w-full">
                <div className="skeleton h-8 w-1/3" />
                <div className="skeleton h-5 w-1/4" />
                <div className="skeleton h-20 w-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
               <div key={i} className="skeleton h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Profile Not Found</h2>
        <p className="text-neutral-600 mb-6">{error || 'This farmer profile is unavailable.'}</p>
        <Link to="/farmers" className="btn-primary">Browse All Farmers</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold shrink-0 border-4 border-white shadow-md overflow-hidden">
              <img 
                src={farmer.photoURL || farmer.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'} 
                alt={farmer.displayName || 'Farmer'} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">
                  {farmer.displayName || 'Independent Farmer'}
                </h1>
                {farmer.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium w-fit">
                    <ShieldCheck className="w-4 h-4" /> Verified Farmer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium w-fit">
                    <Clock className="w-4 h-4" /> Verification Pending
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-neutral-600 mb-6">
                <MapPin className="w-4 h-4" />
                <span>
                  {[farmer.district, farmer.state]
                    .filter(Boolean)
                    .join(', ') || 'Location details not provided'}
                </span>
              </div>
              
              <div className="prose prose-neutral max-w-none text-neutral-700">
                <h3 className="text-sm uppercase tracking-wider text-neutral-500 font-semibold mb-2">About the Farm</h3>
                <p>
                  {farmer.bio || 
                   'This farmer has not provided a detailed description yet. They are a registered producer on KisanMitra, bringing fresh produce directly to the market.'}
                </p>
                {farmer.farmCount !== undefined && (
                  <p className="mt-2 text-sm">
                    <strong>Farm Count:</strong> {farmer.farmCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Farmer's Products */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Available Produce</h2>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Box className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No active listings</h3>
              <p className="text-neutral-500">This farmer currently doesn't have any produce listed for sale.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <SimpleProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
