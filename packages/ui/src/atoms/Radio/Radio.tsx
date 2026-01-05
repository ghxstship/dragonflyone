import { forwardRef } from "react";
import clsx from "clsx";
import { radioVariants } from "./Radio.variants.js";
import type { RadioProps } from "./Radio.types.js";

/**
 * Radio component
 * 
 * A styled radio button that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Radio
 *   label="Option A"
 *   value="a"
 *   checked={selected === "a"}
 *   onChange={(e) => setSelected(e.target.value)}
 * />
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, className, checked, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <input
          ref={ref}
          type="radio"
          checked={checked}
          className={radioVariants({ checked, className: "" })}
          {...props}
        />
        
        {label && (
          <span className={clsx(
            "font-body text-sm select-none",
            "text-[var(--color-text-secondary)]"
          )}>
            {label}
          </span>
        )}
      </label>
    );
  }
);
