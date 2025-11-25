import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer", className)}>
        <input
          ref={ref}
          type="radio"
          className={clsx(
            "w-5 h-5 border-2 border-black rounded-full appearance-none cursor-pointer",
            "checked:bg-black checked:border-black",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "relative",
            "after:content-[''] after:absolute after:inset-[4px] after:bg-white after:rounded-full after:opacity-0 checked:after:opacity-100"
          )}
          {...props}
        />
        {label ? <span className="font-body text-[1rem] select-none">{label}</span> : null}
      </label>
    );
  }
);
