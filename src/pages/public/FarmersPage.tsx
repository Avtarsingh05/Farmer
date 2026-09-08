import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShieldCheck, ChevronRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVerifiedFarmers } from '@/services/farmerService';
import { FarmerProfile } from '@/types';
import { useDebounce } from '@/hooks';

const FarmerCard: React.FC<{ farmer: FarmerProfile, delay: number }> = ({ farmer, delay }) => (
  <Link 
    to={`/farmers/${farmer.userId}`} 
    className={`card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group block bg-white border border-neutral-200 animate-fade-up animate-delay-${delay}`}
  >
    <div className="flex items-start gap-5">
      <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden shadow-sm border-2 border-white ring-1 ring-neutral-100">
        <img 
          src={farmer.photoURL || farmer.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'} 
          alt={farmer.displayName || 'Farmer'} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
          }}
        />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="font-bold text-xl text-neutral-900 truncate mb-1.5 group-hover:text-primary transition-colors">
          {farmer.displayName || 'Verified Farm'}
        </h3>
        {farmer.verificationStatus === 'verified' && (
          <div className="flex items-center gap-1.5 text-green-700 bg-green-50 w-fit px-2 py-0.5 rounded-full text-xs font-semibold mb-2.5 border border-green-200/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Farmer
          </div>
        )}
        <div className="flex items-center gap-2 text-neutral-600 text-sm">
          <MapPin className="w-4 h-4 shrink-0 text-neutral-400" />
          <span className="truncate font-medium">{farmer.state ? `${farmer.district}, ${farmer.state}` : 'Location not specified'}</span>
        </div>
      </div>
    </div>
    
    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-sm font-medium">
      <span className="text-primary group-hover:underline">View Profile & Produce</span>
      <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  </Link>
);

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 400);

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
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* Hero */}
      <section className="bg-white border-b border-neutral-200 pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20 hidden lg:block" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 animate-fade-up">
            <Users className="w-8 h-8 -rotate-3" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 animate-fade-up animate-delay-100">
            Meet Our Verified Farmers
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-10 animate-fade-up animate-delay-200">
            Connect directly with the people growing your food. Browse our network of trusted agricultural producers across India.
          </p>
          
          <div className="relative max-w-2xl mx-auto animate-fade-up animate-delay-300">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search by farm name, district, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-neutral-200 rounded-2xl pl-14 pr-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 border border-neutral-100 shadow-sm">
                <div className="flex gap-5">
                  <div className="skeleton w-20 h-20 rounded-full shrink-0" />
                  <div className="space-y-4 flex-1 pt-2">
                    <div className="skeleton h-6 w-3/4" />
                    <div className="skeleton h-5 w-1/3 rounded-full" />
                    <div className="skeleton h-4 w-2/3" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">!</span>
            </div>
            <p className="text-red-600 font-medium mb-6 text-lg">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary px-8">
              Try Again
            </button>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-neutral-200 shadow-sm max-w-3xl mx-auto animate-fade-up">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">No farmers found</h3>
            <p className="text-neutral-500 text-lg">We couldn't find any farmers matching "{debouncedSearch}".</p>
            <button onClick={() => setSearchQuery('')} className="mt-8 btn-ghost text-primary">
              Clear Search
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8 animate-fade-up">
              <h2 className="text-2xl font-bold text-neutral-900">Farmer Directory</h2>
              <span className="bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full text-sm font-bold">
                {farmers.length} {farmers.length === 1 ? 'Farmer' : 'Farmers'}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {farmers.map((farmer, idx) => (
                <FarmerCard key={farmer.userId} farmer={farmer} delay={Math.min(100 * (idx % 6), 500)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
