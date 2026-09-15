import { describe, it, expect } from 'vitest';
import { 
  calculateAverage, 
  calculatePercentageChange, 
  determinePriceTrend, 
  determineVolatility, 
  calculateDemandScore,
  computePriceStatistics 
} from '@/features/analytics/utils/calculations';
import { MarketPriceObservation } from '@/features/analytics/types/analytics.types';

describe('Kisan Insights Calculations', () => {
  describe('calculateAverage', () => {
    it('computes correct arithmetic mean', () => {
      expect(calculateAverage([30, 32, 34])).toBe(32);
      expect(calculateAverage([10, 20])).toBe(15);
    });

    it('returns 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
      expect(calculateAverage([10, 10, 11])).toBe(10.33);
    });
  });

  describe('calculatePercentageChange', () => {
    it('computes positive percentage change', () => {
      // 30 to 36 = +20%
      expect(calculatePercentageChange(36, 30)).toBe(20.0);
    });

    it('computes negative percentage change', () => {
      // 40 to 30 = -25%
      expect(calculatePercentageChange(30, 40)).toBe(-25.0);
    });

    it('handles zero previous value safely', () => {
      expect(calculatePercentageChange(30, 0)).toBe(0);
    });
  });

  describe('determinePriceTrend', () => {
    it('identifies rising trend above threshold', () => {
      expect(determinePriceTrend(5.5, 10)).toBe('rising');
    });

    it('identifies falling trend below negative threshold', () => {
      expect(determinePriceTrend(-6.2, 10)).toBe('falling');
    });

    it('identifies stable trend within threshold boundaries', () => {
      expect(determinePriceTrend(1.2, 10)).toBe('stable');
      expect(determinePriceTrend(-1.8, 10)).toBe('stable');
    });

    it('returns insufficient_data for fewer than 3 observations', () => {
      expect(determinePriceTrend(15.0, 2)).toBe('insufficient_data');
    });
  });

  describe('determineVolatility', () => {
    it('returns low volatility for steady prices', () => {
      expect(determineVolatility([30, 30.5, 30, 30.2, 30.1])).toBe('low');
    });

    it('returns high volatility for wide price fluctuations', () => {
      expect(determineVolatility([20, 45, 18, 52, 22, 50])).toBe('high');
    });

    it('returns insufficient_data for fewer than 5 observations', () => {
      expect(determineVolatility([30, 35])).toBe('insufficient_data');
    });
  });

  describe('calculateDemandScore', () => {
    it('computes weighted score normalized to 0-100', () => {
      const score = calculateDemandScore(20, 40, 10, 5);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('caps maximum score at 100', () => {
      const score = calculateDemandScore(500, 1000, 200, 100);
      expect(score).toBe(100);
    });

    it('returns 0 for zero activity', () => {
      expect(calculateDemandScore(0, 0, 0, 0)).toBe(0);
    });
  });

  describe('computePriceStatistics', () => {
    it('computes complete stats for chronological observations', () => {
      const mockObs: MarketPriceObservation[] = [
        {
          cropId: 'tomato',
          cropName: 'Tomato',
          marketId: 'amritsar',
          marketName: 'Amritsar',
          state: 'Punjab',
          district: 'Amritsar',
          minPrice: 28,
          maxPrice: 34,
          modalPrice: 30,
          unit: 'kg',
          currency: 'INR',
          date: new Date('2026-08-01'),
          source: 'apmc',
          sourceName: 'APMC Amritsar',
          dataSource: 'demo',
          isDemo: true,
        },
        {
          cropId: 'tomato',
          cropName: 'Tomato',
          marketId: 'amritsar',
          marketName: 'Amritsar',
          state: 'Punjab',
          district: 'Amritsar',
          minPrice: 32,
          maxPrice: 38,
          modalPrice: 35,
          unit: 'kg',
          currency: 'INR',
          date: new Date('2026-08-15'),
          source: 'apmc',
          sourceName: 'APMC Amritsar',
          dataSource: 'demo',
          isDemo: true,
        },
        {
          cropId: 'tomato',
          cropName: 'Tomato',
          marketId: 'amritsar',
          marketName: 'Amritsar',
          state: 'Punjab',
          district: 'Amritsar',
          minPrice: 36,
          maxPrice: 42,
          modalPrice: 40,
          unit: 'kg',
          currency: 'INR',
          date: new Date('2026-08-30'),
          source: 'apmc',
          sourceName: 'APMC Amritsar',
          dataSource: 'demo',
          isDemo: true,
        }
      ];

      const stats = computePriceStatistics(mockObs, '30d');
      expect(stats).not.toBeNull();
      expect(stats?.currentPrice).toBe(40);
      expect(stats?.lowestPrice).toBe(30);
      expect(stats?.highestPrice).toBe(40);
      expect(stats?.averagePrice).toBe(35);
      expect(stats?.trend).toBe('rising');
      expect(stats?.isDemo).toBe(true);
    });

    it('returns null for empty observation list', () => {
      expect(computePriceStatistics([], '30d')).toBeNull();
    });
  });
});
