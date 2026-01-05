import { forwardRef } from "react";
import clsx from "clsx";
import { switchTrackVariants, switchThumbVariants } from "./Switch.variants.js";
import type { SwitchProps } from "./Switch.types.js";

/**
 * Switch component
 * 
 * A styled toggle switch that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Switch
 *   label="Enable notifications"
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 * />
 * ```
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, className, checked, ...props }, ref) {
    return (
      <label className={clsx("inline-flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            aria-checked={checked}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          
          {/* Track */}
          <div className={switchTrackVariants({ checked })} />
          
          {/* Thumb */}
          <div className={switchThumbVariants({ checked })} />
        </div>
        
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
