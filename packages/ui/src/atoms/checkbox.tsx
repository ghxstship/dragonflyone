import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  inverted?: boolean;
};

// Checkmark icons for light and dark themes (bold 4px stroke)
const checkmarkLight = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkw5IDE3TDQgMTIiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";
const checkmarkDark = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkw5IDE3TDQgMTIiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9zdmc+";

/**
 * Checkbox component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - 2px bold borders
 * - Bold checkmark (4px stroke)
 * - Satisfying scale animation on check
 * - Hard offset shadow when checked
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, inverted = false, className, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={clsx(
              "peer w-5 h-5 border-2 appearance-none cursor-pointer relative",
              "rounded-[var(--radius-badge)]",
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
              // Checkmark
              "after:content-[''] after:absolute after:inset-0 after:bg-center after:bg-no-repeat after:bg-[length:14px_14px]",
              "after:opacity-0 after:scale-50",
              "checked:after:opacity-100 checked:after:scale-100",
              "after:transition-all after:duration-100 after:ease-[var(--ease-bounce)]"
            )}
            style={{
              ["--checkmark-url" as string]: `url('${inverted ? checkmarkDark : checkmarkLight}')`,
            }}
            {...props}
          />
          <style>{`
            input[type="checkbox"]::after {
              background-image: var(--checkmark-url);
            }
          `}</style>
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
