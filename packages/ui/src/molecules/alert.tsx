import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ variant = "info", title, icon, onClose, className, children, ...props }, ref) {
    const variantClasses = {
      info: "bg-info-50 border-info-500 text-info-900",
      success: "bg-success-50 border-success-500 text-success-900",
      warning: "bg-warning-50 border-warning-500 text-warning-900",
      error: "bg-error-50 border-error-500 text-error-900",
    };

    const iconColors = {
      info: "text-info-500",
      success: "text-success-500",
      warning: "text-warning-500",
      error: "text-error-500",
    };

    const closeButtonColors = {
      info: "text-info-700 hover:text-info-900",
      success: "text-success-700 hover:text-success-900",
      warning: "text-warning-700 hover:text-warning-900",
      error: "text-error-700 hover:text-error-900",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "flex gap-3 p-4 border-2",
          variantClasses[variant],
          className
        )}
        role="alert"
        {...props}
      >
        {icon ? <div className={clsx("flex-shrink-0", iconColors[variant])}>{icon}</div> : null}
        <div className="flex-1">
          {title ? (
            <div className="font-heading text-h5-sm uppercase tracking-wider mb-1">
              {title}
            </div>
          ) : null}
          <div className="font-body text-body-sm">{children}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={clsx("flex-shrink-0 transition-colors", closeButtonColors[variant])}
            aria-label="Close alert"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    );
  }
);
