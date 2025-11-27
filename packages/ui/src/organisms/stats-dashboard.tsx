"use client";

import React from "react";
import clsx from "clsx";

export interface Stat {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "currency" | "percent";
}

export interface StatsDashboardProps {
  /** Stats to display */
  stats: Stat[];
  /** Number of columns */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Show trend indicators */
  showTrends?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Stat click handler */
  onStatClick?: (stat: Stat) => void;
  /** Custom className */
  className?: string;
}

function formatValue(value: string | number, format?: Stat["format"]): string {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

const gridClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

const trendClasses = {
  up: "text-black",
  down: "text-grey-500",
  neutral: "text-grey-600",
};

export function StatsDashboard({
  stats,
  columns = 4,
  showTrends = true,
  compact = false,
  onStatClick,
  className = "",
}: StatsDashboardProps) {
  return (
    <div
      className={clsx(
        "grid",
        gridClasses[columns],
        compact ? "gap-3" : "gap-4",
        className
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.id}
          onClick={() => onStatClick?.(stat)}
          role={onStatClick ? "button" : undefined}
          tabIndex={onStatClick ? 0 : undefined}
          className={clsx(
            "bg-white border-2 border-black flex flex-col transition-colors duration-base",
            compact ? "p-4 gap-2" : "p-6 gap-3",
            onStatClick && "cursor-pointer hover:bg-grey-50"
          )}
        >
          {/* Header with icon */}
          <div className="flex items-start justify-between gap-2">
            <span
              className={clsx(
                "font-code text-grey-600 tracking-widest uppercase",
                compact ? "text-mono-xs" : "text-mono-sm"
              )}
            >
              {stat.label}
            </span>
            {stat.icon && (
              <span className={clsx("text-grey-500", compact ? "text-body-sm" : "text-body-lg")}>
                {stat.icon}
              </span>
            )}
          </div>

          {/* Value */}
          <div
            className={clsx(
              "font-heading text-black tracking-tight leading-none",
              compact ? "text-h3-md" : "text-h2-md"
            )}
          >
            {formatValue(stat.value, stat.format)}
          </div>

          {/* Trend and change */}
          {showTrends && (stat.change !== undefined || stat.previousValue !== undefined) && (
            <div className="flex items-center gap-2 flex-wrap">
              {stat.change !== undefined && (
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 font-code text-mono-xs tracking-wide",
                    trendClasses[stat.trend || "neutral"]
                  )}
                >
                  {stat.trend === "up" && "↑"}
                  {stat.trend === "down" && "↓"}
                  {formatChange(stat.change)}
                </span>
              )}
              {stat.changeLabel && (
                <span className="font-code text-mono-xs text-grey-500 tracking-wide">
                  {stat.changeLabel}
                </span>
              )}
              {stat.previousValue !== undefined && !stat.changeLabel && (
                <span className="font-code text-mono-xs text-grey-500 tracking-wide">
                  vs {formatValue(stat.previousValue, stat.format)}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Single stat card component */
export function StatCard({
  label,
  value,
  change,
  trend,
  format,
  icon,
  onClick,
  className = "",
}: {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  format?: Stat["format"];
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "p-6 bg-white border-2 border-black transition-colors duration-base",
        onClick && "cursor-pointer hover:bg-grey-50",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-code text-mono-sm text-grey-600 tracking-widest uppercase">
          {label}
        </span>
        {icon && (
          <span className="text-body-lg text-grey-500">{icon}</span>
        )}
      </div>

      <div
        className={clsx(
          "font-heading text-h2-md text-black tracking-tight leading-none",
          change !== undefined && "mb-3"
        )}
      >
        {formatValue(value, format)}
      </div>

      {change !== undefined && (
        <span
          className={clsx(
            "inline-flex items-center gap-1 font-code text-mono-xs tracking-wide",
            trendClasses[trend || "neutral"]
          )}
        >
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          {formatChange(change)}
        </span>
      )}
    </div>
  );
}

export default StatsDashboard;
