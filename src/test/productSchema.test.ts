import { describe, it, expect } from 'vitest';
import { productSchema } from '@/schemas/product.schema';

describe('Product Schema Validation', () => {
  const valid = {
    name: 'Fresh Tomato',
    description: 'High quality tomatoes grown organically in Nashik.',
    categoryId: 'cat-vegetables',
    quantity: 500,
    unit: 'kg' as const,
    price: 28,
    qualityGrade: 'A' as const,
  };

  it('accepts a valid product', () => {
    const result = productSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = productSchema.safeParse({ ...valid, price: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = productSchema.safeParse({ ...valid, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid unit', () => {
    const result = productSchema.safeParse({ ...valid, unit: 'truckload' });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = productSchema.safeParse({ ...valid, name: 'T' });
    expect(result.success).toBe(false);
  });

  it('rejects short description', () => {
    const result = productSchema.safeParse({ ...valid, description: 'Short' });
    expect(result.success).toBe(false);
  });

  it('accepts valid quality grades', () => {
    for (const grade of ['A', 'B', 'C', 'mixed'] as const) {
      const result = productSchema.safeParse({ ...valid, qualityGrade: grade });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid quality grade', () => {
    const result = productSchema.safeParse({ ...valid, qualityGrade: 'Premium' });
    expect(result.success).toBe(false);
  });

  it('rejects missing categoryId', () => {
    const result = productSchema.safeParse({ ...valid, categoryId: '' });
    expect(result.success).toBe(false);
  });
});
