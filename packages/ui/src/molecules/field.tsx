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
            inverted ? "text-grey-200" : "text-black"
          )}>
            {label}
            {required ? <span className={clsx("ml-spacing-1", inverted ? "text-white" : "text-black")}>*</span> : null}
          </label>
        ) : null}
        {children}
        {hint && !error ? (
          <span className={clsx("font-code text-mono-xs", inverted ? "text-grey-400" : "text-grey-500")}>{hint}</span>
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
