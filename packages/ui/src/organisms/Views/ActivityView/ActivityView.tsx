"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { Clock, User, FileText, MessageSquare, Paperclip, Search, Filter, MoreHorizontal, Plus, RefreshCw, Activity, Bell, Eye, EyeOff, Star, ChevronRight, ChevronLeft } from "lucide-react";
import type { 
  ActivityViewProps, 
  ActivityViewMode,
  ActivityGrouping,
  ActivityItem,
  ActivityGroup,
  ActivityFilter,
  ActivityActor,
  ActivityTarget,
  ActivityAttachment,
  ActivityComment,
  ActivityStats,
  ActivityViewState
} from "./ActivityView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * ACTIVITY VIEW
 * 
 * CHARACTERISTICS:
 * - Activity feed visualization
 * - Multiple view modes (feed, list, cards, timeline)
 * - Grouping by date/type/actor/target
 * - Real-time updates support
 * - Activity filtering and search
 * - Actor avatars and profiles
 * - Activity attachments and comments
 * - Read/unread status tracking
 * - Infinite scroll support
 */
export function ActivityView<T extends { id: string }>({
  entityIds,
  entitySelector,
  filters = [],
  sort = [],
  groupBy,
  searchQuery = "",
  visibleFields = [],
  density = "default",
  showSubtasks = true,
  showCompleted = true,
  colorBy,
  selectionMode = "none",
  selectedIds = [],
  onSelectionChange,
  onEntityClick,
  onEntityDoubleClick,
  onContextMenu,
  onEntityUpdate,
  onEntityCreate,
  onEntityDelete,
  onEntityReorder,
  isLoading = false,
  error = null,
  emptyState,
  config = {},
  timestampField,
  typeField,
  actorField,
  actionField,
  targetField,
  descriptionField,
  metadataField,
  attachmentsField,
  commentsField,
  defaultView = "feed",
  defaultGrouping = "date",
  enableRealTime = false,
  enableActivityFiltering = true,
  enableSearch = true,
  enableInfiniteScroll = false,
  showActivityIcons = true,
  showActorAvatars = true,
  showTimestamps = true,
  showRelativeTime = true,
  showActivityDetails = true,
  showAttachments = true,
  showComments = true,
  compact = false,
  autoRefreshInterval = 30000,
  activityRenderer,
  groupRenderer,
  actorRenderer,
  onActivityClick,
  onActivityDoubleClick,
  onActivityContextMenu,
  onActorClick,
  onTargetClick,
  onSearch,
  onFilter,
  onLoadMore,
  onRefresh,
  ...props
}: ActivityViewProps<T>) {
  const [viewMode, setViewMode] = useState<ActivityViewMode>(defaultView);
  const [grouping, setGrouping] = useState<ActivityGrouping>(defaultGrouping);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set(selectedIds));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);
  const [activeFilters, setActiveFilters] = useState<ActivityFilter[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const activityViewRef = useRef<HTMLDivElement>(null);

  // Activity configuration
  const activityConfig = useMemo(() => ({
    itemHeight: compact ? 60 : 80,
    avatarSize: compact ? 24 : 32,
    iconSize: compact ? 16 : 20,
    groupSpacing: 20,
    itemSpacing: 10,
    dateFormat: 'MMM dd, yyyy',
    timeFormat: 'h:mm a',
    locale: 'en-US',
    timeZone: 'UTC',
    maxItems: 50,
    ...config,
  }), [compact, config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchQueryLocal) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchQueryLocal.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.isActive) {
        filtered = filtered.filter(entity => {
          const value = entity[filter.field as keyof T];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'greater_than':
              return Number(value) > Number(filter.value);
            case 'less_than':
              return Number(value) < Number(filter.value);
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [entities, searchQueryLocal, filters]);

  // Convert entities to activity items
  const activityItems = useMemo((): ActivityItem<T>[] => {
    return filteredEntities.map(entity => {
      const timestamp = new Date(entity[timestampField] as string);
      const type = String(entity[typeField]);
      const actorData = entity[actorField] as Record<string, unknown>;
      const action = String(entity[actionField]);
      const targetData = targetField ? (entity[targetField] as Record<string, unknown>) : undefined;
      const description = descriptionField ? String(entity[descriptionField]) : undefined;
      const metadata = metadataField ? (entity[metadataField] as Record<string, unknown>) : {};
      const attachments = attachmentsField ? (entity[attachmentsField] as Record<string, unknown>[]) : [];
      const comments = commentsField ? (entity[commentsField] as Record<string, unknown>[]) : [];

      const actor: ActivityActor<T> = {
        data: actorData,
        id: actorData?.id || 'unknown',
        name: actorData?.name || 'Unknown',
        email: actorData?.email,
        avatar: actorData?.avatar,
        role: actorData?.role,
        type: actorData?.type || 'user',
      };

      const target: ActivityTarget<T> | undefined = targetData ? {
        data: targetData,
        id: targetData?.id || 'unknown',
        name: targetData?.name || 'Unknown',
        type: targetData?.type || 'unknown',
        url: targetData?.url,
        icon: targetData?.icon,
      } : undefined;

      return {
        data: entity,
        id: entity.id,
        timestamp,
        type,
        actor,
        action,
        target,
        description,
        metadata,
        attachments,
        comments,
        icon: getActivityIcon(type),
        color: getActivityColor(type),
        selected: selectedActivities.has(entity.id),
        isRead: Boolean((entity as Record<string, unknown>).isRead),
        isImportant: Boolean((entity as Record<string, unknown>).isImportant),
        status: (entity as Record<string, unknown>).status || 'completed',
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [filteredEntities, timestampField, typeField, actorField, actionField, targetField, descriptionField, metadataField, attachmentsField, commentsField, selectedActivities]);

  // Group activity items
  const activityGroups = useMemo((): ActivityGroup<T>[] => {
    if (grouping === 'none') {
      return [{
        id: 'all',
        title: 'All Activities',
        type: 'all',
        activities: activityItems,
        count: activityItems.length,
      }];
    }

    const groups = new Map<string, ActivityItem<T>[]>();
    
    activityItems.forEach(item => {
      let groupKey = '';
      
      switch (grouping) {
        case 'date':
          groupKey = item.timestamp.toLocaleDateString();
          break;
        case 'type':
          groupKey = item.type;
          break;
        case 'actor':
          groupKey = item.actor.name;
          break;
        case 'target':
          groupKey = item.target?.name || 'no-target';
          break;
        default:
          groupKey = 'custom';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return Array.from(groups.entries()).map(([key, activities]) => {
      const dateRange = activities.length > 0 ? {
        start: activities[0].timestamp,
        end: activities[activities.length - 1].timestamp,
      } : undefined;

      const byType: Record<string, number> = {};
      activities.forEach(activity => {
        byType[activity.type] = (byType[activity.type] || 0) + 1;
      });

      return {
        id: key,
        title: key,
        type: grouping,
        activities,
        collapsed: collapsedGroups.has(key),
        count: activities.length,
        dateRange,
        stats: {
          totalActivities: activities.length,
          unreadActivities: activities.filter(a => !a.isRead).length,
          importantActivities: activities.filter(a => a.isImportant).length,
          byType,
        },
      };
    }).sort((a, b) => {
      if (a.dateRange && b.dateRange) {
        return b.dateRange.start.getTime() - a.dateRange.start.getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [activityItems, grouping, collapsedGroups]);

  // Activity statistics
  const activityStats = useMemo((): ActivityStats => {
    const byType: Record<string, number> = {};
    const byActor: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    activityItems.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byActor[item.actor.name] = (byActor[item.actor.name] || 0) + 1;
      const dateKey = item.timestamp.toLocaleDateString();
      byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    });

    return {
      total: activityItems.length,
      byType,
      byActor,
      byDate,
      unread: activityItems.filter(a => !a.isRead).length,
      important: activityItems.filter(a => a.isImportant).length,
      trend: [], // Would be calculated from historical data
    };
  }, [activityItems]);

  // View mode change handler
  const handleViewModeChange = useCallback((newViewMode: ActivityViewMode) => {
    setViewMode(newViewMode);
  }, []);

  // Grouping change handler
  const handleGroupingChange = useCallback((newGrouping: ActivityGrouping) => {
    setGrouping(newGrouping);
  }, []);

  // Group collapse handler
  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Activity selection handlers
  const handleActivityClick = useCallback((activityId: string, event: React.MouseEvent) => {
    const activity = activityItems.find(a => a.id === activityId);
    if (!activity) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedActivities(prev => {
        const next = new Set(prev);
        if (next.has(activityId)) {
          next.delete(activityId);
        } else {
          next.add(activityId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedActivities(new Set([activityId]));
    }
    
    onActivityClick?.(activity.data);
    onEntityClick?.(activityId);
  }, [activityItems, onActivityClick, onEntityClick]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQueryLocal(query);
    onSearch?.(query);
  }, [onSearch]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Load more handler
  const handleLoadMore = useCallback(async () => {
    await onLoadMore?.();
  }, [onLoadMore]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshInterval || !enableRealTime) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, enableRealTime, handleRefresh]);

  // Get activity icon
  const getActivityIcon = useCallback((type: string) => {
    const iconMap: Record<string, string> = {
      'create': 'plus',
      'update': 'edit',
      'delete': 'trash',
      'comment': 'message-square',
      'upload': 'upload',
      'download': 'download',
      'share': 'share',
      'login': 'log-in',
      'logout': 'log-out',
    };
    return iconMap[type] || 'activity';
  }, []);

  // Get activity color
  const getActivityColor = useCallback((type: string) => {
    const colorMap: Record<string, string> = {
      'create': 'var(--color-success)',
      'update': 'var(--color-brand-primary)',
      'delete': 'var(--color-error)',
      'comment': 'var(--color-info)',
      'upload': 'var(--color-warning)',
      'download': 'var(--color-info)',
      'share': 'var(--color-brand-primary)',
      'login': 'var(--color-success)',
      'logout': 'var(--color-error)',
    };
    return colorMap[type] || 'var(--color-text-muted)';
  }, []);

  // Render activity item
  const renderActivityItem = useCallback((activity: ActivityItem<T>) => {
    if (activityRenderer) {
      return activityRenderer(activity);
    }

    const relativeTime = getRelativeTime(activity.timestamp);

    return (
      <div
        className={clsx(
          "flex items-start gap-3 p-4 border border-[var(--color-border-input)] rounded-lg hover:bg-[var(--color-surface-elevated)] cursor-pointer transition-all",
          activity.selected && "ring-2 ring-[var(--color-brand-primary)]",
          !activity.isRead && "bg-[var(--color-brand-primary)] bg-opacity-5",
          compact && "p-2"
        )}
        onClick={(e) => handleActivityClick(activity.id, e)}
        onDoubleClick={() => onActivityDoubleClick?.(activity.data)}
        onContextMenu={(e) => onActivityContextMenu?.(activity.data, e)}
      >
        {/* Activity icon */}
        {showActivityIcons && (
          <div className="flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: activity.color }}
            >
              <Icon name={activity.icon} className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Actor avatar */}
        {showActorAvatars && (
          <div className="flex-shrink-0">
            {actorRenderer ? (
              actorRenderer(activity.actor)
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center">
                {activity.actor.avatar ? (
                  <img
                    src={activity.actor.avatar}
                    alt={activity.actor.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-[var(--color-text-muted)]" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[var(--color-text-primary)]">
              {activity.actor.name}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {activity.action}
            </span>
            {activity.target && (
              <span className="text-sm text-[var(--color-brand-primary)]">
                {activity.target.name}
              </span>
            )}
            {activity.isImportant && (
              <Star className="w-3 h-3 text-[var(--color-warning)]" />
            )}
          </div>

          {showActivityDetails && activity.description && (
            <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2">
              {activity.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            {showTimestamps && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {showRelativeTime ? relativeTime : activity.timestamp.toLocaleString()}
              </div>
            )}

            {showAttachments && activity.attachments && activity.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {activity.attachments.length}
              </div>
            )}

            {showComments && activity.comments && activity.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {activity.comments.length}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }, [activityRenderer, actorRenderer, showActivityIcons, showActorAvatars, showActivityDetails, showTimestamps, showRelativeTime, showAttachments, showComments, compact, handleActivityClick, onActivityDoubleClick, onActivityContextMenu]);

  // Render group
  const renderGroup = useCallback((group: ActivityGroup<T>) => {
    if (groupRenderer) {
      return groupRenderer(group);
    }

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--color-text-primary)]">
              {group.title}
            </h3>
            <Badge variant="secondary" size="sm">
              {group.count}
            </Badge>
            {group.stats && (
              <div className="text-xs text-[var(--color-text-muted)]">
                {group.stats.unreadActivities} unread
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleGroupCollapse(group.id)}
          >
            {group.collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!group.collapsed && (
          <div className="space-y-2">
            {group.activities.map(activity => (
              <div key={activity.id}>
                {renderActivityItem(activity)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [groupRenderer, toggleGroupCollapse, renderActivityItem]);

  // Empty state
  if (activityItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No activities found"}
          </h3>
          {emptyState?.description && (
            <p className="text-[var(--color-text-muted)] mb-4">
              {emptyState.description}
            </p>
          )}
          {emptyState?.action && (
            <Button onClick={emptyState.action.onClick}>
              {emptyState.action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[var(--color-text-muted)]">Loading activities...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading activities</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={activityViewRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'feed' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('feed')}
            >
              Feed
            </Button>
            <Button
              variant={viewMode === 'list' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('cards')}
            >
              Cards
            </Button>
          </div>

          <select
            value={grouping}
            onChange={(e) => handleGroupingChange(e.target.value as ActivityGrouping)}
            className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option value="none">No Grouping</option>
            <option value="date">Group by Date</option>
            <option value="type">Group by Type</option>
            <option value="actor">Group by Actor</option>
            <option value="target">Group by Target</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQueryLocal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              />
            </div>
          )}

          {enableActivityFiltering && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>

          {enableRealTime && (
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-2 h-2 rounded-full",
                  realTimeStatus === 'connected' && "bg-[var(--color-success)]",
                  realTimeStatus === 'disconnected' && "bg-[var(--color-error)]",
                  realTimeStatus === 'connecting' && "bg-[var(--color-warning)]"
                )}
              />
              <span className="text-xs text-[var(--color-text-muted)]">
                {realTimeStatus}
              </span>
            </div>
          )}

          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Activity stats */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[var(--color-border-input)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Total:</span>
          <Badge variant="secondary" size="sm">
            {activityStats.total}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Unread:</span>
          <Badge variant="solid" size="sm">
            {activityStats.unread}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Important:</span>
          <Badge variant="outline" size="sm">
            {activityStats.important}
          </Badge>
        </div>
      </div>

      {/* Activities */}
      <div className="overflow-auto" style={{ height: 'calc(100% - 140px)' }}>
        <div className="p-4">
          {activityGroups.map(group => (
            <div key={group.id}>
              {renderGroup(group)}
            </div>
          ))}

          {/* Load more */}
          {enableInfiniteScroll && hasMore && (
            <div className="flex justify-center py-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
