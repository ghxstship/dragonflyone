import { forwardRef } from "react";
import { badgeVariants } from "./Badge.variants.js";
import type { BadgeProps } from "./Badge.types.js";

/**
 * Badge component
 * 
 * A styled badge that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Badge variant="success" size="lg">
 *   Active
 * </Badge>
 * ```
 * 
 * @example
 * ```tsx
 * <Badge color="#ff6b6b" textColor="#ffffff">
 *   Custom Color
 * </Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ 
    variant = "solid", 
    size = "md", 
    color, 
    textColor, 
    className, 
    children, 
    style, 
    ...props 
  }, ref) {
    // Custom color styles override variant classes
    const customColorStyle = color ? {
      backgroundColor: color,
      color: textColor || 'var(--color-text-inverse)',
      borderColor: color,
      ...style,
    } : style;

    return (
      <span
        ref={ref}
        className={badgeVariants({ 
          variant: color ? undefined : variant, // Don't apply variant if custom color
          size, 
          className 
        })}
        style={customColorStyle}
        {...props}
      >
        {children}
      </span>
    );
  }
);
