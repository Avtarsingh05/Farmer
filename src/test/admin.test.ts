import { describe, it, expect, beforeEach } from 'vitest';
import { isUserAdmin, ADMIN_UIDS } from '@/config/admin';
import { DEMO_USERS, getStoredUser, saveStoredUser } from '@/services/mockStore';

describe('Admin Configuration & Role Enforcement', () => {
  it('identifies DGzP6ZxUblbqM8RyvwoVrbAmEEs1 as an administrator', () => {
    expect(isUserAdmin('DGzP6ZxUblbqM8RyvwoVrbAmEEs1')).toBe(true);
    expect(ADMIN_UIDS).toContain('DGzP6ZxUblbqM8RyvwoVrbAmEEs1');
  });

  it('identifies demo-admin-1 as an administrator', () => {
    expect(isUserAdmin('demo-admin-1')).toBe(true);
  });

  it('rejects arbitrary UIDs from being admin', () => {
    expect(isUserAdmin('regular-user-123')).toBe(false);
    expect(isUserAdmin(null)).toBe(false);
    expect(isUserAdmin(undefined)).toBe(false);
  });

  it('DEMO_USERS has admin profile assigned to DGzP6ZxUblbqM8RyvwoVrbAmEEs1', () => {
    expect(DEMO_USERS.admin.uid).toBe('DGzP6ZxUblbqM8RyvwoVrbAmEEs1');
    expect(DEMO_USERS.admin.role).toBe('admin');
  });

  it('enforces admin role on stored user for DGzP6ZxUblbqM8RyvwoVrbAmEEs1', () => {
    saveStoredUser({
      uid: 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1',
      id: 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1',
      name: 'Test Admin',
      email: 'admin@kisanmitra.in',
      role: 'buyer', // Even if stored as buyer, it must be promoted to admin
      isEmailVerified: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const loaded = getStoredUser();
    expect(loaded).not.toBeNull();
    expect(loaded?.role).toBe('admin');
  });
});
