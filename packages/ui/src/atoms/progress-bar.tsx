import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "inverse" | "success" | "warning" | "error" | "info";
  showLabel?: boolean;
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { value, max = 100, size = "md", variant = "default", showLabel = false, className, ...props },
    ref
  ) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    const bgClasses = {
      default: "bg-grey-200",
      inverse: "bg-grey-900",
      success: "bg-success-100",
      warning: "bg-warning-100",
      error: "bg-error-100",
      info: "bg-info-100",
    };

    const fillClasses = {
      default: "bg-black",
      inverse: "bg-white",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500",
      info: "bg-info-500",
    };

    const labelClasses = {
      default: "text-grey-500",
      inverse: "text-grey-400",
      success: "text-success-700",
      warning: "text-warning-700",
      error: "text-error-700",
      info: "text-info-700",
    };

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        <div className={clsx("relative overflow-hidden", sizeClasses[size], bgClasses[variant])}>
          <div
            className={clsx("h-full transition-all duration-300", fillClasses[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={clsx("mt-1 block font-mono text-xs", labelClasses[variant])}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }
);
