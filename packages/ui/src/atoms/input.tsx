import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
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
  function Input({ error, fullWidth, inverted = false, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          // Base styles
          "font-body px-4 py-3 h-11",
          "border-2 rounded-[var(--radius-input)]",
          "transition-all duration-100",
          "focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Placeholder
          inverted ? "placeholder:text-grey-500" : "placeholder:text-grey-400",
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
                  "focus:border-indigo-400 focus:-translate-x-px focus:-translate-y-px focus:shadow-[3px_3px_0_rgba(99,102,241,0.3)]"
                )
              : clsx(
                  "border-grey-300 bg-white text-black",
                  "shadow-[2px_2px_0_rgba(0,0,0,0.08)]",
                  "hover:border-grey-400",
                  "focus:border-indigo-500 focus:-translate-x-px focus:-translate-y-px focus:shadow-[3px_3px_0_rgba(99,102,241,0.2)]"
                ),
          fullWidth ? "w-full" : "w-auto",
          className
        )}
        {...props}
      />
    );
  }
);
