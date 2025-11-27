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
      xs: "text-mono-xs",
      sm: "text-body-sm",
      md: "text-body-sm",
      lg: "text-body-md",
      xl: "text-body-lg",
    };

    // Note: Font weights have no effect on design system fonts (Anton, Bebas Neue, Share Tech)
    // These are kept for semantic purposes but will not visually change the text
    const weightClasses = {
      normal: "",
      medium: "",
      semibold: "",
      bold: "",
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
