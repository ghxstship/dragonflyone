"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
  status?: "completed" | "current" | "upcoming" | "error";
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, string>;
}

export interface TimelineProps {
  /** Timeline items */
  items: TimelineItem[];
  /** Layout orientation */
  orientation?: "vertical" | "horizontal";
  /** Show connector lines */
  showConnectors?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Item click handler */
  onItemClick?: (item: TimelineItem) => void;
  /** Custom className */
  className?: string;
}

const statusColors = {
  completed: colors.black,
  current: colors.grey700,
  upcoming: colors.grey400,
  error: colors.grey500,
};

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "JUST NOW";
  if (diffMins < 60) return `${diffMins}M AGO`;
  if (diffHours < 24) return `${diffHours}H AGO`;
  if (diffDays < 7) return `${diffDays}D AGO`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }).toUpperCase();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Timeline({
  items,
  orientation = "vertical",
  showConnectors = true,
  compact = false,
  onItemClick,
  className = "",
}: TimelineProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        gap: compact ? "0.75rem" : "1.25rem",
        overflowX: isVertical ? "visible" : "auto",
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const statusColor = statusColors[item.status || "completed"];

        return (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            role={onItemClick ? "button" : undefined}
            tabIndex={onItemClick ? 0 : undefined}
            style={{
              display: "flex",
              flexDirection: isVertical ? "row" : "column",
              gap: compact ? "0.75rem" : "1rem",
              cursor: onItemClick ? "pointer" : "default",
              minWidth: isVertical ? "auto" : "200px",
              flex: isVertical ? "none" : "0 0 auto",
            }}
          >
            {/* Timeline indicator */}
            <div
              style={{
                display: "flex",
                flexDirection: isVertical ? "column" : "row",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {/* Dot/Icon */}
              <div
                style={{
                  width: compact ? "24px" : "32px",
                  height: compact ? "24px" : "32px",
                  borderRadius: "50%",
                  backgroundColor: item.status === "current" ? colors.white : statusColor,
                  border: `${borderWidths.medium} solid ${statusColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.status === "current" ? statusColor : colors.white,
                  fontSize: compact ? "10px" : "12px",
                  flexShrink: 0,
                }}
              >
                {item.icon || (item.status === "completed" ? "✓" : index + 1)}
              </div>

              {/* Connector line */}
              {showConnectors && !isLast && (
                <div
                  style={{
                    width: isVertical ? borderWidths.medium : "100%",
                    height: isVertical ? "100%" : borderWidths.medium,
                    minWidth: isVertical ? "auto" : "24px",
                    minHeight: isVertical ? "24px" : "auto",
                    backgroundColor:
                      item.status === "completed" ? colors.black : colors.grey300,
                    flex: 1,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                paddingBottom: isVertical && !isLast ? (compact ? "0.75rem" : "1.25rem") : 0,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  marginBottom: "0.25rem",
                }}
              >
                <h4
                  style={{
                    fontFamily: typography.heading,
                    fontSize: compact ? fontSizes.h6MD : fontSizes.h5MD,
                    color: colors.black,
                    textTransform: "uppercase",
                    letterSpacing: letterSpacing.wide,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {item.title}
                </h4>
                <span
                  style={{
                    fontFamily: typography.mono,
                    fontSize: fontSizes.monoXS,
                    color: colors.grey500,
                    letterSpacing: letterSpacing.widest,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p
                  style={{
                    fontFamily: typography.body,
                    fontSize: compact ? fontSizes.bodySM : fontSizes.bodyMD,
                    color: colors.grey700,
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.description}
                </p>
              )}

              {/* User */}
              {item.user && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {item.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        filter: "grayscale(100%)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: colors.grey700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: typography.mono,
                        fontSize: fontSizes.monoXXS,
                        color: colors.white,
                      }}
                    >
                      {getInitials(item.user.name)}
                    </div>
                  )}
                  <span
                    style={{
                      fontFamily: typography.mono,
                      fontSize: fontSizes.monoXS,
                      color: colors.grey600,
                    }}
                  >
                    {item.user.name}
                  </span>
                </div>
              )}

              {/* Metadata */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      style={{
                        fontFamily: typography.mono,
                        fontSize: fontSizes.monoXS,
                        color: colors.grey600,
                        padding: "0.125rem 0.375rem",
                        backgroundColor: colors.grey100,
                        letterSpacing: letterSpacing.wide,
                      }}
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
