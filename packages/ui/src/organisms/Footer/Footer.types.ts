import type { HTMLAttributes, ReactNode } from "react";

/**
 * Footer component props
 */
export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Company or brand logo */
  logo?: ReactNode;
  
  /** Footer content sections */
  children?: ReactNode;
  
  /** Copyright text */
  copyright?: string;
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Footer variant */
  variant?: FooterVariant;
}

/**
 * Footer variant types
 */
export type FooterVariant = 
  | "default"
  | "minimal"
  | "expanded";

/**
 * Footer section props
 */
export interface FooterSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string;
  
  /** Section content */
  children: ReactNode;
  
  /** Inverted theme */
  inverted?: boolean;
}
