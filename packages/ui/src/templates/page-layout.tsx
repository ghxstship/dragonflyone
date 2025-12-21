import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type PageLayoutProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  background?: "white" | "black";
};

/**
 * PageLayout component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Full-height layout structure
 * - Clean header/footer integration
 * - Dark-first design support
 */
export const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
  function PageLayout({ header, footer, children, background = "white", className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "min-h-screen flex flex-col",
          background === "black" ? "bg-black text-white" : "bg-white text-black",
          className
        )}
        {...props}
      >
        {/* Skip to main content link - visible on focus for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {header}
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        {footer}
      </div>
    );
  }
);
