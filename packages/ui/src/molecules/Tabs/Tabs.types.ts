import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

/**
 * Tabs variant
 */
export type TabsVariant = "line" | "enclosed" | "pop";

/**
 * Tabs component props
 */
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  variant?: TabsVariant;
  inverted?: boolean;
  /** Default tab index to show (0-indexed) */
  defaultTab?: number;
}

/**
 * TabsList component props
 */
export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: TabsVariant;
  inverted?: boolean;
  /** Callback when tab changes via keyboard or swipe navigation */
  onTabChange?: (index: number) => void;
  /** Enable touch swipe gestures for mobile tab switching */
  enableSwipe?: boolean;
}

/**
 * TabsTrigger component props
 */
export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  inverted?: boolean;
}

/**
 * TabsContent component props
 */
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  inverted?: boolean;
}

/**
 * TabsPanel component props
 */
export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  inverted?: boolean;
}
