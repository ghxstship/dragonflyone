import type { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

export interface ClientPortalNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface ClientPortalShellProps {
  /** Organization name */
  organizationName: string;
  /** Organization logo URL */
  organizationLogo?: string;
  /** Client name */
  clientName: string;
  /** Client email */
  clientEmail?: string;
  /** Current active route ID */
  activeRoute?: string;
  /** Navigation handler */
  onNavigate?: (route: string) => void;
  /** Logout handler */
  onLogout?: () => void;
  /** Main content */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom navigation items */
  navigationItems?: ClientPortalNavItem[];
  /** Dark/light theme */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Offline state */
  offline?: boolean;
  /** Restricted/access denied state */
  restricted?: boolean;
  /** Restricted message */
  restrictedMessage?: string;
  /** Restricted action */
  restrictedAction?: { label: string; onClick: () => void };
  /** Footer links */
  footerLinks?: Array<{ label: string; onClick?: () => void; href?: string }>;
  /** Copyright text */
  copyright?: string;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
}
