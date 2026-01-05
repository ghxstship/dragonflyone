import type { ReactNode } from "react";

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
  formatValue?: (value: unknown, field: string) => ReactNode;
  onEventClick?: (event: AuditEvent) => void;
  className?: string;
}
