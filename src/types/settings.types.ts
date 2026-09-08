/**
 * Platform Settings Type Definitions
 */

export interface PlatformSettings {
  // General Information
  platformName: string;
  logoUrl?: string;
  supportEmail: string;
  supportPhone: string;
  currencySymbol: string;
  platformCommissionPercent: number;
  deliveryFlatFee: number;
  freeDeliveryThreshold: number;

  // Agricultural & APMC Market Benchmarks
  mandiBenchmarkSource: string;
  mandiPriceAlertVariancePercent: number;
  maxOrderQuantityKg: number;
  enforceQualityGrading: boolean;

  // Database & Infrastructure
  firestoreCircuitBreaker: boolean;
  liveFirebaseSync: boolean;

  // Operational & Feature Toggles
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowFarmerRegistration: boolean;
  allowBuyerRegistration: boolean;
  enableCodPayments: boolean;
  enableUpiPayments: boolean;
  autoApproveFarmers: boolean;

  // Admin Access Whitelist
  adminUids: string[];

  // Metadata
  updatedAt: string;
  updatedBy: string;
}
