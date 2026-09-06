import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a date for display. e.g. "5 Sep 2026"
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return format(date, 'd MMM yyyy');
}

/**
 * Format date with time. e.g. "5 Sep 2026, 2:30 PM"
 */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '—';
  return format(date, 'd MMM yyyy, h:mm aa');
}

/**
 * Relative time. e.g. "2 hours ago"
 */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Convert a Firestore Timestamp or plain object to a JS Date.
 */
export function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Firestore Timestamp
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
}
