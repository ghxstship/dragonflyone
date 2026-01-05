"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { ChevronDown, ChevronRight, Search, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { 
  TableViewProps, 
  TableColumn 
} from "./TableView.types.js";
import type { ViewSort, ViewFilter } from "../types.js";

/**
 * TABLE VIEW (ClickUp List View)
 * 
 * CHARACTERISTICS:
 * - Spreadsheet-style data display
 * - Inline editing
 * - Column resizing and reordering
 * - Sticky header and first column
 * - Virtualized for performance
 * - Multi-select with shift+click
 * - Grouped rows with collapse
 * - Custom cell renderers
 */
export function TableView<T extends { id: string }>({
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
  enableInlineEdit = false,
  enableColumnResize = false,
  enableColumnReorder = false,
  enableVirtualization = false,
  rowHeight = 48,
  stickyHeader = true,
  stickyFirstColumn = false,
  enableMultiSelect = false,
  enableGrouping = false,
  cellRenderers = {},
  ...props
}: TableViewProps<T>) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<ViewSort[]>(sort);
  const [filterConfig, setFilterConfig] = useState<ViewFilter[]>(filters);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter and sort entities
  const processedEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply view filters
    filterConfig.forEach(filter => {
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
            case 'greater_than_or_equal':
              return Number(value) >= Number(filter.value);
            case 'less_than_or_equal':
              return Number(value) <= Number(filter.value);
            case 'not_equals':
              return value !== filter.value;
            case 'not_contains':
              return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'starts_with':
              return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
            case 'ends_with':
              return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
            case 'is_empty':
              return value === null || value === undefined || value === '';
            case 'is_not_empty':
              return value !== null && value !== undefined && value !== '';
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(value);
            case 'not_in':
              return Array.isArray(filter.value) && !filter.value.includes(value);
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    if (sortConfig.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        for (const sort of sortConfig) {
          const aValue = a[sort.field as keyof T];
          const bValue = b[sort.field as keyof T];
          const direction = sort.direction === 'asc' ? 1 : -1;
          
          if (aValue < bValue) return -1 * direction;
          if (aValue > bValue) return 1 * direction;
        }
        return 0;
      });
    }

    return filtered;
  }, [entities, searchTerm, filterConfig, sortConfig]);

  // Group entities if grouping is enabled
  const groupedEntities = useMemo(() => {
    if (!enableGrouping || !groupBy) return processedEntities;

    const groups = new Map<string, T[]>();
    processedEntities.forEach(entity => {
      const groupKey = String(entity[groupBy.field as keyof T] || 'ungrouped');
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(entity);
    });

    return Array.from(groups.entries());
  }, [processedEntities, enableGrouping, groupBy]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  // Handle cell editing
  const startEditing = useCallback((rowId: string, column: string, value: string) => {
    if (!enableInlineEdit) return;
    setEditingCell({ rowId, column });
    setEditValue(value);
  }, [enableInlineEdit]);

  const saveEdit = useCallback(() => {
    if (!editingCell || !onEntityUpdate) return;
    
    onEntityUpdate(editingCell.rowId, {
      [editingCell.column]: editValue
    } as Partial<T>).finally(() => {
      setEditingCell(null);
      setEditValue("");
    });
  }, [editingCell, editValue, onEntityUpdate]);

  // Handle column sorting
  const handleSort = useCallback((column: string) => {
    const existingSort = sortConfig.find(s => s.field === column);
    
    if (existingSort) {
      // Toggle direction
      setSortConfig(prev => prev.map(s => 
        s.field === column 
          ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
          : s
      ));
    } else {
      // Add new sort
      setSortConfig(prev => [...prev, { field: column, direction: 'asc' }]);
    }
  }, [sortConfig]);

  // Handle selection
  const handleRowSelect = useCallback((rowId: string, index: number, event: React.MouseEvent) => {
    if (selectionMode === 'none') return;

    if (event.shiftKey && selectedIds.length > 0 && enableMultiSelect && lastSelectedIndex >= 0) {
      // Multi-select with shift
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = processedEntities.slice(start, end + 1).map(e => e.id);
      
      onSelectionChange?.([...new Set([...selectedIds, ...rangeIds])]);
    } else if (event.metaKey || event.ctrlKey) {
      // Multi-select with ctrl/cmd
      const isSelected = selectedIds.includes(rowId);
      if (isSelected) {
        onSelectionChange?.(selectedIds.filter(id => id !== rowId));
      } else {
        onSelectionChange?.([...selectedIds, rowId]);
      }
    } else {
      // Single select
      const isSelected = selectedIds.includes(rowId);
      if (isSelected) {
        onSelectionChange?.([]);
      } else {
        onSelectionChange?.([rowId]);
      }
    }
    
    setLastSelectedIndex(index);
  }, [selectionMode, selectedIds, enableMultiSelect, processedEntities, onSelectionChange, lastSelectedIndex]);

  // Handle column resizing
  const handleColumnResize = useCallback((column: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: newWidth
    }));
  }, []);

  // Handle column reordering
  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (!enableColumnReorder) return;
    
    const newOrder = [...columnOrder];
    const [movedColumn] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedColumn);
    setColumnOrder(newOrder);
  }, [enableColumnReorder, columnOrder]);

  // Render cell content
  const renderCell = useCallback((value: unknown, row: T, column: TableColumn<T>) => {
    const cellKey = `${row.id}-${String(column.key)}`;
    const isEditing = editingCell?.rowId === row.id && editingCell?.column === String(column.key);
    
    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit();
            } else if (e.key === 'Escape') {
              setEditingCell(null);
              setEditValue("");
            }
          }}
          className="w-full px-2 py-1 text-sm border border-[var(--color-border-input)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          autoFocus
        />
      );
    }

    // Use custom renderer if provided
    if (cellRenderers[String(column.key)]) {
      return cellRenderers[String(column.key)](value, row, column);
    }

    // Use column-specific renderer
    if (column.renderer) {
      return column.renderer(value, row);
    }

    // Default type-based renderers
    switch (column.type) {
      case 'status':
        const statusColors: Record<string, string> = {
          todo: 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]',
          in_progress: 'bg-[var(--color-blue-100)] text-[var(--color-blue-700)]',
          review: 'bg-[var(--color-yellow-100)] text-[var(--color-yellow-700)]',
          done: 'bg-[var(--color-green-100)] text-[var(--color-green-700)]',
          cancelled: 'bg-[var(--color-red-100)] text-[var(--color-red-700)]',
        };
        return (
          <Badge variant="solid" className={statusColors[String(value)]}>
            {String(value)}
          </Badge>
        );
      
      case 'priority':
        const priorityColors: Record<string, string> = {
          low: 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]',
          medium: 'bg-[var(--color-orange-100)] text-[var(--color-orange-700)]',
          high: 'bg-[var(--color-red-100)] text-[var(--color-red-700)]',
          urgent: 'bg-[var(--color-purple-100)] text-[var(--color-purple-700)]',
        };
        return (
          <Badge variant="solid" className={priorityColors[String(value)]}>
            {String(value)}
          </Badge>
        );
      
      case 'tags':
        if (Array.isArray(value)) {
          return (
            <div className="flex gap-1 flex-wrap">
              {value.map((tag, index) => (
                <Badge key={index} variant="outline" size="sm">
                  {String(tag)}
                </Badge>
              ))}
            </div>
          );
        }
        break;
      
      case 'actions':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu?.(row.id, e);
            }}
            className="p-1 hover:bg-[var(--color-surface-elevated)] rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        );
      
      default:
        return String(value);
    }

    return String(value);
  }, [editingCell, editValue, cellRenderers, onContextMenu, saveEdit]);

  // Render table rows
  const renderRows = useCallback((data: T[] | [string, T[]][], isGrouped = false) => {
    if (isGrouped) {
      return (data as [string, T[]][]).map(([groupKey, groupItems]) => (
        <React.Fragment key={groupKey}>
          {/* Group header */}
          <tr className="bg-[var(--color-surface-elevated)]">
            <td 
              colSpan={columns.length}
              className="px-4 py-2 font-medium text-[var(--color-text-primary)] border-b border-[var(--color-border-input)]"
            >
              <button
                onClick={() => toggleGroup(groupKey)}
                className="flex items-center gap-2 hover:text-[var(--color-brand-primary)]"
              >
                {expandedGroups.has(groupKey) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>{groupKey}</span>
                <span className="text-[var(--color-text-muted)]">
                  ({groupItems.length})
                </span>
              </button>
            </td>
          </tr>
          
          {/* Group rows */}
          {expandedGroups.has(groupKey) && renderRows(groupItems, false)}
        </React.Fragment>
      ));
    }

    return (data as T[]).map((row, index) => {
      const isSelected = selectedIds.includes(row.id);
      const isEditing = editingCell?.rowId === row.id;
      
      return (
        <tr
          key={row.id}
          className={clsx(
            "border-b border-[var(--color-border-input)] hover:bg-[var(--color-surface-elevated)] transition-colors",
            isSelected && "bg-[var(--color-brand-primary)] bg-opacity-10",
            isEditing && "ring-2 ring-[var(--color-brand-primary)]"
          )}
          onClick={(e) => {
            if (e.detail === 2) {
              onEntityDoubleClick?.(row.id);
            } else {
              onEntityClick?.(row.id);
            }
            handleRowSelect(row.id, index, e);
          }}
        >
          {columns.map((column, colIndex) => (
            <td
              key={String(column.key)}
              className={clsx(
                "px-4 py-2 text-sm",
                column.align === 'center' && "text-center",
                column.align === 'right' && "text-right",
                stickyFirstColumn && colIndex === 0 && "sticky left-0 bg-[var(--color-surface-primary)]",
                "border-r border-[var(--color-border-input)]",
                enableInlineEdit && column.type !== 'actions' && "cursor-pointer"
              )}
              onDoubleClick={() => {
                if (enableInlineEdit && column.type !== 'actions') {
                  startEditing(row.id, String(column.key), String(row[column.key as keyof T]));
                }
              }}
              style={{
                width: columnWidths[String(column.key)] || column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              {renderCell(row[column.key as keyof T], row, column)}
            </td>
          ))}
        </tr>
      );
    });
  }, [
    columns,
    selectedIds,
    editingCell,
    editValue,
    cellRenderers,
    onEntityClick,
    onEntityDoubleClick,
    onContextMenu,
    handleRowSelect,
    toggleGroup,
    expandedGroups,
    stickyFirstColumn,
    enableInlineEdit,
    startEditing,
    renderCell,
    columnWidths
  ]);

  // Handle mouse events for column resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const newWidth = e.clientX;
        handleColumnResize(resizingColumn, newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, handleColumnResize]);

  // Initialize column order
  useEffect(() => {
    if (columnOrder.length === 0 && columns.length > 0) {
      setColumnOrder(columns.map(col => String(col.key)));
    }
  }, [columns, columnOrder]);

  // Empty state
  if (processedEntities.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          {emptyState?.icon && (
            <div className="w-16 h-16 mx-auto mb-4 opacity-50">
              {emptyState.icon}
            </div>
          )}
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No data found"}
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
    <div className="w-full overflow-hidden" ref={tableRef}>
      {/* Search and filters */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={density}
            onChange={(e) => {/* Handle density change */}}
            className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option value="compact">Compact</option>
            <option value="default">Default</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className={clsx("bg-[var(--color-surface-elevated)]", stickyHeader && "sticky top-0 z-10")}>
            <tr>
              {columnOrder.map((columnKey, index) => {
                const column = columns.find(col => String(col.key) === columnKey);
                if (!column) return null;
                
                const isDragging = draggedColumn === columnKey;
                const isDragOver = dragOverColumn === columnKey;
                
                return (
                  <th
                    key={columnKey}
                    className={clsx(
                      "px-4 py-3 text-left text-xs font-medium text-[var(--color-text-primary)] uppercase tracking-wider border-b border-[var(--color-border-input)]",
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right",
                      stickyFirstColumn && index === 0 && "sticky left-0 bg-[var(--color-surface-elevated)]",
                      "border-r border-[var(--color-border-input)]",
                      column.sortable && "cursor-pointer hover:bg-[var(--color-surface-elevated)]",
                      enableColumnResize && "relative",
                      isDragging && "opacity-50",
                      isDragOver && "border-t-2 border-t-[var(--color-brand-primary)]"
                    )}
                    style={{
                      width: columnWidths[columnKey] || column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                    onClick={() => column.sortable && handleSort(columnKey)}
                    draggable={enableColumnReorder}
                    onDragStart={(e) => {
                      if (enableColumnReorder) {
                        setDraggedColumn(columnKey);
                        e.dataTransfer.effectAllowed = 'move';
                      }
                    }}
                    onDragOver={(e) => {
                      if (enableColumnReorder) {
                        e.preventDefault();
                        setDragOverColumn(columnKey);
                      }
                    }}
                    onDragLeave={() => {
                      if (enableColumnReorder) {
                        setDragOverColumn(null);
                      }
                    }}
                    onDrop={(e) => {
                      if (enableColumnReorder && draggedColumn) {
                        e.preventDefault();
                        const fromIndex = columnOrder.indexOf(draggedColumn);
                        const toIndex = columnOrder.indexOf(columnKey);
                        handleColumnReorder(fromIndex, toIndex);
                        setDraggedColumn(null);
                        setDragOverColumn(null);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                    
                    {enableColumnResize && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--color-brand-primary)] cursor-col-resize hover:bg-[var(--color-brand-primary)]"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setResizingColumn(columnKey);
                        }}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody>
            {renderRows(groupedEntities, enableGrouping)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
