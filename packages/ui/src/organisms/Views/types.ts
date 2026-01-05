/**
 * COMMON VIEW INTERFACE
 * 
 * All ClickUp-style views implement this interface to ensure:
 * - Consistent data binding patterns
 * - SSOT compliance
 * - Unified filtering/sorting/grouping
 * - Common interaction patterns
 */

export interface BaseViewProps<T extends { id: string }> {
  // ══════════════════════════════════════════════════
  // DATA BINDING (SSOT Compliant)
  // ══════════════════════════════════════════════════
  
  /** Entity IDs to display (never full objects - SSOT) */
  entityIds: string[];
  
  /** Entity type for selector lookup */
  entityType: EntityType;
  
  /** Custom selector for entity resolution */
  entitySelector?: (id: string) => T | null;
  
  // ══════════════════════════════════════════════════
  // FILTERING & SORTING
  // ══════════════════════════════════════════════════
  
  /** Active filters */
  filters?: ViewFilter[];
  
  /** Sort configuration */
  sort?: ViewSort[];
  
  /** Grouping configuration */
  groupBy?: GroupConfig;
  
  /** Search query */
  searchQuery?: string;
  
  // ══════════════════════════════════════════════════
  // DISPLAY OPTIONS
  // ══════════════════════════════════════════════════
  
  /** Visible columns/fields */
  visibleFields?: string[];
  
  /** Density setting */
  density?: 'compact' | 'default' | 'comfortable';
  
  /** Show/hide subtasks */
  showSubtasks?: boolean;
  
  /** Show/hide completed items */
  showCompleted?: boolean;
  
  /** Color coding field */
  colorBy?: string;
  
  // ══════════════════════════════════════════════════
  // INTERACTIONS
  // ══════════════════════════════════════════════════
  
  /** Selection mode */
  selectionMode?: 'none' | 'single' | 'multiple';
  
  /** Selected entity IDs */
  selectedIds?: string[];
  
  /** Selection change handler */
  onSelectionChange?: (ids: string[]) => void;
  
  /** Entity click handler */
  onEntityClick?: (id: string) => void;
  
  /** Entity double-click handler */
  onEntityDoubleClick?: (id: string) => void;
  
  /** Context menu handler */
  onContextMenu?: (id: string, event: React.MouseEvent) => void;
  
  // ══════════════════════════════════════════════════
  // MUTATIONS (Optimistic Updates)
  // ══════════════════════════════════════════════════
  
  /** Update entity (with optimistic update support) */
  onEntityUpdate?: (id: string, updates: Partial<T>) => Promise<void>;
  
  /** Create entity */
  onEntityCreate?: (data: Partial<T>) => Promise<T>;
  
  /** Delete entity */
  onEntityDelete?: (id: string) => Promise<void>;
  
  /** Reorder entity */
  onEntityReorder?: (id: string, newPosition: number, newGroupId?: string) => Promise<void>;
  
  // ══════════════════════════════════════════════════
  // LOADING & ERROR STATES
  // ══════════════════════════════════════════════════
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  error?: Error | null;
  
  /** Empty state configuration */
  emptyState?: EmptyStateConfig;
  
  // ══════════════════════════════════════════════════
  // VIEW-SPECIFIC CONFIG (Override in specific views)
  // ══════════════════════════════════════════════════
  
  /** Additional view-specific configuration */
  config?: Record<string, unknown>;
}

export interface ViewFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
  isActive: boolean;
}

export interface ViewSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface GroupConfig {
  field: string;
  direction: 'asc' | 'desc';
  collapsed?: string[]; // IDs of collapsed groups
}

export interface EmptyStateConfig {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

export type EntityType = 
  | 'task'
  | 'project'
  | 'user'
  | 'space'
  | 'document'
  | 'comment'
  | 'attachment'
  | 'milestone'
  | 'dependency';

// ══════════════════════════════════════════════════
// VIEW-SPECIFIC TYPES
// ══════════════════════════════════════════════════

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  customFields?: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  icon?: string;
  startDate?: string;
  endDate?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'done'
  | 'cancelled';

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type UserRole = 
  | 'owner'
  | 'admin'
  | 'member'
  | 'guest';

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'suspended';

// ══════════════════════════════════════════════════
// ACTIVITY LOG TYPES
// ══════════════════════════════════════════════════

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'assigned'
  | 'unassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'due_date_changed'
  | 'comment_added'
  | 'attachment_added'
  | 'tag_added'
  | 'tag_removed';

// ══════════════════════════════════════════════════
// WHITEBOARD TYPES
// ══════════════════════════════════════════════════

export interface WhiteboardElement {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  style?: Record<string, unknown>;
  connections?: string[]; // IDs of connected elements
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type WhiteboardElementType = 
  | 'text'
  | 'shape'
  | 'sticky'
  | 'drawing'
  | 'image'
  | 'connector';

// ══════════════════════════════════════════════════
// DOCUMENT TYPES
// ══════════════════════════════════════════════════

export interface Document {
  id: string;
  title: string;
  content: string;
  version: number;
  authorId: string;
  collaborators: string[];
  comments: DocumentComment[];
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}
