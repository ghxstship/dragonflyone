import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
  /** ID for the error message element (for aria-describedby) */
  errorId?: string;
  /** ID for the hint/description element (for aria-describedby) */
  hintId?: string;
};

/**
 * Input component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - 2px bold borders
 * - Hard offset shadow (subtle)
 * - Focus lift effect with primary border
 * - Clear error state styling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, fullWidth, inverted = false, errorId, hintId, className, ...props }, ref) {
    // Build aria-describedby from available IDs
    const describedByIds = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    
    return (
      <input
        ref={ref}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        className={clsx(
          // Base styles
          "font-body px-4 py-3 h-11",
          "border-2 rounded-[var(--radius-input)]",
          "transition-all duration-100",
          "focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Placeholder
          inverted ? "placeholder:text-text-disabled" : "placeholder:text-text-muted",
          // Error state
          error
            ? inverted
              ? clsx(
                  "border-error-500 bg-surface-inverse text-text-primary",
                  "shadow-xs",
                  "focus:border-error-400 focus:shadow-sm"
                )
              : clsx(
                  "border-error-500 bg-surface-inverse text-text-primary",
                  "shadow-xs",
                  "focus:border-error-600 focus:shadow-sm"
                )
            // Normal state
            : inverted
              ? clsx(
                  "border-border bg-surface-inverse text-text-primary",
                  "shadow-xs",
                  "hover:border-border-primary",
                  "focus:border-primary-400 focus:-translate-x-px focus:-translate-y-px focus:shadow-sm"
                )
              : clsx(
                  "border-border bg-surface-primary text-text-primary",
                  "shadow-xs",
                  "hover:border-border-primary",
                  "focus:border-primary-500 focus:-translate-x-px focus:-translate-y-px focus:shadow-sm"
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
 * InputGroup - Wrapper for Input with label and error message
 * Provides proper ARIA bindings between label, input, and error
 */
export type InputGroupProps = InputProps & {
  /** Label text for the input */
  label: string;
  /** Optional hint text displayed below the input */
  hint?: string;
  /** Error message to display and announce to screen readers */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom ID for the input (auto-generated if not provided) */
  id?: string;
};

let inputGroupCounter = 0;

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  function InputGroup({ label, hint, errorMessage, error, required, id, className, ...props }, ref) {
    const uniqueId = id || `input-${++inputGroupCounter}`;
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
        <Input
          ref={ref}
          id={uniqueId}
          error={error || !!errorMessage}
          errorId={errorId}
          hintId={hintId}
          aria-required={required}
          {...props}
        />
        {hint && !errorMessage && (
          <p id={hintId} className="text-sm text-text-disabled">
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
