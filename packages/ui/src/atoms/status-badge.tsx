import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: "success" | "error" | "warning" | "info" | "neutral" | "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge({ status, size = "md", className, children, ...props }, ref) {
    const statusClasses = {
      success: "bg-white border-2 border-black text-black",
      error: "bg-black text-white",
      warning: "bg-grey-200 border-2 border-grey-800 text-black",
      info: "bg-grey-100 border-2 border-grey-700 text-black",
      neutral: "bg-grey-400 text-white",
      active: "bg-white text-black border-2 border-black",
      inactive: "bg-grey-800 text-white",
      pending: "bg-grey-700 text-grey-200",
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-mono-xxs",
      md: "px-3 py-1 text-mono-xs",
      lg: "px-3 py-1.5 text-mono-md",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center font-code uppercase tracking-widest leading-none",
          statusClasses[status],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
