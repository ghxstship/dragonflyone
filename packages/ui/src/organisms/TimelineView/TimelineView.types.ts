import type { ReactNode } from "react";

export interface TimelineItem<T = unknown> {
  id: string;
  title: string;
  description?: string;
  date: Date;
  icon?: ReactNode;
  color?: string;
  status?: "pending" | "in_progress" | "completed";
  data?: T;
}

export interface TimelineGroup {
  label: string;
  items: TimelineItem[];
}

export type TimelineGrouping = "none" | "day" | "week" | "month" | "year";

export interface TimelineViewProps<T> {
  /** Items to display */
  items: TimelineItem<T>[];
  /** Grouping mode */
  groupBy?: TimelineGrouping;
  /** Sort order */
  sortOrder?: "asc" | "desc";
  /** Item click handler */
  onItemClick?: (item: TimelineItem<T>) => void;
  /** Custom item render */
  renderItem?: (item: TimelineItem<T>) => ReactNode;
  /** Show connector line */
  showConnector?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
}
