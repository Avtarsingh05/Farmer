import { createContext, useContext } from 'react';
import type { CartItem } from '@/types';

export interface CartContextValue {
  items:      CartItem[];
  itemCount:  number;
  total:      number;
  cart:       { items: CartItem[] };
  addItem:    (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty:  (productId: string, qty: number) => void;
  clearCart:  () => void;
  getItem:    (productId: string) => CartItem | undefined;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
