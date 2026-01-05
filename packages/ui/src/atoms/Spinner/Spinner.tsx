import { forwardRef } from "react";
import clsx from "clsx";
import { 
  spinnerVariants, 
  spinnerContainerVariants, 
  spinnerTextVariants 
} from "./Spinner.variants.js";
import type { SpinnerProps } from "./Spinner.types.js";

/**
 * Spinner component
 * 
 * A loading spinner that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Spinner size="lg" variant="white" text="Loading..." />
 * ```
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  function Spinner({ 
    size = "md", 
    variant = "black", 
    text, 
    className, 
    ...props 
  }, ref) {
    const spinnerElement = (
      <div
        className={spinnerVariants({ size, variant })}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );

    if (!text) {
      return (
        <div ref={ref} className={className} {...props}>
          {spinnerElement}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          spinnerContainerVariants({ size }),
          className
        )}
        {...props}
      >
        {spinnerElement}
        <p className={spinnerTextVariants({ variant })}>
          {text}
        </p>
      </div>
    );
  }
);
