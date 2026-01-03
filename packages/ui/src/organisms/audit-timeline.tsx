"use client";

import React from "react";
import clsx from "clsx";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MessageSquare,
  FileText,
  Link2,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";

export type AuditEventType =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "comment"
  | "attachment"
  | "link"
  | "assign"
  | "status_change"
  | "custom";

export interface AuditFieldChange {
  field: string;
  fieldLabel?: string;
  previousValue: unknown;
  newValue: unknown;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: string | Date;
  userId: string;
  userName: string;
  userAvatar?: string;
  description?: string;
  changes?: AuditFieldChange[];
  metadata?: Record<string, unknown>;
}

export interface AuditTimelineProps {
  events: AuditEvent[];
  loading?: boolean;
  emptyMessage?: string;
  maxHeight?: string;
  showFieldChanges?: boolean;
  formatTimestamp?: (timestamp: string | Date) => string;
  formatValue?: (value: unknown, field: string) => React.ReactNode;
  onEventClick?: (event: AuditEvent) => void;
  className?: string;
}

const eventIcons: Record<AuditEventType, React.ReactNode> = {
  create: <Plus className="size-4" />,
  update: <Pencil className="size-4" />,
  delete: <Trash2 className="size-4" />,
  view: <Eye className="size-4" />,
  comment: <MessageSquare className="size-4" />,
  attachment: <FileText className="size-4" />,
  link: <Link2 className="size-4" />,
  assign: <User className="size-4" />,
  status_change: <ArrowRight className="size-4" />,
  custom: <Clock className="size-4" />,
};

const eventColors: Record<AuditEventType, string> = {
  create: "bg-success-500 text-white",
  update: "bg-primary-500 text-white",
  delete: "bg-error-500 text-white",
  view: "bg-muted text-white",
  comment: "bg-secondary-500 text-white",
  attachment: "bg-accent-500 text-black",
  link: "bg-info-500 text-white",
  assign: "bg-warning-500 text-black",
  status_change: "bg-primary-600 text-white",
  custom: "bg-muted text-white",
};

function defaultFormatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function defaultFormatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-on-dark-muted italic">empty</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function AuditTimeline({
  events,
  loading = false,
  emptyMessage = "No activity yet",
  maxHeight,
  showFieldChanges = true,
  formatTimestamp = defaultFormatTimestamp,
  formatValue = defaultFormatValue,
  onEventClick,
  className = "",
}: AuditTimelineProps) {
  if (loading) {
    return (
      <div className={clsx("flex items-center justify-center py-spacing-12", className)}>
        <div className="w-spacing-6 h-spacing-6 border-2 border-border border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={clsx("text-center py-spacing-12 text-on-dark-disabled font-code text-mono-sm", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={clsx("relative", className)}
      style={{ maxHeight, overflowY: maxHeight ? "auto" : undefined }}
    >
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" aria-hidden="true" />

      <ul className="space-y-spacing-4" role="list" aria-label="Activity timeline">
        {events.map((event, index) => (
          <li
            key={event.id}
            className={clsx(
              "relative pl-spacing-10",
              onEventClick && "cursor-pointer hover:bg-surface-secondary rounded-card transition-colors duration-fast"
            )}
            onClick={() => onEventClick?.(event)}
          >
            {/* Icon */}
            <div
              className={clsx(
                "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white z-10",
                eventColors[event.type]
              )}
              aria-hidden="true"
            >
              {eventIcons[event.type]}
            </div>

            {/* Content */}
            <div className="pb-spacing-4">
              <div className="flex items-start justify-between gap-gap-sm">
                <div className="flex-1 min-w-0">
                  {/* User and action */}
                  <p className="font-body text-body-sm text-text-primary">
                    <span className="font-semibold">{event.userName}</span>
                    {event.description && (
                      <span className="text-text-secondary"> {event.description}</span>
                    )}
                  </p>

                  {/* Field changes */}
                  {showFieldChanges && event.changes && event.changes.length > 0 && (
                    <div className="mt-spacing-2 space-y-spacing-1">
                      {event.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="flex items-center gap-gap-xs text-body-xs text-text-secondary"
                        >
                          <span className="font-code text-mono-xs text-on-dark-disabled">
                            {change.fieldLabel || change.field}:
                          </span>
                          <span className="line-through text-on-dark-muted">
                            {formatValue(change.previousValue, change.field)}
                          </span>
                          <ArrowRight className="size-3 text-on-dark-muted" />
                          <span className="text-text-primary">
                            {formatValue(change.newValue, change.field)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <time
                  dateTime={
                    typeof event.timestamp === "string"
                      ? event.timestamp
                      : event.timestamp.toISOString()
                  }
                  className="font-code text-mono-xs text-on-dark-disabled whitespace-nowrap"
                >
                  {formatTimestamp(event.timestamp)}
                </time>
              </div>
            </div>

            {/* Connector to next item */}
            {index < events.length - 1 && (
              <div
                className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AuditTimeline;
