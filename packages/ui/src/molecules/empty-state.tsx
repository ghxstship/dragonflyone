import { ReactNode } from "react";
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

export function EmptyState({ icon, title, description, action, inverted = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center border-2 p-spacing-16 text-center ${inverted ? "border-grey-600" : "border-grey-800"}`}>
      {icon && <div className={`mb-spacing-6 ${inverted ? "text-grey-400" : "text-grey-600"}`}>{icon}</div>}
      <H3 className={inverted ? "text-grey-300" : "text-grey-600"}>{title}</H3>
      {description && (
        <Body className={`mt-spacing-4 max-w-md ${inverted ? "text-grey-400" : "text-grey-500"}`}>
          {description}
        </Body>
      )}
      {action && (
        <div className="mt-spacing-8">
          <Button variant="outline" inverted={inverted} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
