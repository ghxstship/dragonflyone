import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  inverted?: boolean;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, inverted = false, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-spacing-3 cursor-pointer", className)}>
        <input
          ref={ref}
          type="radio"
          className={clsx(
            "w-spacing-5 h-spacing-5 border-2 rounded-full appearance-none cursor-pointer relative",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            inverted
              ? "border-grey-500 bg-transparent checked:bg-white checked:border-white focus:ring-white focus:ring-offset-ink-950"
              : "border-black bg-transparent checked:bg-black checked:border-black focus:ring-black focus:ring-offset-white",
            "after:content-[''] after:absolute after:inset-[4px] after:rounded-full after:opacity-0 checked:after:opacity-100",
            inverted ? "after:bg-black" : "after:bg-white"
          )}
          {...props}
        />
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
