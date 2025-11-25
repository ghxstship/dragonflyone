import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ orientation = "horizontal", fullWidth, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          fullWidth && "w-full",
          "[&>button]:border-2 [&>button:not(:first-child)]:border-l-0",
          orientation === "vertical" && "[&>button:not(:first-child)]:border-l-2 [&>button:not(:first-child)]:border-t-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
