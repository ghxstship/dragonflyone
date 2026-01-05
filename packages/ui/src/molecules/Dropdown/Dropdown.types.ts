import type { HTMLAttributes, ReactNode } from "react";

/**
 * Dropdown container props
 */
export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Trigger element */
  trigger: ReactNode;
  
  /** Alignment */
  align?: DropdownAlign;
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Accessible label */
  label?: string;
}

/**
 * Dropdown alignment options
 */
export type DropdownAlign = 
  | "left"
  | "right";

/**
 * Dropdown menu props
 */
export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * Dropdown item props
 */
export interface DropdownItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Disabled state */
  disabled?: boolean;
  
  /** Inverted theme */
  inverted?: boolean;
}
