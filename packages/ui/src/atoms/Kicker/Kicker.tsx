"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { kickerVariants } from "./Kicker.variants.js";
import type { KickerProps } from "./Kicker.types.js";

/**
 * Kicker component - Bold Contemporary Pop Art Adventure
 * 
 * A small uppercase label used above headings.
 * Features bold typography and clear visual hierarchy.
 * 
 * Color scheme determines text color for WCAG AA compliance:
 * - on-dark: For dark backgrounds (ink-700 to ink-950)
 * - on-light: For light backgrounds (ink-50 to ink-200)
 * - on-mid: For mid-tone backgrounds (ink-400 to ink-600)
 * 
 * @example
 * ```tsx
 * <Kicker size="md" variant="accent" colorScheme="on-dark">
 *   Section Label
 * </Kicker>
 * ```
 */
export const Kicker = forwardRef<HTMLSpanElement, KickerProps>(
  function Kicker({ 
    size = "md", 
    variant = "default", 
    colorScheme = "on-dark", 
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <span
        ref={ref}
        className={clsx(
          kickerVariants({ 
            size, 
            variant, 
            colorScheme, 
            className 
          })
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export default Kicker;
