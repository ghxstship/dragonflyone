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
      const base = "border-2 rounded-full";
      
      if (variant === "pop") {
        return clsx(
          base,
          inverted
            ? "bg-ink-900 border-white shadow-[3px_3px_0_hsl(239,84%,67%)]"
            : "bg-grey-100 border-black shadow-[3px_3px_0_hsl(239,84%,67%)]"
        );
      }
      
      if (inverted) {
        switch (variant) {
          case "default": return clsx(base, "bg-grey-800 border-grey-600 shadow-[2px_2px_0_rgba(255,255,255,0.1)]");
          case "inverse": return clsx(base, "bg-grey-200 border-grey-400 shadow-[2px_2px_0_rgba(255,255,255,0.1)]");
          case "success": return clsx(base, "bg-success-900 border-success-500 shadow-[2px_2px_0_rgba(34,197,94,0.2)]");
          case "warning": return clsx(base, "bg-warning-900 border-warning-500 shadow-[2px_2px_0_rgba(245,158,11,0.2)]");
          case "error": return clsx(base, "bg-error-900 border-error-500 shadow-[2px_2px_0_rgba(239,68,68,0.2)]");
          case "info": return clsx(base, "bg-info-900 border-info-500 shadow-[2px_2px_0_rgba(59,130,246,0.2)]");
          default: return base;
        }
      } else {
        switch (variant) {
          case "default": return clsx(base, "bg-grey-200 border-grey-300 shadow-[2px_2px_0_rgba(0,0,0,0.08)]");
          case "inverse": return clsx(base, "bg-grey-900 border-grey-700 shadow-[2px_2px_0_rgba(0,0,0,0.08)]");
          case "success": return clsx(base, "bg-success-100 border-success-300 shadow-[2px_2px_0_rgba(34,197,94,0.15)]");
          case "warning": return clsx(base, "bg-warning-100 border-warning-300 shadow-[2px_2px_0_rgba(245,158,11,0.15)]");
          case "error": return clsx(base, "bg-error-100 border-error-300 shadow-[2px_2px_0_rgba(239,68,68,0.15)]");
          case "info": return clsx(base, "bg-info-100 border-info-300 shadow-[2px_2px_0_rgba(59,130,246,0.15)]");
          default: return base;
        }
      }
    };

    // Fill/indicator classes
    const fillClasses = {
      default: inverted ? "bg-white" : "bg-black",
      inverse: inverted ? "bg-black" : "bg-white",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500",
      info: "bg-info-500",
      pop: inverted ? "bg-white" : "bg-black",
    };

    // Label classes
    const labelClasses = {
      default: inverted ? "text-grey-400" : "text-grey-600",
      inverse: inverted ? "text-grey-600" : "text-grey-400",
      success: inverted ? "text-success-300" : "text-success-700",
      warning: inverted ? "text-warning-300" : "text-warning-700",
      error: inverted ? "text-error-300" : "text-error-700",
      info: inverted ? "text-info-300" : "text-info-700",
      pop: inverted ? "text-grey-300" : "text-grey-700",
    };

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        <div className={clsx("relative overflow-hidden", sizeClasses[size], getTrackClasses())}>
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-200 ease-[var(--ease-bounce)]",
              fillClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={clsx("mt-1 block font-code text-xs font-bold", labelClasses[variant])}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }
);
