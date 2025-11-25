import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "div" | "strong" | "em" | "small";
  variant?: "default" | "muted" | "mono" | "accent";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(
  function Text({ as: Component = "span", variant = "default", size = "md", weight = "normal", className, children, ...props }, ref) {
    const variantClasses = {
      default: "text-current",
      muted: "text-grey-500",
      mono: "font-code",
      accent: "text-white",
    };

    const sizeClasses = {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    return (
      <Component
        ref={ref as any}
        className={clsx(
          variantClasses[variant],
          sizeClasses[size],
          weightClasses[weight],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
