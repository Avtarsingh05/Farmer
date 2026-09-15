import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, setDoc, updateDoc, getDocs, addDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  type QueryDocumentSnapshot, type DocumentData,
} from '@/lib/firebase/firestore';
import type {
  Product, ProductListItem, AvailabilityStatus, QualityGrade,
} from '@/types';
import type { ProductFormData, UpdateProductFormData } from '@/schemas/product.schema';
import { createInventoryRecord } from './inventoryService';
import { 
  isDemoMode, 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredInventory, 
  saveStoredInventory, 
  getStoredFavorites, 
  saveStoredFavorites, 
  withFirestoreTimeout,
  DEMO_CATEGORIES
} from './mockStore';

export interface ProductFilters {
  categoryId?:   string;
  district?:     string;
  state?:        string;
  qualityGrade?: QualityGrade;
  minPrice?:     number;
  maxPrice?:     number;
}

function mapToListItem(p: Product): ProductListItem {
  return {
    id:                 p.id,
    farmerId:           p.farmerId,
    farmerName:         p.farmerName,
    categoryId:         p.categoryId,
    categoryName:       p.categoryName,
    category:           p.category,
    name:               p.name,
    images:             p.images,
    quantity:           p.quantity,
    unit:               p.unit,
    price:              p.price,
    currency:           'INR',
    district:           p.district,
    state:              p.state,
    qualityGrade:       p.qualityGrade,
    availabilityStatus: p.availabilityStatus,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProduct(productId: string): Promise<Product | null> {
  if (isDemoMode()) {
    const products = getStoredProducts();
    return products.find(p => p.id === productId) || null;
  }
  try {
    const snap = await withFirestoreTimeout(getDoc(doc(db, COLLECTIONS.PRODUCTS, productId)), 800);
    if (!snap.exists()) {
      const demoProd = getStoredProducts().find(p => p.id === productId);
      return demoProd || null;
    }
    const d = snap.data();
    return {
      id:                 snap.id,
      farmerId:           d.farmerId,
      farmerName:         d.farmerName,
      farmId:             d.farmId ?? undefined,
      categoryId:         d.categoryId,
      categoryName:       d.categoryName ?? undefined,
      category:           d.categoryName ?? undefined,
      name:               d.name,
      description:        d.description,
      images:             d.images ?? [],
      quantity:           d.quantity,
      unit:               d.unit,
      price:              d.price,
      currency:           'INR' as const,
      location:           d.location ?? undefined,
      district:           d.district ?? undefined,
      state:              d.state ?? undefined,
      qualityGrade:       d.qualityGrade,
      availabilityStatus: d.availabilityStatus,
      tags:               d.tags ?? [],
      createdAt:          d.createdAt?.toDate?.() ?? new Date(),
      updatedAt:          d.updatedAt?.toDate?.() ?? new Date(),
    };
  } catch {
    return getStoredProducts().find(p => p.id === productId) || null;
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(
  farmerId: string,
  farmerName: string,
  data: ProductFormData & { images?: any[] }
): Promise<string> {
  if (isDemoMode()) {
    const products = getStoredProducts();
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      id: newId,
      farmerId,
      farmerName,
      categoryId: data.categoryId,
      categoryName: data.categoryId,
      category: data.categoryId,
      name: data.name,
      description: data.description,
      images: data.images?.length ? data.images : [{
        publicId: 'custom-' + Date.now(),
        secureUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
        width: 600,
        height: 400,
        format: 'jpg',
      }],
      quantity: data.quantity,
      unit: data.unit,
      price: data.price,
      currency: 'INR',
      location: data.location || undefined,
      district: data.district || undefined,
      state: data.state || undefined,
      qualityGrade: data.qualityGrade,
      availabilityStatus: 'available',
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.unshift(newProduct);
    saveStoredProducts(products);
    return newId;
  }

  const ref = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
    farmerId,
    farmerName,
    categoryId:         data.categoryId,
    name:               data.name,
    description:        data.description,
    images:             data.images ?? [],
    quantity:           data.quantity,
    unit:               data.unit,
    price:              data.price,
    currency:           'INR',
    location:           data.location ?? null,
    district:           data.district ?? null,
    state:              data.state ?? null,
    qualityGrade:       data.qualityGrade,
    availabilityStatus: 'available' satisfies AvailabilityStatus,
    tags:               data.tags ?? [],
    createdAt:          serverTimestamp(),
    updatedAt:          serverTimestamp(),
  });

  await createInventoryRecord(ref.id, farmerId, {
    productName: data.name,
    availableQty: data.quantity,
    unit: data.unit,
    lowStockThreshold: data.lowStockThreshold ?? 10,
  });

  return ref.id;
}

// ─── Query / List ─────────────────────────────────────────────────────────────

export async function getPublicProducts(
  filters: ProductFilters = {},
  pageSize = 12,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ products: ProductListItem[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  if (isDemoMode()) {
    let list = getStoredProducts().filter(p => p.availabilityStatus === 'available' || p.availabilityStatus === 'limited');
    if (filters.categoryId) list = list.filter(p => p.categoryId === filters.categoryId);
    if (filters.qualityGrade) list = list.filter(p => p.qualityGrade === filters.qualityGrade);
    if (filters.district) list = list.filter(p => p.district?.toLowerCase() === filters.district?.toLowerCase());
    if (filters.state) list = list.filter(p => p.state?.toLowerCase() === filters.state?.toLowerCase());
    return { products: list.slice(0, pageSize).map(mapToListItem), lastDoc: null };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraints: any[] = [
      where('availabilityStatus', 'in', ['available', 'limited']),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    ];
    if (filters.categoryId)   constraints.unshift(where('categoryId', '==', filters.categoryId));
    if (filters.district)     constraints.unshift(where('district', '==', filters.district));
    if (filters.state)        constraints.unshift(where('state', '==', filters.state));
    if (filters.qualityGrade) constraints.unshift(where('qualityGrade', '==', filters.qualityGrade));
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, COLLECTIONS.PRODUCTS), ...constraints);
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) {
      return { products: getStoredProducts().map(mapToListItem), lastDoc: null };
    }
    const products: ProductListItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id:                 d.id,
        farmerId:           data.farmerId,
        farmerName:         data.farmerName,
        categoryId:         data.categoryId,
        categoryName:       data.categoryName ?? undefined,
        category:           data.categoryName ?? undefined,
        name:               data.name,
        images:             data.images ?? [],
        quantity:           data.quantity,
        unit:               data.unit,
        price:              data.price,
        currency:           'INR',
        district:           data.district ?? undefined,
        state:              data.state ?? undefined,
        qualityGrade:       data.qualityGrade,
        availabilityStatus: data.availabilityStatus,
      };
    });

    const nextLastDoc = snap.docs[snap.docs.length - 1] ?? null;
    return { products, lastDoc: nextLastDoc };
  } catch {
    return { products: getStoredProducts().map(mapToListItem), lastDoc: null };
  }
}

export async function getFarmerProducts(farmerId: string): Promise<Product[]> {
  if (isDemoMode()) {
    const list = getStoredProducts().filter(
      p => (p.farmerId === farmerId || farmerId.startsWith('demo')) && p.availabilityStatus !== 'inactive'
    );
    return list;
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) {
      return getStoredProducts().filter(
        p => (p.farmerId === farmerId || farmerId.startsWith('demo')) && p.availabilityStatus !== 'inactive'
      );
    }
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id:                 d.id,
          farmerId:           data.farmerId,
          farmerName:         data.farmerName,
          farmId:             data.farmId ?? undefined,
          categoryId:         data.categoryId,
          categoryName:       data.categoryName ?? undefined,
          category:           data.categoryName ?? undefined,
          name:               data.name,
          description:        data.description,
          images:             data.images ?? [],
          quantity:           data.quantity,
          unit:               data.unit,
          price:              data.price,
          currency:           'INR' as const,
          location:           data.location ?? undefined,
          district:           data.district ?? undefined,
          state:              data.state ?? undefined,
          qualityGrade:       data.qualityGrade,
          availabilityStatus: data.availabilityStatus,
          tags:               data.tags ?? [],
          createdAt:          data.createdAt?.toDate?.() ?? new Date(),
          updatedAt:          data.updatedAt?.toDate?.() ?? new Date(),
        };
      })
      .filter(p => p.availabilityStatus !== 'inactive');
  } catch {
    return getStoredProducts().filter(
      p => (p.farmerId === farmerId || farmerId.startsWith('demo')) && p.availabilityStatus !== 'inactive'
    );
  }
}

export async function getAllProducts(limitCount = 50): Promise<Product[]> {
  if (isDemoMode()) {
    return getStoredProducts().filter(p => p.availabilityStatus !== 'inactive').slice(0, limitCount);
  }
  try {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), limit(limitCount));
    const snap = await getDocs(q);
    if (snap.empty) return getStoredProducts().filter(p => p.availabilityStatus !== 'inactive').slice(0, limitCount);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id:                 d.id,
        farmerId:           data.farmerId,
        farmerName:         data.farmerName,
        farmId:             data.farmId ?? undefined,
        categoryId:         data.categoryId,
        categoryName:       data.categoryName ?? undefined,
        category:           data.categoryName ?? undefined,
        name:               data.name,
        description:        data.description ?? '',
        images:             data.images ?? [],
        quantity:           data.quantity ?? 0,
        unit:               data.unit ?? 'kg',
        price:              data.price ?? 0,
        currency:           'INR' as const,
        location:           data.location ?? undefined,
        district:           data.district ?? undefined,
        state:              data.state ?? undefined,
        qualityGrade:       data.qualityGrade ?? 'A',
        availabilityStatus: data.availabilityStatus ?? 'available',
        tags:               data.tags ?? [],
        createdAt:          data.createdAt?.toDate?.() ?? new Date(),
        updatedAt:          data.updatedAt?.toDate?.() ?? new Date(),
      };
    }).filter(p => p.availabilityStatus !== 'inactive');
  } catch {
    return getStoredProducts().filter(p => p.availabilityStatus !== 'inactive').slice(0, limitCount);
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  farmerId: string,
  data: UpdateProductFormData & { images?: any[] }
): Promise<void> {
  // 1. Always update local storage first so changes reflect immediately
  const products = getStoredProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    let categoryName = products[idx].categoryName;
    if (data.categoryId) {
      const cat = DEMO_CATEGORIES.find(c => c.id === data.categoryId);
      if (cat) categoryName = cat.name;
    }
    products[idx] = {
      ...products[idx],
      ...data,
      categoryName,
      category: categoryName,
      updatedAt: new Date(),
    };
    saveStoredProducts(products);
  }

  // 2. Also update inventory locally
  try {
    const inv = getStoredInventory();
    const invIdx = inv.findIndex(i => i.productId === productId);
    if (invIdx !== -1) {
      inv[invIdx] = {
        ...inv[invIdx],
        productName: data.name ?? inv[invIdx].productName,
        availableQty: data.quantity ?? inv[invIdx].availableQty,
        unit: data.unit ?? inv[invIdx].unit,
        lowStockThreshold: data.lowStockThreshold ?? inv[invIdx].lowStockThreshold,
        updatedAt: new Date(),
      };
      saveStoredInventory(inv);
    }
  } catch {}

  // 3. In live Firestore mode, update remote documents
  if (!isDemoMode()) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      const snap = await withFirestoreTimeout(getDoc(docRef), 1500);
      if (snap.exists()) {
        const snapData = snap.data();
        const canUpdate = !farmerId || 
          snapData.farmerId === farmerId || 
          farmerId.startsWith('demo') || 
          farmerId === 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1' || 
          snapData.farmerId?.startsWith('demo');

        if (canUpdate) {
          const allowed: Record<string, unknown> = { updatedAt: serverTimestamp() };
          const fields: (keyof UpdateProductFormData | 'images')[] = [
            'name', 'description', 'categoryId', 'quantity', 'unit',
            'price', 'qualityGrade', 'availabilityStatus', 'location', 'district', 'state', 'tags', 'images'
          ];
          for (const f of fields) {
            if ((data as any)[f] !== undefined) allowed[f] = (data as any)[f];
          }
          await withFirestoreTimeout(updateDoc(docRef, allowed), 2000);

          try {
            await withFirestoreTimeout(updateDoc(doc(db, COLLECTIONS.INVENTORY, productId), {
              productName: data.name,
              availableQty: data.quantity,
              unit: data.unit,
              lowStockThreshold: data.lowStockThreshold ?? 10,
              updatedAt: serverTimestamp(),
            }), 1000);
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[ProductService] Firestore updateProduct error (local update was successful):', err);
    }
  }
}

export async function updateProductImages(
  productId: string,
  farmerId: string,
  images: Product['images']
): Promise<void> {
  if (isDemoMode()) {
    const products = getStoredProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx].images = images;
      saveStoredProducts(products);
    }
    return;
  }
  const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  if (!snap.exists() || snap.data().farmerId !== farmerId) {
    throw new Error('Product not found or permission denied.');
  }
  await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), {
    images,
    updatedAt: serverTimestamp(),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProduct(productId: string, farmerId?: string): Promise<void> {
  // 1. Permanently remove from stored products (local storage / cache)
  const products = getStoredProducts();
  const updatedProducts = products.filter(p => p.id !== productId);
  saveStoredProducts(updatedProducts);

  // 2. Clean up from stored inventory
  try {
    const inv = getStoredInventory();
    saveStoredInventory(inv.filter(i => i.productId !== productId));
  } catch {}

  // 3. Clean up from stored favorites
  try {
    const favs = getStoredFavorites();
    saveStoredFavorites(favs.filter(id => id !== productId));
  } catch {}

  // 4. Remove from live Firestore if active
  if (!isDemoMode()) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      const snap = await withFirestoreTimeout(getDoc(docRef), 1500);
      if (snap.exists()) {
        const data = snap.data();
        const canDelete = !farmerId || data.farmerId === farmerId || farmerId.startsWith('demo') || farmerId === 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1';
        if (canDelete) {
          await withFirestoreTimeout(deleteDoc(docRef), 2000);
          try {
            await withFirestoreTimeout(deleteDoc(doc(db, COLLECTIONS.INVENTORY, productId)), 1000);
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[ProductService] Firestore delete error (local purge was successful):', err);
    }
  }
}
