import React, { useState, useEffect } from 'react';
import { 
  MarketPriceObservation, 
  RegionalPriceRecord, 
  DemandHistoryRecord, 
  PriceStatistics, 
  TimePeriod, 
  FarmerSalesSummary 
} from '../types/analytics.types';
import { SUPPORTED_CROPS } from '../services/seedAnalytics';
import { 
  getMarketPriceHistory, 
  getCropPriceStatistics, 
  getRegionalPrices, 
  getCropDemandHistory, 
  getFarmerSalesPerformance 
} from '../services/analyticsService';
import { PriceHistoryChart } from './PriceHistoryChart';
import { RegionalComparison } from './RegionalComparison';
import { DemandActivityCard } from './DemandActivityCard';
import { FarmerPerformanceCard } from './FarmerPerformanceCard';
import { useAuth } from '@/hooks';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sprout, 
  Scale, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function KisanInsightsDashboard() {
  const { user } = useAuth();
  
  const [selectedCropId, setSelectedCropId] = useState<string>('tomato');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');

  const [priceHistory, setPriceHistory] = useState<MarketPriceObservation[]>([]);
  const [stats, setStats] = useState<PriceStatistics | null>(null);
  const [regionalRecords, setRegionalRecords] = useState<RegionalPriceRecord[]>([]);
  const [demandRecords, setDemandRecords] = useState<DemandHistoryRecord[]>([]);
  const [farmerSales, setFarmerSales] = useState<FarmerSalesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const selectedCrop = SUPPORTED_CROPS.find(c => c.id === selectedCropId) || SUPPORTED_CROPS[0];

  useEffect(() => {
    let isMounted = true;

    async function loadInsights() {
      setLoading(true);
      try {
        const [history, statistics, regional, demand, sales] = await Promise.all([
          getMarketPriceHistory(selectedCropId, selectedPeriod),
          getCropPriceStatistics(selectedCropId, selectedPeriod),
          getRegionalPrices(selectedCropId),
          getCropDemandHistory(selectedCropId),
          getFarmerSalesPerformance(user?.id || user?.uid || '', selectedPeriod)
        ]);

        if (isMounted) {
          setPriceHistory(history);
          setStats(statistics);
          setRegionalRecords(regional);
          setDemandRecords(demand);
          setFarmerSales(sales);
        }
      } catch (err) {
        console.error('Failed to load Kisan Insights:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, [selectedCropId, selectedPeriod, user?.id, user?.uid]);

  const getTrendBadge = (trend?: string) => {
    switch (trend) {
      case 'rising':
        return { label: 'Price Rising', icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'falling':
        return { label: 'Price Softening', icon: TrendingDown, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'stable':
        return { label: 'Price Stable', icon: Minus, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      default:
        return { label: 'Insufficient Data', icon: Info, color: 'text-neutral-600 bg-neutral-100 border-neutral-200' };
    }
  };

  const trendInfo = getTrendBadge(stats?.trend);
  const TrendIcon = trendInfo.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Filter Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-2 border border-primary-200">
              <Sprout className="w-3.5 h-3.5" /> Market Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Kisan Insights
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Understand APMC market trends, track historical prices, and make informed selling decisions.
            </p>
          </div>

          {/* Crop Selector Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <label htmlFor="cropSelect" className="sr-only">Select Crop</label>
              <select
                id="cropSelect"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="appearance-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 font-bold text-neutral-800 text-sm rounded-full pl-5 pr-10 py-2.5 outline-none cursor-pointer transition-colors shadow-2xs"
              >
                {SUPPORTED_CROPS.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.localNames[0]})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Reference Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Current Reference Price</div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900">
            ₹{stats?.currentPrice || '--'}
            <span className="text-xs font-normal text-neutral-500 ml-1">/ {stats?.unit || 'kg'}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1">
            <span>Latest APMC modal rate</span>
          </div>
        </div>

        {/* Period Average */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500 mb-1">
            {selectedPeriod.toUpperCase()} Average Price
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900">
            ₹{stats?.averagePrice || '--'}
            <span className="text-xs font-normal text-neutral-500 ml-1">/ {stats?.unit || 'kg'}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Historical mean over {selectedPeriod}
          </div>
        </div>

        {/* Price Change % */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Price Change</div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xl sm:text-2xl font-extrabold flex items-center",
              (stats?.priceChangePercent || 0) > 0 ? "text-emerald-600" : (stats?.priceChangePercent || 0) < 0 ? "text-amber-600" : "text-neutral-700"
            )}>
              {(stats?.priceChangePercent || 0) > 0 ? <ArrowUpRight className="w-5 h-5" /> : (stats?.priceChangePercent || 0) < 0 ? <ArrowDownRight className="w-5 h-5" /> : null}
              {Math.abs(stats?.priceChangePercent || 0)}%
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            vs previous comparison window
          </div>
        </div>

        {/* Range High/Low */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500 mb-1">Observed High / Low</div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900">
            ₹{stats?.highestPrice || '--'} <span className="text-xs font-normal text-neutral-400">/</span> ₹{stats?.lowestPrice || '--'}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Over selected period
          </div>
        </div>
      </div>

      {/* Main Historical Chart */}
      <PriceHistoryChart
        observations={priceHistory}
        cropName={selectedCrop.name}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        loading={loading}
      />

      {/* Grid of Regional Comparison and Platform Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegionalComparison
          records={regionalRecords}
          cropName={selectedCrop.name}
          loading={loading}
        />

        <DemandActivityCard
          demandRecords={demandRecords}
          cropName={selectedCrop.name}
          loading={loading}
        />
      </div>

      {/* Private Farmer Sales Card (Only shown if logged in as farmer) */}
      {farmerSales && (
        <FarmerPerformanceCard
          summary={farmerSales}
          farmerName={user?.name}
          loading={loading}
        />
      )}

      {/* Objective Educational Insight Card */}
      <div className="bg-primary-50/60 p-5 rounded-3xl border border-primary-100 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
        <div className="text-xs text-primary-900 leading-relaxed">
          <p className="font-bold text-sm text-primary-950 mb-0.5">Historical Market Insight</p>
          During the selected period, {selectedCrop.name}'s reference average has been{' '}
          <strong>{(stats?.priceChangePercent || 0) >= 0 ? 'higher' : 'lower'}</strong> than the preceding period.
          Regional rates in nearby markets show differences of up to ₹
          {regionalRecords.length > 1 ? Math.max(...regionalRecords.map(r => r.averagePrice)) - Math.min(...regionalRecords.map(r => r.averagePrice)) : '0'}/
          {selectedCrop.unit}. Use these benchmarks to negotiate fair prices directly with buyers.
        </div>
      </div>
    </div>
  );
}
