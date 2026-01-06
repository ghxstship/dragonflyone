"use client";

import React from "react";
import clsx from "clsx";
import { statsDashboardVariants, statCardVariants } from "./StatsDashboard.variants.js";
import type { 
  StatsDashboardProps,
  Stat
} from "./StatsDashboard.types.js";

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

/**
 * StatsDashboard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px borders on stat cards
 * - Hard offset shadows
 * - Hover lift effects
 * - Clear visual hierarchy
 * - Responsive grid layout
 * - Multiple formatting options
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
    up: inverted ? "text-success-400" : "text-success-600",
    down: inverted ? "text-error-400" : "text-error-600",
    neutral: inverted ? "text-text-muted" : "text-text-muted",
  };

  return (
    <div className={clsx(statsDashboardVariants({ columns, compact }), className)}>
      {stats.map((stat) => (
        <div
          key={stat.id}
          onClick={() => onStatClick?.(stat)}
          role={onStatClick ? "button" : undefined}
          tabIndex={onStatClick ? 0 : undefined}
          className={clsx(
            statCardVariants({ 
              compact, 
              
              clickable: !!onStatClick 
            }),
            onStatClick && inverted
              ? "hover:bg-surface-elevated hover:shadow-[6px_6px_0_rgba(255,255,255,0.15)]"
              : onStatClick
              ? "hover:bg-muted hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]"
              : ""
          )}
        >
          {/* Header with icon */}
          <div className="flex items-start justify-between gap-2">
            <span
              className={clsx(
                "font-code tracking-widest uppercase font-bold",
                compact ? "text-[10px]" : "text-xs",
                inverted ? "text-text-muted" : "text-text-muted"
              )}
            >
              {stat.label}
            </span>
            {stat.icon && (
              <span className={clsx(
                compact ? "text-sm" : "text-lg",
                inverted ? "text-text-disabled" : "text-text-muted"
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
                  inverted ? "text-text-disabled" : "text-text-muted"
                )}>
                  {stat.changeLabel}
                </span>
              )}
              {stat.previousValue !== undefined && !stat.changeLabel && (
                <span className={clsx(
                  "font-code text-xs tracking-wide",
                  inverted ? "text-text-disabled" : "text-text-muted"
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
    up: inverted ? "text-success-400" : "text-success-600",
    down: inverted ? "text-error-400" : "text-error-600",
    neutral: inverted ? "text-text-muted" : "text-text-muted",
  };

  return (
    <div
      className={clsx(
        statCardVariants({ 
          compact: false, 
          
          clickable: !!onClick 
        }),
        onClick && inverted
          ? "hover:bg-surface-elevated hover:shadow-[6px_6px_0_rgba(255,255,255,0.15)]"
          : onClick
          ? "hover:bg-muted hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]"
          : "",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={clsx(
          "font-code text-xs tracking-widest uppercase font-bold",
          inverted ? "text-text-muted" : "text-text-muted"
        )}>
          {label}
        </span>
        {icon && (
          <span className={clsx(
            "text-lg",
            inverted ? "text-text-disabled" : "text-text-muted"
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
