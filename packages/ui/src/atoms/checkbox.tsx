import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  inverted?: boolean;
};

// Checkmark icons for light and dark themes
const checkmarkLight = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkw5IDE3TDQgMTIiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";
const checkmarkDark = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkw5IDE3TDQgMTIiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, inverted = false, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-spacing-3 cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            "w-spacing-5 h-spacing-5 border-2 appearance-none cursor-pointer relative",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            inverted
              ? "border-grey-500 bg-transparent checked:bg-white checked:border-white focus:ring-white focus:ring-offset-ink-950"
              : "border-black bg-transparent checked:bg-black checked:border-black focus:ring-black focus:ring-offset-white",
            "after:content-[''] after:absolute after:inset-0 after:bg-center after:bg-no-repeat after:bg-contain after:opacity-0 checked:after:opacity-100"
          )}
          style={{
            // Use appropriate checkmark color based on theme
            ["--checkmark-url" as string]: `url('${inverted ? checkmarkDark : checkmarkLight}')`,
          }}
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
