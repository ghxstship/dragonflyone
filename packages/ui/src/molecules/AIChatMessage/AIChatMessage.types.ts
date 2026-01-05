import type { HTMLAttributes, ReactNode } from "react";

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

export interface AIChatMessageVariants {
  role?: MessageRole;
  inverted?: boolean;
  isStreaming?: boolean;
  className?: string;
}
