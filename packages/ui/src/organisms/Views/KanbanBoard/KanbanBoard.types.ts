import type { BaseViewProps } from '../types.js';

export interface KanbanBoardProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Column definitions */
  columns: KanbanColumn[];
  
  /** Field for status/column assignment */
  statusField: keyof T;
  
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  
  /** Enable column resizing */
  enableColumnResize?: boolean;
  
  /** Enable column reordering */
  enableColumnReorder?: boolean;
  
  /** Card rendering options */
  cardOptions?: {
    showAssignee?: boolean;
    showDueDate?: boolean;
    showPriority?: boolean;
    showTags?: boolean;
    showProgress?: boolean;
    compact?: boolean;
  };
  
  /** Column width */
  columnWidth?: number;
  
  /** Minimum column width */
  minColumnWidth?: number;
  
  /** Maximum column width */
  maxColumnWidth?: number;
  
  /** Custom card renderer */
  cardRenderer?: (item: T, column: KanbanColumn) => React.ReactNode;
  
  /** Custom column header renderer */
  columnHeaderRenderer?: (column: KanbanColumn, items: T[]) => React.ReactNode;
  
  /** Swimlane grouping field */
  swimlaneField?: keyof T;
  
  /** Swimlane definitions */
  swimlanes?: KanbanSwimlane[];
}

export interface KanbanColumn {
  /** Column ID */
  id: string;
  
  /** Column title */
  title: string;
  
  /** Column status value */
  status: string;
  
  /** Column color */
  color?: string;
  
  /** Column icon */
  icon?: string;
  
  /** Is column collapsed */
  collapsed?: boolean;
  
  /** Maximum items in column */
  maxItems?: number;
  
  /** Column width */
  width?: number;
  
  /** Custom styles */
  styles?: Record<string, string>;
  
  /** Column permissions */
  permissions?: {
    canAdd?: boolean;
    canRemove?: boolean;
    canReorder?: boolean;
  };
}

export interface KanbanSwimlane {
  /** Swimlane ID */
  id: string;
  
  /** Swimlane title */
  title: string;
  
  /** Swimlane value */
  value: string;
  
  /** Swimlane color */
  color?: string;
  
  /** Is swimlane collapsed */
  collapsed?: boolean;
  
  /** Swimlane order */
  order?: number;
}

export interface KanbanCard<T> {
  /** Card data */
  data: T;
  
  /** Card ID */
  id: string;
  
  /** Is card being dragged */
  isDragging?: boolean;
  
  /** Is card selected */
  selected?: boolean;
  
  /** Card position */
  position?: number;
  
  /** Swimlane assignment */
  swimlane?: string;
}
