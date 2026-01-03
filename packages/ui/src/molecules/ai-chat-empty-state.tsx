"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import clsx from "clsx";

// =============================================================================
// AI CHAT EMPTY STATE - Initial/Empty State Component
// Industry best practices for AI chat interfaces
// Features:
// - Centered layout with icon/illustration
// - Title and description
// - Suggestion prompts
// - Call-to-action
// =============================================================================

export interface AIChatEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon or illustration element */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Suggestion prompts or actions */
  suggestions?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

export const AIChatEmptyState = forwardRef<HTMLDivElement, AIChatEmptyStateProps>(
  function AIChatEmptyState(
    { icon, title, description, suggestions, inverted = false, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex h-full flex-col items-center justify-center p-8 text-center",
          className
        )}
        {...props}
      >
        <div className="flex max-w-md flex-col items-center gap-lg">
          {/* Icon */}
          {icon && (
            <div
              className={clsx(
                "flex size-16 items-center justify-center border-2",
                inverted
                  ? "border-border bg-surface-elevated text-text-primary"
                  : "border-border-primary bg-accent/20 text-accent"
              )}
            >
              {icon}
            </div>
          )}

          {/* Title */}
          <h2
            className={clsx(
              "font-display text-h3-md uppercase tracking-label",
              inverted ? "text-text-primary" : "text-text-primary"
            )}
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              className={clsx(
                "font-body text-body-md leading-body",
                inverted ? "text-text-secondary" : "text-text-muted"
              )}
            >
              {description}
            </p>
          )}

          {/* Suggestions */}
          {suggestions && <div className="mt-lg w-full">{suggestions}</div>}
        </div>
      </div>
    );
  }
);

export default AIChatEmptyState;
