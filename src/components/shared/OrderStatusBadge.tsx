import React from 'react';
import { OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/orderStateMachine';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status] || status;
  const color = ORDER_STATUS_COLORS[status] || 'neutral';
  
  return (
    <Badge variant={color as any} className={cn("capitalize whitespace-nowrap", className)}>
      {label}
    </Badge>
  );
}
