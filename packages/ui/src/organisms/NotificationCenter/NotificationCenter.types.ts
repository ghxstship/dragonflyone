/**
 * @deprecated This entire module is deprecated. Use EnhancedHeader's EnhancedNotificationsPanel instead.
 * The NotificationCenter and NotificationBell components are superseded by the integrated
 * notification system in EnhancedHeader which provides:
 * - Category tabs (All, Mentions, Updates, Alerts)
 * - Inline mark-as-read and delete actions
 * - Notification grouping support
 * - Priority badges
 * - Source labels and relative timestamps
 * 
 * This module will be removed in v2.0.
 * 
 * Migration: Use AuthenticatedShell with useEnhancedHeader=true (default) and pass
 * notifications in the HeaderNotification[] format.
 */

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message?: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationCenterProps {
  /** Notifications to display */
  notifications: Notification[];
  /** Called when a notification is clicked */
  onNotificationClick?: (notification: Notification) => void;
  /** Called when a notification is marked as read */
  onMarkRead?: (notificationId: string) => void;
  /** Called when all notifications are marked as read */
  onMarkAllRead?: () => void;
  /** Called when a notification is deleted */
  onDelete?: (notificationId: string) => void;
  /** Called when all notifications are cleared */
  onClearAll?: () => void;
  /** Called when settings is clicked */
  onSettings?: () => void;
  /** Open state (controlled) */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Position of the notification center */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Additional class name */
  className?: string;
}

export interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount: number;
  /** Called when bell is clicked */
  onClick: () => void;
  /** Additional class name */
  className?: string;
}
