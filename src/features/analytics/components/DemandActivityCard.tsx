import React from 'react';
import { DemandHistoryRecord } from '../types/analytics.types';
import { Activity, Search, Eye, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DemandActivityCardProps {
  demandRecords: DemandHistoryRecord[];
  cropName: string;
  loading?: boolean;
}

export function DemandActivityCard({ demandRecords, cropName, loading = false }: DemandActivityCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-neutral-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const latest = demandRecords[demandRecords.length - 1];
  const score = latest?.demandScore ?? 65;

  const getScoreRating = (s: number) => {
    if (s >= 75) return { label: 'High Demand', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (s >= 40) return { label: 'Moderate Demand', color: 'text-primary-700 bg-primary-50 border-primary-200' };
    return { label: 'Low Demand', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const rating = getScoreRating(score);

  // Aggregate 30-day totals
  const totalSearches = demandRecords.reduce((sum, r) => sum + r.searchCount, 0);
  const totalViews = demandRecords.reduce((sum, r) => sum + r.viewCount, 0);
  const totalOrders = demandRecords.reduce((sum, r) => sum + r.orderCount, 0);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary-600" />
            Platform Demand Activity
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Buyer interest and search volume for {cropName} across Kisan Mitra
          </p>
        </div>
        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", rating.color)}>
          {rating.label}
        </span>
      </div>

      {/* Demand Score Gauge Bar */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs font-semibold text-neutral-700">Demand Activity Index</span>
          <span className="text-lg font-extrabold text-neutral-900">{score}<span className="text-xs font-normal text-neutral-400">/100</span></span>
        </div>
        <div className="h-2.5 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-amber-400 via-primary-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* 30-Day Platform Activity Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
          <Search className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
          <div className="text-base font-bold text-neutral-900">{totalSearches}</div>
          <div className="text-[10px] text-neutral-500 font-medium">Buyer Searches</div>
        </div>

        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
          <Eye className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
          <div className="text-base font-bold text-neutral-900">{totalViews}</div>
          <div className="text-[10px] text-neutral-500 font-medium">Produce Views</div>
        </div>

        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
          <ShoppingCart className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
          <div className="text-base font-bold text-neutral-900">{totalOrders}</div>
          <div className="text-[10px] text-neutral-500 font-medium">Orders Placed</div>
        </div>
      </div>

      <div className="text-[11px] text-neutral-400 pt-4 mt-4 border-t border-neutral-100">
        Based on Kisan Mitra verified marketplace traffic over the last 30 days.
      </div>
    </div>
  );
}
