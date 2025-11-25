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
          <label className="font-heading text-[1rem] uppercase tracking-wider">
            {label}
            {required ? <span className="ml-1 text-black">*</span> : null}
          </label>
        ) : null}
        {children}
        {hint && !error ? (
          <span className="font-code text-[0.75rem] text-grey-500">{hint}</span>
        ) : null}
        {error ? (
          <span className="font-code text-[0.75rem] text-black uppercase tracking-widest">
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);
