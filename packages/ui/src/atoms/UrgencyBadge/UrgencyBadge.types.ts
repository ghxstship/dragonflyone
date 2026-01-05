export interface UrgencyBadgeProps {
  /** Type of urgency indicator */
  type: "low-stock" | "selling-fast" | "last-chance" | "limited" | "ending-soon" | "new";
  /** Custom count (e.g., "Only 5 left") */
  count?: number;
  /** Animate the badge */
  animated?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

export interface UrgencyBadgeVariants {
  type: "low-stock" | "selling-fast" | "last-chance" | "limited" | "ending-soon" | "new";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  inverted?: boolean;
  className?: string;
}
