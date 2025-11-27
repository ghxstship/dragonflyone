import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "inverse" | "success" | "warning" | "error" | "info";
  showLabel?: boolean;
  inverted?: boolean;
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { value, max = 100, size = "md", variant = "default", showLabel = false, inverted = false, className, ...props },
    ref
  ) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    const sizeClasses = {
      sm: "h-spacing-1",
      md: "h-spacing-2",
      lg: "h-spacing-3",
    };

    // Background classes - inverted swaps default/inverse variants
    const bgClasses = {
      default: inverted ? "bg-grey-800" : "bg-grey-200",
      inverse: inverted ? "bg-grey-200" : "bg-grey-900",
      success: inverted ? "bg-success-900" : "bg-success-100",
      warning: inverted ? "bg-warning-900" : "bg-warning-100",
      error: inverted ? "bg-error-900" : "bg-error-100",
      info: inverted ? "bg-info-900" : "bg-info-100",
    };

    // Fill classes - inverted swaps default/inverse variants
    const fillClasses = {
      default: inverted ? "bg-white" : "bg-black",
      inverse: inverted ? "bg-black" : "bg-white",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500",
      info: "bg-info-500",
    };

    // Label classes - inverted adjusts text colors
    const labelClasses = {
      default: inverted ? "text-grey-400" : "text-grey-500",
      inverse: inverted ? "text-grey-500" : "text-grey-400",
      success: inverted ? "text-success-300" : "text-success-700",
      warning: inverted ? "text-warning-300" : "text-warning-700",
      error: inverted ? "text-error-300" : "text-error-700",
      info: inverted ? "text-info-300" : "text-info-700",
    };

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        <div className={clsx("relative overflow-hidden", sizeClasses[size], bgClasses[variant])}>
          <div
            className={clsx("h-full transition-all duration-slow", fillClasses[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={clsx("mt-spacing-1 block font-code text-mono-xs", labelClasses[variant])}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }
);
