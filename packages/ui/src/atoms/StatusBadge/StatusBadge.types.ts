import type { HTMLAttributes } from "react";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: "success" | "error" | "warning" | "info" | "neutral" | "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
  /** Use filled variant for higher emphasis */
  filled?: boolean;
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
}

export interface StatusBadgeVariants {
  status: "success" | "error" | "warning" | "info" | "neutral" | "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
  filled?: boolean;
  inverted?: boolean;
  className?: string;
}
