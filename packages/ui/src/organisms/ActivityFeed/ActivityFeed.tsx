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
import { activityFeedVariants, activityItemVariants, activityIconVariants } from "./ActivityFeed.variants.js";
import type { ActivityFeedProps, ActivityItem, ActivityType } from "./ActivityFeed.types.js";

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

function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return timestamp.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
        activityItemVariants({
          compact,
          inverted: false,
        }),
        "w-full text-left bg-transparent border-none cursor-pointer transition-all duration-200 hover:bg-surface-secondary"
      )}
    >
      {/* Icon */}
      <div className={activityIconVariants({ type: activity.type, inverted: false })}>
        {activityIcons[activity.type]}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {activity.user && (
            <span className="font-medium text-text-primary text-sm">
              {activity.user.name}
            </span>
          )}
          <span className="text-text-muted text-sm">
            {activity.title}
          </span>
          {activity.entityName && (
            <span className="font-medium text-primary-500 text-sm truncate">
              {activity.entityName}
            </span>
          )}
        </div>
        
        {activity.description && !compact && (
          <p className="text-sm text-text-muted mt-1 line-clamp-2">
            {activity.description}
          </p>
        )}
        
        <p className="text-xs text-text-disabled mt-1">
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
          "flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm cursor-pointer transition-colors",
          selectedTypes.length > 0
            ? "bg-primary-500 border-primary-600 text-white"
            : "bg-surface-secondary border-border text-text-primary hover:bg-surface-tertiary"
        )}
      >
        <Filter className="w-4 h-4" />
        Filter
        {selectedTypes.length > 0 && (
          <span className="ml-1 px-1 bg-white/20 rounded text-xs">
            {selectedTypes.length}
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 min-w-[200px] bg-surface-elevated border-2 border-border rounded-lg shadow-lg z-50">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleToggle(type)}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2 text-left border-none cursor-pointer transition-colors",
                  selectedTypes.includes(type)
                    ? "bg-primary-500/10 text-primary-600"
                    : "bg-transparent text-text-primary hover:bg-surface-secondary"
                )}
              >
                <div className={activityIconVariants({ type, inverted: false })}>
                  {activityIcons[type]}
                </div>
                <span className="text-sm">{activityLabels[type]}</span>
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

/**
 * ActivityFeed component - Displays a chronological feed of user activities
 * 
 * @example
 * ```tsx
 * <ActivityFeed
 *   activities={activities}
 *   showFilters={true}
 *   compact={false}
 *   onActivityClick={(activity) => console.log(activity)}
 * />
 * ```
 */
export function ActivityFeed({
  activities,
  maxItems,
  showLoadMore = false,
  compact = false,
  inverted = false,
  onLoadMore,
  onActivityClick,
  className,
  ...props
}: ActivityFeedProps) {
  // Filter activities by maxItems
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  // Group by date
  const groupedActivities = groupByDate(displayActivities);

  // Handle filter change
  const handleFilterChange = useCallback((_types: ActivityType[]) => {
    // Filter logic would go here
  }, []);

  return (
    <div className={clsx(activityFeedVariants({ compact, inverted, className }))} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-text-primary">Activity</h3>
        <div className="flex items-center gap-2">
          <FilterDropdown
            selectedTypes={[]}
            onSelect={handleFilterChange}
          />
        </div>
      </div>

      {/* Activity List */}
      <div className="flex flex-col">
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-text-secondary mb-4" />
            <p className="text-lg text-text-muted">No activity yet</p>
            <p className="text-sm text-text-disabled mt-1">
              Activity will appear here as actions are taken
            </p>
          </div>
        ) : (
          Array.from(groupedActivities.entries()).map(([group, items]) => (
            <div key={group} className="mb-4">
              <p className="font-mono text-xs text-text-disabled uppercase tracking-wider mb-2 px-3">
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
      {showLoadMore && maxItems && activities.length > maxItems && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="mt-4 px-4 py-2 bg-surface-secondary hover:bg-surface-tertiary border-2 border-border rounded-lg text-sm text-text-primary cursor-pointer transition-colors"
        >
          Load More
        </button>
      )}
    </div>
  );
}

export default ActivityFeed;
