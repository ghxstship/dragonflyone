import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  inverted?: boolean;
};

/**
 * Alert component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Panel style with bold borders
 * - Hard offset shadow
 * - Icon emphasis
 * - Uppercase title
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ variant = "info", title, icon, onClose, inverted = false, className, children, ...props }, ref) {
    // Get variant-specific styling
    const getVariantClasses = () => {
      const baseClasses = "border-2 rounded-[var(--radius-card)]";
      
      if (inverted) {
        switch (variant) {
          case "info":
            return clsx(baseClasses, "bg-info-900 border-info-400 text-info-100 shadow-[4px_4px_0_rgba(59,130,246,0.3)]");
          case "success":
            return clsx(baseClasses, "bg-success-900 border-success-400 text-success-100 shadow-[4px_4px_0_rgba(34,197,94,0.3)]");
          case "warning":
            return clsx(baseClasses, "bg-warning-900 border-warning-400 text-warning-100 shadow-[4px_4px_0_rgba(245,158,11,0.3)]");
          case "error":
            return clsx(baseClasses, "bg-error-900 border-error-400 text-error-100 shadow-[4px_4px_0_rgba(239,68,68,0.3)]");
          default:
            return baseClasses;
        }
      } else {
        switch (variant) {
          case "info":
            return clsx(baseClasses, "bg-info-50 border-info-500 text-info-900 shadow-[4px_4px_0_rgba(59,130,246,0.2)]");
          case "success":
            return clsx(baseClasses, "bg-success-50 border-success-500 text-success-900 shadow-[4px_4px_0_rgba(34,197,94,0.2)]");
          case "warning":
            return clsx(baseClasses, "bg-warning-50 border-warning-500 text-warning-900 shadow-[4px_4px_0_rgba(245,158,11,0.2)]");
          case "error":
            return clsx(baseClasses, "bg-error-50 border-error-500 text-error-900 shadow-[4px_4px_0_rgba(239,68,68,0.2)]");
          default:
            return baseClasses;
        }
      }
    };

    const iconColors = {
      info: inverted ? "text-info-400" : "text-info-500",
      success: inverted ? "text-success-400" : "text-success-500",
      warning: inverted ? "text-warning-400" : "text-warning-500",
      error: inverted ? "text-error-400" : "text-error-500",
    };

    const closeButtonClasses = clsx(
      "flex-shrink-0 p-1 border-2 rounded transition-all duration-100",
      "hover:-translate-x-0.5 hover:-translate-y-0.5",
      "active:translate-x-0.5 active:translate-y-0.5",
      inverted
        ? "border-current text-current hover:bg-white/10"
        : "border-current text-current hover:bg-black/10"
    );

    return (
      <div
        ref={ref}
        className={clsx(
          "flex gap-3 p-4",
          getVariantClasses(),
          className
        )}
        role="alert"
        {...props}
      >
        {icon ? <div className={clsx("flex-shrink-0 mt-0.5", iconColors[variant])}>{icon}</div> : null}
        <div className="flex-1 min-w-0">
          {title ? (
            <div className="font-heading text-sm uppercase tracking-wider font-bold mb-1">
              {title}
            </div>
          ) : null}
          <div className="font-body text-sm">{children}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={closeButtonClasses}
            aria-label="Close alert"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    );
  }
);
