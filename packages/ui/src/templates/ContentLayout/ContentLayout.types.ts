import type { ReactNode } from "react";

export interface ContentLayoutProps {
  children: ReactNode;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export interface MainContentProps extends ContentLayoutProps {
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
}

export interface SplitLayoutProps extends ContentLayoutProps {
  /** Main content area */
  main: ReactNode;
  /** Side panel content */
  side: ReactNode;
  /** Side panel position */
  sidePosition?: "left" | "right";
  /** Side panel width */
  sideWidth?: "sm" | "md" | "lg" | "xl";
  /** Collapsible side panel */
  collapsible?: boolean;
  /** Side panel collapsed state */
  collapsed?: boolean;
  /** Collapse toggle handler */
  onCollapseToggle?: () => void;
  /** Show divider between panels */
  showDivider?: boolean;
}

export interface PanelLayoutProps extends ContentLayoutProps {
  /** Panel sections */
  sections: Array<{
    id: string;
    title?: string;
    content: ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  }>;
  /** Panel direction */
  direction?: "horizontal" | "vertical";
  /** Gap between panels */
  gap?: "none" | "sm" | "md" | "lg";
}

export interface ToolbarProps {
  children: ReactNode;
  /** Position */
  position?: "top" | "bottom";
  /** Sticky */
  sticky?: boolean;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export interface ContentSectionProps {
  children: ReactNode;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Section actions */
  actions?: ReactNode;
  /** Collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  count?: number;
  color?: string;
  items: ReactNode;
}

export interface KanbanLayoutProps {
  columns: KanbanColumn[];
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export interface KanbanCardProps {
  children: ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Priority indicator */
  priority?: "low" | "medium" | "high" | "urgent";
  /** Tags */
  tags?: Array<{ label: string; color?: string }>;
  /** Assignee avatar */
  assignee?: { name: string; avatar?: string };
  /** Due date */
  dueDate?: string;
  /** Click handler */
  onClick?: () => void;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}
