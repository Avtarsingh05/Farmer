import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getPlatformSettings, 
  updatePlatformSettings, 
  resetPlatformSettings,
  addAdminUid,
  removeAdminUid,
  DEFAULT_PLATFORM_SETTINGS
} from '@/services/settingsService';
import { isUserAdmin } from '@/config/admin';

describe('Platform Settings Service', () => {
  beforeEach(() => {
    resetPlatformSettings();
  });

  it('retrieves default platform settings', () => {
    const settings = getPlatformSettings();
    expect(settings.platformName).toBe('KisanMitra');
    expect(settings.deliveryFlatFee).toBe(50);
    expect(settings.freeDeliveryThreshold).toBe(500);
    expect(settings.platformCommissionPercent).toBe(0);
    expect(settings.adminUids).toContain('DGzP6ZxUblbqM8RyvwoVrbAmEEs1');
  });

  it('updates platform settings dynamically', () => {
    const updated = updatePlatformSettings({
      deliveryFlatFee: 65,
      platformName: 'KisanMitra Direct',
    });

    expect(updated.deliveryFlatFee).toBe(65);
    expect(updated.platformName).toBe('KisanMitra Direct');

    const retrieved = getPlatformSettings();
    expect(retrieved.deliveryFlatFee).toBe(65);
    expect(retrieved.platformName).toBe('KisanMitra Direct');
  });

  it('adds a new admin UID and grants administrator rights', () => {
    const testAdminUid = 'test-new-admin-uid-999';
    expect(isUserAdmin(testAdminUid)).toBe(false);

    addAdminUid(testAdminUid);
    const settings = getPlatformSettings();
    expect(settings.adminUids).toContain(testAdminUid);
    expect(isUserAdmin(testAdminUid)).toBe(true);
  });

  it('protects root administrator DGzP6ZxUblbqM8RyvwoVrbAmEEs1 from removal', () => {
    expect(() => {
      removeAdminUid('DGzP6ZxUblbqM8RyvwoVrbAmEEs1');
    }).toThrow(/Primary administrator/);

    const settings = getPlatformSettings();
    expect(settings.adminUids).toContain('DGzP6ZxUblbqM8RyvwoVrbAmEEs1');
  });

  it('resets settings to defaults', () => {
    updatePlatformSettings({ deliveryFlatFee: 120 });
    expect(getPlatformSettings().deliveryFlatFee).toBe(120);

    const defaults = resetPlatformSettings();
    expect(defaults.deliveryFlatFee).toBe(DEFAULT_PLATFORM_SETTINGS.deliveryFlatFee);
    expect(getPlatformSettings().deliveryFlatFee).toBe(50);
  });
});
