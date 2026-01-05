import type { HTMLAttributes } from "react";

export type ActivityType = 
  | "created"
  | "updated"
  | "deleted"
  | "commented"
  | "mentioned"
  | "status_changed"
  | "assigned"
  | "completed"
  | "automation"
  | "system";

export interface ActivityUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  user?: ActivityUser;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ActivityFeedProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of activity items to display */
  activities: ActivityItem[];
  /** Maximum number of activities to show */
  maxItems?: number;
  /** Show load more button when activities exceed maxItems */
  showLoadMore?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Inverted theme for dark backgrounds */
  inverted?: boolean;
  /** Callback when load more is clicked */
  onLoadMore?: () => void;
  /** Callback when activity is clicked */
  onActivityClick?: (activity: ActivityItem) => void;
}

export interface ActivityFeedVariants {
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}
