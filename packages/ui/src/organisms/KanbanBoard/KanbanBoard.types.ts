import type { ReactNode } from "react";

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  wipLimit?: number;
  collapsed?: boolean;
}

export interface KanbanBoardProps<T> {
  /** Data items to display */
  data: T[];
  /** Column definitions */
  columns: KanbanColumn[];
  /** Field to group items by (must match column IDs) */
  groupBy: keyof T;
  /** Row key accessor */
  rowKey: keyof T | ((item: T) => string);
  /** Render function for card content */
  cardRender: (item: T) => ReactNode;
  /** Called when item is dropped in a new column */
  onDragEnd?: (item: T, newColumnId: string, newIndex: number) => void;
  /** Called when card is clicked */
  onCardClick?: (item: T) => void;
  /** Called when add button is clicked in a column */
  onAddClick?: (columnId: string) => void;
  /** Show add button in columns */
  showAddButton?: boolean;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty column message */
  emptyMessage?: string;
}
