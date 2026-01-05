import type { BaseViewProps } from '../types.js';

export interface TableViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Column definitions */
  columns: TableColumn<T>[];
  
  /** Enable inline editing */
  enableInlineEdit?: boolean;
  
  /** Enable column resizing */
  enableColumnResize?: boolean;
  
  /** Enable column reordering */
  enableColumnReorder?: boolean;
  
  /** Enable virtualization */
  enableVirtualization?: boolean;
  
  /** Row height */
  rowHeight?: number;
  
  /** Sticky header */
  stickyHeader?: boolean;
  
  /** Sticky first column */
  stickyFirstColumn?: boolean;
  
  /** Enable multi-select with shift+click */
  enableMultiSelect?: boolean;
  
  /** Enable row grouping */
  enableGrouping?: boolean;
  
  /** Custom cell renderers */
  cellRenderers?: Record<string, (value: unknown, row: T, column: TableColumn<T>) => React.ReactNode>;
}

export interface TableColumn<T> {
  /** Column key (maps to field in data) */
  key: keyof T;
  
  /** Column header */
  header: string;
  
  /** Column width */
  width?: number;
  
  /** Minimum width */
  minWidth?: number;
  
  /** Maximum width */
  maxWidth?: number;
  
  /** Is column resizable */
  resizable?: boolean;
  
  /** Is column sortable */
  sortable?: boolean;
  
  /** Is column filterable */
  filterable?: boolean;
  
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  
  /** Custom cell renderer */
  renderer?: (value: unknown, row: T) => React.ReactNode;
  
  /** Custom header renderer */
  headerRenderer?: () => React.ReactNode;
  
  /** Column type for special handling */
  type?: 'text' | 'number' | 'date' | 'status' | 'priority' | 'assignee' | 'tags' | 'actions';
}

export interface TableRowData<T> {
  /** Row data */
  data: T;
  
  /** Row index */
  index: number;
  
  /** Is row selected */
  selected: boolean;
  
  /** Is row expanded (for grouped rows) */
  expanded?: boolean;
  
  /** Row level (for nested rows) */
  level?: number;
  
  /** Has children (for expandable rows) */
  hasChildren?: boolean;
  
  /** Group key (for grouped rows) */
  groupKey?: string;
}
