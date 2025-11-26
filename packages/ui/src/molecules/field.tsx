import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  function Field({ label, error, hint, required, children, className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("flex flex-col gap-2", className)} {...props}>
        {label ? (
          <label className="font-heading text-h6-sm uppercase tracking-wider">
            {label}
            {required ? <span className="ml-1 text-black">*</span> : null}
          </label>
        ) : null}
        {children}
        {hint && !error ? (
          <span className="font-code text-mono-xs text-grey-500">{hint}</span>
        ) : null}
        {error ? (
          <span className="font-code text-mono-xs text-black uppercase tracking-widest">
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);
