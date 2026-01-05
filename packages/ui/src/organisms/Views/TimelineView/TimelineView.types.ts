import type { BaseViewProps } from '../types.js';

export interface TimelineViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for timestamp/date */
  timestampField: keyof T;
  
  /** Field for event title */
  titleField: keyof T;
  
  /** Field for event description */
  descriptionField?: keyof T;
  
  /** Field for event type/category */
  typeField?: keyof T;
  
  /** Field for event author/creator */
  authorField?: keyof T;
  
  /** Field for event icon */
  iconField?: keyof T;
  
  /** Field for event color */
  colorField?: keyof T;
  
  /** Field for event attachments */
  attachmentsField?: keyof T;
  
  /** Field for event tags */
  tagsField?: keyof T;
  
  /** Default timeline orientation */
  defaultOrientation?: TimelineOrientation;
  
  /** Default grouping mode */
  defaultGrouping?: TimelineGrouping;
  
  /** Enable drag to reorder */
  enableDragReorder?: boolean;
  
  /** Enable inline editing */
  enableInlineEdit?: boolean;
  
  /** Enable item expansion */
  enableItemExpansion?: boolean;
  
  /** Enable item selection */
  enableItemSelection?: boolean;
  
  /** Enable item filtering */
  enableItemFiltering?: boolean;
  
  /** Enable search */
  enableSearch?: boolean;
  
  /** Enable date range selection */
  enableDateRangeSelection?: boolean;
  
  /** Show item timestamps */
  showTimestamps?: boolean;
  
  /** Show item authors */
  showAuthors?: boolean;
  
  /** Show item icons */
  showIcons?: boolean;
  
  /** Show item attachments */
  showAttachments?: boolean;
  
  /** Show item tags */
  showTags?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Custom item renderer */
  itemRenderer?: (item: TimelineItem<T>, orientation: TimelineOrientation) => React.ReactNode;
  
  /** Custom group renderer */
  groupRenderer?: (group: TimelineGroup<T>) => React.ReactNode;
  
  /** Custom timeline connector renderer */
  connectorRenderer?: (fromItem: TimelineItem<T>, toItem: TimelineItem<T>) => React.ReactNode;
  
  /** Item click handler */
  onItemClick?: (item: T) => void;
  
  /** Item double-click handler */
  onItemDoubleClick?: (item: T) => void;
  
  /** Item context menu handler */
  onItemContextMenu?: (item: T, event: React.MouseEvent) => void;
  
  /** Group click handler */
  onGroupClick?: (group: TimelineGroup<T>) => void;
  
  /** Date range selection handler */
  onDateRangeSelect?: (range: { start: Date; end: Date }) => void;
  
  /** Search handler */
  onSearch?: (query: string) => void;
  
  /** Filter handler */
  onFilter?: (filters: TimelineFilter[]) => void;
  
  /** Timeline configuration */
  config?: {
    itemHeight?: number;
    connectorWidth?: number;
    connectorColor?: string;
    groupSpacing?: number;
    itemSpacing?: number;
    dateFormat?: string;
    timeFormat?: string;
    locale?: string;
    timeZone?: string;
  };
}

export type TimelineOrientation = 
  | 'vertical'
  | 'horizontal';

export type TimelineGrouping = 
  | 'none'
  | 'date'
  | 'type'
  | 'author'
  | 'custom';

export interface TimelineItem<T> {
  /** Item data */
  data: T;
  
  /** Item ID */
  id: string;
  
  /** Item title */
  title: string;
  
  /** Item description */
  description?: string;
  
  /** Item timestamp */
  timestamp: Date;
  
  /** Item type */
  type?: string;
  
  /** Item author */
  author?: string;
  
  /** Item icon */
  icon?: string;
  
  /** Item color */
  color?: string;
  
  /** Item attachments */
  attachments?: string[];
  
  /** Item tags */
  tags?: string[];
  
  /** Is expanded */
  expanded?: boolean;
  
  /** Is selected */
  selected?: boolean;
  
  /** Is being dragged */
  isDragging?: boolean;
  
  /** Position in timeline */
  position?: {
    x: number;
    y: number;
  };
  
  /** Group assignment */
  group?: string;
  
  /** Item status */
  status?: 'active' | 'inactive' | 'pending' | 'completed';
}

export interface TimelineGroup<T> {
  /** Group ID */
  id: string;
  
  /** Group title */
  title: string;
  
  /** Group type */
  type: string;
  
  /** Group color */
  color?: string;
  
  /** Group icon */
  icon?: string;
  
  /** Group items */
  items: TimelineItem<T>[];
  
  /** Is collapsed */
  collapsed?: boolean;
  
  /** Group count */
  count: number;
  
  /** Group date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  /** Group statistics */
  stats?: {
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    activeItems: number;
  };
}

export interface TimelineFilter {
  /** Filter ID */
  id: string;
  
  /** Filter field */
  field: string;
  
  /** Filter operator */
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  
  /** Filter value */
  value: any;
  
  /** Filter label */
  label: string;
  
  /** Is active */
  isActive: boolean;
  
  /** Filter options */
  options?: TimelineFilterOption[];
}

export interface TimelineFilterOption {
  /** Option value */
  value: any;
  
  /** Option label */
  label: string;
  
  /** Option count */
  count?: number;
  
  /** Option color */
  color?: string;
}

export interface TimelineDateRange {
  /** Start date */
  start: Date;
  
  /** End date */
  end: Date;
  
  /** Range label */
  label?: string;
  
  /** Range type */
  type?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface TimelineConnector {
  /** Connector ID */
  id: string;
  
  /** From item ID */
  from: string;
  
  /** To item ID */
  to: string;
  
  /** Connector type */
  type?: 'solid' | 'dashed' | 'dotted';
  
  /** Connector color */
  color?: string;
  
  /** Connector width */
  width?: number;
  
  /** Connector path */
  path?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    controlPoints?: { x: number; y: number }[];
  };
}

export interface TimelineLayout {
  /** Layout orientation */
  orientation: TimelineOrientation;
  
  /** Layout width */
  width: number;
  
  /** Layout height */
  height: number;
  
  /** Item positions */
  itemPositions: Map<string, { x: number; y: number; width: number; height: number }>;
  
  /** Group positions */
  groupPositions: Map<string, { x: number; y: number; width: number; height: number }>;
  
  /** Connector paths */
  connectorPaths: TimelineConnector[];
  
  /** Timeline bounds */
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  
  /** Scroll dimensions */
  scrollDimensions: {
    width: number;
    height: number;
  };
}

export interface TimelineViewState {
  /** Current orientation */
  orientation: TimelineOrientation;
  
  /** Current grouping */
  grouping: TimelineGrouping;
  
  /** Current date range */
  dateRange: TimelineDateRange;
  
  /** Selected items */
  selectedItems: Set<string>;
  
  /** Expanded items */
  expandedItems: Set<string>;
  
  /** Collapsed groups */
  collapsedGroups: Set<string>;
  
  /** Active filters */
  activeFilters: TimelineFilter[];
  
  /** Search query */
  searchQuery: string;
  
  /** Scroll position */
  scrollPosition: {
    left: number;
    top: number;
  };
  
  /** Drag state */
  dragState: {
    isDragging: boolean;
    draggedItem?: string;
    dropTarget?: string;
    dragType?: 'reorder' | 'move';
  };
  
  /** Hover state */
  hoverState: {
    hoveredItem?: string;
    hoveredGroup?: string;
  };
}
