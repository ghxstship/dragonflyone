"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { aiChatMessageVariants, messageBubbleVariants, messageActionsVariants, typingIndicatorVariants } from "./AIChatMessage.variants.js";
import type { AIChatMessageProps, AIChatMessageActionsProps, AIChatTypingIndicatorProps } from "./AIChatMessage.types.js";

// =============================================================================
// MESSAGE ACTIONS CONTAINER
// =============================================================================

export const AIChatMessageActions = forwardRef<HTMLDivElement, AIChatMessageActionsProps>(
  function AIChatMessageActions({ inverted = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          messageActionsVariants({ inverted, className }),
          "group-hover:opacity-100"
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
        className={clsx(typingIndicatorVariants({ inverted, className }), "animate-fade-in")}
        {...props}
      >
        {/* Avatar */}
        {avatar && (
          <div
            className={clsx(
              "flex-shrink-0 w-10 h-10 items-center justify-center border-2 rounded-lg",
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
            "flex items-center gap-2 border-2 p-3 rounded-lg",
            inverted
              ? "border-border bg-surface-elevated"
              : "border-border-primary bg-surface-primary shadow-sm"
          )}
        >
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                "w-2 h-2 rounded-full animate-bounce bg-text-muted",
                inverted ? "bg-text-muted" : "bg-text-muted"
              )}
              style={{ animationDelay: "0ms" }}
            />
            <span
              className={clsx(
                "w-2 h-2 rounded-full animate-bounce bg-text-muted",
                inverted ? "bg-text-muted" : "bg-text-muted"
              )}
              style={{ animationDelay: "150ms" }}
            />
            <span
              className={clsx(
                "w-2 h-2 rounded-full animate-bounce bg-text-muted",
                inverted ? "bg-text-muted" : "bg-text-muted"
              )}
              style={{ animationDelay: "300ms" }}
            />
          </div>

          {/* Label */}
          <span
            className={clsx(
              "text-sm",
              inverted ? "text-text-muted" : "text-text-muted"
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

/**
 * AIChatMessage component - Message bubble for AI chat interfaces
 * 
 * @example
 * ```tsx
 * <AIChatMessage
 *   role="user"
 *   avatar={<UserAvatar />}
 *   timestamp={new Date()}
 * >
 *   Hello, how can I help you?
 * </AIChatMessage>
 * ```
 */
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
              "px-4 py-2 font-mono text-xs rounded-md",
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
          aiChatMessageVariants({ role, inverted, className }),
          "group animate-slide-up-bounce"
        )}
        {...props}
      >
        {/* Avatar */}
        {avatar && (
          <div
            className={clsx(
              "flex-shrink-0 w-10 h-10 items-center justify-center border-2 rounded-lg",
              isUser
                ? inverted
                  ? "border-border bg-primary text-white"
                  : "border-border-primary bg-primary text-white"
                : inverted
                  ? "border-border bg-surface-elevated text-text-primary"
                  : "border-border-primary bg-accent text-text-primary"
            )}
          >
            {avatar}
          </div>
        )}

        {/* Message Content */}
        <div className={clsx(
          "flex flex-col gap-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Bubble */}
          <div
            className={clsx(
              messageBubbleVariants({ role, inverted }),
              isStreaming && "animate-pulse"
            )}
          >
            <div className="text-sm leading-relaxed">{children}</div>
          </div>

          {/* Footer: Timestamp + Actions */}
          <div
            className={clsx(
              "flex items-center gap-2",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Timestamp */}
            {formattedTime && (
              <span
                className={clsx(
                  "font-mono text-xs",
                  inverted ? "text-text-muted" : "text-text-muted"
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
