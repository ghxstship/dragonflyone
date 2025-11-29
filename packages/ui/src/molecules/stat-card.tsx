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
            ? "bg-grey-900 border-grey-700 shadow-[4px_4px_0_rgba(255,255,255,0.1)] hover:shadow-[6px_6px_0_rgba(255,255,255,0.15)]"
            : "bg-white border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]",
          className
        )}
        {...props}
      >
        {icon && (
          <div className={inverted ? "text-grey-400" : "text-grey-600"}>
            {icon}
          </div>
        )}
        <div className={clsx(
          "font-display text-4xl md:text-5xl leading-none uppercase tracking-tight",
          inverted ? "text-white" : "text-black"
        )}>
          {value}
        </div>
        <div className={clsx(
          "font-heading text-sm uppercase tracking-wider",
          inverted ? "text-grey-400" : "text-grey-600"
        )}>
          {label}
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "font-code text-xs uppercase tracking-widest font-bold",
                trend === "up" && (inverted ? "text-green-400" : "text-green-600"),
                trend === "down" && (inverted ? "text-red-400" : "text-red-600"),
                trend === "neutral" && (inverted ? "text-grey-400" : "text-grey-500")
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
