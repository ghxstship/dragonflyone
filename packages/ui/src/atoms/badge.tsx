import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ variant = "solid", size = "md", className, children, ...props }, ref) {
    const variantClasses = {
      solid: "bg-black text-white",
      outline: "border-2 border-black text-black bg-white",
      ghost: "text-black bg-grey-100",
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-[0.6875rem]",  // 11px
      md: "px-2.5 py-1 text-[0.75rem]",    // 12px
      lg: "px-3 py-1.5 text-[0.875rem]",   // 14px
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
