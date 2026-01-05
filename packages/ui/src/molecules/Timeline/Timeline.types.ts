import type { ReactNode } from "react";

/**
 * Timeline item status
 */
export type TimelineItemStatus = "completed" | "current" | "upcoming" | "error";

/**
 * Timeline orientation
 */
export type TimelineOrientation = "vertical" | "horizontal";

/**
 * Timeline item user info
 */
export interface TimelineItemUser {
  name: string;
  avatar?: string;
}

/**
 * Timeline item interface
 */
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: ReactNode;
  status?: TimelineItemStatus;
  user?: TimelineItemUser;
  metadata?: Record<string, string>;
}

/**
 * Timeline component props
 */
export interface TimelineProps {
  /** Timeline items */
  items: TimelineItem[];
  /** Layout orientation */
  orientation?: TimelineOrientation;
  /** Show connector lines */
  showConnectors?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Item click handler */
  onItemClick?: (item: TimelineItem) => void;
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
