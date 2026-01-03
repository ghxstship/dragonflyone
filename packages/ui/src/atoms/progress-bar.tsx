import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "inverse" | "success" | "warning" | "error" | "info" | "pop";
  showLabel?: boolean;
  inverted?: boolean;
};

/**
 * ProgressBar component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px border track
 * - Chunky indicator
 * - Hard offset shadow on track
 * - Pop variant with accent shadow
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { value, max = 100, size = "md", variant = "default", showLabel = false, inverted = false, className, ...props },
    ref
  ) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    const sizeClasses = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    };

    // Background/track classes
    const getTrackClasses = () => {
      const base = "border-2 rounded-[var(--radius-circle)]";
      
      if (variant === "pop") {
        return clsx(
          base,
          inverted
            ? "bg-surface-inverse border-on-dark-primary shadow-primary"
            : "bg-muted border-on-light-primary shadow-primary"
        );
      }
      
      if (inverted) {
        switch (variant) {
          case "default": return clsx(base, "bg-surface-elevated border-border shadow-xs");
          case "inverse": return clsx(base, "bg-muted border-border shadow-xs");
          case "success": return clsx(base, "bg-success-900 border-success-500 shadow-xs");
          case "warning": return clsx(base, "bg-warning-900 border-warning-500 shadow-xs");
          case "error": return clsx(base, "bg-error-900 border-error-500 shadow-xs");
          case "info": return clsx(base, "bg-info-900 border-info-500 shadow-xs");
          default: return base;
        }
      } else {
        switch (variant) {
          case "default": return clsx(base, "bg-muted border-border shadow-xs");
          case "inverse": return clsx(base, "bg-surface-inverse border-border shadow-xs");
          case "success": return clsx(base, "bg-success-100 border-success-300 shadow-xs");
          case "warning": return clsx(base, "bg-warning-100 border-warning-300 shadow-xs");
          case "error": return clsx(base, "bg-error-100 border-error-300 shadow-xs");
          case "info": return clsx(base, "bg-info-100 border-info-300 shadow-xs");
          default: return base;
        }
      }
    };

    // Fill/indicator classes
    const fillClasses = {
      default: inverted ? "bg-surface-inverse" : "bg-surface-primary",
      inverse: inverted ? "bg-surface-primary" : "bg-surface-inverse",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500",
      info: "bg-info-500",
      pop: inverted ? "bg-surface-inverse" : "bg-surface-primary",
    };

    // Label classes
    const labelClasses = {
      default: inverted ? "text-text-muted" : "text-text-muted",
      inverse: inverted ? "text-text-disabled" : "text-text-muted",
      success: inverted ? "text-success-300" : "text-success-700",
      warning: inverted ? "text-warning-300" : "text-warning-700",
      error: inverted ? "text-error-300" : "text-error-700",
      info: inverted ? "text-info-300" : "text-info-700",
      pop: inverted ? "text-text-secondary" : "text-text-muted",
    };

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        <div 
          className={clsx("relative overflow-hidden", sizeClasses[size], getTrackClasses())}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={props['aria-label'] || `Progress: ${percentage.toFixed(0)}%`}
        >
          <div
            className={clsx(
              "h-full rounded-[var(--radius-circle)] transition-all duration-200 ease-[var(--ease-bounce)]",
              fillClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={clsx("mt-1 block font-code text-xs font-bold", labelClasses[variant])} aria-hidden="true">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }
);
