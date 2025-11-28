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
  function Switch({ label, inverted = false, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div className={clsx(
            "w-11 h-6 border-2 rounded-full",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            "peer-focus:ring-2 peer-focus:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            // Unchecked state
            inverted
              ? "border-grey-500 bg-transparent shadow-[2px_2px_0_rgba(255,255,255,0.1)]"
              : "border-black bg-transparent shadow-[2px_2px_0_rgba(0,0,0,0.1)]",
            // Checked state
            inverted
              ? "peer-checked:bg-white peer-checked:border-white peer-checked:shadow-[3px_3px_0_hsl(239,84%,67%)]"
              : "peer-checked:bg-black peer-checked:border-black peer-checked:shadow-[3px_3px_0_hsl(239,84%,67%)]",
            // Focus state
            inverted
              ? "peer-focus:ring-white peer-focus:ring-offset-ink-950"
              : "peer-focus:ring-black peer-focus:ring-offset-white"
          )} />
          {/* Thumb */}
          <div className={clsx(
            "absolute left-0.5 top-0.5 w-4 h-4 rounded-full",
            "transition-all duration-100 ease-[var(--ease-bounce)]",
            "peer-checked:translate-x-5",
            // Unchecked state
            inverted
              ? "bg-grey-400 border-2 border-grey-500"
              : "bg-black border-2 border-black",
            // Checked state
            inverted
              ? "peer-checked:bg-black peer-checked:border-black"
              : "peer-checked:bg-white peer-checked:border-white",
            // Scale on hover
            "group-hover:scale-110",
            "group-active:scale-95"
          )} />
        </div>
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
