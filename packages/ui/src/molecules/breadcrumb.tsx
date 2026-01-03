import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  separator?: ReactNode;
  inverted?: boolean;
};

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ separator: _separator = "/", inverted: _inverted = true, className, children, ...props }, ref) {
    // Note: separator and inverted are passed via props spread to children or used for context
    // They are destructured here to prevent them from being passed to the nav element
    void _separator;
    void _inverted;
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={clsx("flex items-center gap-gap-xs text-body-sm", className)}
        {...props}
      >
        <ol className="flex items-center gap-gap-xs">
          {children}
        </ol>
      </nav>
    );
  }
);

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement> & {
  href?: string;
  active?: boolean;
  inverted?: boolean;
};

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ href, active, inverted = true, className, children, ...props }, ref) {
    const activeColor = inverted ? "text-text-primary" : "text-text-primary";
    const inactiveColor = inverted ? "text-text-muted" : "text-text-muted";
    const hoverColor = inverted ? "hover:text-text-primary" : "hover:text-text-primary";

    return (
      <>
        <li
          ref={ref}
          className={clsx(
            "font-body",
            active ? activeColor : inactiveColor,
            className
          )}
          {...props}
        >
          {href && !active ? (
            <a
              href={href}
              className={clsx("transition-colors uppercase tracking-wider", hoverColor)}
            >
              {children}
            </a>
          ) : (
            <span className="uppercase tracking-wider">{children}</span>
          )}
        </li>
        {!active && (
          <li aria-hidden="true" className={inactiveColor}>
            /
          </li>
        )}
      </>
    );
  }
);
