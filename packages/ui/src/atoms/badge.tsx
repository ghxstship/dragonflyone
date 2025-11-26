import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "solid" | "outline" | "ghost" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ variant = "solid", size = "md", className, children, ...props }, ref) {
    const variantClasses = {
      // Base variants (monochrome)
      solid: "bg-black text-white",
      outline: "border-2 border-black text-black bg-white",
      ghost: "text-black bg-grey-100",
      // Semantic status variants
      success: "bg-success-500 text-white",
      warning: "bg-warning-500 text-white",
      error: "bg-error-500 text-white",
      info: "bg-info-500 text-white",
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-mono-xxs",
      md: "px-2.5 py-1 text-mono-xs",
      lg: "px-3 py-1.5 text-mono-md",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center font-code uppercase tracking-widest leading-none",
          variantClasses[variant],
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
