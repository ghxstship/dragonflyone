import type { HTMLAttributes, ReactNode } from "react";

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

export interface AppSidebarProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Sidebar sections and items */
  sections: SidebarSection[];
  /** Currently active item */
  activeItem?: string;
  /** Collapsed state */
  collapsed?: boolean;
  /** Called when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Called when item is clicked */
  onItemClick?: (item: SidebarItem) => void;
  /** Logo element */
  logo?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Width when expanded */
  width?: string;
  /** Width when collapsed */
  collapsedWidth?: string;
  /** Inverted theme for dark backgrounds */
  inverted?: boolean;
  /** Show tooltips when collapsed */
  showTooltips?: boolean;
  /** Sticky positioning */
  sticky?: boolean;
}

export interface AppSidebarVariants {
  collapsed?: boolean;
  inverted?: boolean;
  sticky?: boolean;
  className?: string;
}
