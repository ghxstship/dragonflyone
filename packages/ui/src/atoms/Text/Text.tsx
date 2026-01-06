"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { textVariants } from "./Text.variants.js";
import type { TextProps } from "./Text.types.js";

/**
 * Text component - Flexible text element with variants
 * 
 * @example
 * ```tsx
 * <Text
 *   as="span"
 *   variant="muted"
 *   size="sm"
 *   weight="medium"
 * >
 *   Some text
 * </Text>
 * ```
 */
export const Text = forwardRef<HTMLSpanElement, TextProps>(
  function Text({ 
    variant = "default", 
    size = "md", 
    weight = "normal", 
    inverted = false, 
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <span
        ref={ref}
        className={clsx(
          textVariants({
            variant,
            size,
            weight,
            
            className,
          })
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export default Text;
