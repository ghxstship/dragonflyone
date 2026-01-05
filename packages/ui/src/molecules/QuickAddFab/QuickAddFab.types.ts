import type { ReactNode } from "react";

/**
 * Quick add action
 */
export interface QuickAddAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
}

/**
 * Quick add FAB position
 */
export type QuickAddFabPosition = "bottom-right" | "bottom-left" | "bottom-center";

/**
 * QuickAddFab component props
 */
export interface QuickAddFabProps {
  /** Actions to display when expanded */
  actions: QuickAddAction[];
  /** Position of the FAB */
  position?: QuickAddFabPosition;
  /** Whether the FAB is expanded */
  expanded?: boolean;
  /** Called when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Theme inversion */
  inverted?: boolean;
  /** Additional class name */
  className?: string;
}
