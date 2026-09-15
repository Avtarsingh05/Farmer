import { Timestamp } from 'firebase/firestore';

export type DataSourceType = 'official' | 'platform' | 'farmer' | 'aggregated' | 'demo';

export type PriceTrendState = 'rising' | 'falling' | 'stable' | 'insufficient_data';

export type PriceVolatilityState = 'low' | 'moderate' | 'high' | 'insufficient_data';

export type TimePeriod = '7d' | '30d' | '90d' | '1y';

export interface CropInfo {
  id: string;
  name: string;
  localNames: string[];
  category: string;
  unit: string;
  active: boolean;
}

export interface MarketPriceObservation {
  id?: string;
  cropId: string;
  cropName: string;
  marketId: string;
  marketName: string;
  state: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  currency: 'INR';
  date: Date | Timestamp;
  source: string;
  sourceName: string;
  dataSource: DataSourceType;
  isDemo: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface RegionalPriceRecord {
  id?: string;
  cropId: string;
  cropName: string;
  regionType: 'district' | 'state';
  state: string;
  district: string;
  marketName: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  currency: 'INR';
  date: Date | Timestamp;
  source: string;
  dataSource: DataSourceType;
  isDemo: boolean;
}

export interface DemandHistoryRecord {
  id?: string;
  cropId: string;
  cropName: string;
  date: Date | Timestamp;
  searchCount: number;
  viewCount: number;
  cartCount: number;
  orderCount: number;
  requestedQuantity: number;
  fulfilledQuantity: number;
  demandScore: number; // 0 to 100 normalized index
  dataSource: DataSourceType;
  isDemo: boolean;
}

export interface SalesAnalyticsRecord {
  id?: string;
  farmerId: string;
  cropId: string;
  cropName: string;
  date: Date | Timestamp;
  quantitySold: number;
  revenue: number;
  averageSellingPrice: number;
  orderCount: number;
  unit: string;
  currency: 'INR';
}

export interface FarmerSalesSummary {
  totalRevenue: number;
  totalQuantitySold: number;
  totalOrders: number;
  averageSellingPrice: number;
  previousPeriodRevenue?: number;
  revenueChangePercent?: number;
  topCrops: {
    cropName: string;
    quantity: number;
    revenue: number;
    orderCount: number;
    unit: string;
  }[];
}

export interface PriceStatistics {
  currentPrice: number;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  priceChangePercent: number;
  trend: PriceTrendState;
  volatility: PriceVolatilityState;
  observationCount: number;
  timePeriod: TimePeriod;
  unit: string;
  lastUpdated: Date;
  dataSource: DataSourceType;
  isDemo: boolean;
}

export interface AnalyticsFilter {
  cropId: string;
  district?: string;
  period: TimePeriod;
}
