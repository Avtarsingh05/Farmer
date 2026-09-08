import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, setDoc, updateDoc, getDocs,
  query, where, orderBy,
} from '@/lib/firebase/firestore';
import type { InventoryItem } from '@/types';
import { isDemoMode, getStoredInventory, saveStoredInventory, withFirestoreTimeout } from './mockStore';

export async function createInventoryRecord(
  productId: string,
  farmerId: string,
  data: {
    availableQty: number;
    unit: string;
    lowStockThreshold: number;
    productName: string;
  }
): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    const newItem: InventoryItem = {
      productId,
      farmerId,
      productName: data.productName,
      availableQty: data.availableQty,
      reservedQty: 0,
      soldQty: 0,
      unit: data.unit,
      lowStockThreshold: data.lowStockThreshold,
      updatedAt: new Date(),
    };
    saveStoredInventory([...list, newItem]);
    return;
  }

  try {
    await withFirestoreTimeout(
      setDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
        productId,
        farmerId,
        productName:       data.productName,
        availableQty:      data.availableQty,
        reservedQty:       0,
        soldQty:           0,
        unit:              data.unit,
        lowStockThreshold: data.lowStockThreshold,
        updatedAt:         serverTimestamp(),
      }),
      800
    );
  } catch {
    const list = getStoredInventory();
    const newItem: InventoryItem = {
      productId,
      farmerId,
      productName: data.productName,
      availableQty: data.availableQty,
      reservedQty: 0,
      soldQty: 0,
      unit: data.unit,
      lowStockThreshold: data.lowStockThreshold,
      updatedAt: new Date(),
    };
    saveStoredInventory([...list, newItem]);
  }
}

export async function getInventoryItem(productId: string): Promise<InventoryItem | null> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    return list.find((i) => i.productId === productId) ?? null;
  }

  try {
    const snap = await withFirestoreTimeout(getDoc(doc(db, COLLECTIONS.INVENTORY, productId)), 800);
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      productId:         d.productId,
      farmerId:          d.farmerId,
      productName:       d.productName ?? '',
      availableQty:      d.availableQty ?? 0,
      reservedQty:       d.reservedQty ?? 0,
      soldQty:           d.soldQty ?? 0,
      unit:              d.unit ?? '',
      lowStockThreshold: d.lowStockThreshold ?? 0,
      updatedAt:         d.updatedAt?.toDate?.() ?? new Date(),
    };
  } catch {
    const list = getStoredInventory();
    return list.find((i) => i.productId === productId) ?? null;
  }
}

export async function getFarmerInventory(farmerId: string): Promise<InventoryItem[]> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    return list.filter((i) => i.farmerId === farmerId);
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.INVENTORY),
      where('farmerId', '==', farmerId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        productId:         d.id,
        farmerId:          data.farmerId,
        productName:       data.productName ?? '',
        availableQty:      data.availableQty ?? 0,
        reservedQty:       data.reservedQty ?? 0,
        soldQty:           data.soldQty ?? 0,
        unit:              data.unit ?? '',
        lowStockThreshold: data.lowStockThreshold ?? 0,
        updatedAt:         data.updatedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch {
    const list = getStoredInventory();
    return list.filter((i) => i.farmerId === farmerId);
  }
}

export async function reserveInventory(
  productId: string,
  quantity: number
): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId);
    if (!item) return;
    const available = item.availableQty - item.reservedQty;
    if (available < quantity) {
      throw new Error(`Only ${available} ${item.unit} available. Requested ${quantity}.`);
    }
    item.reservedQty += quantity;
    saveStoredInventory([...list]);
    return;
  }

  try {
    const snap = await withFirestoreTimeout(getDoc(doc(db, COLLECTIONS.INVENTORY, productId)), 800);
    if (!snap.exists()) throw new Error('Inventory record not found.');
    const d = snap.data();
    const available = (d.availableQty ?? 0) - (d.reservedQty ?? 0);
    if (available < quantity) {
      throw new Error(`Only ${available} ${d.unit} available. Requested ${quantity}.`);
    }
    await withFirestoreTimeout(
      updateDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
        reservedQty: (d.reservedQty ?? 0) + quantity,
        updatedAt:   serverTimestamp(),
      }),
      800
    );
  } catch (err) {
    if (String(err).includes('Only')) throw err;
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId);
    if (item) {
      item.reservedQty += quantity;
      saveStoredInventory([...list]);
    }
  }
}

export async function releaseInventory(
  productId: string,
  quantity: number
): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId);
    if (!item) return;
    item.reservedQty = Math.max(0, item.reservedQty - quantity);
    saveStoredInventory([...list]);
    return;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.INVENTORY, productId));
    if (!snap.exists()) return;
    const d = snap.data();
    await updateDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
      reservedQty: Math.max(0, (d.reservedQty ?? 0) - quantity),
      updatedAt:   serverTimestamp(),
    });
  } catch {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId);
    if (item) {
      item.reservedQty = Math.max(0, item.reservedQty - quantity);
      saveStoredInventory([...list]);
    }
  }
}

export async function confirmSale(
  productId: string,
  quantity: number
): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId);
    if (!item) return;
    item.availableQty = Math.max(0, item.availableQty - quantity);
    item.reservedQty = Math.max(0, item.reservedQty - quantity);
    item.soldQty += quantity;
    saveStoredInventory([...list]);
    return;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.INVENTORY, productId));
    if (!snap.exists()) return;
    const d = snap.data();
    await updateDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
      availableQty: Math.max(0, (d.availableQty ?? 0) - quantity),
      reservedQty:  Math.max(0, (d.reservedQty ?? 0) - quantity),
      soldQty:      (d.soldQty ?? 0) + quantity,
      updatedAt:    serverTimestamp(),
    });
  } catch {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId);
    if (item) {
      item.availableQty = Math.max(0, item.availableQty - quantity);
      item.reservedQty = Math.max(0, item.reservedQty - quantity);
      item.soldQty += quantity;
      saveStoredInventory([...list]);
    }
  }
}

export async function updateInventoryThreshold(
  productId: string,
  farmerId: string,
  threshold: number
): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId && i.farmerId === farmerId);
    if (!item) throw new Error('Inventory item not found or permission denied.');
    item.lowStockThreshold = threshold;
    saveStoredInventory([...list]);
    return;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.INVENTORY, productId));
    if (!snap.exists() || snap.data().farmerId !== farmerId) {
      throw new Error('Inventory item not found or permission denied.');
    }
    await updateDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
      lowStockThreshold: threshold,
      updatedAt:         serverTimestamp(),
    });
  } catch {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId && i.farmerId === farmerId);
    if (item) {
      item.lowStockThreshold = threshold;
      saveStoredInventory([...list]);
    }
  }
}

export async function updateAvailableQuantity(
  productId: string,
  farmerId: string,
  availableQty: number
): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId && i.farmerId === farmerId);
    if (!item) throw new Error('Inventory item not found or permission denied.');
    item.availableQty = availableQty;
    saveStoredInventory([...list]);
    return;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.INVENTORY, productId));
    if (!snap.exists() || snap.data().farmerId !== farmerId) {
      throw new Error('Inventory item not found or permission denied.');
    }
    await updateDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
      availableQty,
      updatedAt: serverTimestamp(),
    });
  } catch {
    const list = getStoredInventory();
    const item = list.find((i) => i.productId === productId && i.farmerId === farmerId);
    if (item) {
      item.availableQty = availableQty;
      saveStoredInventory([...list]);
    }
  }
}
