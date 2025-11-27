import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  separator?: ReactNode;
  inverted?: boolean;
};

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ separator = "/", inverted = false, className, children, ...props }, ref) {
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
  function BreadcrumbItem({ href, active, inverted = false, className, children, ...props }, ref) {
    const activeColor = inverted ? "text-white" : "text-black";
    const inactiveColor = inverted ? "text-grey-400" : "text-grey-500";
    const hoverColor = inverted ? "hover:text-white" : "hover:text-black";

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
