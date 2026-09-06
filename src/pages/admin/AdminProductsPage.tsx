import React, { useEffect, useState } from 'react';
import { getAllProducts, updateProduct } from '@/services/productService';
import { Product } from '@/types';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data: any = await getAllProducts?.() || [];
        setProducts(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Error loading products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.availabilityStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeactivate = async (id: string, currentStatus: string) => {
    if (currentStatus === 'inactive') return;
    if (!window.confirm("Are you sure you want to deactivate this product? It will no longer be visible to buyers.")) return;

    try {
      const prod = products.find(p => p.id === id);
      if (prod) {
        await updateProduct(id, prod.farmerId, { availabilityStatus: 'inactive' });
        setProducts(products.map(p => p.id === id ? { ...p, availabilityStatus: 'inactive' } : p));
      }
    } catch (err) {
      console.error("Failed to deactivate product", err);
      alert("Failed to deactivate product");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 container-content py-6">
      <h1 className="text-2xl font-bold text-neutral-900">Product Moderation</h1>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="form-input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="table-th">Product</th>
              <th className="table-th">Farmer ID</th>
              <th className="table-th">Price</th>
              <th className="table-th">Status</th>
              <th className="table-th">Created</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-neutral-500">No products found.</td></tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
                        <img 
                          src={product.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.categoryName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-sm text-neutral-600">
                    <span title={product.farmerId}>{product.farmerId.slice(0, 8)}...</span>
                  </td>
                  <td className="table-td text-sm font-medium">₹{product.price}/{product.unit}</td>
                  <td className="table-td">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      product.availabilityStatus === 'available' ? 'bg-green-100 text-green-700' :
                      product.availabilityStatus === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {product.availabilityStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="table-td text-sm text-neutral-600">
                    {format((product.createdAt as any)?.toDate ? (product.createdAt as any).toDate() : new Date(product.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="table-td text-right">
                    <button 
                      onClick={() => handleDeactivate(product.id, product.availabilityStatus)}
                      disabled={product.availabilityStatus === 'inactive'}
                      className={`btn-sm text-xs ${product.availabilityStatus !== 'inactive' ? 'btn-danger' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
