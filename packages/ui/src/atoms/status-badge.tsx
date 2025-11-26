import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: "success" | "error" | "warning" | "info" | "neutral" | "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
  /** Use filled variant for higher emphasis */
  filled?: boolean;
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  function StatusBadge({ status, size = "md", filled = false, className, children, ...props }, ref) {
    // Semantic status colors with filled and outline variants
    const statusClasses = {
      success: filled 
        ? "bg-success-500 text-white" 
        : "bg-success-50 border-2 border-success-500 text-success-700",
      error: filled 
        ? "bg-error-500 text-white" 
        : "bg-error-50 border-2 border-error-500 text-error-700",
      warning: filled 
        ? "bg-warning-500 text-white" 
        : "bg-warning-50 border-2 border-warning-500 text-warning-700",
      info: filled 
        ? "bg-info-500 text-white" 
        : "bg-info-50 border-2 border-info-500 text-info-700",
      neutral: filled 
        ? "bg-grey-500 text-white" 
        : "bg-grey-100 border-2 border-grey-400 text-grey-700",
      active: filled 
        ? "bg-success-500 text-white" 
        : "bg-success-50 border-2 border-success-500 text-success-700",
      inactive: filled 
        ? "bg-grey-700 text-white" 
        : "bg-grey-100 border-2 border-grey-500 text-grey-600",
      pending: filled 
        ? "bg-warning-500 text-white" 
        : "bg-warning-50 border-2 border-warning-400 text-warning-700",
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
