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
      info: "bg-grey-100 border-grey-700",
      success: "bg-white border-black",
      warning: "bg-grey-200 border-grey-800",
      error: "bg-black text-white border-black",
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
        {icon ? <div className="flex-shrink-0">{icon}</div> : null}
        <div className="flex-1">
          {title ? (
            <div className="font-heading text-[1.125rem] uppercase tracking-wider mb-1">
              {title}
            </div>
          ) : null}
          <div className="font-body text-[1rem]">{children}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
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
