"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
};

/**
 * PasswordInput component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Password visibility toggle button
 * - 2px bold borders
 * - Hard offset shadow (subtle)
 * - Focus lift effect with primary border
 * - Clear error state styling
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ error, fullWidth, inverted = false, className, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={clsx("relative", fullWidth ? "w-full" : "w-auto")}>
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={clsx(
            // Base styles
            "h-11 border-2 px-4 py-3 pr-12 font-body",
            "rounded-[var(--radius-input)]",
            "transition-all duration-100",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Placeholder
            inverted ? "placeholder:text-text-disabled" : "placeholder:text-text-muted",
            // Error state
            error
              ? inverted
                ? clsx(
                    "border-error-500 bg-surface-inverse text-text-primary",
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
                    "border-border bg-surface-inverse text-text-primary",
                    "shadow-[2px_2px_0_rgba(255,255,255,0.1)]",
                    "hover:border-border-primary",
                    "focus:-translate-x-px focus:-translate-y-px focus:border-[var(--color-primary-400)] focus:shadow-[3px_3px_0_var(--color-primary-300)]"
                  )
                : clsx(
                    "border-border bg-surface-primary text-text-primary",
                    "shadow-[2px_2px_0_rgba(0,0,0,0.08)]",
                    "hover:border-border-primary",
                    "focus:-translate-x-px focus:-translate-y-px focus:border-[var(--color-primary-500)] focus:shadow-[3px_3px_0_var(--color-primary-200)]"
                  ),
            "w-full",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={clsx(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "rounded p-1 transition-colors duration-100",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            inverted
              ? "text-text-muted hover:text-white focus:ring-[var(--color-primary-400)] focus:ring-offset-ink-900"
              : "text-text-disabled hover:text-black focus:ring-[var(--color-primary-500)] focus:ring-offset-white"
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    );
  }
);
