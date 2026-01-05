import { forwardRef } from "react";
import clsx from "clsx";
import { checkboxVariants, checkboxCheckmarkImage } from "./Checkbox.variants.js";
import type { CheckboxProps } from "./Checkbox.types.js";

/**
 * Checkbox component
 * 
 * A styled checkbox that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms and conditions"
 *   checked={accepted}
 *   onChange={(e) => setAccepted(e.target.checked)}
 *   required
 * />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className, checked, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className={checkboxVariants({ checked, className: "" })}
            style={{
              backgroundImage: checked ? checkboxCheckmarkImage : "none",
              backgroundSize: "1.25rem 1.25rem",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            {...props}
          />
        </div>
        
        {label && (
          <span className="text-sm font-medium text-[var(--color-text-primary)] select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);
