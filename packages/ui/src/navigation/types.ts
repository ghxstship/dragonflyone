/**
 * Navigation Configuration Types
 * Shared across ATLVS, COMPVSS, and GVTEWAY applications
 */

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export type NavigationContextLevel = 'platform' | 'event';

export type AppName = 'atlvs' | 'compvss' | 'gvteway';

export interface NavigationContext {
  /** Current navigation level */
  level: NavigationContextLevel;
  /** Current organization ID (platform level) */
  organizationId?: string;
  /** Current production ID (event level - ATLVS/COMPVSS) */
  productionId?: string;
  /** Current event ID (event level - GVTEWAY) */
  eventId?: string;
  /** Organization name for display */
  organizationName?: string;
  /** Production/Event name for display */
  productionName?: string;
}

// =============================================================================
// ROLE & PERMISSION TYPES
// =============================================================================

/** Platform-level roles (organization-wide) */
export type PlatformRole =
  | 'super_admin'
  | 'org_admin'
  | 'finance_director'
  | 'production_manager'
  | 'sales_director'
  | 'operations_director'
  | 'marketing_director'
  | 'hr_director'
  | 'member';

/** Event-level roles (production-specific) */
export type EventRole =
  | 'executive_producer'
  | 'production_manager'
  | 'finance_manager'
  | 'operations_manager'
  | 'marketing_manager'
  | 'department_head'
  | 'crew_lead'
  | 'crew_member'
  | 'vendor'
  | 'stakeholder'
  | 'viewer';

/** Permission scopes */
export type PermissionScope =
  | 'read'
  | 'write'
  | 'delete'
  | 'admin';

/** Permission resource */
export type PermissionResource =
  | 'productions'
  | 'schedule'
  | 'shows'
  | 'venues'
  | 'team'
  | 'finance'
  | 'sponsors'
  | 'investors'
  | 'expenses'
  | 'compliance'
  | 'permits'
  | 'insurance'
  | 'marketing'
  | 'metrics'
  | 'documents'
  | 'settings'
  | 'integrations'
  | 'crm'
  | 'assets';

/** Full permission string format: resource:scope */
export type Permission = `${PermissionResource}:${PermissionScope}`;

// =============================================================================
// NAVIGATION ITEM TYPES
// =============================================================================

export interface NavBadge {
  /** Badge content (number or text) */
  content: string | number;
  /** Badge variant for styling */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation href (optional if has children) */
  href?: string;
  /** Lucide icon name as string */
  icon?: string;
  /** Child navigation items */
  children?: NavItem[];
  /** Badge to display */
  badge?: NavBadge;
  /** Platform roles that can see this item */
  platformRoles?: PlatformRole[];
  /** Event roles that can see this item */
  eventRoles?: EventRole[];
  /** Required permissions */
  permissions?: Permission[];
  /** Which context level this item appears in */
  contextLevel: NavigationContextLevel | 'both';
  /** Which apps this item appears in */
  apps?: AppName[];
  /** Whether this is a divider/section header */
  type?: 'item' | 'divider' | 'section';
  /** Section title (if type is 'section') */
  sectionTitle?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** External link (opens in new tab) */
  external?: boolean;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Description for command palette */
  description?: string;
}

export interface NavSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Items in this section */
  items: NavItem[];
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

// =============================================================================
// NAVIGATION CONFIG TYPES
// =============================================================================

export interface NavigationConfig {
  /** Application name */
  app: AppName;
  /** Platform-level navigation sections */
  platformNav: NavSection[];
  /** Event-level navigation sections */
  eventNav: NavSection[];
  /** Quick actions for command palette */
  quickActions?: NavItem[];
  /** Footer navigation items */
  footerNav?: NavItem[];
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface SidebarProps {
  /** Current navigation context */
  context: NavigationContext;
  /** User's platform roles */
  platformRoles: PlatformRole[];
  /** User's event roles (for current production) */
  eventRoles: EventRole[];
  /** User's permissions */
  permissions: Permission[];
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Navigation configuration */
  config: NavigationConfig;
  /** Current active path */
  activePath?: string;
}

export interface ContextSwitcherProps {
  /** Current context */
  context: NavigationContext;
  /** Available productions/events to switch to */
  availableContexts: Array<{
    id: string;
    name: string;
    type: 'production' | 'event';
    status?: 'active' | 'upcoming' | 'past';
  }>;
  /** Callback when context changes */
  onContextChange: (context: NavigationContext) => void;
  /** Callback to return to platform level */
  onExitEventContext: () => void;
}

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href */
  href?: string;
  /** Whether this is the current page */
  current?: boolean;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Current context for automatic breadcrumbs */
  context?: NavigationContext;
}

export interface CommandPaletteProps {
  /** Whether palette is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Navigation configuration for search */
  config: NavigationConfig;
  /** Current context */
  context: NavigationContext;
  /** Recent items */
  recentItems?: NavItem[];
  /** Callback when item is selected */
  onSelect: (item: NavItem) => void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface NavigationState {
  /** Expanded section IDs */
  expandedSections: string[];
  /** Recently visited items */
  recentItems: string[];
  /** Pinned items */
  pinnedItems: string[];
  /** Sidebar collapsed state */
  sidebarCollapsed: boolean;
}

export interface NavigationActions {
  toggleSection: (sectionId: string) => void;
  addRecentItem: (itemId: string) => void;
  togglePinnedItem: (itemId: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}
