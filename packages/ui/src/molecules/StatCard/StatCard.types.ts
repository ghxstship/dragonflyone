import type { HTMLAttributes, ReactNode } from "react";

/**
 * Stat card trend
 */
export type StatCardTrend = "up" | "down" | "neutral";

/**
 * StatCard component props
 */
export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: StatCardTrend;
  trendValue?: string;
  inverted?: boolean;
}
