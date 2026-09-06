import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerProducts, deleteProduct } from '@/services/productService';
import { Product } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'all';

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
    if (currentTab === 'all') return true;
    if (currentTab === 'available') return p.availabilityStatus === 'available';
    if (currentTab === 'limited') return p.availabilityStatus === 'limited' || (p.quantity > 0 && p.quantity < 10);
    if (currentTab === 'sold_out') return p.quantity <= 0 || p.availabilityStatus === 'sold_out';
    return p.availabilityStatus === currentTab;
  });

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'limited', label: 'Limited' },
    { id: 'sold_out', label: 'Sold Out' },
    { id: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">My Products</h1>
        <Link to="/farmer/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200 flex overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ status: tab.id })}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap",
                currentTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading products...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <PackageIcon className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No products found</h3>
            <p className="text-neutral-500 mb-4">You haven't added any products matching this filter.</p>
            {currentTab !== 'all' && (
              <button onClick={() => setSearchParams({})} className="text-primary hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.images[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'} 
                          alt={product.name} 
                          className="w-12 h-12 rounded object-cover border border-neutral-200" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{product.name}</p>
                          <p className="text-xs text-neutral-500">{product.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">₹{product.price}/{product.unit}</td>
                    <td className="p-4">
                      <span className={cn(
                        "font-medium",
                        product.quantity <= 0 ? "text-red-600" : "text-neutral-900"
                      )}>
                        {product.quantity} {product.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium inline-block capitalize",
                        product.availabilityStatus === 'available' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                      )}>
                        {product.availabilityStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/farmer/products/${product.id}`} className="p-2 text-neutral-600 hover:text-primary hover:bg-neutral-100 rounded">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
            <p className="text-neutral-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn-danger">Delete</button>
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
