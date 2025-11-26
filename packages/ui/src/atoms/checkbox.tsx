import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            "w-5 h-5 border-2 border-black appearance-none cursor-pointer",
            "checked:bg-black checked:border-black",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "relative",
            "after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkw5IDE3TDQgMTIiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+')] after:bg-center after:bg-no-repeat after:bg-contain after:opacity-0 checked:after:opacity-100"
          )}
          {...props}
        />
        {label ? <span className="font-body text-body-sm select-none">{label}</span> : null}
      </label>
    );
  }
);
