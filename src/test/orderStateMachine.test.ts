import { describe, it, expect } from 'vitest';
import { canTransition, ORDER_TRANSITIONS } from '@/utils/orderStateMachine';
import type { OrderStatus } from '@/types';

describe('Order State Machine', () => {
  it('allows valid transition: pending -> accepted', () => {
    expect(canTransition('pending', 'accepted')).toBe(true);
  });

  it('allows valid transition: pending -> rejected', () => {
    expect(canTransition('pending', 'rejected')).toBe(true);
  });

  it('allows valid transition: accepted -> processing', () => {
    expect(canTransition('accepted', 'processing')).toBe(true);
  });

  it('allows valid transition: processing -> ready_for_dispatch', () => {
    expect(canTransition('processing', 'ready_for_dispatch')).toBe(true);
  });

  it('allows valid transition: ready_for_dispatch -> out_for_delivery', () => {
    expect(canTransition('ready_for_dispatch', 'out_for_delivery')).toBe(true);
  });

  it('allows valid transition: out_for_delivery -> delivered', () => {
    expect(canTransition('out_for_delivery', 'delivered')).toBe(true);
  });

  it('blocks invalid transition: pending -> delivered', () => {
    expect(canTransition('pending', 'delivered')).toBe(false);
  });

  it('blocks invalid transition: delivered -> cancelled', () => {
    expect(canTransition('delivered', 'cancelled')).toBe(false);
  });

  it('blocks invalid transition: rejected -> processing', () => {
    expect(canTransition('rejected', 'processing')).toBe(false);
  });

  it('blocks invalid transition: delivered -> pending', () => {
    expect(canTransition('delivered', 'pending')).toBe(false);
  });

  it('terminal states have no outgoing transitions', () => {
    const terminalStatuses: OrderStatus[] = ['delivered', 'rejected', 'cancelled'];
    for (const status of terminalStatuses) {
      expect(ORDER_TRANSITIONS[status]).toHaveLength(0);
    }
  });

  it('returns false for self-transitions', () => {
    expect(canTransition('pending', 'pending')).toBe(false);
  });
});
