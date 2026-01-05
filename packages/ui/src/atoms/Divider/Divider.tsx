import { forwardRef } from "react";
import { dividerVariants } from "./Divider.variants.js";
import type { DividerProps } from "./Divider.types.js";

/**
 * Divider component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Default 2px weight (medium) for bold aesthetic
 * - Thick option for maximum impact
 * - Clean geometric lines
 * 
 * @example
 * ```tsx
 * <Divider />
 * <Divider orientation="vertical" weight="thick" />
 * <Divider inverted />
 * ```
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  function Divider({ 
    orientation = "horizontal", 
    weight = "medium", 
    inverted = false, 
    className, 
    ...props 
  }, ref) {
    return (
      <hr
        ref={ref}
        className={dividerVariants({ orientation, weight, inverted, className })}
        {...props}
      />
    );
  }
);
