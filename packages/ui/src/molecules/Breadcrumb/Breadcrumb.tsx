import { forwardRef } from "react";
import React from "react";
import { breadcrumbVariants } from "./Breadcrumb.variants.js";
import type { BreadcrumbProps } from "./Breadcrumb.types.js";

/**
 * Breadcrumb component
 * 
 * A navigation breadcrumb that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 *   <BreadcrumbItem active>Product Details</BreadcrumbItem>
 * </Breadcrumb>
 * ```
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ separator = "/", inverted = true, className, children, ...props }, ref) {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={breadcrumbVariants({ inverted, className })}
        {...props}
      >
        <ol className="flex items-center gap-gap-xs">
          {React.Children.map(children, (child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < React.Children.count(children) - 1 && (
                <span className="text-text-muted mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";
