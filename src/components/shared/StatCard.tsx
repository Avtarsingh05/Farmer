import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-white',
  success: 'bg-green-50 border-green-100',
  warning: 'bg-amber-50 border-amber-100',
  info: 'bg-blue-50 border-blue-100'
};

const iconStyles = {
  default: 'text-neutral-500 bg-neutral-100',
  success: 'text-green-600 bg-green-100',
  warning: 'text-amber-600 bg-amber-100',
  info: 'text-blue-600 bg-blue-100'
};

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  
  return (
    <div className={cn("card p-5 flex flex-col", variantStyles[variant], className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-neutral-600">{label}</h3>
        <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        
        {trend && (
          <div className="flex items-center mt-2 text-sm">
            {trend.value > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1 shrink-0" />
            ) : trend.value < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1 shrink-0" />
            ) : (
              <Minus className="w-4 h-4 text-neutral-400 mr-1 shrink-0" />
            )}
            
            <span className={cn(
              "font-medium mr-1.5",
              trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-600" : "text-neutral-500"
            )}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-neutral-500 truncate">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
