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
          messageActionsVariants({ className }),
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
    { avatar, label = "AI is thinking...", className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(typingIndicatorVariants({ className }), "animate-fade-in")}
        {...props}
      >
        {/* Avatar */}
        {avatar && (
          <div
            className={clsx(
              "flex-shrink-0 w-10 h-10 items-center justify-center border-2 rounded-lg",
              "border-[var(--color-border-primary)] bg-accent text-[var(--color-text-primary)]"
            )}
          >
            {avatar}
          </div>
        )}

        {/* Typing Bubble */}
        <div
          className={clsx(
            "flex items-center gap-2 border-2 p-3 rounded-lg",
            "border-[var(--color-border-primary)] bg-[var(--color-surface-primary)] shadow-sm"
          )}
        >
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                "w-2 h-2 rounded-full animate-bounce bg-[var(--color-text-muted)]"
              )}
              style={{ animationDelay: "0ms" }}
            />
            <span
              className={clsx(
                "w-2 h-2 rounded-full animate-bounce bg-[var(--color-text-muted)]"
              )}
              style={{ animationDelay: "150ms" }}
            />
            <span
              className={clsx(
                "w-2 h-2 rounded-full animate-bounce bg-[var(--color-text-muted)]"
              )}
              style={{ animationDelay: "300ms" }}
            />
          </div>

          {/* Label */}
          <span
            className={clsx(
              "text-sm",
              "text-[var(--color-text-muted)]"
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
              "bg-[var(--color-muted)] text-[var(--color-text-muted)]"
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
          aiChatMessageVariants({ role, className }),
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
                ? "border-[var(--color-border-primary)] bg-primary text-white"
                : "border-[var(--color-border-primary)] bg-accent text-[var(--color-text-primary)]"
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
              messageBubbleVariants({ role }),
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
                  "text-[var(--color-text-muted)]"
                )}
              >
                {formattedTime}
              </span>
            )}

            {/* Actions */}
            {actions && <AIChatMessageActions>{actions}</AIChatMessageActions>}
          </div>
        </div>
      </div>
    );
  }
);

export default AIChatMessage;
