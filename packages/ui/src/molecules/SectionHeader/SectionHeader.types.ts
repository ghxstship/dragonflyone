import type { HTMLAttributes, ReactNode } from "react";

/**
 * Section header alignment
 */
export type SectionHeaderAlign = "left" | "center" | "right";

/**
 * Section header title size
 */
export type SectionHeaderTitleSize = "md" | "lg" | "xl";

/**
 * Section header gap
 */
export type SectionHeaderGap = "sm" | "md" | "lg";

/**
 * Section header color scheme
 */
export type SectionHeaderColorScheme = "on-dark" | "on-light" | "on-mid";

/**
 * SectionHeader component props
 */
export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small uppercase label above the title */
  kicker?: string;
  /** Main section title */
  title?: string | ReactNode;
  /** Description text below the title */
  description?: string | ReactNode;
  /** Text alignment */
  align?: SectionHeaderAlign;
  /** Title size variant */
  titleSize?: SectionHeaderTitleSize;
  /** Gap between elements */
  gap?: SectionHeaderGap;
  /** Background context for WCAG-compliant contrast */
  colorScheme?: SectionHeaderColorScheme;
  /** Theme inversion */
  inverted?: boolean;
}
