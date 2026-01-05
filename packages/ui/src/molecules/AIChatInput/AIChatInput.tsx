"use client";

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { 
  aiChatInputVariants,
  aiChatInputFormVariants,
  aiChatInputTextareaVariants,
  aiChatInputActionsVariants,
  aiChatInputCharCountVariants,
  aiChatInputSuggestionsVariants 
} from "./AIChatInput.variants.js";
import type { AIChatInputProps } from "./AIChatInput.types.js";

/**
 * AIChatInput component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Auto-expanding textarea
 * - Keyboard shortcuts (Cmd/Ctrl+Enter to send)
 * - Suggestion chips
 * - Attachment support placeholder
 * - Character count
 * - Loading/disabled states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AIChatInput
 *   value={message}
 *   onChange={setMessage}
 *   onSubmit={(value) => console.log('Send:', value)}
 *   placeholder="Type your message..."
 *   isLoading={isResponding}
 *   maxLength={1000}
 *   showCharCount
 * />
 * ```
 */
export const AIChatInput = forwardRef<HTMLFormElement, AIChatInputProps>(
  function AIChatInput(
    {
      value,
      onChange,
      onSubmit,
      placeholder = "Type your message...",
      disabled = false,
      isLoading = false,
      maxLength,
      showCharCount = false,
      leftActions,
      rightActions,
      suggestions,
      inverted = false,
      className,
      ...props
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isComposing, setIsComposing] = useState(false);

    // Auto-resize textarea
    const resizeTextarea = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 44), 200);
      textarea.style.height = `${newHeight}px`;
    }, []);

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        
        // Check max length
        if (maxLength && newValue.length > maxLength) {
          return;
        }
        
        onChange(newValue);
        resizeTextarea();
      },
      [onChange, maxLength, resizeTextarea]
    );

    // Handle form submission
    const handleSubmit = useCallback(
      (e: FormEvent) => {
        e.preventDefault();
        
        if (!value.trim() || disabled || isLoading) {
          return;
        }
        
        onSubmit(value.trim());
        onChange("");
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      },
      [value, disabled, isLoading, onSubmit, onChange]
    );

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing) {
          // Cmd/Ctrl+Enter to send
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
          }
        }
      },
      [handleSubmit, isComposing]
    );

    // Handle composition events (for IME input)
    const handleCompositionStart = useCallback(() => {
      setIsComposing(true);
    }, []);

    const handleCompositionEnd = useCallback(() => {
      setIsComposing(false);
    }, []);

    // Auto-resize on value change
    useEffect(() => {
      resizeTextarea();
    }, [value, resizeTextarea]);

    // Focus textarea on mount
    useEffect(() => {
      if (textareaRef.current && !disabled && !isLoading) {
        textareaRef.current.focus();
      }
    }, [disabled, isLoading]);

    // Character count states
    const charCount = value.length;
    const isNearLimit = maxLength && charCount > maxLength * 0.9;
    const isAtLimit = maxLength && charCount >= maxLength;

    return (
      <div className={aiChatInputVariants({ inverted, className })}>
        <form
          ref={ref}
          className={aiChatInputFormVariants({ 
            isLoading, 
            disabled, 
            inverted 
          })}
          onSubmit={handleSubmit}
          {...props}
        >
          {/* Left Actions */}
          {leftActions && (
            <div className={aiChatInputActionsVariants({ inverted })}>
              {leftActions}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            className={aiChatInputTextareaVariants({ inverted })}
            rows={1}
            aria-label="Message input"
          />

          {/* Right Actions */}
          {rightActions && (
            <div className={aiChatInputActionsVariants({ inverted })}>
              {rightActions}
            </div>
          )}
        </form>

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className={aiChatInputCharCountVariants({ 
            isWarning: Boolean(isNearLimit && !isAtLimit), 
            isError: Boolean(isAtLimit), 
            inverted 
          })}>
            {charCount}/{maxLength}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && (
          <div className={aiChatInputSuggestionsVariants({ inverted })}>
            {suggestions}
          </div>
        )}
      </div>
    );
  }
);

AIChatInput.displayName = "AIChatInput";
