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
  /** Inverted theme (dark background) */
  inverted?: boolean;
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

/**
 * StatsDashboard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px borders on stat cards
 * - Hard offset shadows
 * - Hover lift effects
 * - Clear visual hierarchy
 */
export function StatsDashboard({
  stats,
  columns = 4,
  showTrends = true,
  compact = false,
  onStatClick,
  inverted = false,
  className = "",
}: StatsDashboardProps) {
  const trendClasses = {
    up: inverted ? "text-green-400" : "text-green-600",
    down: inverted ? "text-red-400" : "text-red-600",
    neutral: inverted ? "text-grey-400" : "text-grey-500",
  };

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
            "border-2 flex flex-col rounded-[var(--radius-card)]",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            compact ? "p-4 gap-2" : "p-6 gap-3",
            inverted
              ? "bg-grey-900 border-grey-700 shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
              : "bg-white border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]",
            onStatClick && clsx(
              "cursor-pointer",
              "hover:-translate-x-0.5 hover:-translate-y-0.5",
              inverted
                ? "hover:bg-grey-800 hover:shadow-[6px_6px_0_rgba(255,255,255,0.15)]"
                : "hover:bg-grey-50 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]"
            )
          )}
        >
          {/* Header with icon */}
          <div className="flex items-start justify-between gap-2">
            <span
              className={clsx(
                "font-code tracking-widest uppercase font-bold",
                compact ? "text-[10px]" : "text-xs",
                inverted ? "text-grey-400" : "text-grey-600"
              )}
            >
              {stat.label}
            </span>
            {stat.icon && (
              <span className={clsx(
                compact ? "text-sm" : "text-lg",
                inverted ? "text-grey-500" : "text-grey-400"
              )}>
                {stat.icon}
              </span>
            )}
          </div>

          {/* Value */}
          <div
            className={clsx(
              "font-display tracking-tight leading-none uppercase",
              compact ? "text-2xl" : "text-4xl",
              inverted ? "text-white" : "text-black"
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
                    "inline-flex items-center gap-1 font-code text-xs tracking-wide font-bold",
                    trendClasses[stat.trend || "neutral"]
                  )}
                >
                  {stat.trend === "up" && "↑"}
                  {stat.trend === "down" && "↓"}
                  {formatChange(stat.change)}
                </span>
              )}
              {stat.changeLabel && (
                <span className={clsx(
                  "font-code text-xs tracking-wide",
                  inverted ? "text-grey-500" : "text-grey-400"
                )}>
                  {stat.changeLabel}
                </span>
              )}
              {stat.previousValue !== undefined && !stat.changeLabel && (
                <span className={clsx(
                  "font-code text-xs tracking-wide",
                  inverted ? "text-grey-500" : "text-grey-400"
                )}>
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

/** 
 * Single stat card component - Bold Contemporary Pop Art Adventure
 * 
 * Note: For new implementations, prefer using the StatCard from molecules/stat-card.tsx
 * which has full inverted theme support.
 */
export function StatCard({
  label,
  value,
  change,
  trend,
  format,
  icon,
  onClick,
  inverted = false,
  className = "",
}: {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  format?: Stat["format"];
  icon?: React.ReactNode;
  onClick?: () => void;
  inverted?: boolean;
  className?: string;
}) {
  const trendClasses = {
    up: inverted ? "text-green-400" : "text-green-600",
    down: inverted ? "text-red-400" : "text-red-600",
    neutral: inverted ? "text-grey-400" : "text-grey-500",
  };

  return (
    <div
      className={clsx(
        "p-6 border-2 rounded-[var(--radius-card)]",
        "transition-all duration-100 ease-[var(--ease-bounce)]",
        inverted
          ? "bg-grey-900 border-grey-700 shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
          : "bg-white border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]",
        onClick && clsx(
          "cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5",
          inverted
            ? "hover:bg-grey-800 hover:shadow-[6px_6px_0_rgba(255,255,255,0.15)]"
            : "hover:bg-grey-50 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]"
        ),
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={clsx(
          "font-code text-xs tracking-widest uppercase font-bold",
          inverted ? "text-grey-400" : "text-grey-600"
        )}>
          {label}
        </span>
        {icon && (
          <span className={clsx(
            "text-lg",
            inverted ? "text-grey-500" : "text-grey-400"
          )}>{icon}</span>
        )}
      </div>

      <div
        className={clsx(
          "font-display text-4xl tracking-tight leading-none uppercase",
          inverted ? "text-white" : "text-black",
          change !== undefined && "mb-3"
        )}
      >
        {formatValue(value, format)}
      </div>

      {change !== undefined && (
        <span
          className={clsx(
            "inline-flex items-center gap-1 font-code text-xs tracking-wide font-bold",
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
