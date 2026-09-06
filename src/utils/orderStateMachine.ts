import type { OrderStatus } from '@/types';

/**
 * Valid order status transitions.
 * Key = current status, Value = allowed next statuses.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:             ['accepted', 'rejected', 'cancelled'],
  accepted:            ['processing', 'cancelled'],
  rejected:            [],
  processing:          ['ready_for_dispatch', 'cancelled'],
  ready_for_dispatch:  ['out_for_delivery'],
  out_for_delivery:    ['delivered'],
  delivered:           [],
  cancelled:           [],
};

/**
 * Check if a status transition is valid.
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Human-readable label for each status.
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:             'Pending',
  accepted:            'Accepted',
  rejected:            'Rejected',
  processing:          'Processing',
  ready_for_dispatch:  'Ready for Dispatch',
  out_for_delivery:    'Out for Delivery',
  delivered:           'Delivered',
  cancelled:           'Cancelled',
};

/**
 * Tailwind color class for each status badge.
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:             'badge-amber',
  accepted:            'badge-blue',
  rejected:            'badge-red',
  processing:          'badge-blue',
  ready_for_dispatch:  'badge-blue',
  out_for_delivery:    'badge-blue',
  delivered:           'badge-green',
  cancelled:           'badge-neutral',
};

/**
 * Statuses that a farmer can set (from their side).
 */
export const FARMER_CONTROLLABLE_STATUSES: OrderStatus[] = [
  'accepted',
  'rejected',
  'processing',
  'ready_for_dispatch',
  'out_for_delivery',
  'delivered',
];

/**
 * Statuses that a buyer can trigger cancellation from.
 */
export const BUYER_CANCELLABLE_FROM: OrderStatus[] = [
  'pending',
];
