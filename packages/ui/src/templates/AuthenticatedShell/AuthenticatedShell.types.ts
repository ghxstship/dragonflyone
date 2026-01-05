import type { ReactNode } from "react";

// Define types inline for now to avoid import issues
export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarItem[];
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  organization?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Define additional types for AuthenticatedShell
export type HeaderNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
};

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';
export type ThemeMode = 'light' | 'dark' | 'system';

export type BreadcrumbContextItem = {
  type: 'organization' | 'project' | 'team' | 'workspace';
  id: string;
  name: string;
  href?: string;
  current?: boolean;
};

export type ContextOptions = {
  organizations?: Array<{ id: string; name: string; current?: boolean }>;
  projects?: Array<{ id: string; name: string; current?: boolean }>;
  teams?: Array<{ id: string; name: string; current?: boolean }>;
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
};

export type HeaderQuickAction = {
  label: string;
  href: string;
  icon?: string;
  shortcut?: string;
};

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
};

export type AuthenticatedShellProps = {
  children: ReactNode;
  /** Navigation sections for sidebar */
  sections?: SidebarSection[];
  /** Current active path */
  activeItem?: string;
  /** Logo element */
  logo?: ReactNode;
  /** Workspace/org name for header */
  title?: string;
  /** Breadcrumb context */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** User profile */
  user?: UserProfile;
  /** Search component */
  search?: ReactNode;
  /** Quick actions */
  actions?: ReactNode;
  /** Theme mode */
  theme?: 'light' | 'dark' | 'system';
  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Notifications */
  notifications?: HeaderNotification[];
  /** Legacy notifications format - DEPRECATED */
  legacyNotifications?: Array<{ id: string; title: string; message: string; time: string; read?: boolean }>;
  /** Available workspaces for switching */
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
  /** Callback when switching context at any level */
  onContextSwitch?: (type: BreadcrumbContextItem["type"], id: string) => void;
  /** Quick action buttons for sidebar */
  quickActions?: Array<{ label: string; href: string; icon?: string; shortcut?: string }>;
  /** Header quick actions (contextual) */
  headerQuickActions?: HeaderQuickAction[];
  /** Favorites items */
  favorites?: SidebarNavItem[];
  /** Spaces/projects */
  spaces?: Array<{ id: string; name: string; color?: string; href: string }>;
  /** Recent pages section (last 5 visited) */
  recentPages?: SidebarNavItem[];
  /** Search component override */
  searchComponent?: ReactNode;
  /** Header actions (context switcher, etc.) */
  headerActions?: ReactNode;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Search callback - triggers command palette */
  onSearch?: (query: string) => void;
  /** Open global search/command palette */
  onSearchOpen?: () => void;
  /** Settings path */
  settingsPath?: string;
  /** Help path */
  helpPath?: string;
  /** Workspace switch callback */
  onWorkspaceSwitch?: (workspaceId: string) => void;
  /** Sign out callback */
  onSignOut?: () => void;
  /** User roles for filtering navigation items */
  userRoles?: string[];
  /** Storage key prefix for persisting sidebar state */
  storageKey?: string;
  /** Theme change callback */
  onThemeChange?: (theme: ThemeMode) => void;
  /** User status change callback */
  onStatusChange?: (status: UserStatus) => void;
  /** Notification callbacks */
  onNotificationClick?: (notification: HeaderNotification) => void;
  onNotificationMarkRead?: (id: string) => void;
  onNotificationMarkAllRead?: () => void;
  onNotificationDelete?: (id: string) => void;
  onNotificationSettings?: () => void;
  /** Keyboard shortcuts modal callback */
  onKeyboardShortcuts?: () => void;
  /** Use enhanced header (default: true) */
  useEnhancedHeader?: boolean;
  /** Additional className */
  className?: string;
};
