import type { ReactNode } from 'react';

export interface Stat {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "currency" | "percent";
}

export interface StatsDashboardProps {
  /** Stats to display */
  stats: Stat[];
  /** Number of columns */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Show trend indicators */
  showTrends?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Stat click handler */
  onStatClick?: (stat: Stat) => void;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
