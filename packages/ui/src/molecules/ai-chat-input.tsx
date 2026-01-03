"use client";

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import clsx from "clsx";

// =============================================================================
// AI CHAT INPUT - Bottom-fixed Input Component
// Industry best practices for AI chat interfaces
// Features:
// - Auto-expanding textarea
// - Keyboard shortcuts (Cmd/Ctrl+Enter to send)
// - Suggestion chips
// - Attachment support placeholder
// - Character count
// - Loading/disabled states
// =============================================================================

export interface AIChatInputProps extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  /** Current input value */
  value: string;
  /** Value change handler */
  onChange: (value: string) => void;
  /** Submit handler */
  onSubmit: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether AI is currently responding */
  isLoading?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Show character count */
  showCharCount?: boolean;
  /** Left side actions (attachments, etc.) */
  leftActions?: ReactNode;
  /** Right side actions (send button, etc.) */
  rightActions?: ReactNode;
  /** Suggestion chips below input */
  suggestions?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatSuggestionChipsProps extends HTMLAttributes<HTMLDivElement> {
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatSuggestionChipProps extends HTMLAttributes<HTMLButtonElement> {
  /** Chip label */
  label: string;
  /** Click handler */
  onSelect: () => void;
  /** Icon element */
  icon?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

// =============================================================================
// SUGGESTION CHIPS CONTAINER
// =============================================================================

export const AIChatSuggestionChips = forwardRef<HTMLDivElement, AIChatSuggestionChipsProps>(
  function AIChatSuggestionChips({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-wrap items-center gap-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// =============================================================================
// SUGGESTION CHIP
// =============================================================================

export const AIChatSuggestionChip = forwardRef<HTMLButtonElement, AIChatSuggestionChipProps>(
  function AIChatSuggestionChip(
    { label, onSelect, icon, inverted = false, className, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        className={clsx(
          "flex items-center gap-xs border-2 px-3 py-1.5 font-mono text-mono-xs uppercase tracking-label",
          "transition-all duration-100 hover:-translate-y-0.5",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          inverted
            ? "border-border bg-surface-elevated text-text-muted hover:border-on-dark-muted hover:text-text-primary focus:ring-ring focus:ring-offset-background"
            : "border-border bg-surface-primary text-text-muted hover:border-border-primary hover:text-text-primary focus:ring-ring focus:ring-offset-background",
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label}
      </button>
    );
  }
);

// =============================================================================
// CHAT INPUT
// =============================================================================

export const AIChatInput = forwardRef<HTMLFormElement, AIChatInputProps>(
  function AIChatInput(
    {
      value,
      onChange,
      onSubmit,
      placeholder = "Type a message...",
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
    const [isFocused, setIsFocused] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [value]);

    // Handle form submission
    const handleSubmit = useCallback(
      (e: FormEvent) => {
        e.preventDefault();
        if (value.trim() && !disabled && !isLoading) {
          onSubmit(value.trim());
        }
      },
      [value, disabled, isLoading, onSubmit]
    );

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Cmd/Ctrl + Enter to submit
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (value.trim() && !disabled && !isLoading) {
            onSubmit(value.trim());
          }
        }
        // Enter without shift to submit (single line mode)
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          if (value.trim() && !disabled && !isLoading) {
            onSubmit(value.trim());
          }
        }
      },
      [value, disabled, isLoading, onSubmit]
    );

    const isDisabled = disabled || isLoading;
    const charCount = value.length;
    const isOverLimit = maxLength ? charCount > maxLength : false;

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={clsx("flex flex-col gap-md", className)}
        {...props}
      >
        {/* Input Container */}
        <div
          className={clsx(
            "flex items-end gap-sm border-2 p-2 transition-all duration-100 rounded-radius-card",
            isFocused && !isDisabled
              ? inverted
                ? "border-on-dark-primary shadow-sm"
                : "border-border-primary shadow-md"
              : inverted
                ? "border-border"
                : "border-border",
            isDisabled && "opacity-50 cursor-not-allowed",
            inverted ? "bg-surface-inverse" : "bg-surface-primary"
          )}
        >
          {/* Left Actions */}
          {leftActions && (
            <div className="flex shrink-0 items-center gap-xs pb-1">{leftActions}</div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className={clsx(
              "flex-1 resize-none bg-transparent font-body text-body-md leading-relaxed",
              "placeholder:text-muted-foreground focus:outline-none",
              "disabled:cursor-not-allowed",
              inverted ? "text-text-primary" : "text-text-primary"
            )}
            aria-label="Message input"
          />

          {/* Right Actions */}
          {rightActions && (
            <div className="flex shrink-0 items-center gap-xs pb-1">{rightActions}</div>
          )}
        </div>

        {/* Footer: Character count + Suggestions */}
        <div className="flex items-center justify-between">
          {/* Character Count */}
          {showCharCount && (
            <span
              className={clsx(
                "font-mono text-mono-xs",
                isOverLimit
                  ? "text-error"
                  : inverted
                    ? "text-text-muted"
                    : "text-muted-foreground"
              )}
            >
              {charCount}
              {maxLength && ` / ${maxLength}`}
            </span>
          )}

          {/* Keyboard Hint */}
          <span
            className={clsx(
              "font-mono text-mono-xs",
              inverted ? "text-text-disabled" : "text-muted-foreground"
            )}
          >
            Press Enter to send
          </span>
        </div>

        {/* Suggestions */}
        {suggestions}
      </form>
    );
  }
);

export default AIChatInput;
