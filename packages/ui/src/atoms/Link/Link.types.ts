import type { AnchorHTMLAttributes } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Visual style variant */
  variant?: "default" | "nav" | "footer" | "inline" | "button";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Prefetch hint - when true, adds data-prefetch attribute for router integration */
  prefetch?: boolean;
  /** Callback for hover-based prefetch trigger */
  onPrefetch?: () => void;
}
