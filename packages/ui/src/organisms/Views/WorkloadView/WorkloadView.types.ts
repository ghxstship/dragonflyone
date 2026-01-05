import type { BaseViewProps } from '../types.js';

export interface WorkloadViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for assignee/user */
  assigneeField: keyof T;
  
  /** Field for task/project name */
  nameField: keyof T;
  
  /** Field for workload value (hours, points, etc.) */
  workloadField: keyof T;
  
  /** Field for capacity/availability */
  capacityField?: keyof T;
  
  /** Field for workload type */
  typeField?: keyof T;
  
  /** Field for status */
  statusField?: keyof T;
  
  /** Field for priority */
  priorityField?: keyof T;
  
  /** Field for due date */
  dueDateField?: keyof T;
  
  /** Field for start date */
  startDateField?: keyof T;
  
  /** Field for end date */
  endDateField?: keyof T;
  
  /** Default view mode */
  defaultView?: WorkloadViewMode;
  
  /** Default time range */
  defaultTimeRange?: WorkloadTimeRange;
  
  /** Enable capacity visualization */
  enableCapacity?: boolean;
  
  /** Enable workload forecasting */
  enableForecasting?: boolean;
  
  /** Enable workload balancing */
  enableBalancing?: boolean;
  
  /** Enable drag to reassign */
  enableDragReassign?: boolean;
  
  /** Show workload percentages */
  showPercentages?: boolean;
  
  /** Show capacity limits */
  showCapacityLimits?: boolean;
  
  /** Show overallocation warnings */
  showOverallocationWarnings?: boolean;
  
  /** Show workload trends */
  showTrends?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Workload unit */
  workloadUnit?: WorkloadUnit;
  
  /** Custom assignee renderer */
  assigneeRenderer?: (assignee: WorkloadAssignee<T>) => React.ReactNode;
  
  /** Custom workload bar renderer */
  workloadBarRenderer?: (workload: WorkloadItem<T>) => React.ReactNode;
  
  /** Custom capacity indicator renderer */
  capacityRenderer?: (assignee: WorkloadAssignee<T>) => React.ReactNode;
  
  /** Assignee click handler */
  onAssigneeClick?: (assignee: T) => void;
  
  /** Workload item click handler */
  onWorkloadItemClick?: (item: T) => void;
  
  /** Reassign handler */
  onReassign?: (itemId: string, newAssigneeId: string) => void;
  
  /** Balance workloads handler */
  onBalanceWorkloads?: () => Promise<void>;
  
  /** Time range change handler */
  onTimeRangeChange?: (range: WorkloadTimeRange) => void;
  
  /** View mode change handler */
  onViewModeChange?: (mode: WorkloadViewMode) => void;
  
  /** Workload configuration */
  config?: {
    barHeight?: number;
    capacityThreshold?: number;
    overallocationThreshold?: number;
    forecastDays?: number;
    colorScheme?: WorkloadColorScheme;
    animationDuration?: number;
  };
}

export type WorkloadViewMode = 
  | 'bars'
  | 'heatmap'
  | 'calendar'
  | 'table';

export type WorkloadTimeRange = 
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export type WorkloadUnit = 
  | 'hours'
  | 'points'
  | 'tasks'
  | 'stories'
  | 'tickets';

export type WorkloadColorScheme = 
  | 'capacity'
  | 'priority'
  | 'status'
  | 'type';

export interface WorkloadItem<T> {
  /** Item data */
  data: T;
  
  /** Item ID */
  id: string;
  
  /** Item name */
  name: string;
  
  /** Assignee */
  assignee: WorkloadAssignee<T>;
  
  /** Workload value */
  workload: number;
  
  /** Capacity value */
  capacity?: number;
  
  /** Workload type */
  type?: string;
  
  /** Status */
  status?: string;
  
  /** Priority */
  priority?: string;
  
  /** Due date */
  dueDate?: Date;
  
  /** Start date */
  startDate?: Date;
  
  /** End date */
  endDate?: Date;
  
  /** Is overallocated */
  isOverallocated?: boolean;
  
  /** Is forecasted */
  isForecasted?: boolean;
  
  /** Workload percentage */
  workloadPercentage?: number;
  
  /** Color */
  color?: string;
  
  /** Position in view */
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WorkloadAssignee<T> {
  /** Assignee data */
  data: T;
  
  /** Assignee ID */
  id: string;
  
  /** Assignee name */
  name: string;
  
  /** Assignee email */
  email?: string;
  
  /** Assignee avatar */
  avatar?: string;
  
  /** Assignee role */
  role?: string;
  
  /** Assignee department */
  department?: string;
  
  /** Total workload */
  totalWorkload: number;
  
  /** Total capacity */
  totalCapacity?: number;
  
  /** Utilization percentage */
  utilization?: number;
  
  /** Available capacity */
  availableCapacity?: number;
  
  /** Workload items */
  workloadItems: WorkloadItem<T>[];
  
  /** Workload by type */
  workloadByType?: Record<string, number>;
  
  /** Workload by priority */
  workloadByPriority?: Record<string, number>;
  
  /** Workload trend */
  workloadTrend?: {
    period: string;
    workload: number;
    capacity: number;
  }[];
  
  /** Is available */
  isAvailable?: boolean;
  
  /** Is overallocated */
  isOverallocated?: boolean;
}

export interface WorkloadGroup<T> {
  /** Group ID */
  id: string;
  
  /** Group name */
  name: string;
  
  /** Group type */
  type: 'department' | 'role' | 'team' | 'custom';
  
  /** Group assignees */
  assignees: WorkloadAssignee<T>[];
  
  /** Total workload */
  totalWorkload: number;
  
  /** Total capacity */
  totalCapacity: number;
  
  /** Average utilization */
  averageUtilization: number;
  
  /** Overallocated assignees */
  overallocatedAssignees: number;
  
  /** Available assignees */
  availableAssignees: number;
  
  /** Workload distribution */
  workloadDistribution: {
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  };
  
  /** Is collapsed */
  collapsed?: boolean;
}

export interface WorkloadForecast<T> {
  /** Forecast period */
  period: string;
  
  /** Forecasted workload */
  forecastedWorkload: number;
  
  /** Forecasted capacity */
  forecastedCapacity: number;
  
  /** Confidence level */
  confidenceLevel: number;
  
  /** Forecast items */
  forecastItems: WorkloadItem<T>[];
  
  /** Trend */
  trend: 'increasing' | 'decreasing' | 'stable';
  
  /** Recommendations */
  recommendations: WorkloadRecommendation[];
}

export interface WorkloadRecommendation {
  /** Recommendation ID */
  id: string;
  
  /** Recommendation type */
  type: 'reassign' | 'adjust_capacity' | 'hire' | 'optimize';
  
  /** Recommendation title */
  title: string;
  
  /** Recommendation description */
  description: string;
  
  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  /** Impact */
  impact: string;
  
  /** Assignee involved */
  assigneeId?: string;
  
  /** Items involved */
  itemIds?: string[];
  
  /** Is actionable */
  actionable: boolean;
}

export interface WorkloadBalance<T> {
  /** Balance ID */
  id: string;
  
  /** Balance type */
  type: 'optimal' | 'overloaded' | 'underloaded';
  
  /** Current distribution */
  currentDistribution: Record<string, number>;
  
  /** Recommended distribution */
  recommendedDistribution: Record<string, number>;
  
  /** Reassignments needed */
  reassignments: WorkloadReassignment<T>[];
  
  /** Balance score */
  balanceScore: number;
  
  /** Improvement potential */
  improvementPotential: number;
}

export interface WorkloadReassignment<T> {
  /** Reassignment ID */
  id: string;
  
  /** Item to reassign */
  itemId: string;
  
  /** From assignee */
  fromAssigneeId: string;
  
  /** To assignee */
  toAssigneeId: string;
  
  /** Reason */
  reason: string;
  
  /** Impact on balance */
  impact: number;
  
  /** Confidence */
  confidence: number;
}

export interface WorkloadStats {
  /** Total workload */
  totalWorkload: number;
  
  /** Total capacity */
  totalCapacity: number;
  
  /** Average utilization */
  averageUtilization: number;
  
  /** Overallocation count */
  overallocationCount: number;
  
  /** Underutilization count */
  underutilizationCount: number;
  
  /** Optimal utilization count */
  optimalUtilizationCount: number;
  
  /** Workload distribution */
  distribution: {
    byAssignee: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  };
  
  /** Forecast summary */
  forecastSummary: {
    nextPeriod: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  };
}
