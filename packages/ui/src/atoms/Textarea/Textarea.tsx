import { forwardRef } from "react";
import clsx from "clsx";
import { textareaVariants } from "./Textarea.variants.js";
import type { TextareaProps, TextareaGroupProps } from "./Textarea.types.js";

let textareaGroupCounter = 0;

/**
 * Textarea component
 * 
 * A styled textarea that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Textarea
 *   error={error}
 *   fullWidth
 *   placeholder="Enter your message..."
 *   rows={4}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, errorId, hintId, className, ...props }, ref) {
    // Build aria-describedby from available IDs
    const describedByIds = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <textarea
        ref={ref}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        className={textareaVariants({ error, fullWidth: props.fullWidth, className })}
        {...props}
      />
    );
  }
);

/**
 * TextareaGroup component
 * 
 * A wrapper component that combines a label, textarea, hint text,
 * and error message into a cohesive form field.
 * 
 * @example
 * ```tsx
 * <TextareaGroup
 *   label="Message"
 *   hint="Please provide detailed feedback"
 *   error={error}
 *   errorMessage="This field is required"
 *   required
 * />
 * ```
 */
export const TextareaGroup = forwardRef<HTMLTextAreaElement, TextareaGroupProps>(
  function TextareaGroup({ 
    label, 
    hint, 
    errorMessage, 
    error, 
    required, 
    id, 
    className, 
    ...props 
  }, ref) {
    const uniqueId = id || `textarea-${++textareaGroupCounter}`;
    const errorId = errorMessage ? `${uniqueId}-error` : undefined;
    const hintId = hint ? `${uniqueId}-hint` : undefined;

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        <label 
          htmlFor={uniqueId}
          className="font-heading text-sm uppercase tracking-wider font-bold text-[var(--color-text-primary)]"
        >
          {label}
          {required && (
            <span className="text-[var(--color-error-border)] ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        
        <Textarea
          ref={ref}
          id={uniqueId}
          error={error || !!errorMessage}
          errorId={errorId}
          hintId={hintId}
          aria-required={required}
          {...props}
        />
        
        {hint && !errorMessage && (
          <p id={hintId} className="text-sm text-[var(--color-text-disabled)]">
            {hint}
          </p>
        )}
        
        {errorMessage && (
          <p id={errorId} className="text-sm text-[var(--color-error-border)]" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
