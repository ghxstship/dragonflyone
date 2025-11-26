import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  function StatCard({ value, label, icon, trend, trendValue, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("bg-white border-2 border-black p-6 flex flex-col gap-3", className)}
        {...props}
      >
        {icon ? <div className="text-black">{icon}</div> : null}
        <div className="font-display text-display-md leading-none uppercase tracking-tightest text-black">
          {value}
        </div>
        <div className="font-heading text-h6-sm uppercase tracking-wider text-black">
          {label}
        </div>
        {trend && trendValue ? (
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "font-code text-mono-xs uppercase tracking-widest",
                trend === "up" && "text-black",
                trend === "down" && "text-grey-600",
                trend === "neutral" && "text-grey-500"
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
          </div>
        ) : null}
      </div>
    );
  }
);
