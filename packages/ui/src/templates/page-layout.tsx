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
        {header}
        <main className="flex-1">{children}</main>
        {footer}
      </div>
    );
  }
);
