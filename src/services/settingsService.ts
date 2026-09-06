import { PlatformSettings } from '@/types/settings.types';
import { disableFirestore, enableFirestore } from './mockStore';

const SETTINGS_STORAGE_KEY = 'kisanmitra_platform_settings';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'KisanMitra',
  supportEmail: 'support@kisanmitra.in',
  supportPhone: '+91 1800-200-5472',
  currencySymbol: '₹',
  platformCommissionPercent: 0,
  deliveryFlatFee: 50,
  freeDeliveryThreshold: 500,

  mandiBenchmarkSource: 'Agmarknet (Govt. of India)',
  mandiPriceAlertVariancePercent: 40,
  maxOrderQuantityKg: 500,
  enforceQualityGrading: true,

  firestoreCircuitBreaker: true,
  liveFirebaseSync: true,

  maintenanceMode: false,
  maintenanceMessage: 'KisanMitra is currently performing scheduled infrastructure maintenance. Services will resume shortly.',
  allowFarmerRegistration: true,
  allowBuyerRegistration: true,
  enableCodPayments: true,
  enableUpiPayments: true,
  autoApproveFarmers: false,

  adminUids: [
    'DGzP6ZxUblbqM8RyvwoVrbAmEEs1', // User-designated administrator
    'demo-admin-1',                 // Demo system admin
  ],

  updatedAt: new Date().toISOString(),
  updatedBy: 'System Administrator',
};

/**
 * Retrieve current platform settings with fallback to defaults.
 */
export function getPlatformSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure any newly added keys exist
      return {
        ...DEFAULT_PLATFORM_SETTINGS,
        ...parsed,
        adminUids: Array.isArray(parsed.adminUids) && parsed.adminUids.length > 0 
          ? Array.from(new Set([...DEFAULT_PLATFORM_SETTINGS.adminUids, ...parsed.adminUids]))
          : DEFAULT_PLATFORM_SETTINGS.adminUids,
      };
    }
  } catch (err) {
    console.warn('[KisanMitra] Error reading settings from localStorage, using defaults', err);
  }
  return { ...DEFAULT_PLATFORM_SETTINGS };
}

/**
 * Save updated platform settings.
 */
export function updatePlatformSettings(
  updates: Partial<PlatformSettings>, 
  updatedBy = 'Admin'
): PlatformSettings {
  const current = getPlatformSettings();
  const merged: PlatformSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('kisanmitra_settings_updated', { detail: merged }));
  } catch (err) {
    console.error('[KisanMitra] Failed to persist platform settings', err);
  }

  // Handle circuit breaker sync
  if (updates.firestoreCircuitBreaker !== undefined) {
    if (updates.firestoreCircuitBreaker) {
      disableFirestore('Enabled via Platform Settings');
    } else {
      enableFirestore();
    }
  }

  return merged;
}

/**
 * Reset all settings to system defaults.
 */
export function resetPlatformSettings(): PlatformSettings {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
    window.dispatchEvent(new CustomEvent('kisanmitra_settings_updated', { detail: DEFAULT_PLATFORM_SETTINGS }));
  } catch (err) {
    console.error('[KisanMitra] Failed to reset platform settings', err);
  }
  return { ...DEFAULT_PLATFORM_SETTINGS };
}

/**
 * Get the list of all authorized admin UIDs.
 */
export function getAdminUids(): string[] {
  const settings = getPlatformSettings();
  return settings.adminUids || DEFAULT_PLATFORM_SETTINGS.adminUids;
}

/**
 * Add a new UID to the admin whitelist.
 */
export function addAdminUid(uid: string): string[] {
  const cleanUid = uid.trim();
  if (!cleanUid) return getAdminUids();

  const current = getPlatformSettings();
  const updatedUids = Array.from(new Set([...current.adminUids, cleanUid]));
  updatePlatformSettings({ adminUids: updatedUids });
  return updatedUids;
}

/**
 * Remove a UID from the admin whitelist.
 * Note: DGzP6ZxUblbqM8RyvwoVrbAmEEs1 cannot be deleted.
 */
export function removeAdminUid(uid: string): string[] {
  const cleanUid = uid.trim();
  if (cleanUid === 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1') {
    throw new Error('Primary administrator UID cannot be removed.');
  }

  const current = getPlatformSettings();
  const updatedUids = current.adminUids.filter((id) => id !== cleanUid);
  updatePlatformSettings({ adminUids: updatedUids });
  return updatedUids;
}
