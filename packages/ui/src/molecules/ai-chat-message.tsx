"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import clsx from "clsx";

// =============================================================================
// AI CHAT MESSAGE - Message Bubble Component
// Industry best practices for AI chat interfaces
// Features:
// - Role-based styling (user/assistant/system)
// - Avatar support
// - Timestamp display
// - Message actions (copy, regenerate, edit)
// - Streaming/typing indicator support
// - Markdown-like content formatting
// =============================================================================

export type MessageRole = "user" | "assistant" | "system";

export interface AIChatMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Message role determines styling and alignment */
  role: MessageRole;
  /** Message content */
  children: ReactNode;
  /** Avatar element or initials */
  avatar?: ReactNode;
  /** Timestamp to display */
  timestamp?: string | Date;
  /** Whether message is currently streaming */
  isStreaming?: boolean;
  /** Actions to display on hover (copy, regenerate, etc.) */
  actions?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatMessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatTypingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar element */
  avatar?: ReactNode;
  /** Label text */
  label?: string;
  /** Dark mode */
  inverted?: boolean;
}

// =============================================================================
// MESSAGE ACTIONS CONTAINER
// =============================================================================

export const AIChatMessageActions = forwardRef<HTMLDivElement, AIChatMessageActionsProps>(
  function AIChatMessageActions({ inverted = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex items-center gap-xs opacity-0 transition-opacity group-hover:opacity-100",
          inverted ? "text-text-muted" : "text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// =============================================================================
// TYPING INDICATOR
// =============================================================================

export const AIChatTypingIndicator = forwardRef<HTMLDivElement, AIChatTypingIndicatorProps>(
  function AIChatTypingIndicator(
    { avatar, label = "AI is thinking...", inverted = false, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx("flex items-start gap-md animate-fade-in", className)}
        {...props}
      >
        {/* Avatar */}
        {avatar && (
          <div
            className={clsx(
              "flex size-10 shrink-0 items-center justify-center border-2",
              inverted
                ? "border-border bg-surface-elevated text-text-primary"
                : "border-border-primary bg-accent text-text-primary"
            )}
          >
            {avatar}
          </div>
        )}

        {/* Typing Bubble */}
        <div
          className={clsx(
            "flex items-center gap-sm border-2 p-4 rounded-radius-card",
            inverted
              ? "border-border bg-surface-elevated"
              : "border-border-primary bg-surface-primary shadow-sm"
          )}
        >
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                "size-2 rounded-full animate-bounce",
                inverted ? "bg-muted-foreground" : "bg-muted-foreground"
              )}
              style={{ animationDelay: "0ms" }}
            />
            <span
              className={clsx(
                "size-2 rounded-full animate-bounce",
                inverted ? "bg-muted-foreground" : "bg-muted-foreground"
              )}
              style={{ animationDelay: "150ms" }}
            />
            <span
              className={clsx(
                "size-2 rounded-full animate-bounce",
                inverted ? "bg-muted-foreground" : "bg-muted-foreground"
              )}
              style={{ animationDelay: "300ms" }}
            />
          </div>

          {/* Label */}
          <span
            className={clsx(
              "font-body text-body-sm",
              inverted ? "text-text-muted" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }
);

// =============================================================================
// MESSAGE BUBBLE
// =============================================================================

export const AIChatMessage = forwardRef<HTMLDivElement, AIChatMessageProps>(
  function AIChatMessage(
    {
      role,
      children,
      avatar,
      timestamp,
      isStreaming = false,
      actions,
      inverted = false,
      className,
      ...props
    },
    ref
  ) {
    const isUser = role === "user";
    const isSystem = role === "system";

    // Format timestamp
    const formattedTime =
      timestamp instanceof Date
        ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : timestamp;

    // System messages have different styling
    if (isSystem) {
      return (
        <div
          ref={ref}
          className={clsx(
            "flex justify-center py-2",
            className
          )}
          {...props}
        >
          <div
            className={clsx(
              "px-4 py-2 font-mono text-mono-xs rounded-radius-badge",
              inverted
                ? "bg-surface-elevated text-text-muted"
                : "bg-muted text-text-muted"
            )}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          "group flex gap-md animate-slide-up-bounce",
          isUser ? "flex-row-reverse" : "flex-row",
          className
        )}
        {...props}
      >
        {/* Avatar */}
        {avatar && (
          <div
            className={clsx(
              "flex size-10 shrink-0 items-center justify-center border-2",
              isUser
                ? inverted
                  ? "border-border bg-primary text-text-primary"
                  : "border-border-primary bg-primary text-text-primary"
                : inverted
                  ? "border-border bg-surface-elevated text-text-primary"
                  : "border-border-primary bg-accent text-text-primary"
            )}
          >
            {avatar}
          </div>
        )}

        {/* Message Content */}
        <div
          className={clsx(
            "flex max-w-[80%] flex-col gap-sm",
            isUser ? "items-end" : "items-start"
          )}
        >
          {/* Bubble */}
          <div
            className={clsx(
              "border-2 p-4 rounded-radius-card",
              isUser
                ? inverted
                  ? "border-primary/50 bg-primary/20 text-text-primary"
                  : "border-primary/30 bg-primary/10 text-text-primary"
                : inverted
                  ? "border-border bg-surface-elevated text-text-primary"
                  : "border-border-primary bg-surface-primary text-text-primary shadow-sm",
              isStreaming && "animate-pulse"
            )}
          >
            <div className="font-body text-body-sm leading-body">{children}</div>
          </div>

          {/* Footer: Timestamp + Actions */}
          <div
            className={clsx(
              "flex items-center gap-md",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Timestamp */}
            {formattedTime && (
              <span
                className={clsx(
                  "font-mono text-mono-xs",
                  inverted ? "text-text-muted" : "text-muted-foreground"
                )}
              >
                {formattedTime}
              </span>
            )}

            {/* Actions */}
            {actions && <AIChatMessageActions inverted={inverted}>{actions}</AIChatMessageActions>}
          </div>
        </div>
      </div>
    );
  }
);

export default AIChatMessage;
