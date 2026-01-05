import type { ReactNode } from "react";

export interface DetailPageTab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface DetailPageProps {
  /** Navigation component */
  navigation?: ReactNode;
  /** Page header props */
  header: {
    kicker?: string;
    title: string;
    description?: string;
    badge?: ReactNode;
    metadata?: ReactNode;
  };
  /** Primary action buttons */
  actions?: ReactNode;
  /** Back button config */
  backButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Main content (if not using tabs) */
  children?: ReactNode;
  /** Tab configuration (alternative to children) */
  tabs?: DetailPageTab[];
  /** Default active tab index */
  defaultTabIndex?: number;
  /** Controlled active tab index */
  activeTabIndex?: number;
  /** Tab change handler */
  onTabChange?: (index: number) => void;
  /** Sidebar content */
  sidebar?: ReactNode;
  /** Sidebar position */
  sidebarPosition?: "left" | "right";
  /** Sidebar width */
  sidebarWidth?: 3 | 4 | 5;
  /** Sticky sidebar */
  stickySidebar?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Not found state */
  notFound?: boolean;
  /** Not found message */
  notFoundMessage?: string;
  /** Not found action */
  notFoundAction?: { label: string; onClick: () => void };
  /** Offline state */
  offline?: boolean;
  /** Restricted/access denied state */
  restricted?: boolean;
  /** Restricted message */
  restrictedMessage?: string;
  /** Restricted action */
  restrictedAction?: { label: string; onClick: () => void };
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
}
