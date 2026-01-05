"use client";

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

import React from "react";
import clsx from "clsx";
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  Settings,
  Trash2,
  ChevronRight,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Tooltip } from "../../atoms/Tooltip/index.js";
import { notificationCenterVariants, notificationBellVariants } from "./NotificationCenter.variants.js";
import type { 
  NotificationCenterProps,
  NotificationBellProps,
  Notification,
  NotificationType
} from "./NotificationCenter.types.js";

// =============================================================================
// NOTIFICATION ICONS
// =============================================================================

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="size-4" />,
  success: <CheckCircle className="size-4" />,
  warning: <AlertTriangle className="size-4" />,
  error: <AlertCircle className="size-4" />,
};

const notificationColors: Record<NotificationType, string> = {
  info: "bg-info-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};

// =============================================================================
// HELPERS
// =============================================================================

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// =============================================================================
// NOTIFICATION ITEM
// =============================================================================

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onMarkRead?: () => void;
  onDelete?: () => void;
}

function NotificationItem({ notification, onClick, onMarkRead, onDelete }: NotificationItemProps) {
  return (
    <div
      className={clsx(
        "flex items-start gap-gap-md p-spacing-3 border-b border-border-secondary transition-colors",
        notification.read ? "bg-surface-primary" : "bg-primary-500/5",
        onClick && "cursor-pointer hover:bg-surface-secondary"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={clsx(
        "flex-shrink-0 flex items-center justify-center size-8 rounded-avatar text-white",
        notificationColors[notification.type]
      )}>
        {notificationIcons[notification.type]}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-gap-sm">
          <div>
            <p className={clsx(
              "text-body-sm",
              notification.read ? "text-text-secondary" : "text-text-primary font-medium"
            )}>
              {notification.title}
            </p>
            {notification.message && (
              <p className="text-body-xs text-text-disabled mt-spacing-1 line-clamp-2">
                {notification.message}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-gap-xs flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {!notification.read && onMarkRead && (
              <Tooltip content="Mark as read">
                <button
                  onClick={onMarkRead}
                  className="p-spacing-1 text-text-muted hover:text-primary-500 bg-transparent border-none cursor-pointer"
                  aria-label="Mark as read"
                >
                  <Check className="size-4" />
                </button>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip content="Delete">
                <button
                  onClick={onDelete}
                  className="p-spacing-1 text-text-muted hover:text-error-500 bg-transparent border-none cursor-pointer"
                  aria-label="Delete notification"
                >
                  <Trash2 className="size-4" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-gap-sm mt-spacing-2">
          <span className="text-body-xs text-text-muted">
            {formatRelativeTime(notification.timestamp)}
          </span>
          {notification.priority === "urgent" && (
            <span className="px-spacing-1 py-px bg-error-500 text-white text-body-xs font-code rounded-badge">
              URGENT
            </span>
          )}
          {notification.priority === "high" && (
            <span className="px-spacing-1 py-px bg-warning-500 text-white text-body-xs font-code rounded-badge">
              HIGH
            </span>
          )}
          {notification.actionLabel && (
            <span className="flex items-center gap-gap-xs text-body-xs text-primary-500">
              {notification.actionLabel}
              <ChevronRight className="size-3" />
            </span>
          )}
        </div>
      </div>
      
      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 size-2 rounded-avatar bg-primary-500 mt-spacing-2" />
      )}
    </div>
  );
}

// =============================================================================
// NOTIFICATION BELL
// =============================================================================

export function NotificationBell({ unreadCount, onClick, className }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(notificationBellVariants({ hasUnread: unreadCount > 0 }), className)}
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-spacing-1 -right-spacing-1 min-w-spacing-4 h-spacing-4 flex items-center justify-center px-spacing-1 bg-error-500 text-white text-body-xs font-code rounded-avatar">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// NOTIFICATION CENTER
// =============================================================================

/**
 * NotificationCenter component - Bold Contemporary Pop Art Adventure
 * 
 * @deprecated Use EnhancedHeader's EnhancedNotificationsPanel instead
 * 
 * Features:
 * - Comprehensive notification management
 * - Priority badges and timestamps
 * - Mark as read and delete actions
 * - Multiple positioning options
 * - Responsive design
 */
export function NotificationCenter({
  notifications,
  onNotificationClick,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
  onSettings,
  open = false,
  onOpenChange,
  position = "top-right",
  className,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <div className={clsx(
      "fixed z-modal",
      position === "top-right" && "top-0 right-0",
      position === "top-left" && "top-0 left-0",
      position === "bottom-right" && "bottom-0 right-0",
      position === "bottom-left" && "bottom-0 left-0",
      className
    )}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Panel */}
      <div className={clsx(notificationCenterVariants({ position }), className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-spacing-4 py-spacing-3 bg-surface-inverse text-text-inverse border-b-2 border-border-primary">
          <div className="flex items-center gap-gap-sm">
            <Bell className="size-5" />
            <h3 className="font-display text-h4-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-spacing-2 py-spacing-1 bg-white/20 rounded-badge text-body-xs font-code">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-gap-xs">
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-spacing-1 text-text-muted hover:text-white bg-transparent border-none cursor-pointer"
              >
                <Settings className="size-4" />
              </button>
            )}
            <button
              onClick={() => onOpenChange?.(false)}
              className="p-spacing-1 text-text-muted hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
        
        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-spacing-4 py-spacing-2 bg-surface-secondary border-b border-border-secondary">
            {onMarkAllRead && unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-gap-xs text-body-xs text-primary-500 hover:text-primary-600 bg-transparent border-none cursor-pointer"
              >
                <CheckCheck className="size-4" />
                Mark all as read
              </button>
            )}
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-gap-xs text-body-xs text-text-disabled hover:text-error-500 bg-transparent border-none cursor-pointer ml-auto"
              >
                <Trash2 className="size-4" />
                Clear all
              </button>
            )}
          </div>
        )}
        
        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-spacing-12 text-center">
              <Bell className="size-12 text-text-secondary mb-spacing-4" />
              <p className="text-body-md text-text-disabled">No notifications</p>
              <p className="text-body-sm text-text-muted mt-spacing-1">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick?.(notification)}
                onMarkRead={() => onMarkRead?.(notification.id)}
                onDelete={() => onDelete?.(notification.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
