import { ReactNode } from "react";
import clsx from "clsx";
import { H3, Body } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Contextual suggestions (e.g., "Try searching for...") */
  suggestions?: string[];
  inverted?: boolean;
}

/**
 * EmptyState component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px dashed border (comic panel style)
 * - Generous padding
 * - Clear visual hierarchy
 */
export function EmptyState({ icon, title, description, action, secondaryAction, suggestions, inverted = false }: EmptyStateProps) {
  return (
    <div className={clsx(
      "flex flex-col items-center justify-center p-16 text-center",
      "border-2 border-dashed rounded-[var(--radius-card)]",
      inverted 
        ? "border-border bg-surface-inverse/50" 
        : "border-border bg-muted"
    )}>
      {icon && (
        <div className={clsx(
          "mb-6 text-4xl",
          inverted ? "text-on-dark-muted" : "text-on-light-muted"
        )}>
          {icon}
        </div>
      )}
      <H3 className={clsx(
        "uppercase tracking-wider",
        inverted ? "text-on-dark-secondary" : "text-on-light-muted"
      )}>
        {title}
      </H3>
      {description && (
        <Body className={clsx(
          "mt-4 max-w-md",
          inverted ? "text-on-dark-muted" : "text-on-light-muted"
        )}>
          {description}
        </Body>
      )}
      {suggestions && suggestions.length > 0 && (
        <div className={clsx(
          "mt-6 text-sm",
          inverted ? "text-on-dark-disabled" : "text-on-light-muted"
        )}>
          <span className="font-mono uppercase tracking-wider text-xs">Try searching for:</span>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <span
                key={index}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  inverted 
                    ? "bg-surface-elevated text-on-dark-secondary" 
                    : "bg-muted text-on-dark-disabled"
                )}
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
      {(action || secondaryAction) && (
        <div className="mt-8 flex gap-3">
          {action && (
            <Button variant="outline" inverted={inverted} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" inverted={inverted} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
