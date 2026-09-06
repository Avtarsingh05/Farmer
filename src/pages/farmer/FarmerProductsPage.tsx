import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Package } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerProducts, deleteProduct } from '@/services/productService';
import { Product } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [user]);

  async function loadProducts() {
    try {
      setLoading(true);
      const uid = user?.uid || user?.id;
      if (!uid) return;
      const data = await getFarmerProducts(uid);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const uid = user?.uid || user?.id;
      if (!uid) return;
      await deleteProduct(id, uid);
      setProducts(products.filter(p => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.categoryName ? p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    if (!matchesSearch) return false;

    if (currentTab === 'all') return true;
    if (currentTab === 'available') return p.availabilityStatus === 'available';
    if (currentTab === 'limited') return p.availabilityStatus === 'limited' || (p.quantity > 0 && p.quantity < 10);
    if (currentTab === 'sold_out') return p.quantity <= 0 || p.availabilityStatus === 'sold_out';
    return p.availabilityStatus === currentTab;
  });

  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'available', label: 'Available' },
    { id: 'limited', label: 'Limited Stock' },
    { id: 'sold_out', label: 'Sold Out' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">My Products</h1>
          <p className="text-neutral-500 mt-2 font-medium">Manage your catalog, inventory, and pricing.</p>
        </div>
        <Link to="/farmer/products/new" className="btn-primary rounded-full px-6 py-3 shadow-[0_8px_30px_rgb(45,80,22,0.2)] hover:-translate-y-0.5 transition-transform flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-2 sm:p-4 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-up delay-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 px-2">
          <div className="flex overflow-x-auto no-scrollbar gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ status: tab.id })}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                  currentTab === tab.id 
                    ? "bg-primary text-white shadow-md" 
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-neutral-100 rounded-3xl h-72"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-medium bg-red-50 rounded-2xl m-4">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
              <PackageIcon className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No products found</h3>
            <p className="text-neutral-500 mb-6 max-w-md">You haven't added any products matching this filter or search query yet.</p>
            {currentTab !== 'all' || searchQuery ? (
              <button onClick={() => { setSearchParams({}); setSearchQuery(''); }} className="btn-secondary rounded-full">Clear filters</button>
            ) : (
              <Link to="/farmer/products/new" className="btn-primary rounded-full">Add Your First Product</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {filteredProducts.map((product, idx) => (
              <div key={product.id} className="group bg-white border border-neutral-100 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${(idx % 10) * 50}ms` }}>
                <div className="relative aspect-square overflow-hidden bg-neutral-50">
                  <img 
                    src={product.images[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
                      product.availabilityStatus === 'available' ? 'bg-green-500/90 text-white' : 
                      product.availabilityStatus === 'limited' ? 'bg-amber-500/90 text-white' : 
                      'bg-red-500/90 text-white'
                    )}>
                      {product.availabilityStatus === 'available' ? 'Available' : 
                       product.availabilityStatus === 'limited' ? 'Limited' : 'Sold Out'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{product.categoryName}</p>
                      <h3 className="font-bold text-lg text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-xl font-extrabold text-neutral-900">₹{product.price}</p>
                    <p className="text-sm font-medium text-neutral-500">/ {product.unit}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-neutral-400 uppercase">Stock</span>
                      <span className={cn("font-bold text-sm", product.quantity <= 0 ? "text-red-600" : "text-neutral-900")}>
                        {product.quantity} {product.unit}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/farmer/products/${product.id}`} className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-center mb-2">Delete Product?</h3>
            <p className="text-neutral-500 text-center mb-8 font-medium">Are you sure you want to remove this product from your catalog? This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirmId)} className="w-full btn-danger rounded-full py-3 text-sm">Yes, delete it</button>
              <button onClick={() => setDeleteConfirmId(null)} className="w-full btn-ghost rounded-full py-3 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-900">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PackageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);
