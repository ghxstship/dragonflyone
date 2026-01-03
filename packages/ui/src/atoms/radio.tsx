import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  inverted?: boolean;
};

/**
 * Radio component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - 2px bold borders
 * - Bold selection indicator
 * - Satisfying scale animation on select
 * - Hard offset shadow when selected
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, inverted = false, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <input
          ref={ref}
          type="radio"
          className={clsx(
            "w-5 h-5 border-2 rounded-[var(--radius-circle)] appearance-none cursor-pointer relative",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // Unchecked state
            inverted
              ? "border-border bg-transparent shadow-xs"
              : "border-on-light-primary bg-transparent shadow-xs",
            // Checked state
            inverted
              ? "checked:bg-surface-inverse checked:border-surface-inverse checked:shadow-primary"
              : "checked:bg-surface-primary checked:border-surface-primary checked:shadow-primary",
            // Focus state
            inverted
              ? "focus:ring-surface-inverse focus:ring-offset-surface-primary"
              : "focus:ring-surface-primary focus:ring-offset-surface-inverse",
            // Hover lift
            "hover:-translate-x-px hover:-translate-y-px",
            "checked:hover:shadow-primary",
            // Active press
            "active:translate-x-0 active:translate-y-0",
            // Inner dot indicator
            "after:content-[''] after:absolute after:inset-[5px] after:rounded-[var(--radius-circle)]",
            "after:opacity-0 after:scale-0",
            "checked:after:opacity-100 checked:after:scale-100",
            "after:transition-all after:duration-100 after:ease-[var(--ease-bounce)]",
            inverted ? "after:bg-surface-primary" : "after:bg-surface-inverse"
          )}
          {...props}
        />
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
