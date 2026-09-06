import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function QuantitySelector({ 
  value, 
  min = 1, 
  max, 
  unit, 
  onChange, 
  disabled = false,
  className 
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrease = () => {
    if (disabled || value <= min) return;
    onChange(value - 1);
  };

  const handleIncrease = () => {
    if (disabled || value >= max) return;
    onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    let newValue = parseInt(inputValue, 10);
    
    if (isNaN(newValue)) {
      newValue = min;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }
    
    setInputValue(newValue.toString());
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden bg-white shadow-sm h-11">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          className="flex items-center justify-center w-11 h-11 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <div className="flex-1 min-w-[60px] h-full border-x border-neutral-200">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-full h-full text-center font-medium text-neutral-900 bg-transparent outline-none focus:ring-2 focus:ring-primary focus:ring-inset disabled:opacity-50"
            aria-label={`Quantity in ${unit}`}
          />
        </div>
        
        <button
          type="button"
          onClick={handleIncrease}
          disabled={disabled || value >= max}
          className="flex items-center justify-center w-11 h-11 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="ml-3 text-sm font-medium text-neutral-600 select-none">
        {unit}
      </span>
    </div>
  );
}
