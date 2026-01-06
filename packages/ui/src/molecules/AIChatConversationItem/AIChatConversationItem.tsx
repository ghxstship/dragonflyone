"use client";

import { forwardRef } from "react";
import { 
  aiChatConversationGroupVariants,
  aiChatConversationGroupLabelVariants,
  aiChatConversationItemVariants,
  aiChatConversationItemContentVariants,
  aiChatConversationItemTitleVariants,
  aiChatConversationItemPreviewVariants,
  aiChatConversationItemTimestampVariants,
  aiChatConversationItemActionsVariants 
} from "./AIChatConversationItem.variants.js";
import type { 
  AIChatConversationItemProps, 
  AIChatConversationGroupProps 
} from "./AIChatConversationItem.types.js";

/**
 * AIChatConversationGroup component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Clear visual hierarchy
 * - Grouped conversations
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AIChatConversationGroup label="Today">
 *   <AIChatConversationItem
 *     title="Project Discussion"
 *     preview="Let's review the latest designs..."
 *     timestamp="2:30 PM"
 *     onSelect={() => console.log('Selected')}
 *   />
 * </AIChatConversationGroup>
 * ```
 */
export const AIChatConversationGroup = forwardRef<HTMLDivElement, AIChatConversationGroupProps>(
  function AIChatConversationGroup({ 
    label, 
    inverted = false, 
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <div 
        ref={ref} 
        className={aiChatConversationGroupVariants({ className })} 
        {...props}
      >
        <div className={aiChatConversationGroupLabelVariants({})}>
          {label}
        </div>
        {children}
      </div>
    );
  }
);

AIChatConversationGroup.displayName = "AIChatConversationGroup";

/**
 * AIChatConversationItem component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Clear visual hierarchy
 * - Interactive hover states
 * - Active/selected states
 * - CVA-based variants for consistent theming
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <AIChatConversationItem
 *   title="Project Discussion"
 *   preview="Let's review the latest designs..."
 *   timestamp="2:30 PM"
 *   isActive={true}
 *   onSelect={() => console.log('Selected')}
 * />
 * ```
 */
export const AIChatConversationItem = forwardRef<HTMLButtonElement, AIChatConversationItemProps>(
  function AIChatConversationItem({ 
    title, 
    preview, 
    timestamp, 
    isActive = false, 
    icon, 
    actions, 
    onSelect, 
    inverted = false, 
    className, 
    ...props 
  }, ref) {
    // Format timestamp
    const formatTimestamp = (ts: string | Date | undefined): string => {
      if (!ts) return "";
      
      const date = typeof ts === "string" ? new Date(ts) : ts;
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString();
    };

    return (
      <button
        ref={ref}
        className={aiChatConversationItemVariants({ isActive, className })}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-label={`Conversation: ${title}`}
        aria-selected={isActive}
        role="option"
        {...props}
      >
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className={aiChatConversationItemContentVariants({})}>
          {/* Title */}
          <div className={aiChatConversationItemTitleVariants({})}>
            {title}
          </div>

          {/* Preview */}
          {preview && (
            <div className={aiChatConversationItemPreviewVariants({})}>
              {preview}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className={aiChatConversationItemTimestampVariants({})}>
            {formatTimestamp(timestamp)}
          </div>
        )}

        {/* Actions (shown on hover) */}
        {actions && (
          <div className={aiChatConversationItemActionsVariants({})}>
            {actions}
          </div>
        )}
      </button>
    );
  }
);

AIChatConversationItem.displayName = "AIChatConversationItem";
