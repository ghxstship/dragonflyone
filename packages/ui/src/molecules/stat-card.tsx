import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  inverted?: boolean;
};

/**
 * StatCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px border
 * - Hard offset shadow
 * - Hover lift effect
 * - Clear visual hierarchy
 * 
 * Note: Defaults to inverted (dark) mode to match the dark-mode-first design system.
 * Use inverted={false} for light backgrounds.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  function StatCard({ value, label, icon, trend, trendValue, inverted = true, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "border-2 p-6 flex flex-col gap-3 rounded-[var(--radius-card)]",
          "transition-all duration-100 ease-[var(--ease-bounce)]",
          "hover:-translate-x-0.5 hover:-translate-y-0.5",
          inverted
            ? "bg-surface-inverse border-border shadow-md hover:shadow-lg"
            : "bg-surface-primary border-border-primary shadow-md hover:shadow-lg",
          className
        )}
        {...props}
      >
        {icon && (
          <div className={inverted ? "text-text-muted" : "text-text-muted"}>
            {icon}
          </div>
        )}
        <div className={clsx(
          "font-display text-4xl md:text-5xl leading-none uppercase tracking-tight",
          inverted ? "text-text-primary" : "text-text-primary"
        )}>
          {value}
        </div>
        <div className={clsx(
          "font-heading text-sm uppercase tracking-wider",
          inverted ? "text-text-muted" : "text-text-muted"
        )}>
          {label}
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "font-code text-xs uppercase tracking-widest font-bold",
                trend === "up" && (inverted ? "text-success-400" : "text-success-600"),
                trend === "down" && (inverted ? "text-error-400" : "text-error-600"),
                trend === "neutral" && (inverted ? "text-text-muted" : "text-text-muted")
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
          </div>
        )}
      </div>
    );
  }
);
