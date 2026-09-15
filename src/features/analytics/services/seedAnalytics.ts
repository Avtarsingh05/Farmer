import { 
  MarketPriceObservation, 
  RegionalPriceRecord, 
  DemandHistoryRecord, 
  CropInfo 
} from '../types/analytics.types';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, writeBatch, doc, Timestamp, query, limit } from 'firebase/firestore';
import { isDemoMode, withFirestoreTimeout } from '@/services/mockStore';

export const SUPPORTED_CROPS: CropInfo[] = [
  { id: 'tomato', name: 'Tomato', localNames: ['tamatar', 'ਟਮਾਟਰ'], category: 'cat-veg', unit: 'kg', active: true },
  { id: 'potato', name: 'Potato', localNames: ['aloo', 'ਆਲੂ'], category: 'cat-veg', unit: 'kg', active: true },
  { id: 'onion', name: 'Onion', localNames: ['pyaaz', 'ਪਿਆਜ਼'], category: 'cat-veg', unit: 'kg', active: true },
  { id: 'wheat', name: 'Wheat', localNames: ['gehun', 'ਕਣਕ'], category: 'cat-grains', unit: 'quintal', active: true },
  { id: 'rice', name: 'Rice', localNames: ['chawal', 'ਚੌਲ'], category: 'cat-grains', unit: 'quintal', active: true },
  { id: 'mustard', name: 'Mustard', localNames: ['sarson', 'ਸਰ੍ਹੋਂ'], category: 'cat-spices', unit: 'kg', active: true },
];

const DISTRICTS = [
  { district: 'Amritsar', state: 'Punjab', marketName: 'Amritsar Main Mandi' },
  { district: 'Jalandhar', state: 'Punjab', marketName: 'Jalandhar APMC' },
  { district: 'Ludhiana', state: 'Punjab', marketName: 'Ludhiana Central Grain Market' },
  { district: 'Patiala', state: 'Punjab', marketName: 'Patiala Mandi' },
  { district: 'Karnal', state: 'Haryana', marketName: 'Karnal Agricultural Market' },
  { district: 'Nashik', state: 'Maharashtra', marketName: 'Nashik APMC Market' },
];

const BASE_PRICES: Record<string, { base: number; variance: number; unit: string }> = {
  tomato:  { base: 32, variance: 6, unit: 'kg' },
  potato:  { base: 26, variance: 4, unit: 'kg' },
  onion:   { base: 38, variance: 7, unit: 'kg' },
  wheat:   { base: 2250, variance: 120, unit: 'quintal' },
  rice:    { base: 3400, variance: 180, unit: 'quintal' },
  mustard: { base: 55, variance: 8, unit: 'kg' },
};

/**
 * Deterministically generates historical time series for demonstration & initial bootstrap.
 */
export function generateDemoMarketPrices(): MarketPriceObservation[] {
  const observations: MarketPriceObservation[] = [];
  const now = new Date();

  // Generate for 90 days back
  for (let d = 90; d >= 0; d--) {
    const obsDate = new Date(now);
    obsDate.setDate(now.getDate() - d);
    obsDate.setHours(11, 0, 0, 0); // 11 AM daily APMC bulletin time

    // Cycle day factor for subtle realistic seasonal trend
    const trendWave = Math.sin((90 - d) / 14) * 0.15; // 2-week subtle sinusoidal trend

    SUPPORTED_CROPS.forEach(crop => {
      const config = BASE_PRICES[crop.id] || { base: 30, variance: 5, unit: 'kg' };
      
      // Calculate daily price with regional differences
      DISTRICTS.forEach((dist, distIdx) => {
        // District specific offset
        const distOffset = (distIdx - 2) * (config.base * 0.03);
        const dayNoise = ((Math.sin(d * 17 + distIdx) + Math.cos(d * 23)) / 2) * config.variance;
        
        const modal = Math.round(config.base * (1 + trendWave) + distOffset + dayNoise);
        const min = Math.round(modal * 0.92);
        const max = Math.round(modal * 1.08);

        observations.push({
          cropId: crop.id,
          cropName: crop.name,
          marketId: dist.district.toLowerCase(),
          marketName: dist.marketName,
          state: dist.state,
          district: dist.district,
          minPrice: min,
          maxPrice: max,
          modalPrice: modal,
          unit: config.unit,
          currency: 'INR',
          date: obsDate,
          source: 'apmc_demo',
          sourceName: `${dist.marketName} Daily Bulletin`,
          dataSource: 'demo',
          isDemo: true,
          createdAt: obsDate,
          updatedAt: obsDate,
        });
      });
    });
  }

  return observations;
}

export function generateDemoRegionalPrices(): RegionalPriceRecord[] {
  const records: RegionalPriceRecord[] = [];
  const now = new Date();

  SUPPORTED_CROPS.forEach(crop => {
    const config = BASE_PRICES[crop.id] || { base: 30, variance: 5, unit: 'kg' };
    
    DISTRICTS.forEach((dist, distIdx) => {
      const distOffset = (distIdx - 2) * (config.base * 0.035);
      const avg = Math.round(config.base + distOffset);

      records.push({
        cropId: crop.id,
        cropName: crop.name,
        regionType: 'district',
        state: dist.state,
        district: dist.district,
        marketName: dist.marketName,
        averagePrice: avg,
        minPrice: Math.round(avg * 0.93),
        maxPrice: Math.round(avg * 1.07),
        unit: config.unit,
        currency: 'INR',
        date: now,
        source: 'APMC Regional Bulletin',
        dataSource: 'demo',
        isDemo: true,
      });
    });
  });

  return records;
}

export function generateDemoDemandHistory(): DemandHistoryRecord[] {
  const records: DemandHistoryRecord[] = [];
  const now = new Date();

  for (let d = 30; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);

    SUPPORTED_CROPS.forEach((crop, idx) => {
      const baseActivity = (idx + 1) * 12;
      const searches = Math.round(baseActivity + Math.sin(d) * 8 + 15);
      const views = Math.round(searches * 1.8);
      const carts = Math.round(searches * 0.4);
      const orders = Math.round(searches * 0.2);

      const demandScore = Math.min(100, Math.round((searches * 0.5) + (views * 0.8) + (carts * 2.0) + (orders * 4.0)));

      records.push({
        cropId: crop.id,
        cropName: crop.name,
        date,
        searchCount: searches,
        viewCount: views,
        cartCount: carts,
        orderCount: orders,
        requestedQuantity: searches * 25,
        fulfilledQuantity: orders * 25,
        demandScore,
        dataSource: 'demo',
        isDemo: true,
      });
    });
  }

  return records;
}

const STORAGE_KEY_MARKET_PRICES = 'kisanmitra_analytics_marketPrices';
const STORAGE_KEY_REGIONAL_PRICES = 'kisanmitra_analytics_regionalPrices';
const STORAGE_KEY_DEMAND = 'kisanmitra_analytics_demand';

/**
 * Initializes analytics data in local store if not present.
 */
export function ensureDemoAnalyticsInitialized() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEY_MARKET_PRICES)) {
    const demoPrices = generateDemoMarketPrices();
    localStorage.setItem(STORAGE_KEY_MARKET_PRICES, JSON.stringify(demoPrices));
  }

  if (!localStorage.getItem(STORAGE_KEY_REGIONAL_PRICES)) {
    const demoRegional = generateDemoRegionalPrices();
    localStorage.setItem(STORAGE_KEY_REGIONAL_PRICES, JSON.stringify(demoRegional));
  }

  if (!localStorage.getItem(STORAGE_KEY_DEMAND)) {
    const demoDemand = generateDemoDemandHistory();
    localStorage.setItem(STORAGE_KEY_DEMAND, JSON.stringify(demoDemand));
  }
}

/**
 * Seeds analytics data directly into live Firestore (idempotent, admin/bootstrap use).
 */
export async function seedFirestoreAnalytics(): Promise<{ seededCount: number }> {
  if (isDemoMode()) {
    ensureDemoAnalyticsInitialized();
    return { seededCount: 90 };
  }

  // Check if live collection already has data
  try {
    const existing = await withFirestoreTimeout(
      getDocs(query(collection(db, 'marketPrices'), limit(5)))
    );

    if (!existing.empty) {
      return { seededCount: 0 }; // Already seeded
    }

    const demoPrices = generateDemoMarketPrices();
    // Batch in chunks of 450 (Firestore limit is 500 writes per batch)
    const chunkSize = 400;
    let count = 0;

    for (let i = 0; i < Math.min(demoPrices.length, 800); i += chunkSize) {
      const chunk = demoPrices.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach(obs => {
        const ref = doc(collection(db, 'marketPrices'));
        batch.set(ref, {
          ...obs,
          date: Timestamp.fromDate(obs.date as Date),
          createdAt: Timestamp.fromDate(obs.createdAt as Date),
          updatedAt: Timestamp.fromDate(obs.updatedAt as Date),
        });
      });

      await withFirestoreTimeout(batch.commit());
      count += chunk.length;
    }

    return { seededCount: count };
  } catch (err) {
    console.warn('[Analytics] Firestore seed fallback to local cache:', err);
    ensureDemoAnalyticsInitialized();
    return { seededCount: 90 };
  }
}
