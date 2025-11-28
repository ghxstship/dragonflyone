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
export function EmptyState({ icon, title, description, action, inverted = false }: EmptyStateProps) {
  return (
    <div className={clsx(
      "flex flex-col items-center justify-center p-16 text-center",
      "border-2 border-dashed rounded-[var(--radius-card)]",
      inverted 
        ? "border-grey-600 bg-grey-900/50" 
        : "border-grey-400 bg-grey-50"
    )}>
      {icon && (
        <div className={clsx(
          "mb-6 text-4xl",
          inverted ? "text-grey-400" : "text-grey-500"
        )}>
          {icon}
        </div>
      )}
      <H3 className={clsx(
        "uppercase tracking-wider",
        inverted ? "text-grey-300" : "text-grey-600"
      )}>
        {title}
      </H3>
      {description && (
        <Body className={clsx(
          "mt-4 max-w-md",
          inverted ? "text-grey-400" : "text-grey-500"
        )}>
          {description}
        </Body>
      )}
      {action && (
        <div className="mt-8">
          <Button variant="outline" inverted={inverted} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
