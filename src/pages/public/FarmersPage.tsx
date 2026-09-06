import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVerifiedFarmers } from '@/services/farmerService';
import { FarmerProfile } from '@/types';
import { useDebounce } from '@/hooks';

const FarmerCard: React.FC<{ farmer: FarmerProfile }> = ({ farmer }) => (
  <Link to={`/farmers/${farmer.userId}`} className="card p-6 hover:shadow-md transition-shadow group">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
        <img 
          src={farmer.photoURL || farmer.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'} 
          alt={farmer.displayName || 'Farmer'} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-neutral-900 truncate mb-1">
          {farmer.displayName || 'Verified Farm'}
        </h3>
        {farmer.verificationStatus === 'verified' && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium mb-2">
            <ShieldCheck className="w-4 h-4" />
            Verified Farmer
          </div>
        )}
        <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{farmer.state ? `${farmer.district}, ${farmer.state}` : 'Location not specified'}</span>
        </div>
      </div>
    </div>
    
    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
      <span className="text-neutral-500">View Profile & Produce</span>
      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
    </div>
  </Link>
);

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVerifiedFarmers();
        
        const filtered = debouncedSearch 
          ? data.filter(f => 
              f.displayName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              f.state?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              f.district?.toLowerCase().includes(debouncedSearch.toLowerCase())
            )
          : data;
          
        setFarmers(filtered);
      } catch (err) {
        setError('Failed to load farmers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Verified Farmers</h1>
          <p className="text-lg text-neutral-600 mb-8">
            Connect directly with the people growing your food. Browse our network of verified agricultural producers.
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by farm name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-12 py-3 w-full shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-4">
                  <div className="skeleton w-16 h-16 rounded-full shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No farmers found</h3>
            <p className="text-neutral-500">We couldn't find any farmers matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map((farmer) => (
              <FarmerCard key={farmer.userId} farmer={farmer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
