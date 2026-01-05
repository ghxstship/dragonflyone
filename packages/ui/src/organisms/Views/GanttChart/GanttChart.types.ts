import type { BaseViewProps } from '../types.js';

export interface GanttChartProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for task start date */
  startDateField: keyof T;
  
  /** Field for task end date */
  endDateField: keyof T;
  
  /** Field for task progress (0-100) */
  progressField?: keyof T;
  
  /** Field for task dependencies */
  dependenciesField?: keyof T;
  
  /** Field for task assignee */
  assigneeField?: keyof T;
  
  /** Field for task priority */
  priorityField?: keyof T;
  
  /** Field for task status */
  statusField?: keyof T;
  
  /** Field for task color */
  colorField?: keyof T;
  
  /** Field for task parent (for subtasks) */
  parentField?: keyof T;
  
  /** Field for task level (hierarchy depth) */
  levelField?: keyof T;
  
  /** Default view mode */
  defaultView?: GanttViewMode;
  
  /** Enable drag to reschedule */
  enableDragReschedule?: boolean;
  
  /** Enable drag to extend duration */
  enableDragResize?: boolean;
  
  /** Enable task linking */
  enableTaskLinking?: boolean;
  
  /** Enable task collapse */
  enableTaskCollapse?: boolean;
  
  /** Enable critical path highlighting */
  enableCriticalPath?: boolean;
  
  /** Enable baseline comparison */
  enableBaseline?: boolean;
  
  /** Enable today indicator */
  enableTodayIndicator?: boolean;
  
  /** Enable weekend highlighting */
  enableWeekendHighlight?: boolean;
  
  /** Enable grid lines */
  enableGridLines?: boolean;
  
  /** Custom task renderer */
  taskRenderer?: (task: GanttTask<T>, viewMode: GanttViewMode) => React.ReactNode;
  
  /** Custom milestone renderer */
  milestoneRenderer?: (milestone: GanttMilestone<T>) => React.ReactNode;
  
  /** Custom dependency renderer */
  dependencyRenderer?: (dependency: GanttDependency<T>) => React.ReactNode;
  
  /** Task click handler */
  onTaskClick?: (task: T) => void;
  
  /** Task double-click handler */
  onTaskDoubleClick?: (task: T) => void;
  
  /** Task context menu handler */
  onTaskContextMenu?: (task: T, event: React.MouseEvent) => void;
  
  /** Dependency click handler */
  onDependencyClick?: (dependency: GanttDependency<T>) => void;
  
  /** Timeline navigation handlers */
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void;
  
  /** View change handler */
  onViewChange?: (viewMode: GanttViewMode) => void;
  
  /** Zoom level handler */
  onZoomChange?: (zoomLevel: number) => void;
  
  /** Date range selection */
  enableDateSelection?: boolean;
  
  /** Selected date range */
  selectedRange?: {
    start: Date;
    end: Date;
  };
  
  /** Date selection handler */
  onDateSelect?: (range: { start: Date; end: Date }) => void;
  
  /** Working hours */
  workingHours?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  
  /** Gantt configuration */
  config?: {
    firstDayOfWeek?: number; // 0-6 (Sunday-Saturday)
    locale?: string;
    timeZone?: string;
    height?: string;
    rowHeight?: number;
    barHeight?: number;
    minZoom?: number;
    maxZoom?: number;
    snapToGrid?: boolean;
    gridStep?: number; // hours
  };
}

export type GanttViewMode = 
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export interface GanttTask<T> {
  /** Task data */
  data: T;
  
  /** Task ID */
  id: string;
  
  /** Task name */
  name: string;
  
  /** Start date */
  start: Date;
  
  /** End date */
  end: Date;
  
  /** Progress percentage (0-100) */
  progress?: number;
  
  /** Dependencies */
  dependencies?: string[];
  
  /** Assignee */
  assignee?: string;
  
  /** Priority */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  /** Status */
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  
  /** Color */
  color?: string;
  
  /** Parent task ID */
  parent?: string;
  
  /** Hierarchy level */
  level?: number;
  
  /** Is collapsed */
  collapsed?: boolean;
  
  /** Is milestone */
  milestone?: boolean;
  
  /** Is critical path */
  critical?: boolean;
  
  /** Baseline start date */
  baselineStart?: Date;
  
  /** Baseline end date */
  baselineEnd?: Date;
  
  /** Is being dragged */
  isDragging?: boolean;
  
  /** Is selected */
  selected?: boolean;
  
  /** Position in timeline */
  position?: {
    left: number;
    width: number;
    top: number;
  };
  
  /** Children tasks */
  children?: GanttTask<T>[];
}

export interface GanttMilestone<T> {
  /** Milestone data */
  data: T;
  
  /** Milestone ID */
  id: string;
  
  /** Milestone name */
  name: string;
  
  /** Milestone date */
  date: Date;
  
  /** Color */
  color?: string;
  
  /** Is completed */
  completed?: boolean;
  
  /** Position in timeline */
  position?: {
    left: number;
    top: number;
  };
}

export interface GanttDependency<T> {
  /** Dependency data */
  data?: T;
  
  /** Dependency ID */
  id: string;
  
  /** From task ID */
  from: string;
  
  /** To task ID */
  to: string;
  
  /** Dependency type */
  type?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  
  /** Lag in days */
  lag?: number;
  
  /** Color */
  color?: string;
  
  /** Is selected */
  selected?: boolean;
  
  /** Path coordinates for rendering */
  path?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    controlPoints?: { x: number; y: number }[];
  };
}

export interface GanttTimeline {
  /** Start date */
  start: Date;
  
  /** End date */
  end: Date;
  
  /** Current zoom level */
  zoom: number;
  
  /** View mode */
  viewMode: GanttViewMode;
  
  /** Timeline cells */
  cells: GanttTimelineCell[];
  
  /** Today position */
  todayPosition?: number;
  
  /** Grid lines */
  gridLines: GanttGridLine[];
}

export interface GanttTimelineCell {
  /** Date */
  date: Date;
  
  /** Position */
  position: number;
  
  /** Width */
  width: number;
  
  /** Is weekend */
  isWeekend?: boolean;
  
  /** Is holiday */
  isHoliday?: boolean;
  
  /** Is working day */
  isWorkingDay?: boolean;
  
  /** Label */
  label?: string;
}

export interface GanttGridLine {
  /** Position */
  position: number;
  
  /** Type */
  type: 'major' | 'minor';
  
  /** Label */
  label?: string;
  
  /** Date */
  date?: Date;
}

export interface GanttRow {
  /** Row index */
  index: number;
  
  /** Task */
  task: GanttTask<any>;
  
  /** Height */
  height: number;
  
  /** Top position */
  top: number;
  
  /** Is visible */
  visible?: boolean;
  
  /** Is expanded */
  expanded?: boolean;
  
  /** Level */
  level?: number;
}

export interface GanttColumn {
  /** Column ID */
  id: string;
  
  /** Column title */
  title: string;
  
  /** Column width */
  width: number;
  
  /** Field name */
  field?: string;
  
  /** Is resizable */
  resizable?: boolean;
  
  /** Is sortable */
  sortable?: boolean;
  
  /** Renderer */
  renderer?: (task: GanttTask<any>) => React.ReactNode;
}

export interface GanttChartState {
  /** Current date range */
  dateRange: {
    start: Date;
    end: Date;
  };
  
  /** Current view mode */
  viewMode: GanttViewMode;
  
  /** Current zoom level */
  zoom: number;
  
  /** Selected tasks */
  selectedTasks: string[];
  
  /** Expanded tasks */
  expandedTasks: string[];
  
  /** Scroll position */
  scrollPosition: {
    left: number;
    top: number;
  };
  
  /** Drag state */
  dragState: {
    isDragging: boolean;
    draggedTask?: string;
    dragType?: 'move' | 'resize' | 'link';
    startPosition?: { x: number; y: number };
  };
  
  /** Hover state */
  hoverState: {
    hoveredTask?: string;
    hoveredDependency?: string;
    hoveredDate?: Date;
  };
}
