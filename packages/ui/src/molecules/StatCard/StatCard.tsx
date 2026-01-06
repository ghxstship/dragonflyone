"use client";

import { forwardRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { 
  statCardVariants,
  statCardIconContainerVariants,
  statCardValueVariants,
  statCardLabelVariants,
  statCardTrendContainerVariants,
  statCardTrendVariants 
} from "./StatCard.variants.js";
import type { 
  StatCardProps 
} from "./StatCard.types.js";

/**
 * StatCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Stat card with value, label, and trend
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <StatCard
 *   value="1,234"
 *   label="Total Users"
 *   icon={<Users />}
 *   trend="up"
 *   trendValue="+12%"
 *   inverted={false}
 * />
 * ```
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  function StatCard({ 
    value, 
    label, 
    icon, 
    trend, 
    trendValue, 
    inverted = false,
    className,
    ...props 
  }, ref) {
    // Get trend icon
    const getTrendIcon = () => {
      switch (trend) {
        case "up":
          return <TrendingUp className="w-3 h-3" />;
        case "down":
          return <TrendingDown className="w-3 h-3" />;
        default:
          return <Minus className="w-3 h-3" />;
      }
    };

    return (
      <div
        ref={ref}
        className={statCardVariants({ className })}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <div className={statCardIconContainerVariants({})}>
            {icon}
          </div>
        )}
        
        {/* Value */}
        <div className={statCardValueVariants({})}>
          {value}
        </div>
        
        {/* Label */}
        <div className={statCardLabelVariants({})}>
          {label}
        </div>
        
        {/* Trend */}
        {(trend || trendValue) && (
          <div className={statCardTrendContainerVariants({})}>
            {trend && (
              <div className={statCardTrendVariants({ trend })}>
                {getTrendIcon()}
              </div>
            )}
            {trendValue && (
              <div className={statCardTrendVariants({ trend })}>
                {trendValue}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
