import type { ReactNode } from "react";

export interface SidebarSection {
  id: string;
  title?: string;
  items: Array<{
    id: string;
    label: string;
    href?: string;
    icon?: ReactNode;
    badge?: string | number;
    active?: boolean;
    disabled?: boolean;
    children?: Array<{
    id: string;
    label: string;
    href?: string;
    icon?: ReactNode;
    badge?: string | number;
    active?: boolean;
    disabled?: boolean;
    children?: Array<{
      id: string;
      label: string;
      href?: string;
      icon?: ReactNode;
      badge?: string | number;
      active?: boolean;
      disabled?: boolean;
    }>;
    onClick?: () => void;
  }>;
    onClick?: () => void;
  }>;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface DashboardPageProps {
  children: ReactNode;
  /** Navigation sections for sidebar */
  sections: SidebarSection[];
  /** Current active path */
  activeItem?: string;
  /** Logo element */
  logo?: ReactNode;
  /** Sidebar footer content */
  footer?: ReactNode;
  /** Sidebar collapsed state */
  collapsed?: boolean;
  /** Called when sidebar collapse state changes */
  onCollapse?: (collapsed: boolean) => void;
  /** Inverted theme for dark backgrounds */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Empty state */
  empty?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Offline state */
  offline?: boolean;
  /** Restricted/access denied state */
  restricted?: boolean;
  /** Restricted message */
  restrictedMessage?: string;
  /** Restricted action */
  restrictedAction?: { label: string; onClick: () => void };
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Additional actions for header */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
  /** Sidebar collapsed state (controlled) */
  sidebarCollapsed?: boolean;
  /** Sidebar collapse handler */
  onSidebarCollapse?: (collapsed: boolean) => void;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
}
