import type { HTMLAttributes, LiHTMLAttributes } from "react";

export interface ListProps extends HTMLAttributes<HTMLElement> {
  as?: "ul" | "ol";
  variant?: "default" | "none" | "disc" | "decimal" | "check";
  spacing?: "none" | "sm" | "md" | "lg";
  inverted?: boolean;
}

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  icon?: React.ReactNode;
  inverted?: boolean;
}

export interface ListVariants {
  /** List type */
  as?: "ul" | "ol";
  /** List variant */
  variant?: "default" | "none" | "disc" | "decimal" | "check";
  /** Spacing between items */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Inverted theme */
  inverted?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface ListItemVariants {
  /** Has icon */
  hasIcon?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Additional CSS classes */
  className?: string;
}
