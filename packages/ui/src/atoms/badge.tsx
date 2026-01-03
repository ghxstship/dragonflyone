import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type BadgeVariant = "solid" | "outline" | "ghost" | "success" | "warning" | "error" | "info" | "pop";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  /** Custom background color (hex or CSS color) - use for dynamic colors from data */
  color?: string;
  /** Custom text color (hex or CSS color) - defaults to white when color is set */
  textColor?: string;
};

/**
 * Badge component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Sharp corners (2px radius) for label-like aesthetic
 * - 2px bold borders
 * - Uppercase, wide tracking
 * - Pop variant with accent shadow
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ variant = "solid", size = "md", inverted = false, color, textColor, className, children, style, ...props }, ref) {
    const getVariantClasses = () => {
      // Semantic status variants with bold borders
      if (variant === "success") {
        return "bg-success-500 text-white border-2 border-success-500";
      }
      if (variant === "warning") {
        return "bg-warning-500 text-white border-2 border-warning-500";
      }
      if (variant === "error") {
        return "bg-error-500 text-white border-2 border-error-500";
      }
      if (variant === "info") {
        return "bg-info-500 text-white border-2 border-info-500";
      }
      if (variant === "pop") {
        return inverted
          ? "bg-surface-inverse text-on-dark-primary border-2 border-on-dark-primary shadow-[2px_2px_0_hsl(var(--primary))]"
          : "bg-white text-black border-2 border-black shadow-[2px_2px_0_hsl(var(--primary))]";
      }

      // Theme-aware base variants
      if (inverted) {
        switch (variant) {
          case "solid":
            return "bg-white text-black border-2 border-white";
          case "outline":
            return "border-2 border-border text-on-dark-secondary bg-transparent";
          case "ghost":
            return "text-on-dark-secondary bg-surface-elevated border-2 border-transparent";
          default:
            return "";
        }
      } else {
        switch (variant) {
          case "solid":
            return "bg-black text-white border-2 border-black";
          case "outline":
            return "border-2 border-black text-black bg-white";
          case "ghost":
            return "text-on-light-primary bg-muted border-2 border-transparent";
          default:
            return "";
        }
      }
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-3 py-1 text-xs",
      lg: "px-4 py-1.5 text-sm",
    };

    // Custom color styles override variant classes
    const customColorStyle = color ? {
      backgroundColor: color,
      color: textColor || '#ffffff',
      borderColor: color,
      ...style,
    } : style;

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center",
          "font-code uppercase tracking-widest leading-none font-bold",
          "rounded-[var(--radius-badge)]",
          // Only apply variant classes if no custom color
          !color && getVariantClasses(),
          // Always apply border-2 for consistent styling
          color && "border-2",
          sizeClasses[size],
          className
        )}
        style={customColorStyle}
        {...props}
      >
        {children}
      </span>
    );
  }
);
