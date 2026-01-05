"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { ChevronLeft, ChevronRight, Clock, User, Tag, Paperclip, Search, Filter, MoreHorizontal, Plus, Calendar, LayoutGrid, LayoutList } from "lucide-react";
import type { 
  TimelineViewProps, 
  TimelineOrientation,
  TimelineGrouping,
  TimelineItem,
  TimelineGroup,
  TimelineFilter,
  TimelineDateRange,
  TimelineConnector,
  TimelineLayout,
  TimelineViewState
} from "./TimelineView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * TIMELINE VIEW
 * 
 * CHARACTERISTICS:
 * - Chronological event visualization
 * - Vertical/horizontal orientation
 * - Grouping by date/type/author
 * - Drag to reorder items
 * - Inline editing support
 * - Item expansion/collapse
 * - Search and filtering
 * - Date range selection
 * - Custom item rendering
 */
export function TimelineView<T extends { id: string }>({
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
  titleField,
  descriptionField,
  typeField,
  authorField,
  iconField,
  colorField,
  attachmentsField,
  tagsField,
  defaultOrientation = "vertical",
  defaultGrouping = "date",
  enableDragReorder = true,
  enableInlineEdit = false,
  enableItemExpansion = true,
  enableItemSelection = true,
  enableItemFiltering = true,
  enableSearch = true,
  enableDateRangeSelection = false,
  showTimestamps = true,
  showAuthors = true,
  showIcons = true,
  showAttachments = true,
  showTags = true,
  compact = false,
  itemRenderer,
  groupRenderer,
  connectorRenderer,
  onItemClick,
  onItemDoubleClick,
  onItemContextMenu,
  onGroupClick,
  onDateRangeSelect,
  onSearch,
  onFilter,
  ...props
}: TimelineViewProps<T>) {
  const [orientation, setOrientation] = useState<TimelineOrientation>(defaultOrientation);
  const [grouping, setGrouping] = useState<TimelineGrouping>(defaultGrouping);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selectedIds));
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);
  const [activeFilters, setActiveFilters] = useState<TimelineFilter[]>([]);
  const [dateRange, setDateRange] = useState<TimelineDateRange | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Timeline configuration
  const timelineConfig = useMemo(() => ({
    itemHeight: compact ? 60 : 80,
    connectorWidth: 2,
    connectorColor: 'var(--color-border-input)',
    groupSpacing: 20,
    itemSpacing: 10,
    dateFormat: 'MMM dd, yyyy',
    timeFormat: 'h:mm a',
    locale: 'en-US',
    timeZone: 'UTC',
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

  // Convert entities to timeline items
  const timelineItems = useMemo((): TimelineItem<T>[] => {
    return filteredEntities.map(entity => {
      const timestamp = new Date(entity[timestampField] as string);
      const title = String(entity[titleField]);
      const description = descriptionField ? String(entity[descriptionField]) : undefined;
      const type = typeField ? String(entity[typeField]) : undefined;
      const author = authorField ? String(entity[authorField]) : undefined;
      const icon = iconField ? String(entity[iconField]) : undefined;
      const color = colorField ? String(entity[colorField]) : undefined;
      const attachments = attachmentsField ? (entity[attachmentsField] as string[]) : [];
      const tags = tagsField ? (entity[tagsField] as string[]) : [];

      return {
        data: entity,
        id: entity.id,
        title,
        description,
        timestamp,
        type,
        author,
        icon,
        color,
        attachments,
        tags,
        expanded: expandedItems.has(entity.id),
        selected: selectedItems.has(entity.id),
        isDragging: draggedItem === entity.id,
        status: 'active' as const, // Would be determined from entity data
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [filteredEntities, timestampField, titleField, descriptionField, typeField, authorField, iconField, colorField, attachmentsField, tagsField, expandedItems, selectedItems, draggedItem]);

  // Group timeline items
  const timelineGroups = useMemo((): TimelineGroup<T>[] => {
    if (grouping === 'none') {
      return [{
        id: 'all',
        title: 'All Items',
        type: 'all',
        items: timelineItems,
        collapsed: false,
        count: timelineItems.length,
      }];
    }

    const groups = new Map<string, TimelineItem<T>[]>();
    
    timelineItems.forEach(item => {
      let groupKey = '';
      
      switch (grouping) {
        case 'date':
          groupKey = item.timestamp.toLocaleDateString();
          break;
        case 'type':
          groupKey = item.type || 'uncategorized';
          break;
        case 'author':
          groupKey = item.author || 'unknown';
          break;
        default:
          groupKey = 'custom';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return Array.from(groups.entries()).map(([key, items]) => {
      const dateRange = items.length > 0 ? {
        start: items[0].timestamp,
        end: items[items.length - 1].timestamp,
      } : undefined;

      return {
        id: key,
        title: key,
        type: grouping,
        items,
        collapsed: collapsedGroups.has(key),
        count: items.length,
        dateRange,
        stats: {
          totalItems: items.length,
          completedItems: items.filter(item => item.status === 'completed').length,
          pendingItems: items.filter(item => item.status === 'pending').length,
          activeItems: items.filter(item => item.status === 'active').length,
        },
      };
    }).sort((a, b) => {
      if (a.dateRange && b.dateRange) {
        return a.dateRange.start.getTime() - b.dateRange.start.getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [timelineItems, grouping, collapsedGroups]);

  // Calculate timeline layout
  const timelineLayout = useMemo((): TimelineLayout => {
    const itemPositions = new Map<string, { x: number; y: number; width: number; height: number }>();
    const groupPositions = new Map<string, { x: number; y: number; width: number; height: number }>();
    const connectorPaths: TimelineConnector[] = [];
    
    let currentY = 0;
    let currentX = 0;
    
    timelineGroups.forEach(group => {
      if (group.collapsed) return;
      
      // Group position
      const groupY = currentY;
      const groupHeight = group.items.length * (timelineConfig.itemHeight + timelineConfig.itemSpacing);
      
      groupPositions.set(group.id, {
        x: 0,
        y: groupY,
        width: 100, // Will be calculated based on container
        height: groupHeight,
      });
      
      // Item positions
      group.items.forEach((item, index) => {
        const itemY = groupY + index * (timelineConfig.itemHeight + timelineConfig.itemSpacing);
        
        itemPositions.set(item.id, {
          x: orientation === 'vertical' ? 50 : currentX,
          y: itemY,
          width: orientation === 'vertical' ? 100 : timelineConfig.itemHeight * 3,
          height: timelineConfig.itemHeight,
        });
        
        if (orientation === 'horizontal') {
          currentX += timelineConfig.itemHeight * 3 + timelineConfig.itemSpacing;
        }
      });
      
      currentY += groupHeight + timelineConfig.groupSpacing;
    });
    
    return {
      orientation,
      width: orientation === 'vertical' ? 100 : currentX,
      height: orientation === 'vertical' ? currentY : 100,
      itemPositions,
      groupPositions,
      connectorPaths,
      bounds: {
        minX: 0,
        minY: 0,
        maxX: orientation === 'vertical' ? 100 : currentX,
        maxY: orientation === 'vertical' ? currentY : 100,
      },
      scrollDimensions: {
        width: orientation === 'vertical' ? 100 : currentX,
        height: orientation === 'vertical' ? currentY : 100,
      },
    };
  }, [timelineGroups, orientation, timelineConfig]);

  // Orientation change handler
  const handleOrientationChange = useCallback((newOrientation: TimelineOrientation) => {
    setOrientation(newOrientation);
  }, []);

  // Grouping change handler
  const handleGroupingChange = useCallback((newGrouping: TimelineGrouping) => {
    setGrouping(newGrouping);
  }, []);

  // Item expansion handler
  const toggleItemExpansion = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
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

  // Item selection handlers
  const handleItemClick = useCallback((itemId: string, event: React.MouseEvent) => {
    const item = timelineItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedItems(prev => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedItems(new Set([itemId]));
    }
    
    onItemClick?.(item.data);
    onEntityClick?.(itemId);
  }, [timelineItems, onItemClick, onEntityClick]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQueryLocal(query);
    onSearch?.(query);
  }, [onSearch]);

  // Render timeline item
  const renderTimelineItem = useCallback((item: TimelineItem<T>) => {
    const position = timelineLayout.itemPositions.get(item.id);
    if (!position) return null;
    
    const isHovered = hoveredItem === item.id;
    const isDragging = draggedItem === item.id;
    
    if (itemRenderer) {
      return itemRenderer(item, orientation);
    }
    
    return (
      <div
        className={clsx(
          "absolute bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg p-4 cursor-pointer transition-all",
          item.selected && "ring-2 ring-[var(--color-brand-primary)]",
          isDragging && "opacity-50 rotate-2",
          isHovered && "shadow-lg",
          compact && "p-2"
        )}
        style={{
          left: orientation === 'vertical' ? '50px' : `${position.x}px`,
          top: orientation === 'vertical' ? `${position.y}px` : '50px',
          width: orientation === 'vertical' ? 'calc(100% - 70px)' : `${position.width}px`,
          height: `${position.height}px`,
        }}
        draggable={enableDragReorder}
        onDragStart={() => setDraggedItem(item.id)}
        onClick={(e) => handleItemClick(item.id, e)}
        onDoubleClick={() => onItemDoubleClick?.(item.data)}
        onContextMenu={(e) => onItemContextMenu?.(item.data, e)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex items-start gap-3">
          {/* Timeline connector */}
          <div className="flex-shrink-0">
            <div
              className="w-3 h-3 rounded-full border-2 border-[var(--color-brand-primary)]"
              style={{ backgroundColor: item.color || 'var(--color-brand-primary)' }}
            />
            {orientation === 'vertical' && (
              <div className="w-0.5 h-4 bg-[var(--color-border-input)] mx-auto" />
            )}
          </div>
          
          {/* Item content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {showIcons && item.icon && (
                <Icon name={item.icon} className="w-4 h-4 text-[var(--color-text-muted)]" />
              )}
              <h3 className="font-medium text-[var(--color-text-primary)] truncate">
                {item.title}
              </h3>
              {item.type && (
                <Badge variant="outline" size="sm">
                  {item.type}
                </Badge>
              )}
            </div>
            
            {item.description && !compact && (
              <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              {showTimestamps && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timestamp.toLocaleDateString()}
                </div>
              )}
              
              {showAuthors && item.author && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.author}
                </div>
              )}
              
              {showAttachments && item.attachments && item.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {item.attachments.length}
                </div>
              )}
              
              {showTags && item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {item.tags.length}
                </div>
              )}
            </div>
            
            {/* Tags */}
            {showTags && item.tags && item.tags.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex-shrink-0">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }, [itemRenderer, orientation, timelineLayout, hoveredItem, draggedItem, showIcons, showTimestamps, showAuthors, showAttachments, showTags, compact, enableDragReorder, handleItemClick, onItemDoubleClick, onItemContextMenu]);

  // Render group
  const renderGroup = useCallback((group: TimelineGroup<T>) => {
    if (groupRenderer) {
      return groupRenderer(group);
    }
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--color-text-primary)]">
              {group.title}
            </h3>
            <Badge variant="secondary" size="sm">
              {group.count}
            </Badge>
            {group.stats && (
              <div className="text-xs text-[var(--color-text-muted)]">
                {group.stats.activeItems} active, {group.stats.completedItems} completed
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
          <div className="relative">
            {/* Timeline line */}
            <div
              className={clsx(
                "absolute bg-[var(--color-border-input)]",
                orientation === 'vertical' ? "left-6 top-0 bottom-0 w-0.5" : "left-0 right-0 top-6 h-0.5"
              )}
            />
            
            {/* Group items */}
            {group.items.map(item => (
              <div key={item.id}>
                {renderTimelineItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [groupRenderer, orientation, toggleGroupCollapse, renderTimelineItem]);

  // Empty state
  if (timelineItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No timeline items found"}
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
        <div className="text-[var(--color-text-muted)]">Loading timeline...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading timeline</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={timelineRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={orientation === 'vertical' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleOrientationChange('vertical')}
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Vertical
            </Button>
            <Button
              variant={orientation === 'horizontal' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleOrientationChange('horizontal')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Horizontal
            </Button>
          </div>
          
          <select
            value={grouping}
            onChange={(e) => handleGroupingChange(e.target.value as TimelineGrouping)}
            className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option value="none">No Grouping</option>
            <option value="date">Group by Date</option>
            <option value="type">Group by Type</option>
            <option value="author">Group by Author</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search timeline..."
                value={searchQueryLocal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              />
            </div>
          )}
          
          {enableItemFiltering && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          )}
          
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-auto" style={{ height: 'calc(100% - 73px)' }}>
        <div className="p-4" style={{ minHeight: `${timelineLayout.scrollDimensions.height}px` }}>
          {timelineGroups.map(group => (
            <div key={group.id}>
              {renderGroup(group)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
