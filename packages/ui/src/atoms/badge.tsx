import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type BadgeVariant = "solid" | "outline" | "ghost" | "success" | "warning" | "error" | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ variant = "solid", size = "md", inverted = false, className, children, ...props }, ref) {
    const getVariantClasses = () => {
      // Semantic status variants remain the same regardless of theme
      if (variant === "success") return "bg-success-500 text-white";
      if (variant === "warning") return "bg-warning-500 text-white";
      if (variant === "error") return "bg-error-500 text-white";
      if (variant === "info") return "bg-info-500 text-white";

      // Theme-aware base variants
      if (inverted) {
        switch (variant) {
          case "solid":
            return "bg-white text-black";
          case "outline":
            return "border-2 border-grey-500 text-grey-200 bg-transparent";
          case "ghost":
            return "text-grey-200 bg-grey-800";
          default:
            return "";
        }
      } else {
        switch (variant) {
          case "solid":
            return "bg-black text-white";
          case "outline":
            return "border-2 border-black text-black bg-white";
          case "ghost":
            return "text-black bg-grey-100";
          default:
            return "";
        }
      }
    };

    const sizeClasses = {
      sm: "px-spacing-2 py-spacing-0.5 text-mono-xxs",
      md: "px-spacing-2.5 py-spacing-1 text-mono-xs",
      lg: "px-spacing-3 py-spacing-1.5 text-mono-md",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center font-code uppercase tracking-widest leading-none",
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
