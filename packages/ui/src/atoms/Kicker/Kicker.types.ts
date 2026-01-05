import type { HTMLAttributes } from "react";

export interface KickerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "muted" | "accent";
  /** Background context for WCAG-compliant contrast */
  colorScheme?: "on-dark" | "on-light" | "on-mid";
}

export interface KickerVariants {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "muted" | "accent";
  /** Background context for WCAG-compliant contrast */
  colorScheme?: "on-dark" | "on-light" | "on-mid";
  /** Additional CSS classes */
  className?: string;
}
