import type { ReactNode } from 'react';

export interface DetailSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Section content */
  content: ReactNode;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

export interface DetailAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: ReactNode;
  /** Action variant */
  variant?: "primary" | "secondary" | "danger";
  /** Whether action is disabled */
  disabled?: boolean;
}

export interface DetailDrawerProps<T = unknown> {
  /** Whether drawer is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Record data */
  record: T | null;
  /** Drawer title */
  title?: string | ((record: T) => string);
  /** Subtitle */
  subtitle?: string | ((record: T) => string);
  /** Content sections */
  sections?: DetailSection[];
  /** Header actions */
  actions?: DetailAction[];
  /** Action click handler */
  onAction?: (actionId: string, record: T) => void;
  /** Edit handler */
  onEdit?: (record: T) => void;
  /** Delete handler */
  onDelete?: (record: T) => void;
  /** Drawer width */
  width?: "sm" | "md" | "lg" | "xl";
  /** Position */
  position?: "left" | "right";
  /** Show overlay */
  showOverlay?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Children for custom content */
  children?: ReactNode;
  /** Split-pane mode: show list on left, detail on right */
  splitPane?: boolean;
  /** List content for split-pane mode */
  listContent?: ReactNode;
  /** Activity/audit timeline slot */
  activityTimeline?: ReactNode;
  /** Undo banner content */
  undoBanner?: ReactNode;
}
