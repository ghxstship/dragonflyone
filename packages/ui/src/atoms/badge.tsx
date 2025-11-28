import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type BadgeVariant = "solid" | "outline" | "ghost" | "success" | "warning" | "error" | "info" | "pop";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
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
  function Badge({ variant = "solid", size = "md", inverted = false, className, children, ...props }, ref) {
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
          ? "bg-ink-950 text-white border-2 border-white shadow-[2px_2px_0_hsl(239,84%,67%)]"
          : "bg-white text-black border-2 border-black shadow-[2px_2px_0_hsl(239,84%,67%)]";
      }

      // Theme-aware base variants
      if (inverted) {
        switch (variant) {
          case "solid":
            return "bg-white text-black border-2 border-white";
          case "outline":
            return "border-2 border-grey-500 text-grey-200 bg-transparent";
          case "ghost":
            return "text-grey-200 bg-grey-800 border-2 border-transparent";
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
            return "text-black bg-grey-100 border-2 border-transparent";
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

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center",
          "font-code uppercase tracking-widest leading-none font-bold",
          "rounded-[var(--radius-badge)]",
          getVariantClasses(),
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
