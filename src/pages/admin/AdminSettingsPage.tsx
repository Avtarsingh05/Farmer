import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Star, RotateCcw, ShieldCheck, Crown, Database, CheckCircle2, 
  AlertTriangle, Plus, Trash2, Download, Upload, Server, Sprout, 
  HelpCircle, RefreshCw, Key, Store, Truck, IndianRupee, Bell, Package
} from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { seedFirestoreContainers, checkFirebaseStatus, type FirebaseConnectionStatus } from '@/services/firebaseInit';
import { enableFirestore } from '@/services/mockStore';
import { useAuth } from '@/hooks';
import { uploadImage } from '@/services/cloudinaryService';
import { 
  getPlatformSettings, 
  updatePlatformSettings, 
  resetPlatformSettings,
  addAdminUid,
  removeAdminUid,
  DEFAULT_PLATFORM_SETTINGS
} from '@/services/settingsService';
import { PlatformSettings } from '@/types/settings.types';
import { getTestimonials, saveTestimonials, Testimonial } from '@/services/landingService';
import { cn } from '@/utils/cn';

type SettingsTab = 'general' | 'market' | 'admin' | 'database' | 'features' | 'landing';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<PlatformSettings>(getPlatformSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<FirebaseConnectionStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  useEffect(() => { getTestimonials().then(setTestimonials); }, []);

  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('kisanmitra_settings_updated', handleSettingsUpdated);
    const handleCheckFirestoreStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await checkFirebaseStatus();
      setFirestoreStatus(status);
    } catch (err: any) {
      toast({ type: 'error', message: 'Failed to check Firestore status: ' + err.message });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadImage(file, { folder: 'settings' });
      setSettings(prev => ({ ...prev, logoUrl: res.secureUrl }));
      toast({ type: 'success', message: 'Logo uploaded successfully. Save settings to apply.' });
    } catch(err: any) {
      toast({ type: 'error', message: err.message || 'Failed to upload logo' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSeedFirestore = async () => {
    if (!window.confirm('This will seed all Firestore collections with demo data. Existing data will NOT be overwritten (uses setDoc with fixed IDs). Continue?')) return;
    setIsSeeding(true);
    enableFirestore();
    try {
      const result = await seedFirestoreContainers();
      if (result.success) {
        toast({ type: 'success', message: `Firestore seeded! ${result.counts.products} products, ${result.counts.farmers} farmers, ${result.counts.categories} categories.` });
        const status = await checkFirebaseStatus();
        setFirestoreStatus(status);
      } else {
        toast({ type: 'error', message: result.message || 'Seeding failed. Check Firestore rules.' });
      }
    } catch (err: any) {
      toast({ type: 'error', message: 'Seeding error: ' + (err.message || String(err)) });
    } finally {
      setIsSeeding(false);
    }
  };

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

  const handleCheckFirestoreStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await checkFirebaseStatus();
      setFirestoreStatus(status);
    } catch (err: any) {
      toast({ type: 'error', message: 'Failed to check Firestore status: ' + err.message });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSeedFirestore = async () => {
    if (!window.confirm('This will seed all Firestore collections with demo data. Existing records will NOT be overwritten (idempotent). Continue?')) return;
    setIsSeeding(true);
    enableFirestore();
    try {
      const result = await seedFirestoreContainers();
      if (result.success) {
        toast({ type: 'success', message: `Firestore seeded! ${result.counts.products} products, ${result.counts.farmers} farmers, ${result.counts.categories} categories.` });
        const status = await checkFirebaseStatus();
        setFirestoreStatus(status);
      } else {
        toast({ type: 'error', message: result.message || 'Seeding failed. Check Firestore security rules.' });
      }
    } catch (err: any) {
      toast({ type: 'error', message: 'Seeding error: ' + (err.message || String(err)) });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container-content py-8 max-w-7xl mx-auto animate-fade-up pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">System Settings</h1>
          <p className="text-neutral-500 mt-2 max-w-xl">
            Manage marketplace parameters, fee structures, security whitelists, and cloud performance in one centralized command center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center gap-2 shadow-sm"
            title="Export settings JSON backup"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md",
              hasUnsavedChanges
                ? "bg-neutral-900 hover:bg-neutral-800 animate-pulse ring-2 ring-neutral-900 ring-offset-2"
                : "bg-neutral-900 hover:bg-neutral-800"
            )}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Unsaved Changes</h3>
              <p className="text-sm text-amber-800">You have modified settings that have not been saved yet.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm transition-colors shrink-0 whitespace-nowrap"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Layout Grid */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Vertical Sidebar Tabs */}
        <div className="md:w-64 shrink-0 space-y-2">
          {[
            { id: 'general', label: 'General & Fees', icon: Store },
            { id: 'market', label: 'APMC & Produce', icon: Sprout },
            { id: 'admin', label: 'Admin Access', icon: ShieldCheck, badge: settings.adminUids.length },
            { id: 'database', label: 'Cloud & Database', icon: Database },
            { id: 'features', label: 'Feature Flags', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  isActive 
                    ? "bg-neutral-900 text-white shadow-md" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5", isActive ? "text-neutral-300" : "text-neutral-400 group-hover:text-neutral-600")} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    isActive ? "bg-neutral-700 text-white" : "bg-neutral-200 text-neutral-600"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
          
          <div className="mt-8 pt-6 border-t border-neutral-200 px-4">
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              System v1.2.4<br/>
              Last modified:<br/>
              <span className="text-neutral-600">{new Date(settings.updatedAt).toLocaleDateString()} by {settings.updatedBy}</span>
            </p>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Tab 1: General & Fees */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-neutral-500" />
                    Platform Identity
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">Configure global platform branding and contact details.</p>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1.5">Platform Name</label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => handleChange('platformName', e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5">Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5">Helpline Phone</label>
                      <input
                        type="text"
                        value={settings.supportPhone}
                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-neutral-500" />
                    Trade & Delivery Fees
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">Set platform commission rates and shipping parameters.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold text-neutral-900">Platform Commission (%)</label>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                        Set to <strong className="text-neutral-900">0%</strong> for a completely free, direct-to-farmer non-profit operational model.
                      </p>
                    </div>
                    <div className="relative w-full md:w-48 shrink-0">
                      <input
                        type="number"
                        min="0" max="100" step="0.5"
                        value={settings.platformCommissionPercent}
                        onChange={(e) => handleChange('platformCommissionPercent', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-lg font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 outline-none transition-all pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5">Base Delivery Fee</label>
                      <div className="relative">
                        <input
                          type="number" min="0" step="5"
                          value={settings.deliveryFlatFee}
                          onChange={(e) => handleChange('deliveryFlatFee', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-10 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none font-medium"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1.5">Standard flat shipping cost per order.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5">Free Delivery Threshold</label>
                      <div className="relative">
                        <input
                          type="number" min="0" step="50"
                          value={settings.freeDeliveryThreshold}
                          onChange={(e) => handleChange('freeDeliveryThreshold', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-10 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none font-medium"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1.5">Orders above this subtotal ship free.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Market & Agriculture */}
          {activeTab === 'market' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                    Market Integrations & Limits
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">Configure pricing sources, variance warnings, and purchase limits.</p>
                </div>
                <div className="p-6 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5">APMC Data Source</label>
                      <input
                        type="text"
                        value={settings.mandiBenchmarkSource}
                        onChange={(e) => handleChange('mandiBenchmarkSource', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-medium"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1.5">Official provider displayed to users (e.g. Agmarknet).</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1.5">Max Order Quantity (kg)</label>
                      <input
                        type="number" min="10" step="50"
                        value={settings.maxOrderQuantityKg}
                        onChange={(e) => handleChange('maxOrderQuantityKg', parseInt(e.target.value, 10) || 500)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-medium"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1.5">Cap on individual retail cart size.</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold text-amber-900">Price Variance Alert (%)</label>
                      <p className="text-xs text-amber-700/80 mt-1 max-w-sm">
                        Warns farmers if their listed price deviates drastically from the live APMC modal rates for their region.
                      </p>
                    </div>
                    <div className="relative w-full md:w-48 shrink-0">
                      <input
                        type="number" min="5" max="100"
                        value={settings.mandiPriceAlertVariancePercent}
                        onChange={(e) => handleChange('mandiPriceAlertVariancePercent', parseInt(e.target.value, 10) || 40)}
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl text-lg font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 font-bold">%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 mt-6">
                    <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-neutral-50 transition-colors">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={settings.enforceQualityGrading}
                          onChange={(e) => handleChange('enforceQualityGrading', e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-6 h-6 border-2 border-neutral-300 rounded bg-white peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-colors"></div>
                        <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">Enforce Mandatory Quality Grading</span>
                        <p className="text-xs text-neutral-500 mt-1">
                          Require farmers to assign an official grade (A, B, or C) to their produce upon listing, ensuring standardized quality metrics across the platform.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Admin Whitelist */}
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <Key className="w-5 h-5 text-neutral-900" />
                      Access Control
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">Manage privileged system administrators via Firebase UIDs.</p>
                  </div>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold shadow-sm">
                    {settings.adminUids.length} Active Admins
                  </span>
                </div>

                <div className="p-6">
                  {/* Add Form */}
                  <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <input
                      type="text"
                      placeholder="Enter Firebase UID..."
                      value={newAdminUid}
                      onChange={(e) => setNewAdminUid(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-neutral-900 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Grant Access
                    </button>
                  </form>

                  {/* List */}
                  <div className="space-y-3">
                    {settings.adminUids.map((uid) => {
                      const isPrimary = uid === 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1';
                      const isDemo = uid === 'demo-admin-1';
                      return (
                        <div key={uid} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-neutral-100 rounded-xl hover:border-neutral-300 transition-colors bg-white gap-4 shadow-sm hover:shadow">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0",
                              isPrimary ? "bg-purple-100 text-purple-700" : "bg-neutral-100 text-neutral-700"
                            )}>
                              {isPrimary ? (
                                <Crown className="w-5 h-5 text-purple-600" />
                              ) : (
                                <ShieldCheck className="w-5 h-5 text-neutral-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{uid}</code>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
                                    Root Admin
                                  </span>
                                )}
                                {isDemo && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                                    Demo Acc
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">
                                {isPrimary ? 'Immutable core system architect.' : 'Standard administrative access.'}
                              </p>
                            </div>
                          </div>

                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAdmin(uid)}
                              className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-100 rounded-lg transition-all flex items-center justify-center gap-2 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Cloud & Database */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-600" />
                    Infrastructure Controls
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">Manage Firebase connection strategies and local cache behavior.</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-600/70 uppercase tracking-wider mb-1">Project ID</p>
                      <p className="text-sm font-mono font-bold text-indigo-900">farmer-bfd33</p>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider mb-1">Firestore Status</p>
                      <p className={cn("text-sm font-bold", firestoreStatus?.isConnected ? "text-emerald-700" : "text-amber-700")}>
                        {firestoreStatus ? (firestoreStatus.isConnected ? "Live Connected" : "Demo / Offline") : "Not Checked"}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                      <p className="text-xs font-semibold text-amber-600/70 uppercase tracking-wider mb-1">Network Policy</p>
                      <p className="text-sm font-bold text-amber-900">5s Smart Timeout</p>
                    </div>
                  </div>

                  {/* Firestore Status Details */}
                  {firestoreStatus && (
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                      <h4 className="text-sm font-bold text-neutral-900 mb-2">Collection Counts (Live)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(firestoreStatus.collections).map(([key, count]) => (
                          <div key={key} className="bg-white rounded-lg p-3 border border-neutral-100 text-center">
                            <p className="text-xl font-extrabold text-neutral-900">{count as number}</p>
                            <p className="text-xs text-neutral-500 capitalize">{key}</p>
                          </div>
                        ))}
                      </div>
                      {firestoreStatus.error && (
                        <p className="text-xs text-red-600 font-medium mt-2 p-2 bg-red-50 rounded-lg border border-red-100">{firestoreStatus.error}</p>
                      )}
                    </div>
                  )}

                  {/* Seed Data Section */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                          <Database className="w-4 h-4" /> Firestore Data Seeding
                        </h4>
                        <p className="text-xs text-emerald-700 mt-1 max-w-md">
                          Populate Firestore with demo farmers, products, categories, inventory and market prices. Safe to run multiple times — uses idempotent setDoc with fixed IDs.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleCheckFirestoreStatus}
                        disabled={isCheckingStatus}
                        className="px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
                      >
                        <RefreshCw className={cn("w-4 h-4", isCheckingStatus && "animate-spin")} />
                        {isCheckingStatus ? 'Checking...' : 'Check Status'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSeedFirestore}
                        disabled={isSeeding}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md disabled:opacity-60"
                      >
                        <Upload className={cn("w-4 h-4", isSeeding && "animate-bounce")} />
                        {isSeeding ? 'Seeding Firestore...' : 'Seed All Data to Firestore'}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 border border-neutral-200 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={settings.firestoreCircuitBreaker}
                            onChange={(e) => handleChange('firestoreCircuitBreaker', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 border-2 border-neutral-300 rounded bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-neutral-900">Enable UI Circuit Breaker</span>
                          <p className="text-xs text-neutral-500 mt-0.5 max-w-md">
                            Bypasses unprovisioned cloud calls instantly, preventing 15-30s web hangs when Firebase is unreachable.
                          </p>
                        </div>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSessionCircuitBreaker}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shrink-0 border border-neutral-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Probe Live Connection
                    </button>
                  </div>

                  <div className="pt-6 border-t border-neutral-100">
                    <h4 className="text-sm font-bold text-neutral-900 mb-4">Cache Management</h4>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem('kisanmitra_products');
                          localStorage.removeItem('kisanmitra_categories');
                          toast({ type: 'success', message: 'Agricultural catalog refreshed.' });
                          setTimeout(() => window.location.reload(), 600);
                        } catch {}
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Flush Local Catalog Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Feature Flags */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-neutral-500" />
                    Operational Toggles
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">Instantly activate or pause critical platform workflows.</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reusable Toggle Component */}
                    {[
                      { id: 'enableCodPayments', label: 'Cash on Delivery (COD)', desc: 'Allow buyers to pay in cash upon delivery.' },
                      { id: 'enableUpiPayments', label: 'UPI / QR Payments', desc: 'Enable direct mobile UPI payment methods.' },
                      { id: 'allowFarmerRegistration', label: 'Farmer Onboarding', desc: 'Accept new farmer applications.' },
                      { id: 'allowBuyerRegistration', label: 'Buyer Registrations', desc: 'Allow consumers to sign up.' },
                      { id: 'autoApproveFarmers', label: 'Auto-Approve Farmers', desc: 'Bypass manual review for new farmers.' }
                    ].map((flag) => (
                      <div key={flag.id} className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-start justify-between gap-4 hover:border-neutral-300 transition-colors">
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">{flag.label}</h4>
                          <p className="text-xs text-neutral-500 mt-1">{flag.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings[flag.id as keyof PlatformSettings] as boolean}
                            onChange={(e) => handleChange(flag.id as keyof PlatformSettings, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <div className="p-5 border border-rose-200 bg-rose-50/30 rounded-xl">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-rose-900">Maintenance Mode</h4>
                          <p className="text-xs text-rose-700/70 mt-1">Suspend operations and show a banner to visitors.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                      
                      {settings.maintenanceMode && (
                        <div className="animate-fade-up">
                          <label className="block text-xs font-bold text-rose-800 mb-1.5">Announcement Message</label>
                          <textarea
                            rows={3}
                            value={settings.maintenanceMessage}
                            onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none shadow-sm"
                            placeholder="We are currently down for maintenance..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
