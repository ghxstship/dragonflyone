import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  inverted?: boolean;
};

/**
 * Switch component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Chunky toggle with 2px bold borders
 * - Satisfying bounce motion
 * - Hard offset shadow when on
 * - Accent shadow on checked state
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, inverted = true, className, checked, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            aria-checked={checked}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div className={clsx(
            "w-11 h-6 border-2 rounded-[var(--radius-circle)]",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            "peer-focus:ring-2 peer-focus:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            // Unchecked state
            inverted
              ? "border-border bg-transparent shadow-xs"
              : "border-on-light-primary bg-transparent shadow-xs",
            // Checked state
            inverted
              ? "peer-checked:bg-surface-inverse peer-checked:border-surface-inverse peer-checked:shadow-primary"
              : "peer-checked:bg-surface-primary peer-checked:border-surface-primary peer-checked:shadow-primary",
            // Focus state
            inverted
              ? "peer-focus:ring-surface-inverse peer-focus:ring-offset-surface-primary"
              : "peer-focus:ring-surface-primary peer-focus:ring-offset-surface-inverse"
          )} />
          {/* Thumb */}
          <div className={clsx(
            "absolute left-0.5 top-0.5 w-4 h-4 rounded-[var(--radius-circle)]",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            "peer-checked:translate-x-5",
            // Unchecked state
            inverted
              ? "bg-muted border-2 border-border"
              : "bg-surface-primary border-2 border-surface-primary",
            // Checked state
            inverted
              ? "peer-checked:bg-surface-primary peer-checked:border-surface-primary"
              : "peer-checked:bg-surface-inverse peer-checked:border-surface-inverse",
            // Scale on hover
            "group-hover:scale-110",
            "group-active:scale-95"
          )} />
        </div>
        {label ? (
          <span className={clsx(
            "font-body text-sm select-none",
            inverted ? "text-on-dark-secondary" : "text-on-light-muted"
          )}>
            {label}
          </span>
        ) : null}
      </label>
    );
  }
);
