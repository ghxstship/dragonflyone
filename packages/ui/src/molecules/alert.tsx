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

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ variant = "info", title, icon, onClose, inverted = false, className, children, ...props }, ref) {
    // Light mode variant classes
    const lightVariantClasses = {
      info: "bg-info-50 border-info-500 text-info-900",
      success: "bg-success-50 border-success-500 text-success-900",
      warning: "bg-warning-50 border-warning-500 text-warning-900",
      error: "bg-error-50 border-error-500 text-error-900",
    };

    // Dark mode (inverted) variant classes
    const darkVariantClasses = {
      info: "bg-info-900 border-info-400 text-info-100",
      success: "bg-success-900 border-success-400 text-success-100",
      warning: "bg-warning-900 border-warning-400 text-warning-100",
      error: "bg-error-900 border-error-400 text-error-100",
    };

    const variantClasses = inverted ? darkVariantClasses : lightVariantClasses;

    const iconColors = {
      info: inverted ? "text-info-400" : "text-info-500",
      success: inverted ? "text-success-400" : "text-success-500",
      warning: inverted ? "text-warning-400" : "text-warning-500",
      error: inverted ? "text-error-400" : "text-error-500",
    };

    const closeButtonColors = {
      info: inverted ? "text-info-300 hover:text-info-100" : "text-info-700 hover:text-info-900",
      success: inverted ? "text-success-300 hover:text-success-100" : "text-success-700 hover:text-success-900",
      warning: inverted ? "text-warning-300 hover:text-warning-100" : "text-warning-700 hover:text-warning-900",
      error: inverted ? "text-error-300 hover:text-error-100" : "text-error-700 hover:text-error-900",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "flex gap-gap-sm p-spacing-4 border-2",
          variantClasses[variant],
          className
        )}
        role="alert"
        {...props}
      >
        {icon ? <div className={clsx("flex-shrink-0", iconColors[variant])}>{icon}</div> : null}
        <div className="flex-1">
          {title ? (
            <div className="font-heading text-h5-sm uppercase tracking-wider mb-spacing-1">
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
