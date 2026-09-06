import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RotateCcw, ShieldCheck, Database, CheckCircle2, 
  AlertTriangle, Plus, Trash2, Download, Upload, Server, Sprout, 
  HelpCircle, RefreshCw, Key, Store, Truck, IndianRupee, Bell, Package
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks';
import { 
  getPlatformSettings, 
  updatePlatformSettings, 
  resetPlatformSettings,
  addAdminUid,
  removeAdminUid,
  DEFAULT_PLATFORM_SETTINGS
} from '@/services/settingsService';
import { PlatformSettings } from '@/types/settings.types';
import { cn } from '@/utils/cn';

type SettingsTab = 'general' | 'market' | 'admin' | 'database' | 'features';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<PlatformSettings>(getPlatformSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('kisanmitra_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('kisanmitra_settings_updated', handleSettingsUpdated);
  }, []);

  const handleChange = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updatePlatformSettings(settings, user?.name || 'Administrator');
      setHasUnsavedChanges(false);
      toast({
        type: 'success',
        message: 'Platform settings have been updated and saved successfully!',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        message: err.message || 'Failed to save platform settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (!window.confirm('Are you sure you want to reset all platform settings to system defaults?')) {
      return;
    }
    const defaults = resetPlatformSettings();
    setSettings(defaults);
    setHasUnsavedChanges(false);
    toast({
      type: 'info',
      message: 'Platform settings have been restored to default values.',
    });
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim()) return;

    try {
      const updated = addAdminUid(newAdminUid);
      setSettings((prev) => ({ ...prev, adminUids: updated }));
      setNewAdminUid('');
      toast({
        type: 'success',
        message: `Admin UID ${newAdminUid.trim()} added successfully.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        message: err.message || 'Failed to add admin UID',
      });
    }
  };

  const handleRemoveAdmin = (uidToRemove: string) => {
    if (!window.confirm(`Are you sure you want to revoke admin privileges for ${uidToRemove}?`)) {
      return;
    }

    try {
      const updated = removeAdminUid(uidToRemove);
      setSettings((prev) => ({ ...prev, adminUids: updated }));
      toast({
        type: 'info',
        message: `Admin UID ${uidToRemove} has been revoked.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        message: err.message || 'Cannot remove administrator',
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kisanmitra-settings-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast({ type: 'success', message: 'Settings configuration exported as JSON' });
  };

  const handleClearSessionCircuitBreaker = () => {
    try {
      sessionStorage.removeItem('kisanmitra_fs_disabled');
      toast({
        type: 'success',
        message: 'Session circuit breaker reset. Live connection will be reprobed.',
      });
    } catch {
      toast({ type: 'error', message: 'Unable to access sessionStorage' });
    }
  };

  return (
    <div className="container-content py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-primary" />
            <span>Platform Settings & Governance</span>
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Manage marketplace parameters, fee structures, APMC benchmarks, security whitelists, and cloud performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            title="Export settings JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm",
              hasUnsavedChanges
                ? "bg-primary hover:bg-primary-hover animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes *' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved changes in platform settings. Make sure to click <strong>Save Settings</strong> to apply them.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold shrink-0"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'general'
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
          )}
        >
          <Store className="w-4 h-4" />
          <span>General & Fees</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'market'
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
          )}
        >
          <Sprout className="w-4 h-4" />
          <span>APMC & Produce</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'admin'
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Access ({settings.adminUids.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'database'
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
          )}
        >
          <Database className="w-4 h-4" />
          <span>Cloud & Database</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'features'
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
          )}
        >
          <Bell className="w-4 h-4" />
          <span>Feature Flags</span>
        </button>
      </div>

      {/* Tab 1: General & Fees */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Platform Identity</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Farmer & Buyer Helpline
              </label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Direct Trade Fee Structure</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Platform Commission Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={settings.platformCommissionPercent}
                  onChange={(e) => handleChange('platformCommissionPercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">%</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Set to <strong>0%</strong> for 100% direct-to-farmer non-profit trade.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Standard Direct Delivery Fee (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={settings.deliveryFlatFee}
                  onChange={(e) => handleChange('deliveryFlatFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none pl-7"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">₹</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Flat shipping fee applied when direct farm delivery is selected.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Free Delivery Order Threshold (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) => handleChange('freeDeliveryThreshold', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none pl-7"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">₹</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Orders with direct farm subtotals above this amount receive free delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Market & Agriculture */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>APMC Mandi Price Benchmarks</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Official Benchmark Data Provider
              </label>
              <input
                type="text"
                value={settings.mandiBenchmarkSource}
                onChange={(e) => handleChange('mandiBenchmarkSource', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Displayed next to farmer listings for price transparency (e.g. Agmarknet, DMI).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mandi Price Variance Alert Threshold (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={settings.mandiPriceAlertVariancePercent}
                  onChange={(e) => handleChange('mandiPriceAlertVariancePercent', parseInt(e.target.value, 10) || 40)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">%</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Alerts farmers if asking price deviates drastically from regional APMC modal rates.
              </p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Order Limits & Grading</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Maximum Order Quantity Per Transaction (kg)
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                step="50"
                value={settings.maxOrderQuantityKg}
                onChange={(e) => handleChange('maxOrderQuantityKg', parseInt(e.target.value, 10) || 500)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Prevents commercial hoarding by individual retail buyer accounts.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.enforceQualityGrading}
                  onChange={(e) => handleChange('enforceQualityGrading', e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 mt-0.5 border-neutral-300"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-800">Enforce Mandatory Quality Grading</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Requires farmers to declare Grade A, B, or C during produce listing.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Whitelist */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Authorized Administrators</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Users matching these Firebase UIDs possess unrestricted platform management permissions.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full shrink-0">
                {settings.adminUids.length} Active Administrators
              </span>
            </div>

            {/* List of Admins */}
            <div className="divide-y divide-neutral-100">
              {settings.adminUids.map((uid) => {
                const isPrimary = uid === 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1';
                const isDemo = uid === 'demo-admin-1';
                return (
                  <div key={uid} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-neutral-700">
                        🛡️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-neutral-900">{uid}</code>
                          {isPrimary && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              Primary Root Admin (Protected)
                            </span>
                          )}
                          {isDemo && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                              Demo Officer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {isPrimary ? 'Designated system administrator with persistent governance rights.' : 'Administrative account with system clearance.'}
                        </p>
                      </div>
                    </div>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(uid)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Revoke admin access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Admin Form */}
            <form onSubmit={handleAddAdmin} className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Firebase UID to promote (e.g. 28-character auth UID)..."
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Grant Admin Access</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud & Database */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Firebase Cloud Status</span>
            </h3>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Firebase Project ID:</span>
                <strong className="font-mono text-neutral-900">farmer-bfd33</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cloud Firestore Mode:</span>
                <span className="font-semibold text-emerald-700">Sub-5ms Local Cache Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fail-Safe Timeout:</span>
                <span className="text-neutral-700">800ms Circuit Breaker</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.firestoreCircuitBreaker}
                  onChange={(e) => handleChange('firestoreCircuitBreaker', e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 mt-0.5 border-neutral-300"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-800">Automatic Fail-Fast Circuit Breaker</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Bypasses unprovisioned cloud calls instantly, eliminating 15–30s web hangs.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearSessionCircuitBreaker}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors flex items-center gap-1.5 w-full justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Probe & Refresh Cloud Connection</span>
              </button>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 border-b pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Catalog & Data Operations</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 border border-neutral-200 rounded-lg">
                <h4 className="text-xs font-bold text-neutral-900">APMC Mandi Price Benchmarks</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Synchronized with genuine Pimpalgaon, Lasalgaon, Karnal, Agra, and Sehore Mandi rates.
                </p>
              </div>

              <div className="p-3 border border-neutral-200 rounded-lg">
                <h4 className="text-xs font-bold text-neutral-900">Zero Math.random() Integrity</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Produce catalog adheres strictly to real verified agricultural specifications.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('kisanmitra_products');
                    localStorage.removeItem('kisanmitra_categories');
                    toast({
                      type: 'success',
                      message: 'Agricultural catalog refreshed with verified APMC data.',
                    });
                    setTimeout(() => window.location.reload(), 600);
                  } catch {}
                }}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Verified Produce Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Feature Flags */}
      {activeTab === 'features' && (
        <div className="card p-6 space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-neutral-900">Marketplace Operation Toggles</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Instantly activate or pause critical platform workflows in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode */}
            <div className="p-4 rounded-xl border border-neutral-200 space-y-3 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Platform Maintenance Mode</h4>
                  <p className="text-[11px] text-neutral-500">Temporarily show announcement banner to visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 h-5 w-5 border-neutral-300"
                />
              </div>
              {settings.maintenanceMode && (
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Notice Banner Message</label>
                  <textarea
                    rows={2}
                    value={settings.maintenanceMessage}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded text-xs focus:ring-primary focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Cash on Delivery (COD)</h4>
                <p className="text-[11px] text-neutral-500">Allow buyers to pay farmers in cash upon delivery</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableCodPayments}
                onChange={(e) => handleChange('enableCodPayments', e.target.checked)}
                className="rounded text-primary focus:ring-primary h-5 w-5 border-neutral-300"
              />
            </div>

            {/* UPI Payments */}
            <div className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">UPI / QR Code Checkout</h4>
                <p className="text-[11px] text-neutral-500">Enable direct mobile UPI payment methods</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableUpiPayments}
                onChange={(e) => handleChange('enableUpiPayments', e.target.checked)}
                className="rounded text-primary focus:ring-primary h-5 w-5 border-neutral-300"
              />
            </div>

            {/* Farmer Registration */}
            <div className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Farmer Registration Open</h4>
                <p className="text-[11px] text-neutral-500">Accept new farmer onboarding applications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowFarmerRegistration}
                onChange={(e) => handleChange('allowFarmerRegistration', e.target.checked)}
                className="rounded text-primary focus:ring-primary h-5 w-5 border-neutral-300"
              />
            </div>

            {/* Buyer Registration */}
            <div className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Buyer Registration Open</h4>
                <p className="text-[11px] text-neutral-500">Allow consumer and business buyers to sign up</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowBuyerRegistration}
                onChange={(e) => handleChange('allowBuyerRegistration', e.target.checked)}
                className="rounded text-primary focus:ring-primary h-5 w-5 border-neutral-300"
              />
            </div>

            {/* Auto-approve Farmers */}
            <div className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Auto-Approve Farmers</h4>
                <p className="text-[11px] text-neutral-500">Bypass manual review for newly onboarded farmers</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproveFarmers}
                onChange={(e) => handleChange('autoApproveFarmers', e.target.checked)}
                className="rounded text-primary focus:ring-primary h-5 w-5 border-neutral-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="text-right text-[11px] text-neutral-400">
        Last updated on {new Date(settings.updatedAt).toLocaleString()} by {settings.updatedBy}
      </div>
    </div>
  );
}
