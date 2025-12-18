"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import type { AnchorHTMLAttributes } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "nav" | "footer" | "inline" | "button";
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  /** Prefetch hint - when true, adds data-prefetch attribute for router integration */
  prefetch?: boolean;
  /** Callback for hover-based prefetch trigger */
  onPrefetch?: () => void;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ variant = "default", size = "md", inverted = false, prefetch = false, onPrefetch, className, children, onMouseEnter, ...props }, ref) {
    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch && onPrefetch) {
        onPrefetch();
      }
      onMouseEnter?.(e);
    };
    const getVariantClasses = () => {
      if (inverted) {
        switch (variant) {
          case "default":
            return "text-current hover:text-grey-300 transition-colors";
          case "nav":
            return "font-heading text-mono-sm uppercase tracking-widest leading-none hover:text-grey-300 transition-colors";
          case "footer":
            return "font-body text-grey-500 hover:text-black transition-colors";
          case "inline":
            return "underline underline-offset-4 hover:text-grey-300 transition-colors";
          case "button":
            return "border-2 border-current px-spacing-6 py-spacing-3 text-mono-sm uppercase tracking-widest leading-none transition hover:-translate-y-0.5 hover:bg-black hover:text-white";
          default:
            return "";
        }
      } else {
        switch (variant) {
          case "default":
            return "text-current hover:text-grey-400 transition-colors";
          case "nav":
            return "font-heading text-mono-sm uppercase tracking-widest leading-none hover:text-grey-400 transition-colors";
          case "footer":
            return "font-body text-grey-300 hover:text-white transition-colors";
          case "inline":
            return "underline underline-offset-4 hover:text-grey-400 transition-colors";
          case "button":
            return "border-2 border-current px-spacing-6 py-spacing-3 text-mono-sm uppercase tracking-widest leading-none transition hover:-translate-y-0.5 hover:bg-white hover:text-black";
          default:
            return "";
        }
      }
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
          getVariantClasses(),
          variant !== "button" && sizeClasses[size],
          className
        )}
        onMouseEnter={handleMouseEnter}
        data-prefetch={prefetch || undefined}
        {...props}
      >
        {children}
      </a>
    );
  }
);
