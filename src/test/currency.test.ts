import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPricePerUnit, formatNumber, calculateSavings } from '@/utils/currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('formats whole numbers in INR', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
      expect(result).toContain('₹');
    });

    it('formats large Indian numbers with lakh separator', () => {
      const result = formatCurrency(125000);
      // Indian format: ₹1,25,000
      expect(result).toContain('₹');
      expect(result).toMatch(/1,25,000/);
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('handles decimal amounts', () => {
      const result = formatCurrency(42.5);
      expect(result).toContain('42');
    });
  });

  describe('formatPricePerUnit', () => {
    it('combines price and unit correctly', () => {
      const result = formatPricePerUnit(42, 'kg');
      expect(result).toContain('/kg');
      expect(result).toContain('42');
    });
  });

  describe('formatNumber', () => {
    it('formats number in Indian notation', () => {
      expect(formatNumber(100000)).toBe('1,00,000');
    });

    it('formats small numbers normally', () => {
      expect(formatNumber(42)).toBe('42');
    });
  });

  describe('calculateSavings', () => {
    it('returns savings when reference price is higher', () => {
      expect(calculateSavings(30, 45)).toBe(15);
    });

    it('returns null when asking price is higher than reference', () => {
      expect(calculateSavings(50, 45)).toBeNull();
    });

    it('returns null when reference price is null', () => {
      expect(calculateSavings(30, null)).toBeNull();
    });

    it('returns null when reference price is undefined', () => {
      expect(calculateSavings(30, undefined)).toBeNull();
    });

    it('returns null when prices are equal', () => {
      expect(calculateSavings(30, 30)).toBeNull();
    });
  });
});
