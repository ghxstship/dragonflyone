import type { HTMLAttributes, ReactNode } from "react";

/**
 * ContentCard component props
 */
export interface ContentCardProps extends HTMLAttributes<HTMLElement> {
  /** Small uppercase label at the top */
  kicker?: string;
  
  /** Card title */
  title: string;
  
  /** Description text */
  description?: string;
  
  /** Bullet points list */
  bullets?: string[];
  
  /** Custom bullet prefix */
  bulletPrefix?: string | ReactNode;
  
  /** Card variant */
  variant?: ContentCardVariant;
  
  /** Padding size */
  padding?: ContentCardPadding;
  
  /** Additional content after bullets */
  footer?: ReactNode;
  
  /** Custom content */
  children?: ReactNode;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * ContentCard variant types
 */
export type ContentCardVariant = 
  | "bordered"
  | "surface"
  | "ghost";

/**
 * ContentCard padding options
 */
export type ContentCardPadding = 
  | "sm"
  | "md"
  | "lg";
