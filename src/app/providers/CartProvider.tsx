import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CartItem } from '@/types';
import { CartContext } from './CartContext';

const CART_STORAGE_KEY = 'kisanmitra_cart_items';

function getInitialCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialCartItems);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.maxQuantity);
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(qty, i.maxQuantity) }
          : i
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getItem = useCallback(
    (productId: string) => items.find((i) => i.productId === productId),
    [items]
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, itemCount, total, cart: { items },
      addItem, removeItem, updateQty, clearCart, getItem,
    }}>
      {children}
    </CartContext.Provider>
  );
}

