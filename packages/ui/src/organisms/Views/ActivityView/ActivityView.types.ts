import type { BaseViewProps } from '../types.js';

export interface ActivityViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for activity timestamp */
  timestampField: keyof T;
  
  /** Field for activity type */
  typeField: keyof T;
  
  /** Field for activity actor/user */
  actorField: keyof T;
  
  /** Field for activity action */
  actionField: keyof T;
  
  /** Field for activity target/object */
  targetField?: keyof T;
  
  /** Field for activity description */
  descriptionField?: keyof T;
  
  /** Field for activity metadata */
  metadataField?: keyof T;
  
  /** Field for activity attachments */
  attachmentsField?: keyof T;
  
  /** Field for activity comments */
  commentsField?: keyof T;
  
  /** Default view mode */
  defaultView?: ActivityViewMode;
  
  /** Default grouping */
  defaultGrouping?: ActivityGrouping;
  
  /** Enable real-time updates */
  enableRealTime?: boolean;
  
  /** Enable activity filtering */
  enableActivityFiltering?: boolean;
  
  /** Enable search */
  enableSearch?: boolean;
  
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean;
  
  /** Show activity icons */
  showActivityIcons?: boolean;
  
  /** Show actor avatars */
  showActorAvatars?: boolean;
  
  /** Show timestamps */
  showTimestamps?: boolean;
  
  /** Show relative time */
  showRelativeTime?: boolean;
  
  /** Show activity details */
  showActivityDetails?: boolean;
  
  /** Show attachments */
  showAttachments?: boolean;
  
  /** Show comments */
  showComments?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Auto-refresh interval (ms) */
  autoRefreshInterval?: number;
  
  /** Custom activity renderer */
  activityRenderer?: (activity: ActivityItem<T>) => React.ReactNode;
  
  /** Custom group renderer */
  groupRenderer?: (group: ActivityGroup<T>) => React.ReactNode;
  
  /** Custom actor renderer */
  actorRenderer?: (actor: ActivityActor<T>) => React.ReactNode;
  
  /** Activity click handler */
  onActivityClick?: (activity: T) => void;
  
  /** Activity double-click handler */
  onActivityDoubleClick?: (activity: T) => void;
  
  /** Activity context menu handler */
  onActivityContextMenu?: (activity: T, event: React.MouseEvent) => void;
  
  /** Actor click handler */
  onActorClick?: (actor: T) => void;
  
  /** Target click handler */
  onTargetClick?: (target: T) => void;
  
  /** Search handler */
  onSearch?: (query: string) => void;
  
  /** Filter handler */
  onFilter?: (filters: ActivityFilter[]) => void;
  
  /** Load more handler */
  onLoadMore?: () => Promise<void>;
  
  /** Refresh handler */
  onRefresh?: () => Promise<void>;
  
  /** Activity configuration */
  config?: {
    itemHeight?: number;
    avatarSize?: number;
    iconSize?: number;
    groupSpacing?: number;
    itemSpacing?: number;
    dateFormat?: string;
    timeFormat?: string;
    locale?: string;
    timeZone?: string;
    maxItems?: number;
  };
}

export type ActivityViewMode = 
  | 'feed'
  | 'list'
  | 'cards'
  | 'timeline';

export type ActivityGrouping = 
  | 'none'
  | 'date'
  | 'type'
  | 'actor'
  | 'target';

export interface ActivityItem<T> {
  /** Activity data */
  data: T;
  
  /** Activity ID */
  id: string;
  
  /** Activity timestamp */
  timestamp: Date;
  
  /** Activity type */
  type: string;
  
  /** Activity actor/user */
  actor: ActivityActor<T>;
  
  /** Activity action */
  action: string;
  
  /** Activity target/object */
  target?: ActivityTarget<T>;
  
  /** Activity description */
  description?: string;
  
  /** Activity metadata */
  metadata?: Record<string, any>;
  
  /** Activity attachments */
  attachments?: ActivityAttachment[];
  
  /** Activity comments */
  comments?: ActivityComment[];
  
  /** Activity icon */
  icon?: string;
  
  /** Activity color */
  color?: string;
  
  /** Is selected */
  selected?: boolean;
  
  /** Is read/unread */
  isRead?: boolean;
  
  /** Is important */
  isImportant?: boolean;
  
  /** Activity status */
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ActivityActor<T> {
  /** Actor data */
  data: T;
  
  /** Actor ID */
  id: string;
  
  /** Actor name */
  name: string;
  
  /** Actor email */
  email?: string;
  
  /** Actor avatar */
  avatar?: string;
  
  /** Actor role */
  role?: string;
  
  /** Actor type */
  type?: 'user' | 'system' | 'bot' | 'api';
}

export interface ActivityTarget<T> {
  /** Target data */
  data: T;
  
  /** Target ID */
  id: string;
  
  /** Target name */
  name: string;
  
  /** Target type */
  type: string;
  
  /** Target URL */
  url?: string;
  
  /** Target icon */
  icon?: string;
}

export interface ActivityAttachment {
  /** Attachment ID */
  id: string;
  
  /** Attachment name */
  name: string;
  
  /** Attachment type */
  type: string;
  
  /** Attachment URL */
  url: string;
  
  /** Attachment size */
  size?: number;
  
  /** Attachment preview */
  preview?: string;
}

export interface ActivityComment {
  /** Comment ID */
  id: string;
  
  /** Comment author */
  author: string;
  
  /** Comment content */
  content: string;
  
  /** Comment timestamp */
  timestamp: Date;
  
  /** Comment author avatar */
  avatar?: string;
}

export interface ActivityGroup<T> {
  /** Group ID */
  id: string;
  
  /** Group title */
  title: string;
  
  /** Group type */
  type: string;
  
  /** Group activities */
  activities: ActivityItem<T>[];
  
  /** Group count */
  count: number;
  
  /** Group date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  /** Group statistics */
  stats?: {
    totalActivities: number;
    unreadActivities: number;
    importantActivities: number;
    byType: Record<string, number>;
  };
  
  /** Is collapsed */
  collapsed?: boolean;
}

export interface ActivityFilter {
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
  
  /** Filter type */
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange';
  
  /** Is active */
  isActive: boolean;
  
  /** Filter options */
  options?: ActivityFilterOption[];
}

export interface ActivityFilterOption {
  /** Option value */
  value: any;
  
  /** Option label */
  label: string;
  
  /** Option count */
  count?: number;
  
  /** Option color */
  color?: string;
}

export interface ActivityViewState {
  /** Current view mode */
  viewMode: ActivityViewMode;
  
  /** Current grouping */
  grouping: ActivityGrouping;
  
  /** Selected activities */
  selectedActivities: Set<string>;
  
  /** Collapsed groups */
  collapsedGroups: Set<string>;
  
  /** Active filters */
  activeFilters: ActivityFilter[];
  
  /** Search query */
  searchQuery: string;
  
  /** Scroll position */
  scrollPosition: {
    left: number;
    top: number;
  };
  
  /** Loading state */
  isLoading: boolean;
  
  /** Has more items */
  hasMore: boolean;
  
  /** Last refresh time */
  lastRefresh: Date;
  
  /** Real-time connection status */
  realTimeStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface ActivityStats {
  /** Total activities */
  total: number;
  
  /** Activities by type */
  byType: Record<string, number>;
  
  /** Activities by actor */
  byActor: Record<string, number>;
  
  /** Activities by date */
  byDate: Record<string, number>;
  
  /** Unread activities */
  unread: number;
  
  /** Important activities */
  important: number;
  
  /** Recent activity trend */
  trend: {
    period: string;
    count: number;
    change: number;
  }[];
}
