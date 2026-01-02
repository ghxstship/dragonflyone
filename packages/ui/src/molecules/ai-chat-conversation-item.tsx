"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import clsx from "clsx";

// =============================================================================
// AI CHAT CONVERSATION ITEM - Sidebar Conversation List Item
// Industry best practices for AI chat interfaces
// Features:
// - Active/selected state
// - Hover actions (rename, delete)
// - Timestamp display
// - Preview text truncation
// - Keyboard accessible
// =============================================================================

export interface AIChatConversationItemProps extends HTMLAttributes<HTMLButtonElement> {
  /** Conversation title */
  title: string;
  /** Preview text (last message) */
  preview?: string;
  /** Timestamp */
  timestamp?: string | Date;
  /** Whether this conversation is active/selected */
  isActive?: boolean;
  /** Icon element */
  icon?: ReactNode;
  /** Actions to show on hover */
  actions?: ReactNode;
  /** Click handler */
  onSelect: () => void;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatConversationGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group label (e.g., "Today", "Yesterday", "Last 7 days") */
  label: string;
  /** Dark mode */
  inverted?: boolean;
}

// =============================================================================
// CONVERSATION GROUP
// =============================================================================

export const AIChatConversationGroup = forwardRef<HTMLDivElement, AIChatConversationGroupProps>(
  function AIChatConversationGroup({ label, inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("flex flex-col gap-xs", className)} {...props}>
        {/* Group Label */}
        <span
          className={clsx(
            "px-2 py-1 font-mono text-mono-xs uppercase tracking-kicker",
            inverted ? "text-grey-500" : "text-grey-400"
          )}
        >
          {label}
        </span>

        {/* Conversations */}
        <div className="flex flex-col gap-xs">{children}</div>
      </div>
    );
  }
);

// =============================================================================
// CONVERSATION ITEM
// =============================================================================

export const AIChatConversationItem = forwardRef<HTMLButtonElement, AIChatConversationItemProps>(
  function AIChatConversationItem(
    {
      title,
      preview,
      timestamp,
      isActive = false,
      icon,
      actions,
      onSelect,
      inverted = false,
      className,
      ...props
    },
    ref
  ) {
    // Format timestamp
    const formattedTime =
      timestamp instanceof Date
        ? timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
        : timestamp;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        className={clsx(
          "group relative flex w-full flex-col gap-xs p-3 text-left transition-all duration-100 rounded-radius-card",
          "focus:outline-none focus:ring-2 focus:ring-inset",
          isActive
            ? inverted
              ? "bg-grey-700 focus:ring-white"
              : "bg-grey-200 focus:ring-ink-950"
            : inverted
              ? "hover:bg-grey-800 focus:ring-white"
              : "hover:bg-grey-100 focus:ring-ink-950",
          className
        )}
        aria-current={isActive ? "page" : undefined}
        {...props}
      >
        {/* Header: Icon + Title + Timestamp */}
        <div className="flex items-center gap-sm">
          {/* Icon */}
          {icon && (
            <span
              className={clsx(
                "shrink-0",
                inverted ? "text-grey-400" : "text-grey-500"
              )}
            >
              {icon}
            </span>
          )}

          {/* Title */}
          <span
            className={clsx(
              "flex-1 truncate font-heading text-h6-sm uppercase",
              isActive
                ? inverted
                  ? "text-white"
                  : "text-ink-950"
                : inverted
                  ? "text-grey-200"
                  : "text-ink-800"
            )}
          >
            {title}
          </span>

          {/* Timestamp */}
          {formattedTime && (
            <span
              className={clsx(
                "shrink-0 font-mono text-mono-xs",
                inverted ? "text-grey-500" : "text-grey-400"
              )}
            >
              {formattedTime}
            </span>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <span
            className={clsx(
              "line-clamp-2 font-body text-body-xs",
              inverted ? "text-grey-400" : "text-grey-500"
            )}
          >
            {preview}
          </span>
        )}

        {/* Hover Actions */}
        {actions && (
          <div
            className={clsx(
              "absolute right-2 top-2 flex items-center gap-xs opacity-0 transition-opacity group-hover:opacity-100",
              inverted ? "bg-grey-700" : "bg-grey-200"
            )}
          >
            {actions}
          </div>
        )}
      </button>
    );
  }
);

export default AIChatConversationItem;
