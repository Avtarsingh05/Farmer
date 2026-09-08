import type {
  Product, ProductListItem, Category, FarmerProfile, Farm, Order,
  AppUser, InventoryItem, MarketPrice, AppNotification
} from '@/types';
import { isUserAdmin, ADMIN_UIDS } from '@/config/admin';

// Circuit Breaker State: If live Firestore is unprovisioned, unreachable, or times out,
// we immediately trip this breaker so the UI never experiences 15-30s retry lag.
let firestoreDisabled = false;

export function disableFirestore(reason?: string) {
  if (!firestoreDisabled) {
    console.warn(`[KisanMitra] Live Firestore bypassed (${reason || 'unprovisioned/offline'}). Instant local high-speed store active.`);
    firestoreDisabled = true;
    try {
      sessionStorage.setItem('kisanmitra_fs_disabled', 'true');
    } catch {}
  }
}

export function enableFirestore() {
  firestoreDisabled = false;
  try {
    sessionStorage.removeItem('kisanmitra_fs_disabled');
  } catch {}
}

export function isFirestoreDisabled(): boolean {
  if (firestoreDisabled) return true;
  try {
    if (sessionStorage.getItem('kisanmitra_fs_disabled') === 'true') {
      firestoreDisabled = true;
      return true;
    }
  } catch {}
  return false;
}

// Helper to determine if we should use local high-speed store
export function isDemoMode(): boolean {
  if (isFirestoreDisabled()) return true;
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!key || key.startsWith('AIzaSyDemo') || key === 'YOUR_FIREBASE_API_KEY') {
    return true;
  }
  return false;
}

/**
 * Wraps any Firestore promise with an aggressive timeout (default 800ms).
 * If Firestore hangs because the database is not provisioned, this prevents the UI from freezing.
 */
export async function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs = 800): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      disableFirestore(`Firestore operation timed out after ${timeoutMs}ms`);
      reject(new Error(`Firestore timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (err: unknown) {
    const msg = String(err);
    if (
      msg.includes('not found') ||
      msg.includes('Database') ||
      msg.includes('permission-denied') ||
      msg.includes('unavailable') ||
      msg.includes('timed out')
    ) {
      disableFirestore(msg);
    }
    throw err;
  } finally {
    clearTimeout(timer!);
  }
}

export interface MandiBenchmark {
  productId: string;
  productName: string;
  mandiName: string;
  district: string;
  state: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  reportDate: string;
  source: string;
}

export const REAL_MANDI_BENCHMARKS: Record<string, MandiBenchmark> = {
  'prod-1': {
    productId: 'prod-1',
    productName: 'Fresh Hybrid Tomatoes',
    mandiName: 'Pimpalgaon APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    modalPrice: 32,
    minPrice: 28,
    maxPrice: 35,
    unit: 'kg',
    reportDate: 'Daily APMC Bulletin',
    source: 'Agmarknet (Govt. of India)',
  },
  'prod-2': {
    productId: 'prod-2',
    productName: 'Red Nashik Onions',
    mandiName: 'Lasalgaon APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    modalPrice: 38,
    minPrice: 34,
    maxPrice: 42,
    unit: 'kg',
    reportDate: 'Daily APMC Bulletin',
    source: 'Agmarknet (Govt. of India)',
  },
  'prod-3': {
    productId: 'prod-3',
    productName: 'Aged 1121 Basmati Rice',
    mandiName: 'Karnal Grain Market',
    district: 'Karnal',
    state: 'Haryana',
    modalPrice: 98,
    minPrice: 92,
    maxPrice: 105,
    unit: 'kg',
    reportDate: 'Daily Mandi Bulletin',
    source: 'Agmarknet (Govt. of India)',
  },
  'prod-4': {
    productId: 'prod-4',
    productName: 'GI-Tagged Alphonso (Hapus) Mangoes',
    mandiName: 'Vashi APMC / Ratnagiri Market',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    modalPrice: 820,
    minPrice: 750,
    maxPrice: 920,
    unit: 'dozen',
    reportDate: 'Horticultural APMC Index',
    source: 'Agmarknet / MSAMB',
  },
  'prod-5': {
    productId: 'prod-5',
    productName: 'Golden Sharbati Wheat',
    mandiName: 'Sehore Mandi',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    modalPrice: 40,
    minPrice: 37,
    maxPrice: 44,
    unit: 'kg',
    reportDate: 'Daily Mandi Bulletin',
    source: 'Agmarknet (Govt. of India)',
  },
  'prod-6': {
    productId: 'prod-6',
    productName: 'Farm Fresh Potatoes',
    mandiName: 'Agra Mandi',
    district: 'Agra',
    state: 'Uttar Pradesh',
    modalPrice: 26,
    minPrice: 24,
    maxPrice: 29,
    unit: 'kg',
    reportDate: 'Daily APMC Bulletin',
    source: 'Agmarknet (Govt. of India)',
  },
  'prod-7': {
    productId: 'prod-7',
    productName: 'Unpolished Chana Dal (Desi)',
    mandiName: 'Gulbarga APMC',
    district: 'Kalaburagi',
    state: 'Karnataka',
    modalPrice: 88,
    minPrice: 82,
    maxPrice: 94,
    unit: 'kg',
    reportDate: 'Daily Mandi Bulletin',
    source: 'Agmarknet (Govt. of India)',
  },
  'prod-8': {
    productId: 'prod-8',
    productName: 'Organic Salem Turmeric Bulbs',
    mandiName: 'Erode / Salem APMC',
    district: 'Salem',
    state: 'Tamil Nadu',
    modalPrice: 165,
    minPrice: 150,
    maxPrice: 180,
    unit: 'kg',
    reportDate: 'Spices Board APMC Bulletin',
    source: 'Agmarknet / Spices Board',
  },
};

export function getMandiBenchmark(productId: string): MandiBenchmark | null {
  return REAL_MANDI_BENCHMARKS[productId] || null;
}

export const DEMO_USERS: Record<string, AppUser> = {
  farmer: {
    uid: 'demo-farmer-1',
    id: 'demo-farmer-1',
    name: 'Ramesh Patel',
    email: 'farmer@kisanmitra.in',
    role: 'farmer',
    phone: '9876543210',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  buyer: {
    uid: 'demo-buyer-1',
    id: 'demo-buyer-1',
    name: 'Priya Sharma',
    email: 'buyer@kisanmitra.in',
    role: 'buyer',
    phone: '9812345678',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  admin: {
    uid: 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1',
    id: 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1',
    name: 'Platform Administrator',
    email: 'admin@kisanmitra.in',
    role: 'admin',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  'DGzP6ZxUblbqM8RyvwoVrbAmEEs1': {
    uid: 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1',
    id: 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1',
    name: 'Platform Administrator',
    email: 'admin@kisanmitra.in',
    role: 'admin',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  'demo-admin-1': {
    uid: 'demo-admin-1',
    id: 'demo-admin-1',
    name: 'Demo Admin Officer',
    email: 'admin@kisanmitra.in',
    role: 'admin',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
};

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-veg', name: 'Vegetables', slug: 'vegetables', icon: '', description: 'Fresh farm-harvested vegetables', isActive: true, order: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-fruits', name: 'Fruits', slug: 'fruits', icon: '', description: 'Seasonal and exotic orchard fruits', isActive: true, order: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-grains', name: 'Grains & Cereals', slug: 'grains', icon: '', description: 'Wheat, Rice, Millets and grains', isActive: true, order: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-pulses', name: 'Pulses & Lentils', slug: 'pulses', icon: '', description: 'High-protein farm-cleaned lentils', isActive: true, order: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-oilseeds', name: 'Oilseeds', slug: 'oilseeds', icon: '', description: 'Mustard, groundnut, and sesame seeds', isActive: true, order: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-spices', name: 'Spices & Herbs', slug: 'spices', icon: '', description: 'Pure ground & whole Indian spices', isActive: true, order: 6, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-dairy', name: 'Dairy', slug: 'dairy', icon: '', description: 'Fresh farm milk and dairy products', isActive: true, order: 7, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-other', name: 'Other Farm Produce', slug: 'other', icon: '', description: 'Honey, jaggery and organic items', isActive: true, order: 8, createdAt: new Date(), updatedAt: new Date() },
];

export const DEMO_FARMERS: FarmerProfile[] = [
  {
    userId: 'demo-farmer-1',
    id: 'demo-farmer-1',
    displayName: 'Ramesh Patel',
    bio: 'Pioneer organic farmer with 14 acres in Nashik belt. Specializing in greenhouse tomatoes, red onions, and bell peppers.',
    verificationStatus: 'verified',
    farmCount: 2,
    primaryLocation: 'Nashik, Maharashtra',
    district: 'Nashik',
    state: 'Maharashtra',
    aadhaarProvided: true,
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
  {
    userId: 'demo-farmer-2',
    id: 'demo-farmer-2',
    displayName: 'Harpreet Singh',
    bio: 'Family farm practicing sustainable paddy and wheat rotation. 100% traditional 1121 Basmati Rice grower.',
    verificationStatus: 'verified',
    farmCount: 3,
    primaryLocation: 'Karnal, Haryana',
    district: 'Karnal',
    state: 'Haryana',
    aadhaarProvided: true,
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  {
    userId: 'demo-farmer-3',
    id: 'demo-farmer-3',
    displayName: 'Ganesh Deshmukh',
    bio: 'Orchardist specializing in Ratnagiri Alphonso (Hapus) mangoes and organic spices.',
    verificationStatus: 'verified',
    farmCount: 1,
    primaryLocation: 'Ratnagiri, Maharashtra',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    aadhaarProvided: true,
    photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date(),
  },
  {
    userId: 'demo-farmer-4',
    id: 'demo-farmer-4',
    displayName: 'Suresh Kumar',
    bio: 'Produces high-grade Sharbati wheat, mustard, and organic chickpeas in Central India.',
    verificationStatus: 'verified',
    farmCount: 2,
    primaryLocation: 'Sehore, Madhya Pradesh',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    aadhaarProvided: true,
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date(),
  },
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    farmerId: 'demo-farmer-1',
    farmerName: 'Ramesh Patel',
    categoryId: 'cat-veg',
    categoryName: 'Vegetables',
    category: 'Vegetables',
    name: 'Fresh Hybrid Tomatoes',
    description: 'Fresh greenhouse-grown hybrid tomatoes. Naturally ripened on the vine with balanced acidity and sweetness. Ideal for salads, curries, and purées.',
    images: [{ publicId: 'tomato-1', secureUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 650,
    unit: 'kg',
    price: 26,
    currency: 'INR',
    location: 'Nashik Agri Valley',
    district: 'Nashik',
    state: 'Maharashtra',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['tomato', 'organic', 'fresh'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-2',
    farmerId: 'demo-farmer-1',
    farmerName: 'Ramesh Patel',
    categoryId: 'cat-veg',
    categoryName: 'Vegetables',
    category: 'Vegetables',
    name: 'Red Nashik Onions',
    description: 'Sun-cured medium to large red onions with long shelf life. Excellent pungency and flavor profile direct from Nashik farms.',
    images: [{ publicId: 'onion-1', secureUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 1200,
    unit: 'kg',
    price: 32,
    currency: 'INR',
    location: 'Lasalgaon Farm',
    district: 'Nashik',
    state: 'Maharashtra',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['onion', 'nashik', 'vegetables'],
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-3',
    farmerId: 'demo-farmer-2',
    farmerName: 'Harpreet Singh',
    categoryId: 'cat-grains',
    categoryName: 'Grains & Cereals',
    category: 'Grains & Cereals',
    name: 'Aged 1121 Basmati Rice',
    description: 'Aged for 2 years. Extra long slender grain with delicate aroma and non-sticky texture after cooking. Farm direct without polishing losses.',
    images: [{ publicId: 'rice-1', secureUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 2500,
    unit: 'kg',
    price: 88,
    currency: 'INR',
    location: 'Gharaunda Farm',
    district: 'Karnal',
    state: 'Haryana',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['rice', 'basmati', 'grains'],
    createdAt: new Date('2024-03-03'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-4',
    farmerId: 'demo-farmer-3',
    farmerName: 'Ganesh Deshmukh',
    categoryId: 'cat-fruits',
    categoryName: 'Fruits',
    category: 'Fruits',
    name: 'GI-Tagged Alphonso (Hapus) Mangoes',
    description: 'Authentic Ratnagiri Hapus mangoes. Naturally ripened in hay without carbide chemicals. Sweet, rich, creamy saffron pulp.',
    images: [{ publicId: 'mango-1', secureUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 180,
    unit: 'dozen',
    price: 680,
    currency: 'INR',
    location: 'Coastal Orchard',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['mango', 'alphonso', 'fruit'],
    createdAt: new Date('2024-03-04'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-5',
    farmerId: 'demo-farmer-4',
    farmerName: 'Suresh Kumar',
    categoryId: 'cat-grains',
    categoryName: 'Grains & Cereals',
    category: 'Grains & Cereals',
    name: 'Golden Sharbati Wheat',
    description: 'Premium Sharbati whole wheat harvested in the fertile black soils of Sehore. High in fiber and protein, making soft golden rotis.',
    images: [{ publicId: 'wheat-1', secureUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 4000,
    unit: 'kg',
    price: 34,
    currency: 'INR',
    location: 'Sehore Plains',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['wheat', 'sharbati', 'grains'],
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-6',
    farmerId: 'demo-farmer-1',
    farmerName: 'Ramesh Patel',
    categoryId: 'cat-veg',
    categoryName: 'Vegetables',
    category: 'Vegetables',
    name: 'Farm Fresh Potatoes',
    description: 'Freshly harvested firm white potatoes. Ideal for storage, roasting, and everyday curries.',
    images: [{ publicId: 'potato-1', secureUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 1500,
    unit: 'kg',
    price: 22,
    currency: 'INR',
    location: 'Nashik Agri Valley',
    district: 'Nashik',
    state: 'Maharashtra',
    qualityGrade: 'B',
    availabilityStatus: 'available',
    tags: ['potato', 'vegetables'],
    createdAt: new Date('2024-03-06'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-7',
    farmerId: 'demo-farmer-4',
    farmerName: 'Suresh Kumar',
    categoryId: 'cat-pulses',
    categoryName: 'Pulses & Lentils',
    category: 'Pulses & Lentils',
    name: 'Unpolished Chana Dal (Desi)',
    description: 'Native Indian chickpea split lentils. Unpolished and pesticide-free, preserving vital nutrients and natural earthy aroma.',
    images: [{ publicId: 'dal-1', secureUrl: 'https://images.unsplash.com/photo-1585996656795-3b9ec8b1b22e?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 900,
    unit: 'kg',
    price: 76,
    currency: 'INR',
    location: 'Sehore Plains',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['chana', 'dal', 'pulses'],
    createdAt: new Date('2024-03-07'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-8',
    farmerId: 'demo-farmer-3',
    farmerName: 'Ganesh Deshmukh',
    categoryId: 'cat-spices',
    categoryName: 'Spices & Herbs',
    category: 'Spices & Herbs',
    name: 'Organic Salem Turmeric Bulbs',
    description: 'Sun-dried pure whole turmeric rhizomes with high curcumin content (above 4.5%). Rich color and medicinal aroma.',
    images: [{ publicId: 'turmeric-1', secureUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80', width: 600, height: 400, format: 'jpg' }],
    quantity: 400,
    unit: 'kg',
    price: 140,
    currency: 'INR',
    location: 'Coastal Spice Garden',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    qualityGrade: 'A',
    availabilityStatus: 'available',
    tags: ['turmeric', 'spices', 'organic'],
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date(),
  }
];

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    buyerId: 'demo-buyer-1',
    buyerName: 'Priya Sharma',
    farmerId: 'demo-farmer-1',
    farmerName: 'Ramesh Patel',
    items: [
      { productId: 'prod-1', productName: 'Fresh Hybrid Tomatoes', quantity: 20, unit: 'kg', unitPrice: 26, subtotal: 520 },
      { productId: 'prod-2', productName: 'Red Nashik Onions', quantity: 15, unit: 'kg', unitPrice: 32, subtotal: 480 },
    ],
    subtotal: 1000,
    deliveryFee: 50,
    total: 1050,
    currency: 'INR',
    paymentStatus: 'paid',
    orderStatus: 'ready_for_dispatch',
    deliveryType: 'delivery',
    deliveryAddress: {
      line1: 'Flat 402, Green Acre Heights',
      line2: 'Bandra West',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      pincode: '400050',
      name: 'Priya Sharma',
      phone: '9812345678',
    },
    statusHistory: [
      { status: 'pending', changedBy: 'demo-buyer-1', changedByRole: 'buyer', timestamp: new Date(Date.now() - 86400000) },
      { status: 'accepted', changedBy: 'demo-farmer-1', changedByRole: 'farmer', timestamp: new Date(Date.now() - 43200000) },
      { status: 'processing', changedBy: 'demo-farmer-1', changedByRole: 'farmer', timestamp: new Date(Date.now() - 21600000) },
      { status: 'ready_for_dispatch', changedBy: 'demo-farmer-1', changedByRole: 'farmer', timestamp: new Date(Date.now() - 3600000) },
    ],
    notes: 'Please ring bell twice on arrival.',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
  },
  {
    id: 'ord-1002',
    buyerId: 'demo-buyer-1',
    buyerName: 'Priya Sharma',
    farmerId: 'demo-farmer-2',
    farmerName: 'Harpreet Singh',
    items: [
      { productId: 'prod-3', productName: 'Aged 1121 Basmati Rice', quantity: 25, unit: 'kg', unitPrice: 88, subtotal: 2200 },
    ],
    subtotal: 2200,
    deliveryFee: 0,
    total: 2200,
    currency: 'INR',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    deliveryType: 'delivery',
    deliveryAddress: {
      line1: 'Flat 402, Green Acre Heights',
      line2: 'Bandra West',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      pincode: '400050',
      name: 'Priya Sharma',
      phone: '9812345678',
    },
    statusHistory: [
      { status: 'pending', changedBy: 'demo-buyer-1', changedByRole: 'buyer', timestamp: new Date(Date.now() - 259200000) },
      { status: 'accepted', changedBy: 'demo-farmer-2', changedByRole: 'farmer', timestamp: new Date(Date.now() - 172800000) },
      { status: 'out_for_delivery', changedBy: 'demo-farmer-2', changedByRole: 'farmer', timestamp: new Date(Date.now() - 86400000) },
      { status: 'delivered', changedBy: 'demo-farmer-2', changedByRole: 'farmer', timestamp: new Date(Date.now() - 43200000) },
    ],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 43200000),
  }
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'demo-farmer-1',
    type: 'new_order',
    title: 'New Order Received',
    body: 'Priya Sharma placed an order (ord-1001) for Tomatoes and Onions.',
    message: 'Priya Sharma placed an order (ord-1001) for Tomatoes and Onions.',
    actionUrl: '/farmer/orders/ord-1001',
    isRead: false,
    relatedId: 'ord-1001',
    relatedType: 'order',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'notif-2',
    userId: 'demo-farmer-1',
    type: 'verification_approved',
    title: 'Farmer Profile Verified',
    body: 'Congratulations! Your farm details have been verified by the platform team.',
    message: 'Congratulations! Your farm details have been verified by the platform team.',
    actionUrl: '/farmer/profile',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'notif-3',
    userId: 'demo-buyer-1',
    type: 'order_status_changed',
    title: 'Order Status Update',
    body: 'Your order (ord-1001) is now Ready for Dispatch from Ramesh Patel’s farm.',
    message: 'Your order (ord-1001) is now Ready for Dispatch from Ramesh Patel’s farm.',
    actionUrl: '/buyer/orders/ord-1001',
    isRead: false,
    relatedId: 'ord-1001',
    relatedType: 'order',
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: 'notif-4',
    userId: 'demo-buyer-1',
    type: 'order_delivered',
    title: 'Order Delivered',
    body: 'Your Basmati Rice order (ord-1002) was delivered successfully.',
    message: 'Your Basmati Rice order (ord-1002) was delivered successfully.',
    actionUrl: '/buyer/orders/ord-1002',
    isRead: true,
    relatedId: 'ord-1002',
    relatedType: 'order',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
];

export const DEMO_INVENTORY: InventoryItem[] = [
  {
    productId: 'prod-1',
    farmerId: 'demo-farmer-1',
    productName: 'Fresh Hybrid Tomatoes',
    availableQty: 650,
    reservedQty: 20,
    soldQty: 180,
    unit: 'kg',
    lowStockThreshold: 100,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-2',
    farmerId: 'demo-farmer-1',
    productName: 'Red Nashik Onions',
    availableQty: 1200,
    reservedQty: 15,
    soldQty: 340,
    unit: 'kg',
    lowStockThreshold: 150,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-6',
    farmerId: 'demo-farmer-1',
    productName: 'Farm Fresh Potatoes',
    availableQty: 1500,
    reservedQty: 0,
    soldQty: 250,
    unit: 'kg',
    lowStockThreshold: 200,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-3',
    farmerId: 'demo-farmer-2',
    productName: 'Aged 1121 Basmati Rice',
    availableQty: 2500,
    reservedQty: 0,
    soldQty: 600,
    unit: 'kg',
    lowStockThreshold: 300,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-4',
    farmerId: 'demo-farmer-3',
    productName: 'GI-Tagged Alphonso (Hapus) Mangoes',
    availableQty: 180,
    reservedQty: 0,
    soldQty: 75,
    unit: 'dozen',
    lowStockThreshold: 30,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-5',
    farmerId: 'demo-farmer-4',
    productName: 'Golden Sharbati Wheat',
    availableQty: 4000,
    reservedQty: 0,
    soldQty: 800,
    unit: 'kg',
    lowStockThreshold: 500,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-7',
    farmerId: 'demo-farmer-4',
    productName: 'Unpolished Chana Dal (Desi)',
    availableQty: 900,
    reservedQty: 0,
    soldQty: 120,
    unit: 'kg',
    lowStockThreshold: 100,
    updatedAt: new Date(),
  },
  {
    productId: 'prod-8',
    farmerId: 'demo-farmer-3',
    productName: 'Organic Salem Turmeric Bulbs',
    availableQty: 400,
    reservedQty: 0,
    soldQty: 50,
    unit: 'kg',
    lowStockThreshold: 50,
    updatedAt: new Date(),
  },
];

// Persistent state handlers using localStorage with instant in-memory fallback
const STORAGE_KEYS = {
  PRODUCTS: 'kisanmitra_products',
  ORDERS: 'kisanmitra_orders',
  USER: 'kisanmitra_user',
  FAVORITES: 'kisanmitra_favs',
  INVENTORY: 'kisanmitra_inventory',
  NOTIFICATIONS: 'kisanmitra_notifs',
};

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEMO_PRODUCTS];
}

export function saveStoredProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch {}
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEMO_ORDERS];
}

export function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch {}
}

export function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      const user: AppUser = JSON.parse(raw);
      if (user && (isUserAdmin(user.uid) || isUserAdmin(user.id))) {
        user.role = 'admin';
      }
      return user;
    }
  } catch {}
  return null;
}

export function saveStoredUser(user: AppUser | null) {
  try {
    if (user) {
      if (isUserAdmin(user.uid) || isUserAdmin(user.id)) {
        user.role = 'admin';
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch {}
}

export function getStoredInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEMO_INVENTORY];
}

export function saveStoredInventory(items: InventoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  } catch {}
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEMO_NOTIFICATIONS];
}

export function saveStoredNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch {}
}

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['prod-1', 'prod-4'];
}

export function saveStoredFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch {}
}
