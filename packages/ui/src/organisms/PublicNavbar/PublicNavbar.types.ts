import type { HTMLAttributes, ReactNode } from "react";
import type { ContextLevel } from "../../molecules/ContextBreadcrumb/index.js";

export interface PublicNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface PublicNavbarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Application logo */
  logo: ReactNode;
  /** Context levels for breadcrumb navigation */
  contextLevels?: ContextLevel[];
  /** Secondary navigation items (right side) */
  navItems?: PublicNavItem[];
  /** Primary CTA button */
  primaryCta?: { label: string; href: string; onClick?: () => void };
  /** User menu content */
  userMenu?: ReactNode;
  /** Current pathname for active state */
  pathname?: string;
  /** Inverted color scheme (dark background) */
  inverted?: boolean;
  /** Callback when mobile menu state changes */
  onMobileMenuChange?: (isOpen: boolean) => void;
  /** Custom actions slot (between breadcrumb and nav) */
  actions?: ReactNode;
}
