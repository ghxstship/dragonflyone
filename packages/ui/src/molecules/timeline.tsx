"use client";

import React from "react";
import clsx from "clsx";

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
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

// Status config for light mode
const statusConfigLight = {
  completed: { bgClass: "bg-black", borderClass: "border-black", textClass: "text-white", shadowClass: "shadow-[2px_2px_0_hsl(239,84%,67%)]" },
  current: { bgClass: "bg-white", borderClass: "border-black", textClass: "text-black", shadowClass: "shadow-[3px_3px_0_hsl(239,84%,67%)]" },
  upcoming: { bgClass: "bg-grey-200", borderClass: "border-grey-300", textClass: "text-grey-500", shadowClass: "shadow-[2px_2px_0_rgba(0,0,0,0.08)]" },
  error: { bgClass: "bg-error-500", borderClass: "border-error-500", textClass: "text-white", shadowClass: "shadow-[2px_2px_0_rgba(239,68,68,0.3)]" },
};

// Status config for dark/inverted mode
const statusConfigDark = {
  completed: { bgClass: "bg-white", borderClass: "border-white", textClass: "text-black", shadowClass: "shadow-[2px_2px_0_hsl(239,84%,67%)]" },
  current: { bgClass: "bg-ink-900", borderClass: "border-white", textClass: "text-white", shadowClass: "shadow-[3px_3px_0_hsl(239,84%,67%)]" },
  upcoming: { bgClass: "bg-grey-800", borderClass: "border-grey-600", textClass: "text-grey-400", shadowClass: "shadow-[2px_2px_0_rgba(255,255,255,0.1)]" },
  error: { bgClass: "bg-error-500", borderClass: "border-error-500", textClass: "text-white", shadowClass: "shadow-[2px_2px_0_rgba(239,68,68,0.3)]" },
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

/**
 * Timeline component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px borders on indicators
 * - Hard offset shadows with accent color
 * - Connector lines with proper styling
 * - Hover lift effect on clickable items
 */
export function Timeline({
  items,
  orientation = "vertical",
  showConnectors = true,
  compact = false,
  onItemClick,
  inverted = false,
  className = "",
}: TimelineProps) {
  const isVertical = orientation === "vertical";
  const statusConfig = inverted ? statusConfigDark : statusConfigLight;

  return (
    <div
      className={clsx(
        "flex",
        isVertical ? "flex-col" : "flex-row overflow-x-auto",
        compact ? "gap-2" : "gap-6",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = statusConfig[item.status || "completed"];

        return (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            role={onItemClick ? "button" : undefined}
            tabIndex={onItemClick ? 0 : undefined}
            className={clsx(
              "flex",
              isVertical ? "flex-row" : "flex-col",
              compact ? "gap-2" : "gap-4",
              onItemClick && "cursor-pointer",
              !isVertical && "min-w-48 shrink-0"
            )}
          >
            {/* Timeline indicator */}
            <div
              className={clsx(
                "flex shrink-0 items-center",
                isVertical ? "flex-col" : "flex-row"
              )}
            >
              {/* Dot/Icon */}
              <div
                className={clsx(
                  "flex shrink-0 items-center justify-center rounded-full border-2",
                  compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs",
                  status.bgClass,
                  status.borderClass,
                  status.textClass,
                  status.shadowClass
                )}
              >
                {item.icon || (item.status === "completed" ? "✓" : index + 1)}
              </div>

              {/* Connector line */}
              {showConnectors && !isLast && (
                <div
                  className={clsx(
                    "flex-1",
                    isVertical ? "min-h-6 w-0.5" : "h-0.5 min-w-6",
                    item.status === "completed"
                      ? inverted ? "bg-white" : "bg-black"
                      : inverted ? "bg-grey-700" : "bg-grey-300"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={clsx(
                "flex-1",
                isVertical && !isLast && (compact ? "pb-3" : "pb-5")
              )}
            >
              {/* Header */}
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4
                  className={clsx(
                    "font-heading uppercase leading-relaxed tracking-wide",
                    compact ? "text-sm" : "text-base",
                    inverted ? "text-white" : "text-black"
                  )}
                >
                  {item.title}
                </h4>
                <span className={clsx(
                  "whitespace-nowrap font-code text-xs tracking-widest",
                  inverted ? "text-grey-400" : "text-grey-500"
                )}>
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p
                  className={clsx(
                    "mb-2 font-body",
                    compact ? "text-sm" : "text-base",
                    inverted ? "text-grey-300" : "text-grey-700"
                  )}
                >
                  {item.description}
                </p>
              )}

              {/* User */}
              {item.user && (
                <div className="mt-2 flex items-center gap-1">
                  {item.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="h-5 w-5 rounded-full object-cover grayscale"
                    />
                  ) : (
                    <div className={clsx(
                      "flex h-5 w-5 items-center justify-center rounded-full font-code text-[10px]",
                      inverted ? "bg-grey-600 text-white" : "bg-grey-700 text-white"
                    )}>
                      {getInitials(item.user.name)}
                    </div>
                  )}
                  <span className={clsx(
                    "font-code text-xs",
                    inverted ? "text-grey-400" : "text-grey-600"
                  )}>
                    {item.user.name}
                  </span>
                </div>
              )}

              {/* Metadata */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className={clsx(
                        "px-1 py-0.5 font-code text-xs tracking-wide",
                        inverted ? "bg-grey-800 text-grey-400" : "bg-grey-100 text-grey-600"
                      )}
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
