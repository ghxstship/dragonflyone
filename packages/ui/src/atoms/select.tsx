import { forwardRef } from "react";
import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
};

// SVG chevron icons encoded as base64 for light and dark themes
const chevronLight = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";
const chevronDark = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA5TDEyIDE1TDE4IDkiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error, fullWidth, inverted = false, className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={clsx(
          "font-body px-spacing-4 py-spacing-3 border-2 transition-colors appearance-none bg-no-repeat bg-[length:1.5rem_1.5rem] bg-[right_0.5rem_center]",
          "focus:outline-none focus:ring-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? inverted
              ? "border-grey-500 bg-grey-900 text-white focus:border-grey-400"
              : "border-black bg-grey-100 text-black focus:border-black"
            : inverted
              ? "border-grey-700 bg-ink-900 text-white focus:border-grey-500 hover:border-grey-600"
              : "border-grey-300 bg-white text-black focus:border-black hover:border-grey-400",
          fullWidth ? "w-full" : "w-auto",
          className
        )}
        style={{
          backgroundImage: `url('${inverted ? chevronDark : chevronLight}')`,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
