"use client";

import { forwardRef } from "react";
import { linkVariants } from "./Link.variants.js";
import type { LinkProps } from "./Link.types.js";

/**
 * Link component
 * 
 * A styled link that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Link href="/about" variant="nav" prefetch onPrefetch={() => prefetchRoute('/about')}>
 *   About
 * </Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ 
    variant = "default", 
    size = "md", 
    prefetch = false, 
    onPrefetch, 
    className, 
    children, 
    onMouseEnter,
    ...props 
  }, ref) {
    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch && onPrefetch) {
        onPrefetch();
      }
      onMouseEnter?.(e);
    };

    return (
      <a
        ref={ref}
        className={linkVariants({ 
          variant: variant === "button" ? "button" : variant, 
          size: variant === "button" ? undefined : size, 
          className 
        })}
        onMouseEnter={handleMouseEnter}
        data-prefetch={prefetch || undefined}
        {...props}
      >
        {children}
      </a>
    );
  }
);
