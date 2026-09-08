import React, { useEffect, useState } from 'react';
import { AlertTriangle, Edit2, Check, X, Plus, Minus, Package, ArchiveRestore } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerInventory, updateInventoryThreshold, updateAvailableQuantity } from '@/services/inventoryService';
import { getFarmerProducts } from '@/services/productService';
import { InventoryItem, Product } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerInventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<(InventoryItem & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for inline editing
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState<number>(0);

  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const uid = user?.uid || user?.id;
        if (!uid) return;
        
        const [invData, prodData] = await Promise.all([
          getFarmerInventory(uid),
          getFarmerProducts(uid)
        ]);

        const merged = invData.map(item => ({
          ...item,
          product: prodData.find(p => p.id === item.productId)
        }));

        setInventory(merged);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSaveThreshold = async (productId: string) => {
    try {
      const uid = user?.uid || user?.id;
      if (!uid) return;
      await updateInventoryThreshold(productId, uid, editThreshold);
      setInventory(inventory.map(item => item.productId === productId ? { ...item, lowStockThreshold: editThreshold } : item));
      setEditingThresholdId(null);
    } catch (err: any) {
      alert('Failed to update threshold: ' + err.message);
    }
  };

  const handleSaveQty = async (productId: string) => {
    try {
      const uid = user?.uid || user?.id;
      if (!uid) return;
      if (editQty < 0) return alert('Quantity cannot be negative');
      await updateAvailableQuantity(productId, uid, editQty);
      setInventory(inventory.map(item => item.productId === productId ? { ...item, availableQty: editQty } : item));
      setEditingQtyId(null);
    } catch (err: any) {
      alert('Failed to update quantity: ' + err.message);
    }
  };

  const adjustQty = async (productId: string, amount: number) => {
    try {
      const uid = user?.uid || user?.id;
      if (!uid) return;
      
      const item = inventory.find(i => i.productId === productId);
      if (!item) return;
      
      const newQty = Math.max(0, item.availableQty + amount);
      await updateAvailableQuantity(productId, uid, newQty);
      setInventory(inventory.map(i => i.productId === productId ? { ...i, availableQty: newQty } : i));
    } catch (err: any) {
      alert('Failed to update quantity: ' + err.message);
    }
  };

  const lowStockItems = inventory.filter(i => i.availableQty <= i.lowStockThreshold);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-neutral-200/50 rounded-xl w-1/4 animate-pulse"></div>
        <div className="h-64 bg-neutral-200/50 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-50 rounded-3xl font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Inventory Management</h1>
          <p className="text-neutral-500 mt-2 font-medium">Monitor stock levels, set alerts, and instantly update quantities.</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 animate-fade-up delay-100 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-800 font-bold text-lg mb-2">Low Stock Warning ({lowStockItems.length} items)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lowStockItems.map(item => (
                <div key={item.productId} className="bg-white/60 px-4 py-2 rounded-xl border border-red-100 flex items-center justify-between">
                  <span className="font-semibold text-red-900 line-clamp-1">{item.product?.name || 'Unknown'}</span>
                  <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                    {item.availableQty} / {item.lowStockThreshold}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 overflow-hidden animate-fade-up delay-150">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ArchiveRestore className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Current Stock</h2>
          </div>
          <span className="text-sm font-bold text-neutral-500 bg-white border border-neutral-200 px-3 py-1 rounded-full shadow-sm">
            {inventory.length} total items
          </span>
        </div>
        
        {inventory.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <Package className="w-16 h-16 text-neutral-200 mb-4" />
            <p className="text-lg font-medium text-neutral-900">Your inventory is empty</p>
            <p className="text-neutral-500">Add products to your catalog to start tracking inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-neutral-500 text-xs uppercase tracking-wider font-semibold border-b border-neutral-100">
                <tr>
                  <th className="p-5">Product Details</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Available Qty (Edit)</th>
                  <th className="p-5">Reserved & Sold</th>
                  <th className="p-5">Alert Threshold</th>
                  <th className="p-5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {inventory.map(item => {
                  const isLow = item.availableQty <= item.lowStockThreshold;
                  
                  return (
                    <tr key={item.productId} className={cn(
                      "hover:bg-neutral-50/80 transition-colors group",
                      isLow ? "bg-red-50/30" : ""
                    )}>
                      {/* Product Details */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 shadow-sm">
                            <img 
                              src={item.product?.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'} 
                              alt="product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-base">{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-neutral-500 uppercase font-semibold">{item.product?.categoryName || 'Produce'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <Check className="w-3.5 h-3.5" /> Healthy
                          </span>
                        )}
                      </td>

                      {/* Available Qty */}
                      <td className="p-5">
                        {editingQtyId === item.productId ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="form-input w-24 py-1.5 text-sm font-bold border-primary ring-2 ring-primary/20" 
                              value={editQty}
                              onChange={(e) => setEditQty(Number(e.target.value))}
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleSaveQty(item.productId)} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingQtyId(null)} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-xl font-extrabold",
                              isLow ? "text-red-600" : "text-neutral-900"
                            )}>
                              {item.availableQty} <span className="text-sm font-medium text-neutral-500 ml-0.5">{item.unit}</span>
                            </span>
                            <button 
                              onClick={() => { setEditingQtyId(item.productId); setEditQty(item.availableQty); setEditingThresholdId(null); }}
                              className="text-neutral-400 hover:text-primary transition-colors bg-white border border-neutral-200 shadow-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
                              title="Edit Quantity"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Reserved & Sold */}
                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit border border-amber-100">
                            {item.reservedQty} {item.unit} reserved
                          </span>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit border border-blue-100">
                            {item.soldQty} {item.unit} sold
                          </span>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="p-5">
                        {editingThresholdId === item.productId ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="form-input w-20 py-1.5 text-sm border-primary ring-2 ring-primary/20" 
                              value={editThreshold}
                              onChange={(e) => setEditThreshold(Number(e.target.value))}
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleSaveThreshold(item.productId)} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingThresholdId(null)} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-neutral-400" />
                              <span className="font-bold text-neutral-700">{item.lowStockThreshold} <span className="text-xs font-medium text-neutral-500">{item.unit}</span></span>
                            </div>
                            <button 
                              onClick={() => { setEditingThresholdId(item.productId); setEditThreshold(item.lowStockThreshold); setEditingQtyId(null); }}
                              className="text-neutral-400 hover:text-primary transition-colors bg-white border border-neutral-200 shadow-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
                              title="Edit Threshold"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => adjustQty(item.productId, -10)}
                            className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                            title="Subtract 10"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold text-neutral-400 w-6 text-center">10</span>
                          <button 
                            onClick={() => adjustQty(item.productId, 10)}
                            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            title="Add 10"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
