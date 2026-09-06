/**
 * KisanMitra — Development seed data
 *
 * PURPOSE: Development / demo only.
 * DO NOT run against production Firebase project.
 * Uses realistic Indian agricultural data.
 * All prices are illustrative — NOT real market data.
 *
 * Usage:
 *   Ensure VITE_ env vars are set in .env.local pointing to a DEV project.
 *   Run in browser console after importing, or adapt as a Node.js script
 *   using firebase-admin for direct seeding.
 */

export const SEED_CATEGORIES = [
  { name: 'Vegetables',  slug: 'vegetables',  icon: '🥦', order: 1, isActive: true },
  { name: 'Fruits',      slug: 'fruits',      icon: '🍎', order: 2, isActive: true },
  { name: 'Grains',      slug: 'grains',      icon: '🌾', order: 3, isActive: true },
  { name: 'Pulses',      slug: 'pulses',      icon: '🫘', order: 4, isActive: true },
  { name: 'Oilseeds',    slug: 'oilseeds',    icon: '🌻', order: 5, isActive: true },
  { name: 'Spices',      slug: 'spices',      icon: '🌶️', order: 6, isActive: true },
  { name: 'Dairy',       slug: 'dairy',       icon: '🥛', order: 7, isActive: true },
  { name: 'Other',       slug: 'other',       icon: '📦', order: 8, isActive: true },
];

export const SEED_PRODUCTS = [
  {
    name: 'Tomato',
    description: 'Fresh hybrid tomatoes grown without excessive pesticides. Best suited for cooking and salads.',
    categorySlug: 'vegetables',
    quantity: 500,
    unit: 'kg',
    price: 28,
    qualityGrade: 'A' as const,
    district: 'Nashik',
    state: 'Maharashtra',
    tags: ['tomato', 'vegetables'],
  },
  {
    name: 'Potato',
    description: 'White potato variety. Good for everyday cooking. Stored in cool, dry conditions.',
    categorySlug: 'vegetables',
    quantity: 1000,
    unit: 'kg',
    price: 22,
    qualityGrade: 'B' as const,
    district: 'Agra',
    state: 'Uttar Pradesh',
    tags: ['potato', 'vegetables'],
  },
  {
    name: 'Onion',
    description: 'Medium-sized red onions. Good pungency, suitable for storage and export quality.',
    categorySlug: 'vegetables',
    quantity: 800,
    unit: 'kg',
    price: 35,
    qualityGrade: 'A' as const,
    district: 'Nashik',
    state: 'Maharashtra',
    tags: ['onion', 'vegetables'],
  },
  {
    name: 'Wheat (Sharbati)',
    description: 'Sharbati wheat variety from MP. Well-known for its taste and quality. Suitable for chapati and bread.',
    categorySlug: 'grains',
    quantity: 5000,
    unit: 'kg',
    price: 32,
    qualityGrade: 'A' as const,
    district: 'Sehore',
    state: 'Madhya Pradesh',
    tags: ['wheat', 'grains'],
  },
  {
    name: 'Basmati Rice',
    description: 'Long-grain basmati rice. Naturally fragrant. Grown in the traditional basmati belt.',
    categorySlug: 'grains',
    quantity: 2000,
    unit: 'kg',
    price: 85,
    qualityGrade: 'A' as const,
    district: 'Karnal',
    state: 'Haryana',
    tags: ['rice', 'basmati', 'grains'],
  },
  {
    name: 'Alphonso Mango',
    description: 'Hapus/Alphonso mangoes from Ratnagiri. Available during season. GI tagged variety.',
    categorySlug: 'fruits',
    quantity: 200,
    unit: 'dozen',
    price: 650,
    qualityGrade: 'A' as const,
    district: 'Ratnagiri',
    state: 'Maharashtra',
    tags: ['mango', 'alphonso', 'fruits'],
  },
  {
    name: 'Mustard Seeds',
    description: 'Yellow mustard seeds. Suitable for oil extraction and tempering. Well-dried.',
    categorySlug: 'oilseeds',
    quantity: 3000,
    unit: 'kg',
    price: 55,
    qualityGrade: 'B' as const,
    district: 'Alwar',
    state: 'Rajasthan',
    tags: ['mustard', 'oilseeds'],
  },
  {
    name: 'Chana Dal',
    description: 'Split chickpea lentil. Machine-cleaned. Suitable for direct consumer and restaurant use.',
    categorySlug: 'pulses',
    quantity: 1500,
    unit: 'kg',
    price: 78,
    qualityGrade: 'A' as const,
    district: 'Gulbarga',
    state: 'Karnataka',
    tags: ['chana', 'dal', 'pulses'],
  },
];

export const SEED_MARKET_PRICES = [
  {
    productName: 'Hybrid Tomato',
    priceMin: 28,
    priceMax: 35,
    unit: 'kg',
    source: 'Agmarknet (Pimpalgaon APMC, Nashik)',
    district: 'Nashik',
    state: 'Maharashtra',
  },
  {
    productName: 'White Potato',
    priceMin: 24,
    priceMax: 29,
    unit: 'kg',
    source: 'Agmarknet (Agra Mandi, UP)',
    district: 'Agra',
    state: 'Uttar Pradesh',
  },
  {
    productName: 'Red Onion',
    priceMin: 34,
    priceMax: 42,
    unit: 'kg',
    source: 'Agmarknet (Lasalgaon APMC, Nashik)',
    district: 'Nashik',
    state: 'Maharashtra',
  },
  {
    productName: '1121 Basmati Rice',
    priceMin: 92,
    priceMax: 105,
    unit: 'kg',
    source: 'Agmarknet (Karnal Grain Market, Haryana)',
    district: 'Karnal',
    state: 'Haryana',
  },
  {
    productName: 'Sharbati Wheat',
    priceMin: 37,
    priceMax: 44,
    unit: 'kg',
    source: 'Agmarknet (Sehore APMC, MP)',
    district: 'Sehore',
    state: 'Madhya Pradesh',
  },
  {
    productName: 'Alphonso Mango',
    priceMin: 750,
    priceMax: 920,
    unit: 'dozen',
    source: 'MSAMB / Agmarknet (Ratnagiri APMC)',
    district: 'Ratnagiri',
    state: 'Maharashtra',
  },
];
