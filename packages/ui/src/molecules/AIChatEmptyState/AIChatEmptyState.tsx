"use client";

import { forwardRef } from "react";
import { 
  aiChatEmptyStateVariants,
  aiChatEmptyStateContainerVariants,
  aiChatEmptyStateIconVariants,
  aiChatEmptyStateTitleVariants,
  aiChatEmptyStateDescriptionVariants,
  aiChatEmptyStateSuggestionsVariants 
} from "./AIChatEmptyState.variants.js";
import type { AIChatEmptyStateProps } from "./AIChatEmptyState.types.js";

/**
 * AIChatEmptyState component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Centered layout with icon/illustration
 * - Title and description
 * - Suggestion prompts
 * - Call-to-action
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AIChatEmptyState
 *   icon={<MessageCircle className="w-8 h-8" />}
 *   title="Start a conversation"
 *   description="Ask me anything! I'm here to help with your questions."
 *   suggestions={
 *     <div className="space-y-2">
 *       <button onClick={() => console.log('Suggestion 1')}>
 *         Tell me about your services
 *       </button>
 *       <button onClick={() => console.log('Suggestion 2')}>
 *         How can I help you today?
 *       </button>
 *     </div>
 *   }
 * />
 * ```
 */
export const AIChatEmptyState = forwardRef<HTMLDivElement, AIChatEmptyStateProps>(
  function AIChatEmptyState(
    { 
      icon, 
      title, 
      description, 
      suggestions, 
      inverted = false, 
      className, 
      ...props 
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={aiChatEmptyStateVariants({ className })}
        {...props}
      >
        <div className={aiChatEmptyStateContainerVariants({})}>
          {/* Icon */}
          {icon && (
            <div className={aiChatEmptyStateIconVariants({})}>
              {icon}
            </div>
          )}

          {/* Title */}
          <h2 className={aiChatEmptyStateTitleVariants({})}>
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className={aiChatEmptyStateDescriptionVariants({})}>
              {description}
            </p>
          )}

          {/* Suggestions */}
          {suggestions && (
            <div className={aiChatEmptyStateSuggestionsVariants({})}>
              {suggestions}
            </div>
          )}
        </div>
      </div>
    );
  }
);

AIChatEmptyState.displayName = "AIChatEmptyState";
