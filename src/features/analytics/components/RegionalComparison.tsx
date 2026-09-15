import React from 'react';
import { RegionalPriceRecord } from '../types/analytics.types';
import { MapPin, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RegionalComparisonProps {
  records: RegionalPriceRecord[];
  cropName: string;
  loading?: boolean;
}

export function RegionalComparison({ records, cropName, loading = false }: RegionalComparisonProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-neutral-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 text-center text-xs text-neutral-500">
        Regional comparison data not available yet for {cropName}.
      </div>
    );
  }

  // Calculate median price to show divergence
  const prices = records.map(r => r.averagePrice);
  const maxPrice = Math.max(...prices, 1);
  const minPrice = Math.min(...prices);
  const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] || 1;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary-600" />
            Regional Price Comparison
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Current {cropName} rates across neighboring agricultural markets
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
          Median: ₹{medianPrice}/{records[0]?.unit}
        </span>
      </div>

      {/* District Comparison Bars */}
      <div className="space-y-3.5 pt-2">
        {records.map((r, idx) => {
          const diff = r.averagePrice - medianPrice;
          const pct = Math.round((r.averagePrice / maxPrice) * 100);
          const isHighest = r.averagePrice === maxPrice;
          const isLowest = r.averagePrice === minPrice;

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  {r.district}
                  <span className="text-[11px] font-normal text-neutral-400">({r.state})</span>
                  {isHighest && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Highest
                    </span>
                  )}
                  {isLowest && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Lowest
                    </span>
                  )}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-neutral-900">
                    ₹{r.averagePrice}
                    <span className="text-[10px] font-normal text-neutral-500 ml-0.5">/{r.unit}</span>
                  </span>
                  <span className={cn(
                    "text-[11px] font-medium flex items-center",
                    diff > 0 ? "text-emerald-600" : diff < 0 ? "text-amber-600" : "text-neutral-400"
                  )}>
                    {diff > 0 ? `+₹${diff}` : diff < 0 ? `-₹${Math.abs(diff)}` : '0'}
                  </span>
                </div>
              </div>

              {/* Bar Fill */}
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isHighest ? "bg-emerald-500" : isLowest ? "bg-amber-400" : "bg-primary-500"
                  )}
                  style={{ width: `${Math.max(15, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-neutral-400 pt-4 mt-4 border-t border-neutral-100">
        Prices reflect latest modal benchmarks reported by district APMCs.
      </div>
    </div>
  );
}
