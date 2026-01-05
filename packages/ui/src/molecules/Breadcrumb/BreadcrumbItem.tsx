import { forwardRef } from "react";
import { breadcrumbItemVariants } from "./Breadcrumb.variants.js";
import type { BreadcrumbItemProps } from "./Breadcrumb.types.js";

/**
 * BreadcrumbItem component
 * 
 * An individual breadcrumb item that can be a link or plain text.
 * 
 * @example
 * ```tsx
 * <BreadcrumbItem href="/">Home</BreadcrumbItem>
 * <BreadcrumbItem active>Current Page</BreadcrumbItem>
 * ```
 */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ href, active, inverted = true, className, children, ...props }, ref) {
    const Component = href ? "a" : "span";
    
    return (
      <li
        ref={ref}
        className={breadcrumbItemVariants({ active, inverted, className })}
        {...props}
      >
        <Component
          href={href}
          className="inline-block"
          {...(href ? { 
            onClick: (e) => {
              // Prevent default for demo purposes - in real app, let the link work
              if (href.startsWith("#")) {
                e.preventDefault();
              }
            }
          } : {})}
        >
          {children}
        </Component>
      </li>
    );
  }
);

BreadcrumbItem.displayName = "BreadcrumbItem";
