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
            "w-5 h-5 border-2 rounded-full appearance-none cursor-pointer relative",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // Unchecked state
            inverted
              ? "border-grey-500 bg-transparent shadow-[2px_2px_0_rgba(255,255,255,0.1)]"
              : "border-black bg-transparent shadow-[2px_2px_0_rgba(0,0,0,0.1)]",
            // Checked state
            inverted
              ? "checked:bg-white checked:border-white checked:shadow-[3px_3px_0_hsl(239,84%,67%)]"
              : "checked:bg-black checked:border-black checked:shadow-[3px_3px_0_hsl(239,84%,67%)]",
            // Focus state
            inverted
              ? "focus:ring-white focus:ring-offset-ink-950"
              : "focus:ring-black focus:ring-offset-white",
            // Hover lift
            "hover:-translate-x-px hover:-translate-y-px",
            "checked:hover:shadow-[4px_4px_0_hsl(239,84%,67%)]",
            // Active press
            "active:translate-x-0 active:translate-y-0",
            // Inner dot indicator
            "after:content-[''] after:absolute after:inset-[5px] after:rounded-full",
            "after:opacity-0 after:scale-0",
            "checked:after:opacity-100 checked:after:scale-100",
            "after:transition-all after:duration-100 after:ease-[var(--ease-bounce)]",
            inverted ? "after:bg-black" : "after:bg-white"
          )}
          {...props}
        />
        {label ? (
          <span className={clsx(
            "font-body text-sm select-none",
            inverted ? "text-grey-200" : "text-grey-800"
          )}>
            {label}
          </span>
        ) : null}
      </label>
    );
  }
);
