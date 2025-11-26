import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div className={clsx(
            "w-11 h-6 border-2 border-black transition-colors",
            "peer-checked:bg-black peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-black",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
          )} />
          <div className={clsx(
            "absolute left-0.5 top-0.5 w-4 h-4 bg-black transition-transform",
            "peer-checked:translate-x-5 peer-checked:bg-white"
          )} />
        </div>
        {label ? <span className="font-body text-body-sm select-none">{label}</span> : null}
      </label>
    );
  }
);
