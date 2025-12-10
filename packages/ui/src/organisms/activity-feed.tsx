"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  AtSign,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Settings,
  ChevronDown,
  Filter,
  RefreshCw,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

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
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ActivityFeedProps {
  /** Activity items to display */
  activities: ActivityItem[];
  /** Loading state */
  loading?: boolean;
  /** Called when more items should be loaded */
  onLoadMore?: () => void;
  /** Whether there are more items to load */
  hasMore?: boolean;
  /** Called when an activity item is clicked */
  onActivityClick?: (activity: ActivityItem) => void;
  /** Filter by activity type */
  filterTypes?: ActivityType[];
  /** Called when filter changes */
  onFilterChange?: (types: ActivityType[]) => void;
  /** Filter by user */
  filterUserId?: string;
  /** Called when user filter changes */
  onUserFilterChange?: (userId: string | undefined) => void;
  /** Called to refresh the feed */
  onRefresh?: () => void;
  /** Show filters */
  showFilters?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// ACTIVITY ICONS
// =============================================================================

const activityIcons: Record<ActivityType, React.ReactNode> = {
  created: <Plus className="size-4" />,
  updated: <Edit className="size-4" />,
  deleted: <Trash2 className="size-4" />,
  commented: <MessageSquare className="size-4" />,
  mentioned: <AtSign className="size-4" />,
  status_changed: <RefreshCw className="size-4" />,
  assigned: <User className="size-4" />,
  completed: <CheckCircle className="size-4" />,
  automation: <Settings className="size-4" />,
  system: <AlertCircle className="size-4" />,
};

const activityColors: Record<ActivityType, string> = {
  created: "bg-success-500",
  updated: "bg-primary-500",
  deleted: "bg-error-500",
  commented: "bg-secondary-500",
  mentioned: "bg-accent-500",
  status_changed: "bg-warning-500",
  assigned: "bg-info-500",
  completed: "bg-success-500",
  automation: "bg-grey-500",
  system: "bg-grey-400",
};

const activityLabels: Record<ActivityType, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  commented: "Commented",
  mentioned: "Mentioned",
  status_changed: "Status Changed",
  assigned: "Assigned",
  completed: "Completed",
  automation: "Automation",
  system: "System",
};

// =============================================================================
// HELPERS
// =============================================================================

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupByDate(activities: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const activity of activities) {
    const date = new Date(activity.timestamp);
    let groupKey: string;

    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else if (date > weekAgo) {
      groupKey = "This Week";
    } else {
      groupKey = "Earlier";
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(activity);
  }

  return groups;
}

// =============================================================================
// ACTIVITY ITEM COMPONENT
// =============================================================================

interface ActivityItemCardProps {
  activity: ActivityItem;
  onClick?: () => void;
  compact?: boolean;
}

function ActivityItemCard({ activity, onClick, compact }: ActivityItemCardProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-start gap-gap-md text-left bg-transparent border-none cursor-pointer transition-colors hover:bg-surface-secondary rounded-card",
        compact ? "p-spacing-2" : "p-spacing-3"
      )}
    >
      {/* Icon */}
      <div className={clsx(
        "flex-shrink-0 flex items-center justify-center rounded-avatar text-white",
        compact ? "size-6" : "size-8",
        activityColors[activity.type]
      )}>
        {activityIcons[activity.type]}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-gap-xs flex-wrap">
          {activity.user && (
            <span className="font-medium text-text-primary text-body-sm">
              {activity.user.name}
            </span>
          )}
          <span className="text-grey-500 text-body-sm">
            {activity.title}
          </span>
          {activity.entityName && (
            <span className="font-medium text-primary-500 text-body-sm truncate">
              {activity.entityName}
            </span>
          )}
        </div>
        
        {activity.description && !compact && (
          <p className="text-body-sm text-grey-500 mt-spacing-1 line-clamp-2">
            {activity.description}
          </p>
        )}
        
        <p className="text-body-xs text-grey-400 mt-spacing-1">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </button>
  );
}

// =============================================================================
// FILTER DROPDOWN
// =============================================================================

interface FilterDropdownProps {
  selectedTypes: ActivityType[];
  onSelect: (types: ActivityType[]) => void;
}

function FilterDropdown({ selectedTypes, onSelect }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const allTypes: ActivityType[] = Object.keys(activityLabels) as ActivityType[];

  const handleToggle = (type: ActivityType) => {
    if (selectedTypes.includes(type)) {
      onSelect(selectedTypes.filter((t) => t !== type));
    } else {
      onSelect([...selectedTypes, type]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "flex items-center gap-gap-xs px-spacing-3 py-spacing-2 rounded-button border-2 text-body-sm cursor-pointer transition-colors",
          selectedTypes.length > 0
            ? "bg-primary-500 border-primary-600 text-white"
            : "bg-surface-secondary border-border-primary text-text-primary hover:bg-surface-tertiary"
        )}
      >
        <Filter className="size-4" />
        Filter
        {selectedTypes.length > 0 && (
          <span className="ml-spacing-1 px-spacing-1 bg-white/20 rounded-badge text-body-xs">
            {selectedTypes.length}
          </span>
        )}
        <ChevronDown className="size-4" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-spacing-1 min-w-container-xs bg-surface-elevated border-2 border-border-primary rounded-card shadow-lg z-20">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleToggle(type)}
                className={clsx(
                  "w-full flex items-center gap-gap-sm px-spacing-3 py-spacing-2 text-left border-none cursor-pointer transition-colors",
                  selectedTypes.includes(type)
                    ? "bg-primary-500/10 text-primary-600"
                    : "bg-transparent text-text-primary hover:bg-surface-secondary"
                )}
              >
                <div className={clsx(
                  "size-4 rounded-avatar flex items-center justify-center text-white",
                  activityColors[type]
                )}>
                  {activityIcons[type]}
                </div>
                <span className="text-body-sm">{activityLabels[type]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

export function ActivityFeed({
  activities,
  loading = false,
  onLoadMore,
  hasMore = false,
  onActivityClick,
  filterTypes = [],
  onFilterChange,
  onRefresh,
  showFilters = true,
  compact = false,
  className,
}: ActivityFeedProps) {
  // Filter activities
  const filteredActivities = filterTypes.length > 0
    ? activities.filter((a) => filterTypes.includes(a.type))
    : activities;

  // Group by date
  const groupedActivities = groupByDate(filteredActivities);

  // Handle filter change
  const handleFilterChange = useCallback((types: ActivityType[]) => {
    onFilterChange?.(types);
  }, [onFilterChange]);

  return (
    <div className={clsx("flex flex-col", className)}>
      {/* Header */}
      {showFilters && (
        <div className="flex items-center justify-between mb-spacing-4">
          <h3 className="font-display text-h4-sm text-text-primary">Activity</h3>
          <div className="flex items-center gap-gap-sm">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-spacing-2 text-grey-500 hover:text-grey-700 bg-transparent border-none cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={clsx("size-4", loading && "animate-spin")} />
              </button>
            )}
            {onFilterChange && (
              <FilterDropdown
                selectedTypes={filterTypes}
                onSelect={handleFilterChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="flex flex-col">
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-spacing-12">
            <div className="inline-block w-spacing-6 h-spacing-6 border-2 border-grey-300 border-t-primary-500 rounded-avatar animate-spin" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-spacing-12 text-center">
            <FileText className="size-12 text-grey-300 mb-spacing-4" />
            <p className="text-body-md text-grey-500">No activity yet</p>
            <p className="text-body-sm text-grey-400 mt-spacing-1">
              Activity will appear here as actions are taken
            </p>
          </div>
        ) : (
          Array.from(groupedActivities.entries()).map(([group, items]) => (
            <div key={group} className="mb-spacing-4">
              <p className="font-code text-mono-xs text-grey-500 uppercase tracking-wider mb-spacing-2 px-spacing-3">
                {group}
              </p>
              <div className="flex flex-col">
                {items.map((activity) => (
                  <ActivityItemCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                    compact={compact}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className={clsx(
            "mt-spacing-4 px-spacing-4 py-spacing-2 bg-surface-secondary hover:bg-surface-tertiary border-2 border-border-primary rounded-button text-body-sm text-text-primary cursor-pointer transition-colors",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export default ActivityFeed;
