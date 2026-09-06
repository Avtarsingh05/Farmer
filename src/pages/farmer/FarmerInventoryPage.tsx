import React, { useEffect, useState } from 'react';
import { AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks';
import { getFarmerInventory, updateInventoryThreshold } from '@/services/inventoryService';
import { getFarmerProducts } from '@/services/productService';
import { InventoryItem, Product } from '@/types';
import { cn } from '@/utils/cn';

export default function FarmerInventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<(InventoryItem & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState<number>(0);

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
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to update threshold: ' + err.message);
    }
  };

  const lowStockItems = inventory.filter(i => i.availableQty <= i.lowStockThreshold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Inventory Management</h1>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-red-800 font-semibold">
            <AlertTriangle className="w-5 h-5" /> Low Stock Warning
          </div>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {lowStockItems.map(item => (
              <li key={item.productId}>
                {item.product?.name || 'Unknown'} - {item.availableQty} {item.product?.unit} left (Threshold: {item.lowStockThreshold})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading inventory...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Available Qty</th>
                  <th className="p-4 font-medium">Reserved Qty</th>
                  <th className="p-4 font-medium">Sold Qty</th>
                  <th className="p-4 font-medium">Low Stock Threshold</th>
                  <th className="p-4 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {inventory.map(item => (
                  <tr key={item.productId} className={cn(
                    "hover:bg-neutral-50",
                    item.availableQty <= item.lowStockThreshold ? "bg-red-50/50" : ""
                  )}>
                    <td className="p-4 font-medium text-neutral-900">{item.product?.name || 'Unknown Product'}</td>
                    <td className="p-4">
                      <span className={cn(
                        "font-bold",
                        item.availableQty <= item.lowStockThreshold ? "text-red-600" : "text-green-600"
                      )}>
                        {item.availableQty} {item.product?.unit}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">{item.reservedQty} {item.product?.unit}</td>
                    <td className="p-4 text-neutral-600">{item.soldQty} {item.product?.unit}</td>
                    <td className="p-4">
                      {editingId === item.productId ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="form-input w-20 py-1 text-sm" 
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(Number(e.target.value))}
                            autoFocus
                          />
                          <button onClick={() => handleSaveThreshold(item.productId)} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-700 p-1"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span>{item.lowStockThreshold} {item.product?.unit}</span>
                          <button 
                            onClick={() => { setEditingId(item.productId); setEditThreshold(item.lowStockThreshold); }}
                            className="text-neutral-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-neutral-500">{new Date(item.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
