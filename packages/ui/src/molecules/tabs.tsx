import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

export type TabsVariant = "line" | "enclosed";

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TabsVariant;
  inverted?: boolean;
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ variant = "line", inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        {children}
      </div>
    );
  }
);

export type TabsListProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TabsVariant;
  inverted?: boolean;
};

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ variant = "line", inverted = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="tablist"
        className={clsx(
          "flex gap-gap-xs",
          variant === "line" && (inverted ? "border-b-2 border-grey-700" : "border-b-2 border-grey-200"),
          variant === "enclosed" && (inverted ? "border-2 border-grey-600" : "border-2 border-black"),
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
  variant?: TabsVariant;
  inverted?: boolean;
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  function Tab({ active, variant = "line", inverted = false, className, children, ...props }, ref) {
    const getLineClasses = () => {
      if (inverted) {
        return active
          ? "border-b-2 border-white text-white"
          : "text-grey-400 hover:text-white";
      }
      return active
        ? "border-b-2 border-black text-black"
        : "text-grey-500 hover:text-black";
    };

    const getEnclosedClasses = () => {
      if (inverted) {
        return [
          active
            ? "bg-white text-black"
            : "bg-transparent text-grey-300 hover:bg-grey-800 hover:text-white",
          "border-r-2 border-grey-600 last:border-r-0",
        ];
      }
      return [
        active
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-grey-100",
        "border-r-2 border-black last:border-r-0",
      ];
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        className={clsx(
          "px-spacing-4 py-spacing-2 font-heading uppercase text-mono-sm tracking-wider transition-colors duration-base",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          inverted ? "focus:ring-white focus:ring-offset-ink-950" : "focus:ring-black focus:ring-offset-white",
          variant === "line" && getLineClasses(),
          variant === "enclosed" && getEnclosedClasses(),
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  inverted?: boolean;
};

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel({ active, inverted = false, className, children, ...props }, ref) {
    if (!active) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={clsx("py-spacing-4", inverted ? "text-grey-200" : "text-grey-800", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
