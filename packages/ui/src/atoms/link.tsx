import { forwardRef } from "react";
import clsx from "clsx";
import type { AnchorHTMLAttributes } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "nav" | "footer" | "inline" | "button";
  size?: "sm" | "md" | "lg";
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ variant = "default", size = "md", className, children, ...props }, ref) {
    const variantClasses = {
      default: "text-current hover:text-grey-400 transition-colors",
      nav: "font-heading text-mono-sm uppercase tracking-widest hover:text-grey-400 transition-colors",
      footer: "font-body text-grey-300 hover:text-white transition-colors",
      inline: "underline underline-offset-4 hover:text-grey-400 transition-colors",
      button: "border-2 border-current px-6 py-3 text-mono-sm uppercase tracking-widest transition hover:-translate-y-0.5 hover:bg-white hover:text-black",
    };

    const sizeClasses = {
      sm: "text-body-sm",
      md: "text-body-sm",
      lg: "text-body-md",
    };

    return (
      <a
        ref={ref}
        className={clsx(
          variantClasses[variant],
          variant !== "button" && sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
