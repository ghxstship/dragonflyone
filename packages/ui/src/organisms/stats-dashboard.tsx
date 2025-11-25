"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

export function StatsDashboard({
  stats,
  columns = 4,
  showTrends = true,
  compact = false,
  onStatClick,
  className = "",
}: StatsDashboardProps) {
  const gridColumns = {
    2: "repeat(2, 1fr)",
    3: "repeat(3, 1fr)",
    4: "repeat(2, 1fr)",
    5: "repeat(5, 1fr)",
    6: "repeat(3, 1fr)",
  };

  const gridColumnsMd = {
    2: "repeat(2, 1fr)",
    3: "repeat(3, 1fr)",
    4: "repeat(4, 1fr)",
    5: "repeat(5, 1fr)",
    6: "repeat(6, 1fr)",
  };

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns[columns],
        gap: compact ? "0.75rem" : "1rem",
      }}
    >
      <style>
        {`
          @media (min-width: 768px) {
            .stats-dashboard-grid {
              grid-template-columns: ${gridColumnsMd[columns]} !important;
            }
          }
        `}
      </style>
      {stats.map((stat) => {
        const trendColor =
          stat.trend === "up"
            ? colors.black
            : stat.trend === "down"
            ? colors.grey500
            : colors.grey600;

        return (
          <div
            key={stat.id}
            onClick={() => onStatClick?.(stat)}
            role={onStatClick ? "button" : undefined}
            tabIndex={onStatClick ? 0 : undefined}
            style={{
              padding: compact ? "1rem" : "1.5rem",
              backgroundColor: colors.white,
              border: `${borderWidths.medium} solid ${colors.black}`,
              cursor: onStatClick ? "pointer" : "default",
              transition: transitions.base,
              display: "flex",
              flexDirection: "column",
              gap: compact ? "0.5rem" : "0.75rem",
            }}
          >
            {/* Header with icon */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: typography.mono,
                  fontSize: compact ? fontSizes.monoXS : fontSizes.monoSM,
                  color: colors.grey600,
                  letterSpacing: letterSpacing.widest,
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </span>
              {stat.icon && (
                <span
                  style={{
                    fontSize: compact ? "16px" : "20px",
                    color: colors.grey500,
                  }}
                >
                  {stat.icon}
                </span>
              )}
            </div>

            {/* Value */}
            <div
              style={{
                fontFamily: typography.heading,
                fontSize: compact ? fontSizes.h3MD : fontSizes.h2MD,
                color: colors.black,
                letterSpacing: letterSpacing.tight,
                lineHeight: 1,
              }}
            >
              {formatValue(stat.value, stat.format)}
            </div>

            {/* Trend and change */}
            {showTrends && (stat.change !== undefined || stat.previousValue !== undefined) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {stat.change !== undefined && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontFamily: typography.mono,
                      fontSize: fontSizes.monoXS,
                      color: trendColor,
                      letterSpacing: letterSpacing.wide,
                    }}
                  >
                    {stat.trend === "up" && "↑"}
                    {stat.trend === "down" && "↓"}
                    {formatChange(stat.change)}
                  </span>
                )}
                {stat.changeLabel && (
                  <span
                    style={{
                      fontFamily: typography.mono,
                      fontSize: fontSizes.monoXS,
                      color: colors.grey500,
                      letterSpacing: letterSpacing.wide,
                    }}
                  >
                    {stat.changeLabel}
                  </span>
                )}
                {stat.previousValue !== undefined && !stat.changeLabel && (
                  <span
                    style={{
                      fontFamily: typography.mono,
                      fontSize: fontSizes.monoXS,
                      color: colors.grey500,
                      letterSpacing: letterSpacing.wide,
                    }}
                  >
                    vs {formatValue(stat.previousValue, stat.format)}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
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
  const trendColor =
    trend === "up" ? colors.black : trend === "down" ? colors.grey500 : colors.grey600;

  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        padding: "1.5rem",
        backgroundColor: colors.white,
        border: `${borderWidths.medium} solid ${colors.black}`,
        cursor: onClick ? "pointer" : "default",
        transition: transitions.base,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoSM,
            color: colors.grey600,
            letterSpacing: letterSpacing.widest,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ fontSize: "20px", color: colors.grey500 }}>{icon}</span>
        )}
      </div>

      <div
        style={{
          fontFamily: typography.heading,
          fontSize: fontSizes.h2MD,
          color: colors.black,
          letterSpacing: letterSpacing.tight,
          lineHeight: 1,
          marginBottom: change !== undefined ? "0.75rem" : 0,
        }}
      >
        {formatValue(value, format)}
      </div>

      {change !== undefined && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontFamily: typography.mono,
            fontSize: fontSizes.monoXS,
            color: trendColor,
            letterSpacing: letterSpacing.wide,
          }}
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
