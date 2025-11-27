import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  inverted?: boolean;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, inverted = false, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-spacing-3 cursor-pointer", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div className={clsx(
            "w-spacing-11 h-spacing-6 border-2 transition-colors",
            "peer-focus:ring-2 peer-focus:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            inverted
              ? "border-grey-500 peer-checked:bg-white peer-checked:border-white peer-focus:ring-white peer-focus:ring-offset-ink-950"
              : "border-black peer-checked:bg-black peer-focus:ring-black peer-focus:ring-offset-white"
          )} />
          <div className={clsx(
            "absolute left-spacing-0.5 top-spacing-0.5 w-spacing-4 h-spacing-4 transition-transform peer-checked:translate-x-5",
            inverted
              ? "bg-grey-400 peer-checked:bg-black"
              : "bg-black peer-checked:bg-white"
          )} />
        </div>
        {label ? (
          <span className={clsx(
            "font-body text-body-sm select-none",
            inverted ? "text-grey-200" : "text-grey-800"
          )}>
            {label}
          </span>
        ) : null}
      </label>
    );
  }
);
