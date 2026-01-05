"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { Plus, MoreHorizontal, Calendar, User, AlertCircle, Tag, ChevronDown, ChevronRight, Search } from "lucide-react";
import type { 
  KanbanBoardProps, 
  KanbanColumn, 
  KanbanSwimlane, 
  KanbanCard 
} from "./KanbanBoard.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * KANBAN BOARD VIEW
 * 
 * CHARACTERISTICS:
 * - Column-based task management
 * - Drag and drop between columns
 * - Swimlane grouping
 * - Card customization
 * - Column resizing and reordering
 * - Inline card editing
 * - Progress tracking
 */
export function KanbanBoard<T extends { id: string }>({
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
  columns = [],
  statusField,
  enableDragDrop = true,
  enableColumnResize = false,
  enableColumnReorder = false,
  cardOptions = {
    showAssignee: true,
    showDueDate: true,
    showPriority: true,
    showTags: true,
    showProgress: false,
    compact: false,
  },
  columnWidth = 300,
  minColumnWidth = 250,
  maxColumnWidth = 400,
  cardRenderer,
  columnHeaderRenderer,
  swimlaneField,
  swimlanes = [],
  ...props
}: KanbanBoardProps<T>) {
  const [expandedSwimlanes, setExpandedSwimlanes] = useState<Set<string>>(new Set());
  const [draggedCard, setDraggedCard] = useState<{ id: string; fromColumn: string; fromSwimlane?: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverSwimlane, setDragOverSwimlane] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const boardRef = useRef<HTMLDivElement>(null);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [entities, searchTerm, filters]);

  // Group entities by columns and swimlanes
  const groupedEntities = useMemo(() => {
    const result = new Map<string, Map<string, T[]>>();

    // Initialize columns
    columns.forEach(column => {
      if (!result.has(column.id)) {
        result.set(column.id, new Map());
      }
      
      // Initialize swimlanes if specified
      if (swimlaneField && swimlanes.length > 0) {
        swimlanes.forEach(swimlane => {
          result.get(column.id)!.set(swimlane.id, []);
        });
      } else {
        result.get(column.id)!.set('default', []);
      }
    });

    // Group entities
    filteredEntities.forEach(entity => {
      const status = String(entity[statusField]);
      const column = columns.find(col => col.status === status);
      
      if (column) {
        const columnMap = result.get(column.id)!;
        
        if (swimlaneField && swimlanes.length > 0) {
          const swimlaneValue = String(entity[swimlaneField]);
          const swimlane = swimlanes.find(s => s.value === swimlaneValue);
          const swimlaneId = swimlane?.id || 'default';
          
          if (!columnMap.has(swimlaneId)) {
            columnMap.set(swimlaneId, []);
          }
          columnMap.get(swimlaneId)!.push(entity);
        } else {
          columnMap.get('default')!.push(entity);
        }
      }
    });

    return result;
  }, [filteredEntities, columns, statusField, swimlaneField, swimlanes]);

  // Initialize column order
  useEffect(() => {
    if (columnOrder.length === 0 && columns.length > 0) {
      setColumnOrder(columns.map(col => col.id));
    }
  }, [columns, columnOrder]);

  // Handle drag start
  const handleDragStart = useCallback((cardId: string, fromColumn: string, fromSwimlane?: string) => {
    if (!enableDragDrop) return;
    setDraggedCard({ id: cardId, fromColumn, fromSwimlane });
  }, [enableDragDrop]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, swimlaneId?: string) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    setDragOverColumn(columnId);
    setDragOverSwimlane(swimlaneId || null);
  }, [enableDragDrop]);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, toColumn: string, toSwimlane?: string) => {
    if (!enableDragDrop || !draggedCard) return;
    
    e.preventDefault();
    
    const { id: cardId, fromColumn, fromSwimlane } = draggedCard;
    
    // Only update if the position changed
    if (fromColumn !== toColumn || fromSwimlane !== toSwimlane) {
      // Update the entity
      const updates: Partial<T> = {
        [statusField]: toColumn,
      } as Partial<T>;
      
      if (swimlaneField && toSwimlane) {
        const swimlane = swimlanes.find(s => s.id === toSwimlane);
        if (swimlane) {
          (updates as any)[swimlaneField] = swimlane.value;
        }
      }
      
      await onEntityUpdate?.(cardId, updates);
    }
    
    // Reset drag state
    setDraggedCard(null);
    setDragOverColumn(null);
    setDragOverSwimlane(null);
  }, [enableDragDrop, draggedCard, onEntityUpdate, statusField, swimlaneField, swimlanes]);

  // Handle column resize
  const handleColumnResize = useCallback((columnId: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnId]: Math.max(minColumnWidth, Math.min(maxColumnWidth, newWidth))
    }));
  }, [minColumnWidth, maxColumnWidth]);

  // Toggle swimlane expansion
  const toggleSwimlane = useCallback((swimlaneId: string) => {
    setExpandedSwimlanes(prev => {
      const next = new Set(prev);
      if (next.has(swimlaneId)) {
        next.delete(swimlaneId);
      } else {
        next.add(swimlaneId);
      }
      return next;
    });
  }, []);

  // Render card
  const renderCard = useCallback((item: T, column: KanbanColumn, swimlaneId?: string) => {
    const itemId = item.id;
    const isDragging = draggedCard?.id === itemId;
    const isSelected = selectedIds.includes(itemId);
    
    if (cardRenderer) {
      return cardRenderer(item, column);
    }

    const title = String((item as any).title || (item as any).name || 'Untitled');
    const description = String((item as any).description || '');
    const assignee = (item as any).assigneeId || (item as any).assignee;
    const dueDate = (item as any).dueDate;
    const priority = (item as any).priority;
    const tags = (item as any).tags || [];
    const progress = (item as any).progress || 0;

    return (
      <div
        className={clsx(
          "bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow",
          isDragging && "opacity-50 rotate-2",
          isSelected && "ring-2 ring-[var(--color-brand-primary)]",
          cardOptions.compact && "p-3"
        )}
        draggable={enableDragDrop}
        onDragStart={() => handleDragStart(itemId, column.id, swimlaneId)}
        onClick={() => onEntityClick?.(itemId)}
        onDoubleClick={() => onEntityDoubleClick?.(itemId)}
        onContextMenu={(e) => onContextMenu?.(itemId, e)}
      >
        {/* Title */}
        <h3 className="font-medium text-[var(--color-text-primary)] mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Description */}
        {description && !cardOptions.compact && (
          <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Progress */}
        {cardOptions.showProgress && typeof progress === 'number' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[var(--color-border-input)] rounded-full h-2">
              <div
                className="bg-[var(--color-brand-primary)] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority */}
            {cardOptions.showPriority && priority && (
              <Badge
                variant="solid"
                size="sm"
                className={clsx(
                  priority === 'urgent' && "bg-[var(--color-red-100)] text-[var(--color-red-700)]",
                  priority === 'high' && "bg-[var(--color-orange-100)] text-[var(--color-orange-700)]",
                  priority === 'medium' && "bg-[var(--color-yellow-100)] text-[var(--color-yellow-700)]",
                  priority === 'low' && "bg-[var(--color-gray-100)] text-[var(--color-gray-700)]"
                )}
              >
                {priority}
              </Badge>
            )}
            
            {/* Tags */}
            {cardOptions.showTags && tags.length > 0 && (
              <div className="flex gap-1">
                {tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="outline" size="sm">
                    +{tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Due Date */}
            {cardOptions.showDueDate && dueDate && (
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Calendar className="w-3 h-3" />
                {new Date(dueDate).toLocaleDateString()}
              </div>
            )}
            
            {/* Assignee */}
            {cardOptions.showAssignee && assignee && (
              <div className="w-6 h-6 bg-[var(--color-brand-primary)] text-white rounded-full flex items-center justify-center text-xs">
                {String(assignee).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    cardRenderer,
    cardOptions,
    selectedIds,
    draggedCard,
    enableDragDrop,
    handleDragStart,
    onEntityClick,
    onEntityDoubleClick,
    onContextMenu
  ]);

  // Render column header
  const renderColumnHeader = useCallback((column: KanbanColumn, items: T[]) => {
    if (columnHeaderRenderer) {
      return columnHeaderRenderer(column, items);
    }

    const itemCount = items.length;
    const maxItems = column.maxItems;
    const isOverLimit = maxItems && itemCount > maxItems;

    return (
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-2">
          {column.icon && (
            <Icon name={column.icon} className="w-4 h-4" />
          )}
          <h3 className="font-medium text-[var(--color-text-primary)]">
            {column.title}
          </h3>
          <Badge
            variant="outline"
            className={clsx(
              isOverLimit && "bg-[var(--color-error-bg)] text-[var(--color-error-border)] border-[var(--color-error-border)]"
            )}
          >
            {itemCount}
            {maxItems && `/${maxItems}`}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }, [columnHeaderRenderer]);

  // Empty state
  if (entities.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          {emptyState?.icon && (
            <div className="w-16 h-16 mx-auto mb-4 opacity-50">
              {emptyState.icon}
            </div>
          )}
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No tasks found"}
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
        <div className="text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading data</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={boardRef}>
      {/* Search and filters */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {columnOrder.map((columnId) => {
          const column = columns.find(col => col.id === columnId);
          if (!column) return null;

          const columnItems = groupedEntities.get(columnId);
          const isDragOver = dragOverColumn === columnId;

          return (
            <div
              key={columnId}
              className={clsx(
                "flex-shrink-0 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border-input)]",
                isDragOver && "ring-2 ring-[var(--color-brand-primary)]"
              )}
              style={{
                width: columnWidths[columnId] || columnWidth || column.width,
                minWidth: minColumnWidth,
                maxWidth: maxColumnWidth,
              }}
              onDragOver={(e) => handleDragOver(e, columnId)}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              {renderColumnHeader(column, Array.from(columnItems?.values() || []).flat())}
              
              <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {swimlaneField && swimlanes.length > 0 ? (
                  // Render swimlanes
                  swimlanes.map((swimlane) => {
                    const items = columnItems?.get(swimlane.id) || [];
                    const isExpanded = expandedSwimlanes.has(swimlane.id);
                    const isSwimlaneDragOver = isDragOver && dragOverSwimlane === swimlane.id;

                    return (
                      <div key={swimlane.id}>
                        {/* Swimlane Header */}
                        <div
                          className={clsx(
                            "flex items-center gap-2 p-2 bg-[var(--color-surface-primary)] rounded border border-[var(--color-border-input)] mb-2",
                            isSwimlaneDragOver && "ring-2 ring-[var(--color-brand-primary)]"
                          )}
                          onClick={() => toggleSwimlane(swimlane.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-medium text-sm">{swimlane.title}</span>
                          <Badge variant="outline" size="sm">
                            {items.length}
                          </Badge>
                        </div>
                        
                        {/* Swimlane Items */}
                        {isExpanded && (
                          <div className="space-y-3">
                            {items.map((item) => renderCard(item, column, swimlane.id))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Render items without swimlanes
                  (columnItems?.get('default') || []).map((item) => renderCard(item, column))
                )}
              </div>

              {/* Column Resize Handle */}
              {enableColumnResize && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--color-brand-primary)] cursor-col-resize hover:bg-[var(--color-brand-primary)]"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setResizingColumn(columnId);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
