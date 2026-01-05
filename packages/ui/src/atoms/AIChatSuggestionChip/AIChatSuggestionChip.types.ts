import type { ReactNode, MouseEventHandler } from "react";

export interface AIChatSuggestionChipProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}
