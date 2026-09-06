/**
 * Admin Configuration
 * Defines authorized administrative user IDs and role verification utilities.
 */

export const ADMIN_UIDS: readonly string[] = [
  'DGzP6ZxUblbqM8RyvwoVrbAmEEs1', // User-specified primary administrator
  'demo-admin-1',                 // Demo system administrator
];

/**
 * Checks whether a given Firebase UID is designated as an administrator.
 */
export function isUserAdmin(uid?: string | null): boolean {
  if (!uid) return false;
  if (ADMIN_UIDS.includes(uid)) return true;
  try {
    const raw = localStorage.getItem('kisanmitra_platform_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.adminUids) && parsed.adminUids.includes(uid)) {
        return true;
      }
    }
  } catch {}
  return false;
}

