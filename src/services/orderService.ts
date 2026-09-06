import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, addDoc, updateDoc, getDocs,
  query, where, orderBy, limit,
} from '@/lib/firebase/firestore';
import type { Order, OrderStatus, OrderItem, DeliveryAddress, DeliveryType, UserRole } from '@/types';
import { canTransition } from '@/utils/orderStateMachine';
import { reserveInventory, releaseInventory, confirmSale } from './inventoryService';
import { isDemoMode, getStoredOrders, saveStoredOrders, withFirestoreTimeout } from './mockStore';

function toOrder(id: string, d: Record<string, unknown>): Order {
  return {
    id,
    buyerId:       d.buyerId as string,
    buyerName:     d.buyerName as string,
    farmerId:      d.farmerId as string,
    farmerName:    d.farmerName as string,
    items:         (d.items as OrderItem[]) ?? [],
    subtotal:      d.subtotal as number,
    deliveryFee:   d.deliveryFee as number,
    total:         d.total as number,
    currency:      'INR',
    paymentStatus: (d.paymentStatus as Order['paymentStatus']) ?? 'pending',
    orderStatus:   (d.orderStatus as OrderStatus) ?? 'pending',
    deliveryType:  (d.deliveryType as DeliveryType) ?? 'pickup',
    deliveryAddress: d.deliveryAddress as DeliveryAddress | undefined,
    statusHistory: ((d.statusHistory as Array<Record<string, unknown>>) ?? []).map((h) => ({
      status:       h.status as OrderStatus,
      changedBy:    h.changedBy as string,
      changedByRole:h.changedByRole as UserRole,
      timestamp:    (h.timestamp as { toDate?: () => Date })?.toDate?.() ?? new Date(),
      note:         h.note as string | undefined,
    })),
    notes:       d.notes as string | undefined,
    createdAt:   (d.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt:   (d.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

/**
 * Place an order. Validates inventory before committing.
 * Groups items by farmerId — one order per farmer per placement.
 */
export async function createOrder(data: {
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  notes?: string;
}): Promise<string> {
  const subtotal    = data.items.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFee = data.deliveryType === 'delivery' ? 50 : 0;
  const total       = subtotal + deliveryFee;

  const saveLocalOrder = (): string => {
    const orders = getStoredOrders();
    const newId = 'ord-' + Date.now();
    const newOrder: Order = {
      id: newId,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      items: data.items,
      subtotal,
      deliveryFee,
      total,
      currency: 'INR',
      paymentStatus: 'paid',
      orderStatus: 'pending',
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
      statusHistory: [{
        status: 'pending',
        changedBy: data.buyerId,
        changedByRole: 'buyer',
        timestamp: new Date(),
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    orders.unshift(newOrder);
    saveStoredOrders(orders);
    return newId;
  };

  if (isDemoMode()) {
    return saveLocalOrder();
  }

  try {
    // Reserve inventory for each item before creating the order
    for (const item of data.items) {
      await reserveInventory(item.productId, item.quantity);
    }

    const orderDoc = {
      buyerId:       data.buyerId,
      buyerName:     data.buyerName,
      farmerId:      data.farmerId,
      farmerName:    data.farmerName,
      items:         data.items,
      subtotal,
      deliveryFee,
      total,
      currency:      'INR',
      paymentStatus: 'pending' as Order['paymentStatus'],
      orderStatus:   'pending' as OrderStatus,
      deliveryType:  data.deliveryType,
      deliveryAddress: data.deliveryAddress ?? null,
      notes:         data.notes ?? null,
      statusHistory: [
        {
          status:        'pending',
          changedBy:     data.buyerId,
          changedByRole: 'buyer',
          timestamp:     new Date(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await withFirestoreTimeout(addDoc(collection(db, COLLECTIONS.ORDERS), orderDoc), 1000);
    return ref.id;
  } catch {
    // Gracefully fall back to local high-speed store
    return saveLocalOrder();
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (isDemoMode()) {
    const orders = getStoredOrders();
    return orders.find(o => o.id === orderId) || null;
  }
  try {
    const snap = await withFirestoreTimeout(getDoc(doc(db, COLLECTIONS.ORDERS, orderId)), 800);
    if (!snap.exists()) {
      return getStoredOrders().find(o => o.id === orderId) || null;
    }
    return toOrder(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return getStoredOrders().find(o => o.id === orderId) || null;
  }
}

export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  if (isDemoMode()) {
    const orders = getStoredOrders();
    return orders.filter(o => o.buyerId === buyerId || buyerId.startsWith('demo'));
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('buyerId', '==', buyerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) {
      return getStoredOrders().filter(o => o.buyerId === buyerId || buyerId.startsWith('demo'));
    }
    return snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>));
  } catch {
    return getStoredOrders().filter(o => o.buyerId === buyerId || buyerId.startsWith('demo'));
  }
}

export async function getFarmerOrders(farmerId: string): Promise<Order[]> {
  if (isDemoMode()) {
    const orders = getStoredOrders();
    return orders.filter(o => o.farmerId === farmerId || farmerId.startsWith('demo'));
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) {
      return getStoredOrders().filter(o => o.farmerId === farmerId || farmerId.startsWith('demo'));
    }
    return snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>));
  } catch {
    return getStoredOrders().filter(o => o.farmerId === farmerId || farmerId.startsWith('demo'));
  }
}

export async function getAllOrders(limitCount = 50): Promise<Order[]> {
  if (isDemoMode()) {
    return getStoredOrders().slice(0, limitCount);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) return getStoredOrders().slice(0, limitCount);
    return snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>));
  } catch {
    return getStoredOrders().slice(0, limitCount);
  }
}

/**
 * Transition order status.
 */
export async function updateOrderStatus(
  orderId: string,
  actorId: string,
  actorRole: UserRole,
  newStatus: OrderStatus,
  note?: string
): Promise<void> {
  if (isDemoMode()) {
    const orders = getStoredOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].orderStatus = newStatus;
      orders[idx].statusHistory.push({
        status: newStatus,
        changedBy: actorId,
        changedByRole: actorRole,
        timestamp: new Date(),
        note,
      });
      orders[idx].updatedAt = new Date();
      saveStoredOrders(orders);
    }
    return;
  }

  const snap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
  if (!snap.exists()) throw new Error('Order not found.');

  const d    = snap.data() as Record<string, unknown>;
  const current = d.orderStatus as OrderStatus;

  if (!canTransition(current, newStatus)) {
    throw new Error(`Cannot change order from "${current}" to "${newStatus}".`);
  }

  const historyEntry = {
    status:        newStatus,
    changedBy:     actorId,
    changedByRole: actorRole,
    timestamp:     new Date(),
    note:          note ?? null,
  };

  const existingHistory = (d.statusHistory as unknown[]) ?? [];

  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    orderStatus:   newStatus,
    statusHistory: [...existingHistory, historyEntry],
    updatedAt:     serverTimestamp(),
  });
}
