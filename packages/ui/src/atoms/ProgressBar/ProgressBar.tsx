import { forwardRef } from "react";
import clsx from "clsx";
import { 
  progressBarTrackVariants, 
  progressBarFillVariants, 
  progressBarLabelVariants 
} from "./ProgressBar.variants.js";
import type { ProgressBarProps } from "./ProgressBar.types.js";

/**
 * ProgressBar component
 * 
 * A progress bar that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <ProgressBar value={75} variant="success" showLabel />
 * ```
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { 
      value, 
      max = 100, 
      size = "md", 
      variant = "default", 
      showLabel = false, 
      className, 
      ...props 
    },
    ref
  ) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        <div 
          className={progressBarTrackVariants({ size, variant })}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={props['aria-label'] || `Progress: ${percentage.toFixed(0)}%`}
        >
          <div
            className={progressBarFillVariants({ variant })}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {showLabel && (
          <span 
            className={progressBarLabelVariants({ variant })} 
            aria-hidden="true"
          >
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }
);
