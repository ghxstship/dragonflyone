import type { ReactNode, HTMLAttributes } from "react";

/**
 * AIChatConversationItem component props
 */
export interface AIChatConversationItemProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  /** Conversation title */
  title: string;
  
  /** Preview text (last message) */
  preview?: string;
  
  /** Timestamp */
  timestamp?: string | Date;
  
  /** Whether this conversation is active/selected */
  isActive?: boolean;
  
  /** Icon element */
  icon?: ReactNode;
  
  /** Actions to show on hover */
  actions?: ReactNode;
  
  /** Click handler */
  onSelect: () => void;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * AIChatConversationGroup component props
 */
export interface AIChatConversationGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group label (e.g., "Today", "Yesterday", "Last 7 days") */
  label: string;
  
  /** Inverted theme */
  inverted?: boolean;
}
