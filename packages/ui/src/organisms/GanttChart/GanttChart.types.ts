import type { ReactNode } from 'react';

export interface GanttTask<T = unknown> {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress?: number; // 0-100
  color?: string;
  dependencies?: string[];
  data?: T;
}

export interface GanttMilestone {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

export type GanttViewMode = "day" | "week" | "month" | "quarter";

export interface GanttChartProps<T> {
  /** Tasks to display */
  tasks: GanttTask<T>[];
  /** Milestones to display */
  milestones?: GanttMilestone[];
  /** View mode */
  viewMode?: GanttViewMode;
  /** Start date for the chart */
  startDate?: Date;
  /** End date for the chart */
  endDate?: Date;
  /** Task click handler */
  onTaskClick?: (task: GanttTask<T>) => void;
  /** Task update handler (for drag resize) */
  onTaskUpdate?: (task: GanttTask<T>, newStart: Date, newEnd: Date) => void;
  /** Show today marker */
  showToday?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Row height */
  rowHeight?: number;
  /** Custom task render */
  renderTask?: (task: GanttTask<T>) => ReactNode;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
}
