import type { ReactNode } from "react";

/**
 * Row action variant
 */
export type RowActionVariant = "default" | "danger";

/**
 * Row actions trigger variant
 */
export type RowActionsTriggerVariant = "icon" | "text" | "dots";

/**
 * Row actions alignment
 */
export type RowActionsAlignment = "left" | "right";

/**
 * Row actions size
 */
export type RowActionsSize = "sm" | "md";

/**
 * Row action interface
 */
export interface RowAction<T = unknown> {
  /** Unique action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon (emoji or component) */
  icon?: ReactNode;
  /** Action variant for styling */
  variant?: RowActionVariant;
  /** Whether action is disabled */
  disabled?: boolean | ((row: T) => boolean);
  /** Whether action is hidden */
  hidden?: boolean | ((row: T) => boolean);
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Divider before this action */
  divider?: boolean;
}

/**
 * RowActions component props
 */
export interface RowActionsProps<T = unknown> {
  /** Row data */
  row: T;
  /** Available actions */
  actions: RowAction<T>[];
  /** Action click handler */
  onAction: (actionId: string, row: T) => void;
  /** Trigger button variant */
  triggerVariant?: RowActionsTriggerVariant;
  /** Trigger button label (for text variant) */
  triggerLabel?: string;
  /** Dropdown alignment */
  align?: RowActionsAlignment;
  /** Size variant */
  size?: RowActionsSize;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
