import { 
  MarketPriceObservation, 
  PriceStatistics, 
  PriceTrendState, 
  PriceVolatilityState, 
  TimePeriod 
} from '../types/analytics.types';

/**
 * Calculates arithmetic mean of an array of numbers.
 */
export function calculateAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Number((sum / values.length).toFixed(2));
}

/**
 * Calculates percentage change between current and previous values.
 * Returns 0 if previous value is 0.
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0 || isNaN(previous) || isNaN(current)) return 0;
  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(1));
}

/**
 * Classifies price trend based on percentage change threshold.
 * Default threshold is 3.0%.
 */
export function determinePriceTrend(
  changePercent: number, 
  observationCount: number,
  threshold: number = 3.0
): PriceTrendState {
  if (observationCount < 3) return 'insufficient_data';
  if (changePercent > threshold) return 'rising';
  if (changePercent < -threshold) return 'falling';
  return 'stable';
}

/**
 * Calculates price volatility using standard deviation normalized by mean.
 */
export function determineVolatility(prices: number[]): PriceVolatilityState {
  if (!prices || prices.length < 5) return 'insufficient_data';
  
  const avg = calculateAverage(prices);
  if (avg === 0) return 'insufficient_data';

  const variance = prices.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / avg) * 100;

  if (coefficientOfVariation < 5) return 'low';
  if (coefficientOfVariation <= 15) return 'moderate';
  return 'high';
}

/**
 * Computes full price statistics from a chronological list of observations.
 */
export function computePriceStatistics(
  observations: MarketPriceObservation[],
  period: TimePeriod = '30d'
): PriceStatistics | null {
  if (!observations || observations.length === 0) return null;

  // Ensure chronological order (oldest to newest)
  const sorted = [...observations].sort((a, b) => {
    const timeA = a.date instanceof Date ? a.date.getTime() : (a.date as any).toDate().getTime();
    const timeB = b.date instanceof Date ? b.date.getTime() : (b.date as any).toDate().getTime();
    return timeA - timeB;
  });

  const prices = sorted.map(o => o.modalPrice);
  const currentPrice = prices[prices.length - 1];
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  const averagePrice = calculateAverage(prices);

  // Divide into recent half vs older half to calculate direction
  const midpoint = Math.floor(prices.length / 2);
  const olderHalf = prices.slice(0, midpoint);
  const recentHalf = prices.slice(midpoint);

  const olderAvg = olderHalf.length > 0 ? calculateAverage(olderHalf) : currentPrice;
  const recentAvg = calculateAverage(recentHalf);

  const priceChangePercent = calculatePercentageChange(recentAvg, olderAvg);
  const trend = determinePriceTrend(priceChangePercent, prices.length);
  const volatility = determineVolatility(prices);

  const latest = sorted[sorted.length - 1];
  const lastDate = latest.date instanceof Date ? latest.date : (latest.date as any).toDate();

  return {
    currentPrice,
    averagePrice,
    highestPrice,
    lowestPrice,
    priceChangePercent,
    trend,
    volatility,
    observationCount: prices.length,
    timePeriod: period,
    unit: latest.unit || 'kg',
    lastUpdated: lastDate,
    dataSource: latest.dataSource || 'official',
    isDemo: Boolean(latest.isDemo)
  };
}

/**
 * Calculates a normalized Demand Activity Score (0 - 100)
 * Weighted: 15% searches, 25% views, 30% cart additions, 30% orders
 */
export function calculateDemandScore(
  searches: number,
  views: number,
  carts: number,
  orders: number
): number {
  const raw = (searches * 0.5) + (views * 1.0) + (carts * 2.5) + (orders * 5.0);
  // Normalize to 0-100 scale where 100 is very high activity
  const score = Math.min(100, Math.round(raw));
  return Math.max(0, score);
}
