import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ButtonHTMLAttributes } from "react";

export type TabsVariant = "line" | "enclosed" | "pop";

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TabsVariant;
  inverted?: boolean;
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ variant: _variant = "line", inverted: _inverted = false, className, children, ...props }, ref) {
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

/**
 * TabsList - Bold Contemporary Pop Art Adventure
 * Features bold underlines and enclosed panel style
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ variant = "line", inverted = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="tablist"
        className={clsx(
          "flex gap-1",
          variant === "line" && (inverted ? "border-b-2 border-grey-700" : "border-b-2 border-grey-200"),
          variant === "enclosed" && (inverted ? "border-2 border-grey-600 rounded-[var(--radius-card)]" : "border-2 border-black rounded-[var(--radius-card)]"),
          variant === "pop" && (inverted ? "border-2 border-white rounded-[var(--radius-card)] shadow-[4px_4px_0_hsl(239,84%,67%)]" : "border-2 border-black rounded-[var(--radius-card)] shadow-[4px_4px_0_hsl(239,84%,67%)]"),
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

/**
 * Tab - Bold Contemporary Pop Art Adventure
 * Features bold indicators and bounce transitions
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  function Tab({ active, variant = "line", inverted = false, className, children, ...props }, ref) {
    const getLineClasses = () => {
      if (inverted) {
        return active
          ? "border-b-2 border-white text-white -mb-0.5"
          : "text-grey-400 hover:text-white border-b-2 border-transparent -mb-0.5";
      }
      return active
        ? "border-b-2 border-black text-black -mb-0.5"
        : "text-grey-500 hover:text-black border-b-2 border-transparent -mb-0.5";
    };

    const getEnclosedClasses = () => {
      if (inverted) {
        return clsx(
          active
            ? "bg-white text-black"
            : "bg-transparent text-grey-300 hover:bg-grey-800 hover:text-white",
          "border-r-2 border-grey-600 last:border-r-0"
        );
      }
      return clsx(
        active
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-grey-100",
        "border-r-2 border-black last:border-r-0"
      );
    };

    const getPopClasses = () => {
      if (inverted) {
        return clsx(
          active
            ? "bg-white text-black"
            : "bg-transparent text-grey-300 hover:bg-grey-800 hover:text-white",
          "first:rounded-l-[calc(var(--radius-card)-2px)] last:rounded-r-[calc(var(--radius-card)-2px)]"
        );
      }
      return clsx(
        active
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-grey-100",
        "first:rounded-l-[calc(var(--radius-card)-2px)] last:rounded-r-[calc(var(--radius-card)-2px)]"
      );
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        className={clsx(
          "px-4 py-2 font-heading uppercase text-xs tracking-wider font-bold",
          "transition-all duration-100 ease-[var(--ease-bounce)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          inverted ? "focus:ring-white focus:ring-offset-ink-950" : "focus:ring-black focus:ring-offset-white",
          variant === "line" && getLineClasses(),
          variant === "enclosed" && getEnclosedClasses(),
          variant === "pop" && getPopClasses(),
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
        className={clsx(
          "py-4 animate-fade-in",
          inverted ? "text-grey-200" : "text-grey-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
