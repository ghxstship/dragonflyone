import type { HTMLAttributes, ReactNode } from "react";

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  organization?: string;
}

export interface AppNavbarProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Navigation items to display */
  items?: NavItem[];
  /** User profile information */
  user?: UserProfile;
  /** Notification items */
  notifications?: NotificationItem[];
  /** Show search input */
  showSearch?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search value */
  searchValue?: string;
  /** Called when search changes */
  onSearchChange?: (value: string) => void;
  /** Called when search is submitted */
  onSearchSubmit?: (value: string) => void;
  /** Show theme toggle */
  showThemeToggle?: boolean;
  /** Current theme */
  theme?: "light" | "dark" | "system";
  /** Called when theme changes */
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  /** Show mobile menu toggle */
  showMobileMenu?: boolean;
  /** Mobile menu open state */
  mobileMenuOpen?: boolean;
  /** Called when mobile menu toggles */
  onMobileMenuToggle?: (open: boolean) => void;
  /** Logo element */
  logo?: ReactNode;
  /** Actions to show in the navbar */
  actions?: ReactNode;
  /** Sticky positioning */
  sticky?: boolean;
  /** Inverted theme for dark backgrounds */
  inverted?: boolean;
  /** Compact mode */
  compact?: boolean;
}

export interface AppNavbarVariants {
  sticky?: boolean;
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}
