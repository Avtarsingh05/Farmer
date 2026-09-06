import React from 'react';
import { formatPricePerUnit } from '@/utils/currency';
import { TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PriceDisplayProps {
  askingPrice: number;
  unit: string;
  referencePrice?: number | null;
  currency?: 'INR';
  className?: string;
}

export function PriceDisplay({ 
  askingPrice, 
  unit, 
  referencePrice, 
  currency = 'INR',
  className 
}: PriceDisplayProps) {
  
  const hasReference = typeof referencePrice === 'number' && referencePrice > 0;
  const savings = hasReference ? referencePrice - askingPrice : 0;
  const savingsPercent = hasReference ? (savings / referencePrice) * 100 : 0;
  const isBelowMarket = hasReference && savings > 0;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-primary">
          {formatPricePerUnit(askingPrice, unit)}
        </span>
        {hasReference && isBelowMarket && (
          <span className="text-sm text-neutral-500 line-through mb-1">
            {formatPricePerUnit(referencePrice, unit)}
          </span>
        )}
      </div>
      
      {hasReference ? (
        isBelowMarket ? (
          <div className="flex items-center text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>
              {savingsPercent.toFixed(0)}% ({formatPricePerUnit(savings, unit)}) below market reference
            </span>
          </div>
        ) : (
          <div className="text-sm text-neutral-500">
            Market reference: {formatPricePerUnit(referencePrice, unit)}
          </div>
        )
      ) : (
        <div className="text-sm text-neutral-400 italic">
          Market reference unavailable
        </div>
      )}
    </div>
  );
}
