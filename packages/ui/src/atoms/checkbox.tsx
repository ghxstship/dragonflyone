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
                ? "border-border bg-transparent shadow-xs"
                : "border-on-light-primary bg-transparent shadow-xs",
              // Checked state
              inverted
                ? "checked:bg-surface-inverse checked:border-surface-inverse checked:shadow-primary"
                : "checked:bg-surface-primary checked:border-surface-primary checked:shadow-primary",
              // Focus state
              inverted
                ? "focus:ring-surface-inverse focus:ring-offset-surface-primary"
                : "focus:ring-surface-primary focus:ring-offset-surface-inverse",
              // Hover lift
              "hover:-translate-x-px hover:-translate-y-px",
              "checked:hover:shadow-primary",
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
            inverted ? "text-text-secondary" : "text-text-muted"
          )}>
            {label}
          </span>
        ) : null}
      </label>
    );
  }
);
