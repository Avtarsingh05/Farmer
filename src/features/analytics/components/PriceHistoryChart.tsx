import React, { useState } from 'react';
import { MarketPriceObservation, TimePeriod } from '../types/analytics.types';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PriceHistoryChartProps {
  observations: MarketPriceObservation[];
  cropName: string;
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  loading?: boolean;
}

export function PriceHistoryChart({
  observations,
  cropName,
  selectedPeriod,
  onPeriodChange,
  loading = false,
}: PriceHistoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4" />
        <div className="h-64 bg-neutral-100 rounded-2xl w-full" />
      </div>
    );
  }

  if (!observations || observations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center">
        <Info className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-neutral-800">Not enough historical data yet</h4>
        <p className="text-xs text-neutral-500 mt-1">Price observations will populate as APMC bulletins update.</p>
      </div>
    );
  }

  const prices = observations.map(o => o.modalPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const paddingY = Math.max(2, (maxPrice - minPrice) * 0.15);
  const scaleMin = Math.max(0, Math.floor(minPrice - paddingY));
  const scaleMax = Math.ceil(maxPrice + paddingY);
  const priceRange = scaleMax - scaleMin || 1;

  // SVG dimensions
  const width = 700;
  const height = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Generate coordinate points
  const points = observations.map((obs, idx) => {
    const x = padLeft + (idx / (observations.length - 1 || 1)) * chartW;
    const y = padTop + chartH - ((obs.modalPrice - scaleMin) / priceRange) * chartH;
    return { x, y, obs };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + chartH} L ${points[0].x},${padTop + chartH} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];
  const activeDate = activePoint?.obs.date instanceof Date 
    ? activePoint.obs.date 
    : new Date(activePoint?.obs.date as any);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-2xs">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {cropName} Price History
            </h3>
            {observations[0]?.isDemo && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Demo Data
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Reference modal prices across regional agricultural mandis
          </p>
        </div>

        {/* Time period filter pills */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-full self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 uppercase",
                selectedPeriod === p 
                  ? "bg-white text-neutral-900 shadow-xs" 
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Active tooltip metric display */}
      <div className="flex items-baseline gap-3 pt-4 pb-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          ₹{activePoint.obs.modalPrice}
          <span className="text-sm font-normal text-neutral-500 ml-1">/ {activePoint.obs.unit}</span>
        </span>
        <span className="text-xs text-neutral-500">
          on {activeDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {activePoint.obs.marketName ? ` · ${activePoint.obs.marketName}` : ''}
        </span>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          aria-label={`${cropName} price trend chart`}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padTop + chartH * pct;
            const val = Math.round(scaleMax - pct * priceRange);
            return (
              <g key={pct}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400 font-mono"
                >
                  ₹{val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Price trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive vertical tracker */}
          {hoveredIndex !== null && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + chartH}
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Hover highlight circle */}
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="5"
            fill="#ffffff"
            stroke="#16a34a"
            strokeWidth="3"
            className="transition-all duration-150 shadow"
          />

          {/* Invisible interactive hover columns */}
          {points.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - chartW / (points.length * 2)}
              y={padTop}
              width={chartW / points.length}
              height={chartH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onTouchStart={() => setHoveredIndex(idx)}
            />
          ))}
        </svg>
      </div>

      {/* Footer attribution */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-100">
        <span>Source: {observations[0]?.sourceName || 'Agmarknet APMC'}</span>
        <span>Drag or hover across chart to inspect daily rates</span>
      </div>
    </div>
  );
}
