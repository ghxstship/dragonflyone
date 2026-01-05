"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { kanbanBoardVariants } from "./KanbanBoard.variants.js";
import type { 
  KanbanBoardProps, 
  KanbanColumn 
} from "./KanbanBoard.types.js";

// =============================================================================
// SORTABLE CARD COMPONENT
// =============================================================================

interface SortableCardProps<T> {
  item: T;
  itemId: string;
  cardRender: (item: T) => React.ReactNode;
  onClick?: () => void;
  inverted?: boolean;
}

function SortableCard<T>({
  item,
  itemId,
  cardRender,
  onClick,
  inverted = true,
}: SortableCardProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={clsx(
        "p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-100",
        isDragging && "opacity-50 shadow-lg scale-105",
        inverted
          ? "bg-surface-elevated border-border hover:border-border-primary"
          : "bg-surface-primary border-border hover:border-border-primary",
        "hover:shadow-md"
      )}
    >
      {cardRender(item)}
    </div>
  );
}

// =============================================================================
// COLUMN COMPONENT
// =============================================================================

interface KanbanColumnComponentProps<T> {
  column: KanbanColumn;
  items: T[];
  getItemId: (item: T) => string;
  cardRender: (item: T) => React.ReactNode;
  onCardClick?: (item: T) => void;
  onAddClick?: () => void;
  showAddButton?: boolean;
  inverted?: boolean;
  emptyMessage?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function KanbanColumnComponent<T>({
  column,
  items,
  getItemId,
  cardRender,
  onCardClick,
  onAddClick,
  showAddButton = true,
  inverted = true,
  emptyMessage = "No items",
  isCollapsed,
  onToggleCollapse,
}: KanbanColumnComponentProps<T>) {
  const isOverLimit = column.wipLimit && items.length > column.wipLimit;

  return (
    <div
      className={clsx(
        "flex flex-col w-full md:min-w-[280px] md:max-w-[320px] rounded-lg border-2 shrink-0",
        inverted
          ? "bg-surface-inverse border-border"
          : "bg-muted border-border"
      )}
    >
      {/* Column Header */}
      <div
        className={clsx(
          "flex items-center justify-between p-3 border-b-2",
          inverted ? "border-border" : "border-border"
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center gap-2 flex-1"
        >
          {isCollapsed ? (
            <ChevronRight size={16} className={inverted ? "text-text-muted" : "text-text-muted"} />
          ) : (
            <ChevronDown size={16} className={inverted ? "text-text-muted" : "text-text-muted"} />
          )}
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color || "#6366f1" }}
          />
          <span className={clsx("font-semibold text-sm", inverted ? "text-text-primary" : "text-text-primary")}>
            {column.title}
          </span>
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              isOverLimit
                ? "bg-error-100 text-error-700"
                : inverted
                ? "bg-surface-elevated text-text-muted"
                : "bg-muted text-text-secondary"
            )}
          >
            {items.length}
            {column.wipLimit && `/${column.wipLimit}`}
          </span>
        </button>

        <div className="flex items-center gap-1">
          {showAddButton && (
            <button
              type="button"
              onClick={onAddClick}
              className={clsx(
                "p-1 rounded transition-colors",
                inverted
                  ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                  : "text-text-muted hover:text-text-primary hover:bg-muted"
              )}
            >
              <Plus size={16} />
            </button>
          )}
          <button
            type="button"
            className={clsx(
              "p-1 rounded transition-colors",
              inverted
                ? "text-text-disabled hover:text-white hover:bg-surface-elevated"
                : "text-text-muted hover:text-text-primary hover:bg-muted"
            )}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          <SortableContext
            items={items.map(getItemId)}
            strategy={verticalListSortingStrategy}
          >
            {items.length === 0 ? (
              <div
                className={clsx(
                  "p-4 text-center text-sm rounded-lg border-2 border-dashed",
                  inverted
                    ? "text-text-disabled border-border"
                    : "text-text-disabled border-border"
                )}
              >
                {emptyMessage}
              </div>
            ) : (
              items.map((item) => (
                <SortableCard
                  key={getItemId(item)}
                  item={item}
                  itemId={getItemId(item)}
                  cardRender={cardRender}
                  onClick={() => onCardClick?.(item)}
                  inverted={inverted}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function KanbanBoard<T>({
  data,
  columns,
  groupBy,
  rowKey,
  cardRender,
  onDragEnd,
  onCardClick,
  onAddClick,
  showAddButton = true,
  inverted = true,
  className,
  loading = false,
  emptyMessage = "No items",
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

  // Get item ID
  const getItemId = useCallback(
    (item: T): string => {
      if (typeof rowKey === "function") {
        return rowKey(item);
      }
      return String(item[rowKey]);
    },
    [rowKey]
  );

  // Group items by column
  const groupedItems = columns.reduce<Record<string, T[]>>((acc, column) => {
    acc[column.id] = data.filter((item) => String(item[groupBy]) === column.id);
    return acc;
  }, {});

  // Find active item
  const activeItem = activeId
    ? data.find((item) => getItemId(item) === activeId)
    : null;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // Handle drag over (for visual feedback)
  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Could add visual feedback here
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeItemId = String(active.id);
      const overId = String(over.id);

      // Find the item being dragged
      const draggedItem = data.find((item) => getItemId(item) === activeItemId);
      if (!draggedItem) return;

      // Determine target column
      let targetColumnId: string | null = null;
      let targetIndex = 0;

      // Check if dropped on a column
      const targetColumn = columns.find((col) => col.id === overId);
      if (targetColumn) {
        targetColumnId = targetColumn.id;
        targetIndex = groupedItems[targetColumn.id]?.length || 0;
      } else {
        // Dropped on another card - find its column
        for (const [columnId, items] of Object.entries(groupedItems)) {
          const itemIndex = items.findIndex((item) => getItemId(item) === overId);
          if (itemIndex !== -1) {
            targetColumnId = columnId;
            targetIndex = itemIndex;
            break;
          }
        }
      }

      if (targetColumnId && onDragEnd) {
        onDragEnd(draggedItem, targetColumnId, targetIndex);
      }
    },
    [data, columns, groupedItems, getItemId, onDragEnd]
  );

  // Toggle column collapse
  const toggleCollapse = useCallback((columnId: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className={clsx(kanbanBoardVariants({ inverted }), className)}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={clsx(
              "w-full md:min-w-[280px] md:w-[280px] h-[200px] md:h-[400px] rounded-lg animate-pulse shrink-0",
              inverted ? "bg-surface-elevated" : "bg-muted"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile: vertical stack, Desktop: horizontal scroll */}
      <div className={clsx(kanbanBoardVariants({ inverted }), className)}>
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            items={groupedItems[column.id] || []}
            getItemId={getItemId}
            cardRender={cardRender}
            onCardClick={onCardClick}
            onAddClick={() => onAddClick?.(column.id)}
            showAddButton={showAddButton}
            inverted={inverted}
            emptyMessage={emptyMessage}
            isCollapsed={collapsedColumns.has(column.id)}
            onToggleCollapse={() => toggleCollapse(column.id)}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div
            className={clsx(
              "p-4 rounded-lg border-2 shadow-xl",
              inverted
                ? "bg-surface-elevated border-primary-500"
                : "bg-surface-primary border-primary-500"
            )}
          >
            {cardRender(activeItem)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
