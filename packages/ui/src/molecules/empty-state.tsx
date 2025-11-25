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
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-grey-800 p-16 text-center">
      {icon && <div className="mb-6 text-grey-600">{icon}</div>}
      <H3 className="text-grey-600">{title}</H3>
      {description && (
        <Body className="mt-4 max-w-md text-grey-500">
          {description}
        </Body>
      )}
      {action && (
        <div className="mt-8">
          <Button variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
