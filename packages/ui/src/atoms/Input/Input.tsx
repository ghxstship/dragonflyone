import { forwardRef } from "react";
import { inputVariants } from "./Input.variants.js";
import type { InputProps, InputGroupProps } from "./Input.types.js";

let inputGroupCounter = 0;

/**
 * Input component
 * 
 * A text input component that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Input placeholder="Enter your name" />
 * <Input error errorId="name-error" />
 * <Input inputSize="lg" fullWidth />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { 
      error = false, 
      fullWidth = false, 
      inputSize = "md",
      errorId, 
      hintId, 
      className, 
      ...props 
    }, 
    ref
  ) {
    const describedByIds = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <input
        ref={ref}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        className={inputVariants({ inputSize, error, fullWidth, className })}
        {...props}
      />
    );
  }
);

/**
 * InputGroup component
 * 
 * A wrapper for Input that includes label, hint text, and error message
 * with proper ARIA bindings for accessibility.
 * 
 * @example
 * ```tsx
 * <InputGroup label="Email" hint="We'll never share your email" />
 * <InputGroup label="Password" required errorMessage="Password is required" />
 * ```
 */
export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  function InputGroup(
    { 
      label, 
      hint, 
      errorMessage, 
      error, 
      required, 
      id, 
      className, 
      ...props 
    }, 
    ref
  ) {
    const uniqueId = id || `input-${++inputGroupCounter}`;
    const errorId = errorMessage ? `${uniqueId}-error` : undefined;
    const hintId = hint ? `${uniqueId}-hint` : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${className || ""}`}>
        <label
          htmlFor={uniqueId}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && (
            <span className="text-[var(--color-error)] ml-1" aria-hidden="true">
              *
            </span>
          )}
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
          <p id={hintId} className="text-sm text-[var(--color-text-tertiary)]">
            {hint}
          </p>
        )}
        {errorMessage && (
          <p
            id={errorId}
            className="text-sm text-[var(--color-error)]"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
