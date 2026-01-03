"use client";

import React, { useMemo, ReactNode } from "react";
import clsx from "clsx";
import { Circle, CheckCircle2 } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface TimelineItem<T = unknown> {
  id: string;
  title: string;
  description?: string;
  date: Date;
  icon?: ReactNode;
  color?: string;
  status?: "pending" | "in_progress" | "completed";
  data?: T;
}

export interface TimelineGroup {
  label: string;
  items: TimelineItem[];
}

export type TimelineGrouping = "none" | "day" | "week" | "month" | "year";

export interface TimelineViewProps<T> {
  /** Items to display */
  items: TimelineItem<T>[];
  /** Grouping mode */
  groupBy?: TimelineGrouping;
  /** Sort order */
  sortOrder?: "asc" | "desc";
  /** Item click handler */
  onItemClick?: (item: TimelineItem<T>) => void;
  /** Custom item render */
  renderItem?: (item: TimelineItem<T>) => ReactNode;
  /** Show connector line */
  showConnector?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_COLORS = {
  pending: "bg-muted-foreground",
  in_progress: "bg-warning-500",
  completed: "bg-success-500",
};

const DEFAULT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatGroupLabel(date: Date, grouping: TimelineGrouping): string {
  switch (grouping) {
    case "day":
      return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    case "week":
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    case "month":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "year":
      return date.getFullYear().toString();
    default:
      return "";
  }
}

function getGroupKey(date: Date, grouping: TimelineGrouping): string {
  switch (grouping) {
    case "day":
      return date.toISOString().split("T")[0];
    case "week":
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split("T")[0];
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case "year":
      return date.getFullYear().toString();
    default:
      return "all";
  }
}

// =============================================================================
// TIMELINE ITEM COMPONENT
// =============================================================================

interface TimelineItemComponentProps<T> {
  item: TimelineItem<T>;
  index: number;
  isLast: boolean;
  showConnector: boolean;
  inverted: boolean;
  onClick?: () => void;
  renderItem?: (item: TimelineItem<T>) => ReactNode;
}

function TimelineItemComponent<T>({
  item,
  index,
  isLast,
  showConnector,
  inverted,
  onClick,
  renderItem,
}: TimelineItemComponentProps<T>) {
  const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

  const StatusIcon = item.status === "completed" ? CheckCircle2 : Circle;

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-full border-2",
            inverted ? "border-border bg-surface-elevated" : "border-border bg-surface-primary"
          )}
        >
          {item.icon || (
            <StatusIcon
              size={16}
              className={item.status ? STATUS_COLORS[item.status].replace("bg-", "text-") : ""}
              style={{ color: item.status ? undefined : color }}
            />
          )}
        </div>

        {/* Connector line */}
        {showConnector && !isLast && (
          <div
            className={clsx(
              "w-0.5 flex-1 min-h-[40px]",
              inverted ? "bg-border" : "bg-border"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div
        className={clsx(
          "flex-1 pb-6 cursor-pointer",
          onClick && "hover:opacity-80"
        )}
        onClick={onClick}
      >
        {renderItem ? (
          renderItem(item)
        ) : (
          <div
            className={clsx(
              "p-4 rounded-lg border-2 transition-all",
              inverted
                ? "bg-surface-elevated border-border hover:border-border-primary"
                : "bg-surface-primary border-border hover:border-border-primary"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4
                  className={clsx(
                    "font-semibold text-sm",
                    inverted ? "text-on-dark-primary" : "text-on-light-primary"
                  )}
                >
                  {item.title}
                </h4>
                {item.description && (
                  <p
                    className={clsx(
                      "text-sm mt-1",
                      inverted ? "text-on-dark-muted" : "text-on-light-muted"
                    )}
                  >
                    {item.description}
                  </p>
                )}
              </div>

              <time
                className={clsx(
                  "text-xs whitespace-nowrap",
                  inverted ? "text-on-dark-disabled" : "text-on-light-disabled"
                )}
              >
                {item.date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </div>

            {/* Status badge */}
            {item.status && (
              <div className="mt-2">
                <span
                  className={clsx(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    item.status === "completed" && "bg-success-100 text-success-700",
                    item.status === "in_progress" && "bg-warning-100 text-warning-700",
                    item.status === "pending" && (inverted ? "bg-surface-elevated text-on-dark-secondary" : "bg-muted text-on-light-secondary")
                  )}
                >
                  {item.status.replace("_", " ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TimelineView<T>({
  items,
  groupBy = "day",
  sortOrder = "desc",
  onItemClick,
  renderItem,
  showConnector = true,
  inverted = true,
  className,
  loading = false,
  emptyMessage = "No items to display",
}: TimelineViewProps<T>) {
  // Sort and group items
  const groupedItems = useMemo(() => {
    // Sort items
    const sorted = [...items].sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      return sortOrder === "asc" ? diff : -diff;
    });

    if (groupBy === "none") {
      return [{ label: "", items: sorted }];
    }

    // Group items
    const groups = new Map<string, TimelineItem<T>[]>();

    sorted.forEach((item) => {
      const key = getGroupKey(item.date, groupBy);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // Convert to array with labels
    return Array.from(groups.entries()).map(([_key, groupItems]) => ({
      label: formatGroupLabel(groupItems[0].date, groupBy),
      items: groupItems,
    }));
  }, [items, groupBy, sortOrder]);

  if (loading) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-64",
          className
        )}
      >
        <div
          className={clsx(
            "w-8 h-8 border-3 rounded-full animate-spin",
            inverted ? "border-border border-t-on-dark-primary" : "border-border border-t-on-light-primary"
          )}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-64 rounded-lg border-2 border-dashed",
          inverted ? "border-border text-on-dark-disabled" : "border-border text-on-light-disabled",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx("space-y-8", className)}>
      {groupedItems.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Group header */}
          {group.label && (
            <div
              className={clsx(
                "sticky top-0 z-sticky-header py-2 mb-4",
                inverted ? "bg-surface-inverse" : "bg-surface-primary"
              )}
            >
              <h3
                className={clsx(
                  "font-semibold text-sm uppercase tracking-wider",
                  inverted ? "text-on-dark-muted" : "text-on-light-muted"
                )}
              >
                {group.label}
              </h3>
            </div>
          )}

          {/* Items */}
          <div>
            {group.items.map((item, itemIndex) => (
              <TimelineItemComponent
                key={item.id}
                item={item}
                index={itemIndex}
                isLast={itemIndex === group.items.length - 1}
                showConnector={showConnector}
                inverted={inverted}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
                renderItem={renderItem}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimelineView;
