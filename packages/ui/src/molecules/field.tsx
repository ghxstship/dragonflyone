import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  inverted?: boolean;
  children: ReactNode;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  function Field({ label, error, hint, required, inverted = false, children, className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("flex flex-col gap-spacing-2", className)} {...props}>
        {label ? (
          <label className={clsx(
            "font-heading text-h6-sm uppercase tracking-wider",
            inverted ? "text-text-secondary" : "text-text-primary"
          )}>
            {label}
            {required ? <span className={clsx("ml-spacing-1", inverted ? "text-text-primary" : "text-text-primary")}>*</span> : null}
          </label>
        ) : null}
        {children}
        {hint && !error ? (
          <span className={clsx("font-code text-mono-xs", inverted ? "text-text-muted" : "text-text-muted")}>{hint}</span>
        ) : null}
        {error ? (
          <span className={clsx(
            "font-code text-mono-xs uppercase tracking-widest",
            inverted ? "text-error-400" : "text-error-600"
          )}>
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);
