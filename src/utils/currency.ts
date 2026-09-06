/**
 * Format a number as Indian Rupees using Indian numbering system.
 * e.g. 125000 → ₹1,25,000
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a price with unit. e.g. "₹42/kg"
 */
export function formatPricePerUnit(price: number, unit: string): string {
  return `${formatCurrency(price)}/${unit}`;
}

/**
 * Format a number with Indian numbering (no currency symbol).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Calculate potential savings vs a reference price.
 * Returns null if reference price is unavailable or lower than asking.
 */
export function calculateSavings(
  askingPrice: number,
  referencePrice: number | null | undefined
): number | null {
  if (!referencePrice || referencePrice <= askingPrice) return null;
  return referencePrice - askingPrice;
}
