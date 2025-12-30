import { forwardRef } from "react";
import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
  /** ID for the error message element (for aria-describedby) */
  errorId?: string;
  /** ID for the hint/description element (for aria-describedby) */
  hintId?: string;
};

/**
 * Textarea component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - 2px bold borders
 * - Hard offset shadow (subtle)
 * - Focus lift effect with primary border
 * - Matches Input component styling
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, fullWidth, inverted = false, errorId, hintId, className, ...props }, ref) {
    // Build aria-describedby from available IDs
    const describedByIds = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    
    return (
      <textarea
        ref={ref}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        className={clsx(
          // Base styles
          "font-body px-4 py-3 min-h-[120px] resize-y",
          "border-2 rounded-[var(--radius-input)]",
          "transition-all duration-100",
          "focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Placeholder
          inverted ? "placeholder:text-on-dark-disabled" : "placeholder:text-on-dark-muted",
          // Error state
          error
            ? inverted
              ? clsx(
                  "border-error-500 bg-ink-900 text-white",
                  "shadow-[2px_2px_0_rgba(239,68,68,0.3)]",
                  "focus:border-error-400 focus:shadow-[3px_3px_0_rgba(239,68,68,0.4)]"
                )
              : clsx(
                  "border-error-500 bg-white text-black",
                  "shadow-[2px_2px_0_rgba(239,68,68,0.2)]",
                  "focus:border-error-600 focus:shadow-[3px_3px_0_rgba(239,68,68,0.3)]"
                )
            // Normal state
            : inverted
              ? clsx(
                  "border-grey-700 bg-ink-900 text-white",
                  "shadow-[2px_2px_0_rgba(255,255,255,0.1)]",
                  "hover:border-grey-600",
                  "focus:border-[var(--color-primary-400)] focus:-translate-x-px focus:-translate-y-px focus:shadow-[3px_3px_0_var(--color-primary-300)]"
                )
              : clsx(
                  "border-grey-300 bg-white text-black",
                  "shadow-[2px_2px_0_rgba(0,0,0,0.08)]",
                  "hover:border-grey-400",
                  "focus:border-[var(--color-primary-500)] focus:-translate-x-px focus:-translate-y-px focus:shadow-[3px_3px_0_var(--color-primary-200)]"
                ),
          fullWidth ? "w-full" : "w-auto",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * TextareaGroup - Wrapper for Textarea with label and error message
 * Provides proper ARIA bindings between label, textarea, and error
 */
export type TextareaGroupProps = TextareaProps & {
  /** Label text for the textarea */
  label: string;
  /** Optional hint text displayed below the textarea */
  hint?: string;
  /** Error message to display and announce to screen readers */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom ID for the textarea (auto-generated if not provided) */
  id?: string;
};

let textareaGroupCounter = 0;

export const TextareaGroup = forwardRef<HTMLTextAreaElement, TextareaGroupProps>(
  function TextareaGroup({ label, hint, errorMessage, error, required, id, className, ...props }, ref) {
    const uniqueId = id || `textarea-${++textareaGroupCounter}`;
    const errorId = errorMessage ? `${uniqueId}-error` : undefined;
    const hintId = hint ? `${uniqueId}-hint` : undefined;
    
    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        <label 
          htmlFor={uniqueId}
          className="font-heading text-sm uppercase tracking-wider font-bold"
        >
          {label}
          {required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
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
          <p id={hintId} className="text-sm text-on-dark-disabled">
            {hint}
          </p>
        )}
        {errorMessage && (
          <p id={errorId} className="text-sm text-error-500" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
