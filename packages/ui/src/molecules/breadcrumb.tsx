import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
  separator?: ReactNode;
};

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ separator = "/", className, children, ...props }, ref) {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={clsx("flex items-center gap-2 text-sm", className)}
        {...props}
      >
        <ol className="flex items-center gap-2">
          {children}
        </ol>
      </nav>
    );
  }
);

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement> & {
  href?: string;
  active?: boolean;
};

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ href, active, className, children, ...props }, ref) {
    return (
      <>
        <li
          ref={ref}
          className={clsx(
            "font-body",
            active ? "text-black" : "text-grey-500",
            className
          )}
          {...props}
        >
          {href && !active ? (
            <a
              href={href}
              className="hover:text-black transition-colors uppercase tracking-wider"
            >
              {children}
            </a>
          ) : (
            <span className="uppercase tracking-wider">{children}</span>
          )}
        </li>
        {!active && (
          <li aria-hidden="true" className="text-grey-400">
            /
          </li>
        )}
      </>
    );
  }
);
