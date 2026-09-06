import {
  db, COLLECTIONS, collection, doc, getDocs, setDoc, serverTimestamp,
} from '@/lib/firebase/firestore';
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_FARMERS,
  DEMO_INVENTORY,
  DEMO_USERS,
  isDemoMode,
  withFirestoreTimeout,
  disableFirestore,
} from './mockStore';
import { SEED_MARKET_PRICES } from '@/utils/seedData';

export interface SeedingResult {
  success: boolean;
  message: string;
  counts: {
    categories: number;
    products: number;
    farmers: number;
    inventory: number;
    marketPrices: number;
    users: number;
  };
  error?: string;
}

export interface FirebaseConnectionStatus {
  projectId: string;
  isConfigured: boolean;
  isConnected: boolean;
  collections: {
    categories: number;
    products: number;
    farmers: number;
    orders: number;
  };
  error?: string;
}

/**
 * Seed all Firestore collections ("containers") in the user's live Firebase project.
 * Uses setDoc with explicit IDs so re-running is idempotent (safe to run multiple times).
 */
export async function seedFirestoreContainers(): Promise<SeedingResult> {
  const counts = {
    categories: 0,
    products: 0,
    farmers: 0,
    inventory: 0,
    marketPrices: 0,
    users: 0,
  };

  try {
    // 1. Seed Categories Container
    for (const cat of DEMO_CATEGORIES) {
      await setDoc(doc(db, COLLECTIONS.CATEGORIES, cat.id), {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || '🥦',
        description: cat.description || '',
        order: cat.order || 1,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      counts.categories++;
    }

    // 2. Seed Users Container (Farmer, Buyer, Admin)
    for (const user of Object.values(DEMO_USERS)) {
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '9876543210',
        status: 'active',
        isEmailVerified: true,
        photoURL: user.photoURL || user.avatar,
        avatar: user.avatar || user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      counts.users++;
    }

    // 3. Seed Farmers Container
    for (const farmer of DEMO_FARMERS) {
      await setDoc(doc(db, COLLECTIONS.FARMERS, farmer.userId), {
        userId: farmer.userId,
        displayName: farmer.displayName,
        bio: farmer.bio,
        verificationStatus: 'verified',
        farmCount: farmer.farmCount || 2,
        primaryLocation: farmer.primaryLocation || 'Nashik, Maharashtra',
        district: farmer.district || 'Nashik',
        state: farmer.state || 'Maharashtra',
        aadhaarProvided: true,
        photoUrl: farmer.photoUrl || farmer.photoURL,
        photoURL: farmer.photoURL || farmer.photoUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      counts.farmers++;
    }

    // 4. Seed Products Container with real Unsplash agricultural photos
    for (const prod of DEMO_PRODUCTS) {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, prod.id), {
        farmerId: prod.farmerId,
        farmerName: prod.farmerName,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName,
        name: prod.name,
        description: prod.description,
        images: prod.images || [],
        quantity: prod.quantity,
        unit: prod.unit,
        price: prod.price,
        currency: 'INR',
        location: prod.location || 'Local Farm',
        district: prod.district || 'Nashik',
        state: prod.state || 'Maharashtra',
        qualityGrade: prod.qualityGrade || 'A',
        availabilityStatus: prod.availabilityStatus || 'available',
        tags: prod.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      counts.products++;
    }

    // 5. Seed Inventory Container
    for (const inv of DEMO_INVENTORY) {
      await setDoc(doc(db, COLLECTIONS.INVENTORY, inv.productId), {
        productId: inv.productId,
        farmerId: inv.farmerId,
        productName: inv.productName,
        availableQty: inv.availableQty,
        reservedQty: inv.reservedQty || 0,
        soldQty: inv.soldQty || 0,
        unit: inv.unit,
        lowStockThreshold: inv.lowStockThreshold || 50,
        updatedAt: serverTimestamp(),
      });
      counts.inventory++;
    }

    // 6. Seed Market Reference Prices
    for (let i = 0; i < SEED_MARKET_PRICES.length; i++) {
      const mp = SEED_MARKET_PRICES[i];
      const id = 'mp-' + (i + 1);
      await setDoc(doc(db, COLLECTIONS.MARKET_PRICES, id), {
        productName: mp.productName,
        priceMin: mp.priceMin,
        priceMax: mp.priceMax,
        unit: mp.unit,
        source: mp.source,
        district: mp.district,
        state: mp.state,
        sourceDate: new Date(),
        createdAt: serverTimestamp(),
      });
      counts.marketPrices++;
    }

    return {
      success: true,
      message: `Successfully populated Firestore containers in project '${import.meta.env.VITE_FIREBASE_PROJECT_ID}'!`,
      counts,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore seeding failed (check security rules / permissions):', errorMsg);
    return {
      success: false,
      message: `Firestore seeding encountered an error: ${errorMsg}`,
      counts,
      error: errorMsg,
    };
  }
}

/**
 * Check connectivity and count documents in main Firestore containers.
 */
export async function checkFirebaseStatus(): Promise<FirebaseConnectionStatus> {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'unconfigured';
  const isConfigured = !isDemoMode() && Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

  const status: FirebaseConnectionStatus = {
    projectId,
    isConfigured,
    isConnected: false,
    collections: {
      categories: 0,
      products: 0,
      farmers: 0,
      orders: 0,
    },
  };

  if (!isConfigured || isDemoMode()) {
    return status;
  }

  try {
    const isAvailable = await probeFirestoreAvailability();
    if (!isAvailable) {
      status.error = `Database '(default)' not found in project '${projectId}'. Please create Cloud Firestore in Firebase Console.`;
      return status;
    }

    const [catSnap, prodSnap, farmerSnap, orderSnap] = await withFirestoreTimeout(
      Promise.all([
        getDocs(collection(db, COLLECTIONS.CATEGORIES)),
        getDocs(collection(db, COLLECTIONS.PRODUCTS)),
        getDocs(collection(db, COLLECTIONS.FARMERS)),
        getDocs(collection(db, COLLECTIONS.ORDERS)),
      ]),
      1200
    );

    status.isConnected = true;
    status.collections = {
      categories: catSnap.size,
      products: prodSnap.size,
      farmers: farmerSnap.size,
      orders: orderSnap.size,
    };
  } catch (err: unknown) {
    status.isConnected = false;
    status.error = err instanceof Error ? err.message : String(err);
    disableFirestore(status.error);
  }

  return status;
}

/**
 * Fast REST probe: checks whether the project's (default) Firestore database is actually provisioned.
 * Takes ~150-600ms instead of waiting for the Firebase SDK's 30-second exponential retry backoff.
 */
export async function probeFirestoreAvailability(): Promise<boolean> {
  if (isDemoMode()) return false;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    disableFirestore('No project ID or API key configured');
    return false;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents?key=${apiKey}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.status === 404) {
      disableFirestore(`Firestore database '(default)' not yet created in project '${projectId}'`);
      return false;
    }
    return res.ok;
  } catch (err) {
    disableFirestore(`Firestore probe unreachable: ${err}`);
    return false;
  }
}

/**
 * Automatically ensures containers are initialized on first boot if Firestore is empty.
 * Guarded with fast REST probe and aggressive timeouts so it never freezes the app.
 */
export async function autoInitIfEmpty(): Promise<void> {
  if (isDemoMode()) return;

  try {
    const isAvailable = await probeFirestoreAvailability();
    if (!isAvailable || isDemoMode()) return;

    const catSnap = await withFirestoreTimeout(getDocs(collection(db, COLLECTIONS.CATEGORIES)), 1000);
    if (catSnap.empty) {
      console.info('Firestore categories container is empty. Auto-initializing collections...');
      await seedFirestoreContainers();
    }
  } catch (err) {
    disableFirestore(`Auto-init skipped: ${err}`);
  }
}
