export interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  active?: boolean;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
}

export interface MobileBottomNavProps {
  /** Navigation items - supports up to 6 items (3 left, 3 right of center button) */
  items: MobileNavItem[];
  /** Current active path */
  currentPath?: string;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Quick action items for the center button menu */
  quickActions?: QuickActionItem[];
  /** Callback when a quick action is selected */
  onQuickAction?: (action: QuickActionItem) => void;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}
