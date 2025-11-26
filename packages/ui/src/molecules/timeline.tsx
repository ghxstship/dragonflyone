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
  /** Custom className */
  className?: string;
}

const statusConfig = {
  completed: { bgClass: "bg-black", borderClass: "border-black", textClass: "text-white" },
  current: { bgClass: "bg-white", borderClass: "border-grey-700", textClass: "text-grey-700" },
  upcoming: { bgClass: "bg-grey-400", borderClass: "border-grey-400", textClass: "text-white" },
  error: { bgClass: "bg-grey-500", borderClass: "border-grey-500", textClass: "text-white" },
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
      className={clsx(
        "flex",
        isVertical ? "flex-col" : "flex-row overflow-x-auto",
        compact ? "gap-3" : "gap-5",
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
              compact ? "gap-3" : "gap-4",
              onItemClick && "cursor-pointer",
              !isVertical && "min-w-[200px] flex-shrink-0"
            )}
          >
            {/* Timeline indicator */}
            <div
              className={clsx(
                "flex items-center flex-shrink-0",
                isVertical ? "flex-col" : "flex-row"
              )}
            >
              {/* Dot/Icon */}
              <div
                className={clsx(
                  "rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  compact ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs",
                  item.status === "current" ? "bg-white" : status.bgClass,
                  status.borderClass,
                  item.status === "current" ? status.textClass : "text-white"
                )}
              >
                {item.icon || (item.status === "completed" ? "✓" : index + 1)}
              </div>

              {/* Connector line */}
              {showConnectors && !isLast && (
                <div
                  className={clsx(
                    "flex-1",
                    isVertical ? "w-0.5 min-h-6" : "h-0.5 min-w-6",
                    item.status === "completed" ? "bg-black" : "bg-grey-300"
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
              <div className="flex items-start justify-between gap-3 mb-1">
                <h4
                  className={clsx(
                    "font-heading text-black uppercase tracking-wide leading-relaxed",
                    compact ? "text-h6-md" : "text-h5-md"
                  )}
                >
                  {item.title}
                </h4>
                <span className="font-code text-mono-xs text-grey-500 tracking-widest whitespace-nowrap">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p
                  className={clsx(
                    "font-body text-grey-700 mb-2",
                    compact ? "text-body-sm" : "text-body-md"
                  )}
                >
                  {item.description}
                </p>
              )}

              {/* User */}
              {item.user && (
                <div className="flex items-center gap-2 mt-2">
                  {item.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-5 h-5 rounded-full object-cover grayscale"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-grey-700 flex items-center justify-center font-code text-mono-xxs text-white">
                      {getInitials(item.user.name)}
                    </div>
                  )}
                  <span className="font-code text-mono-xs text-grey-600">
                    {item.user.name}
                  </span>
                </div>
              )}

              {/* Metadata */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="font-code text-mono-xs text-grey-600 px-1.5 py-0.5 bg-grey-100 tracking-wide"
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
