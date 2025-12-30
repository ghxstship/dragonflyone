import { forwardRef } from "react";
import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
  /** ID for the error message element (for aria-describedby) */
  errorId?: string;
  /** ID for the hint/description element (for aria-describedby) */
  hintId?: string;
};

// SVG chevron icons encoded as base64 for light and dark themes (bold 3px stroke)
const chevronLight = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";
const chevronDark = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";

/**
 * Select component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - 2px bold borders
 * - Hard offset shadow (subtle)
 * - Focus lift effect with primary border
 * - Matches Input component styling
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error, fullWidth, inverted = false, errorId, hintId, className, children, ...props }, ref) {
    // Build aria-describedby from available IDs
    const describedByIds = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    
    return (
      <select
        ref={ref}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        className={clsx(
          // Base styles
          "font-body px-4 py-3 pr-10 h-11",
          "border-2 rounded-[var(--radius-input)]",
          "appearance-none bg-no-repeat bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center]",
          "transition-all duration-100",
          "focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
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
        style={{
          backgroundImage: `url('${inverted ? chevronDark : chevronLight}')`,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

/**
 * SelectGroup - Wrapper for Select with label and error message
 * Provides proper ARIA bindings between label, select, and error
 */
export type SelectGroupProps = SelectProps & {
  /** Label text for the select */
  label: string;
  /** Optional hint text displayed below the select */
  hint?: string;
  /** Error message to display and announce to screen readers */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom ID for the select (auto-generated if not provided) */
  id?: string;
};

let selectGroupCounter = 0;

export const SelectGroup = forwardRef<HTMLSelectElement, SelectGroupProps>(
  function SelectGroup({ label, hint, errorMessage, error, required, id, className, children, ...props }, ref) {
    const uniqueId = id || `select-${++selectGroupCounter}`;
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
        <Select
          ref={ref}
          id={uniqueId}
          error={error || !!errorMessage}
          errorId={errorId}
          hintId={hintId}
          aria-required={required}
          {...props}
        >
          {children}
        </Select>
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
