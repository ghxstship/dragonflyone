// Base types
export type {
  BaseViewProps,
  ViewFilter,
  ViewSort,
  GroupConfig,
  EmptyStateConfig,
  FilterOperator,
  EntityType,
  Task,
  Project,
  User,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  UserRole,
  UserStatus,
  ActivityLog,
  ActivityAction,
  WhiteboardElement,
  WhiteboardElementType,
  Document,
  DocumentComment
} from './types.js';

// TableView
export {
  TableView
} from './TableView/index.js';
export type {
  TableViewProps,
  TableColumn,
  TableRowData
} from './TableView/index.js';

// KanbanBoard
export {
  KanbanBoard
} from './KanbanBoard/index.js';
export type {
  KanbanBoardProps,
  KanbanColumn,
  KanbanSwimlane,
  KanbanCard
} from './KanbanBoard/index.js';

// CalendarView
export {
  CalendarView
} from './CalendarView/index.js';
export type {
  CalendarViewProps,
  CalendarViewMode,
  CalendarEvent,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
  TimeSlot
} from './CalendarView/index.js';

// GanttChart
export {
  GanttChart
} from './GanttChart/index.js';
export type {
  GanttChartProps,
  GanttViewMode,
  GanttTask,
  GanttMilestone,
  GanttDependency,
  GanttTimeline,
  GanttRow,
  GanttColumn,
  GanttChartState
} from './GanttChart/index.js';

// TimelineView
export {
  TimelineView
} from './TimelineView/index.js';
export type {
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
} from './TimelineView/index.js';
