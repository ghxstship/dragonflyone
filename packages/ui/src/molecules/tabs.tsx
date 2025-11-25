import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "line" | "enclosed";
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ variant = "line", className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        {children}
      </div>
    );
  }
);

export const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { variant?: "line" | "enclosed" }>(
  function TabsList({ variant = "line", className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="tablist"
        className={clsx(
          "flex gap-1",
          variant === "line" && "border-b-2 border-grey-200",
          variant === "enclosed" && "border-2 border-black",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: "line" | "enclosed";
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  function Tab({ active, variant = "line", className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        className={clsx(
          "px-4 py-2 font-heading uppercase text-sm tracking-wider transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
          variant === "line" && [
            active
              ? "border-b-2 border-black text-black"
              : "text-grey-500 hover:text-black",
          ],
          variant === "enclosed" && [
            active
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-grey-100",
            "border-r-2 border-black last:border-r-0",
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export const TabPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { active?: boolean }>(
  function TabPanel({ active, className, children, ...props }, ref) {
    if (!active) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={clsx("py-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
