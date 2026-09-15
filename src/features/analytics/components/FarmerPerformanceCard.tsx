import React from 'react';
import { FarmerSalesSummary } from '../types/analytics.types';
import { IndianRupee, PackageCheck, ShoppingBag, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface FarmerPerformanceCardProps {
  summary: FarmerSalesSummary;
  farmerName?: string;
  loading?: boolean;
}

export function FarmerPerformanceCard({ summary, farmerName, loading = false }: FarmerPerformanceCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-neutral-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              My Realized Sales & Performance
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              Private Data
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Actual completed order earnings for {farmerName || 'your account'} over the last 30 days
          </p>
        </div>

        {summary.revenueChangePercent ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{summary.revenueChangePercent}% vs prior period
          </span>
        ) : null}
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-primary-600" /> Total Revenue
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-neutral-900">
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-1">
            <PackageCheck className="w-3.5 h-3.5 text-primary-600" /> Quantity Sold
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-neutral-900">
            {summary.totalQuantitySold} <span className="text-xs font-normal text-neutral-500">units</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-primary-600" /> Orders Delivered
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-neutral-900">
            {summary.totalOrders}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary-600" /> Avg Price/Unit
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-neutral-900">
            ₹{summary.averageSellingPrice}
          </div>
        </div>
      </div>

      {/* Top Selling Crops Breakdown */}
      {summary.topCrops.length > 0 ? (
        <div>
          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
            Top Performing Crops
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-medium">
                  <th className="pb-2">Crop</th>
                  <th className="pb-2">Volume</th>
                  <th className="pb-2">Total Revenue</th>
                  <th className="pb-2 text-right">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {summary.topCrops.map((c, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 font-semibold text-neutral-900">{c.cropName}</td>
                    <td className="py-2.5 text-neutral-600">{c.quantity} {c.unit}</td>
                    <td className="py-2.5 font-bold text-primary-700">{formatCurrency(c.revenue)}</td>
                    <td className="py-2.5 text-right text-neutral-500">{c.orderCount} orders</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-neutral-400">
          No delivered sales recorded in this period yet.
        </div>
      )}
    </div>
  );
}
