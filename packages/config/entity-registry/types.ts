/**
 * Entity Registry Type Definitions
 * 
 * Centralized type system for entity configurations across the monorepo.
 * This eliminates hardcoded UI/workflow elements by providing a single
 * source of truth for columns, filters, actions, form fields, and more.
 */

import type { ReactNode } from 'react';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Supported icon names from Lucide React
 */
export type IconName =
  | 'Eye' | 'Pencil' | 'Trash2' | 'Download' | 'Upload' | 'Plus' | 'Minus'
  | 'Check' | 'X' | 'ChevronRight' | 'ChevronDown' | 'ChevronUp' | 'ChevronLeft'
  | 'Search' | 'Filter' | 'Settings' | 'MoreHorizontal' | 'MoreVertical'
  | 'Copy' | 'Clipboard' | 'Share' | 'ExternalLink' | 'Link'
  | 'Mail' | 'Phone' | 'MapPin' | 'Calendar' | 'Clock' | 'Bell'
  | 'User' | 'Users' | 'UserPlus' | 'UserMinus' | 'UserCheck' | 'UserX'
  | 'Building' | 'Building2' | 'Home' | 'Briefcase' | 'Folder' | 'FolderOpen'
  | 'File' | 'FileText' | 'FilePlus' | 'FileCheck' | 'FileX' | 'Files'
  | 'Image' | 'Camera' | 'Video' | 'Music' | 'Mic'
  | 'DollarSign' | 'CreditCard' | 'Wallet' | 'Receipt' | 'Banknote'
  | 'ShoppingCart' | 'Package' | 'Truck' | 'Box' | 'Archive'
  | 'Tag' | 'Tags' | 'Bookmark' | 'Star' | 'Heart' | 'Flag'
  | 'AlertCircle' | 'AlertTriangle' | 'Info' | 'HelpCircle' | 'CheckCircle' | 'XCircle'
  | 'Lock' | 'Unlock' | 'Key' | 'Shield' | 'ShieldCheck' | 'ShieldX'
  | 'QrCode' | 'Barcode' | 'Scan' | 'ScanLine' | 'Fingerprint'
  | 'Wifi' | 'WifiOff' | 'Bluetooth' | 'Nfc' | 'Radio'
  | 'Play' | 'Pause' | 'Stop' | 'SkipBack' | 'SkipForward' | 'Rewind' | 'FastForward'
  | 'RefreshCw' | 'RotateCw' | 'RotateCcw' | 'Repeat' | 'Shuffle'
  | 'Zap' | 'Activity' | 'TrendingUp' | 'TrendingDown' | 'BarChart' | 'PieChart' | 'LineChart'
  | 'Grid' | 'List' | 'LayoutGrid' | 'LayoutList' | 'Columns' | 'Rows'
  | 'Send' | 'MessageSquare' | 'MessageCircle' | 'Inbox' | 'Archive'
  | 'Globe' | 'Map' | 'Navigation' | 'Compass' | 'Target'
  | 'Sun' | 'Moon' | 'Cloud' | 'CloudRain' | 'Thermometer'
  | 'Wrench' | 'Tool' | 'Hammer' | 'Scissors' | 'Paintbrush'
  | 'Code' | 'Terminal' | 'Database' | 'Server' | 'HardDrive'
  | 'Printer' | 'Monitor' | 'Smartphone' | 'Tablet' | 'Laptop'
  | 'Ban' | 'Slash' | 'Power' | 'PowerOff' | 'LogIn' | 'LogOut'
  | 'Award' | 'Trophy' | 'Medal' | 'Crown' | 'Gift'
  | 'Ticket' | 'BadgeCheck' | 'BadgeX' | 'Badge' | 'IdCard'
  | 'Clipboard' | 'ClipboardCheck' | 'ClipboardList' | 'ClipboardX'
  | 'BookOpen' | 'Book' | 'Library' | 'GraduationCap' | 'School'
  | 'Megaphone' | 'Volume' | 'Volume2' | 'VolumeX' | 'Speaker'
  | 'Headphones' | 'Radio' | 'Podcast' | 'Rss'
  | 'Layers' | 'Layout' | 'Sidebar' | 'PanelLeft' | 'PanelRight'
  | 'Maximize' | 'Minimize' | 'Expand' | 'Shrink' | 'Move'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
  | 'ArrowUpRight' | 'ArrowDownRight' | 'ArrowUpLeft' | 'ArrowDownLeft'
  | 'CornerUpRight' | 'CornerDownRight' | 'CornerUpLeft' | 'CornerDownLeft'
  | 'Undo' | 'Redo' | 'History' | 'Timer' | 'Hourglass'
  | 'Percent' | 'Hash' | 'AtSign' | 'Asterisk'
  | 'Circle' | 'Square' | 'Triangle' | 'Hexagon' | 'Octagon'
  | 'Heart' | 'Smile' | 'Frown' | 'Meh' | 'ThumbsUp' | 'ThumbsDown';

/**
 * Badge/status color variants
 */
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline';

/**
 * Action button variants
 */
export type ActionVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/**
 * Form field types
 */
export type FieldType =
  | 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'url' | 'password'
  | 'date' | 'time' | 'datetime' | 'daterange'
  | 'select' | 'multiselect' | 'combobox' | 'radio' | 'checkbox'
  | 'file' | 'image' | 'avatar'
  | 'currency' | 'percentage'
  | 'color' | 'rating' | 'slider' | 'switch' | 'toggle'
  | 'rich-text' | 'markdown' | 'code'
  | 'address' | 'phone' | 'coordinates'
  | 'relation' | 'tags' | 'json';

// ============================================================================
// Column Definitions
// ============================================================================

/**
 * Column definition for list pages
 */
export interface ColumnDefinition<T = Record<string, unknown>> {
  /** Unique key for the column */
  key: string;
  /** Display label */
  label: string;
  /** Field accessor - string key or function */
  accessor: keyof T | string | ((row: T) => unknown);
  /** Whether column is sortable */
  sortable?: boolean;
  /** Fixed width */
  width?: string;
  /** Minimum width */
  minWidth?: string;
  /** Maximum width */
  maxWidth?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is hidden by default */
  hidden?: boolean;
  /** Whether column can be hidden by user */
  hideable?: boolean;
  /** Column group for organization */
  group?: string;
  /** Render function for custom display */
  render?: (value: unknown, row: T) => ReactNode;
  /** Cell class name */
  className?: string;
  /** Header class name */
  headerClassName?: string;
  /** Data type for formatting */
  dataType?: 'string' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'status' | 'badge' | 'avatar' | 'link';
  /** Format options based on dataType */
  formatOptions?: {
    currency?: string;
    dateFormat?: string;
    locale?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
  };
  /** Status color mapping for status/badge types */
  statusColors?: Record<string, StatusVariant>;
}

// ============================================================================
// Filter Definitions
// ============================================================================

/**
 * Filter option for select/multiselect filters
 */
export interface FilterOption {
  value: string;
  label: string;
  icon?: IconName;
  color?: string;
  disabled?: boolean;
}

/**
 * Filter definition for list pages
 */
export interface FilterDefinition {
  /** Unique key for the filter */
  key: string;
  /** Display label */
  label: string;
  /** Filter type */
  type?: 'select' | 'multiselect' | 'text' | 'number' | 'date' | 'daterange' | 'boolean';
  /** Static options for select filters */
  options?: FilterOption[];
  /** Dynamic options loader */
  optionsLoader?: () => Promise<FilterOption[]>;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: unknown;
  /** Whether filter is hidden by default */
  hidden?: boolean;
  /** Filter group for organization */
  group?: string;
  /** Icon for the filter */
  icon?: IconName;
}

// ============================================================================
// Action Definitions
// ============================================================================

/**
 * Row action definition
 */
export interface RowActionDefinition<T = Record<string, unknown>> {
  /** Unique action ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon name */
  icon?: IconName;
  /** Action variant */
  variant?: ActionVariant;
  /** Whether action is disabled */
  disabled?: boolean | ((row: T) => boolean);
  /** Whether action is hidden */
  hidden?: boolean | ((row: T) => boolean);
  /** Action handler - 'route' for navigation, 'drawer' for detail view, 'modal' for dialog, 'custom' for callback */
  handler: 'route' | 'drawer' | 'modal' | 'confirm' | 'custom';
  /** Route template for 'route' handler (e.g., '/bills/[id]/edit') */
  route?: string;
  /** Confirmation config for 'confirm' handler */
  confirm?: {
    title: string;
    message: string | ((row: T) => string);
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
  };
  /** Custom action key for 'custom' handler */
  customAction?: string;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Required permission/role */
  requiredRole?: string;
}

/**
 * Bulk action definition
 */
export interface BulkActionDefinition {
  /** Unique action ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon name */
  icon?: IconName;
  /** Action variant */
  variant?: ActionVariant;
  /** Whether action requires confirmation */
  requiresConfirmation?: boolean;
  /** Confirmation config */
  confirm?: {
    title: string;
    message: string | ((count: number) => string);
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
  };
  /** Handler type */
  handler: 'api' | 'export' | 'custom';
  /** API endpoint for 'api' handler */
  apiEndpoint?: string;
  /** API method */
  apiMethod?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Custom action key */
  customAction?: string;
  /** Required permission/role */
  requiredRole?: string;
}

/**
 * Quick action definition (toolbar actions)
 */
export interface QuickActionDefinition {
  /** Unique action ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon name */
  icon?: IconName;
  /** Action variant */
  variant?: ActionVariant;
  /** Handler type */
  handler: 'route' | 'modal' | 'custom';
  /** Route for 'route' handler */
  route?: string;
  /** Custom action key */
  customAction?: string;
  /** Whether action is primary (highlighted) */
  primary?: boolean;
  /** Required permission/role */
  requiredRole?: string;
}

// ============================================================================
// Form Field Definitions
// ============================================================================

/**
 * Form field definition
 */
export interface FormFieldDefinition {
  /** Field name (matches data key) */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: FieldType;
  /** Whether field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Default value */
  defaultValue?: unknown;
  /** Column span (1 or 2) */
  colSpan?: 1 | 2;
  /** Static options for select fields */
  options?: FilterOption[];
  /** Dynamic options loader */
  optionsLoader?: () => Promise<FilterOption[]>;
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  /** Conditional visibility */
  showWhen?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'exists';
    value?: unknown;
  };
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Field group for organization */
  group?: string;
  /** Icon for the field */
  icon?: IconName;
}

// ============================================================================
// Detail Section Definitions
// ============================================================================

/**
 * Detail field definition for detail views
 */
export interface DetailFieldDefinition {
  /** Field key */
  key: string;
  /** Display label */
  label: string;
  /** Field accessor */
  accessor: string | ((row: Record<string, unknown>) => unknown);
  /** Data type for formatting */
  dataType?: 'string' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'status' | 'badge' | 'link' | 'email' | 'phone';
  /** Format options */
  formatOptions?: {
    currency?: string;
    dateFormat?: string;
    locale?: string;
  };
  /** Status color mapping */
  statusColors?: Record<string, StatusVariant>;
  /** Column span */
  colSpan?: 1 | 2;
  /** Whether to hide if value is empty */
  hideEmpty?: boolean;
}

/**
 * Detail section definition
 */
export interface DetailSectionDefinition {
  /** Section ID */
  id: string;
  /** Section title */
  title: string;
  /** Fields in this section */
  fields: DetailFieldDefinition[];
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Whether section is collapsed by default */
  defaultCollapsed?: boolean;
  /** Icon for the section */
  icon?: IconName;
}

// ============================================================================
// Stats Definitions
// ============================================================================

/**
 * Stat item definition
 */
export interface StatDefinition {
  /** Stat key */
  key: string;
  /** Display label */
  label: string;
  /** Value accessor from stats response */
  accessor: string | ((stats: Record<string, unknown>) => unknown);
  /** Data type for formatting */
  dataType?: 'number' | 'currency' | 'percentage';
  /** Format options */
  formatOptions?: {
    currency?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
  };
  /** Icon for the stat */
  icon?: IconName;
  /** Color variant */
  variant?: StatusVariant;
  /** Trend indicator accessor */
  trendAccessor?: string | ((stats: Record<string, unknown>) => number);
}

// ============================================================================
// Entity Configuration
// ============================================================================

/**
 * Route configuration for an entity
 */
export interface EntityRoutes {
  /** List page route */
  list: string;
  /** Detail page route template */
  detail?: string;
  /** Create page route */
  create?: string;
  /** Edit page route template */
  edit?: string;
  /** Additional custom routes */
  custom?: Record<string, string>;
}

/**
 * API configuration for an entity
 */
export interface EntityApi {
  /** Base API endpoint */
  endpoint: string;
  /** Stats endpoint */
  statsEndpoint?: string;
  /** Custom endpoints */
  custom?: Record<string, string>;
}

/**
 * Legend schema entity type mapping
 * Maps entity registry names to 3NF Legend schema tables
 */
export type LegendEntityType = 
  | 'legend_people'
  | 'legend_places'
  | 'legend_organizations'
  | 'legend_products'
  | 'legend_events'
  | 'legend_documents';

/**
 * Profile table types for 3NF extension tables
 */
export type ProfileTableType =
  | 'people_profile_employee'
  | 'people_profile_crew'
  | 'people_profile_artist'
  | 'people_profile_volunteer'
  | 'people_profile_contact'
  | 'people_profile_candidate'
  | 'people_profile_mentor'
  | 'people_profile_influencer'
  | 'people_profile_speaker'
  | 'people_profile_attendee'
  | 'places_profile_venue'
  | 'places_profile_warehouse'
  | 'orgs_profile_vendor'
  | 'orgs_profile_sponsor'
  | 'orgs_profile_client'
  | 'products_profile_equipment'
  | 'products_profile_asset'
  | 'products_profile_inventory'
  | 'events_profile_production'
  | 'events_profile_show'
  | 'docs_profile_contract'
  | 'docs_profile_invoice';

/**
 * Relationship type for entity relationships
 */
export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

/**
 * Entity relationship definition
 */
export interface EntityRelationship {
  /** Related entity name */
  entity: string;
  /** Relationship type */
  type: RelationshipType;
  /** Foreign key column in this entity */
  foreignKey: string;
  /** Referenced column in related entity (default: 'id') */
  referencedKey?: string;
  /** Join table for many-to-many relationships */
  joinTable?: string;
  /** Whether to eager load this relationship */
  eager?: boolean;
  /** Cascade delete behavior */
  onDelete?: 'cascade' | 'set-null' | 'restrict' | 'no-action';
}

/**
 * Database field mapping for UI columns
 */
export interface DbFieldMapping {
  /** Database table name */
  table: string;
  /** Database column name */
  column: string;
  /** Whether this is a computed/virtual field */
  computed?: boolean;
  /** SQL expression for computed fields */
  expression?: string;
  /** Join path for nested fields (e.g., 'vendor.name') */
  joinPath?: string[];
}

/**
 * Legend schema mapping configuration
 */
export interface LegendSchemaMapping {
  /** The Legend table this entity maps to */
  table: LegendEntityType;
  /** The type discriminator value (e.g., 'vendor' for legend_organizations) */
  typeValue?: string;
  /** The type column name (e.g., 'org_type', 'product_type') */
  typeColumn?: string;
  /** Profile extension table for type-specific attributes */
  profileTable?: ProfileTableType;
  /** Foreign key in profile table that references the core table */
  profileForeignKey?: string;
  /** Additional query filters for this entity */
  filters?: Record<string, unknown>;
  /** Supabase select query for eager loading related data */
  selectQuery?: string;
  /** Relationships to other entities */
  relationships?: EntityRelationship[];
}

/**
 * Dataset capability types (aligned with dataset-capabilities system)
 */
export type DatasetCapabilityType =
  | 'scannable:qr'
  | 'scannable:barcode'
  | 'scannable:rfid'
  | 'scannable:nfc'
  | 'view:timeline'
  | 'view:map'
  | 'view:calendar'
  | 'view:gantt'
  | 'view:gallery'
  | 'view:kanban'
  | 'import:csv'
  | 'import:json'
  | 'import:excel'
  | 'export:csv'
  | 'export:json'
  | 'export:pdf'
  | 'bulk:edit'
  | 'bulk:delete'
  | 'bulk:assign'
  | 'bulk:status-change'
  | 'notifications:enabled'
  | 'audit:trail'
  | 'versioning:enabled';

/**
 * Complete entity configuration
 */
export interface EntityConfig<T = Record<string, unknown>> {
  /** Entity name (kebab-case, e.g., 'credentials') */
  name: string;
  /** Singular display name */
  singular: string;
  /** Plural display name */
  plural: string;
  /** Entity description */
  description?: string;
  /** Primary icon */
  icon: IconName;
  /** Route configuration */
  routes: EntityRoutes;
  /** API configuration */
  api: EntityApi;
  /** Column definitions */
  columns: ColumnDefinition<T>[];
  /** Filter definitions */
  filters: FilterDefinition[];
  /** Row action definitions */
  rowActions: RowActionDefinition<T>[];
  /** Bulk action definitions */
  bulkActions: BulkActionDefinition[];
  /** Quick action definitions */
  quickActions: QuickActionDefinition[];
  /** Form field definitions for create/edit */
  formFields: FormFieldDefinition[];
  /** Detail section definitions */
  detailSections: DetailSectionDefinition[];
  /** Stat definitions */
  stats: StatDefinition[];
  
  // =========================================================================
  // INTEGRATION: Dataset Capability Detection System
  // =========================================================================
  
  /** 
   * Capability flags aligned with dataset-capabilities system
   * These are used to auto-generate quick actions and view options
   */
  capabilities?: DatasetCapabilityType[];
  
  /**
   * Capability route overrides (aligned with entity-overrides.ts)
   * Maps capability types to custom routes
   */
  capabilityRoutes?: Partial<Record<DatasetCapabilityType, string>>;
  
  // =========================================================================
  // INTEGRATION: Legend 3NF Schema
  // =========================================================================
  
  /**
   * Legend schema mapping for 3NF database integration
   * Maps this entity to the appropriate Legend table and type
   */
  legendMapping?: LegendSchemaMapping;
  /** Search configuration */
  search?: {
    placeholder: string;
    fields: string[];
  };
  /** Empty state configuration */
  emptyState?: {
    message: string;
    actionLabel?: string;
    actionRoute?: string;
  };
  /** Default sort configuration */
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** Pagination configuration */
  pagination?: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  /** Feature flags */
  features?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    export?: boolean;
    import?: boolean;
    bulkActions?: boolean;
    search?: boolean;
    filters?: boolean;
    sort?: boolean;
    pagination?: boolean;
    selection?: boolean;
  };
  /** Required roles for various operations */
  permissions?: {
    view?: string[];
    create?: string[];
    edit?: string[];
    delete?: string[];
    export?: string[];
    import?: string[];
  };
}

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Entity registry type
 */
export type EntityRegistry = Record<string, EntityConfig>;

/**
 * Entity name type (for type-safe entity lookups)
 */
export type EntityName = string;

// ============================================================================
// Generator Types
// ============================================================================

/**
 * Options for column generation
 */
export interface ColumnGeneratorOptions {
  /** Include hidden columns */
  includeHidden?: boolean;
  /** Column groups to include */
  groups?: string[];
  /** Columns to exclude */
  exclude?: string[];
  /** Columns to include (overrides exclude) */
  include?: string[];
}

/**
 * Options for filter generation
 */
export interface FilterGeneratorOptions {
  /** Include hidden filters */
  includeHidden?: boolean;
  /** Filter groups to include */
  groups?: string[];
  /** Filters to exclude */
  exclude?: string[];
  /** Filters to include */
  include?: string[];
}

/**
 * Options for action generation
 */
export interface ActionGeneratorOptions {
  /** User roles for permission filtering */
  userRoles?: string[];
  /** Actions to exclude */
  exclude?: string[];
  /** Actions to include */
  include?: string[];
}

/**
 * Options for form field generation
 */
export interface FormFieldGeneratorOptions {
  /** Mode: create or edit */
  mode: 'create' | 'edit';
  /** Field groups to include */
  groups?: string[];
  /** Fields to exclude */
  exclude?: string[];
  /** Fields to include */
  include?: string[];
}

/**
 * Options for detail section generation
 */
export interface DetailSectionGeneratorOptions {
  /** Sections to exclude */
  exclude?: string[];
  /** Sections to include */
  include?: string[];
  /** Whether to hide empty fields */
  hideEmpty?: boolean;
}

/**
 * Options for stats generation
 */
export interface StatsGeneratorOptions {
  /** Stats to exclude */
  exclude?: string[];
  /** Stats to include */
  include?: string[];
}
