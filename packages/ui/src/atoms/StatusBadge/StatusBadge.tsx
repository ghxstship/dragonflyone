"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { statusBadgeVariants } from "./StatusBadge.variants.js";
import type { StatusBadgeProps } from "./StatusBadge.types.js";

/**
 * StatusBadge component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px borders
 * - Sharp corners (2px radius)
 * - High contrast status colors
 * 
 * @example
 * ```tsx
 * <StatusBadge
 *   status="success"
 *   size="md"
 *   filled={false}
 *   inverted={false}
 * >
 *   Active
 * </StatusBadge>
 * ```
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge({ 
    status, 
    size = "md", 
    filled = false, 
    inverted = false, 
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <span
        ref={ref}
        className={clsx(
          statusBadgeVariants({
            status,
            size,
            filled,
            
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

export default StatusBadge;
