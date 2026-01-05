import { forwardRef } from "react";
import { alertVariants } from "./Alert.variants.js";
import type { AlertProps } from "./Alert.types.js";

/**
 * Alert component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Panel style with bold borders
 * - Hard offset shadow
 * - Icon emphasis
 * - Uppercase title
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Alert variant="error" title="Error">
 *   Something went wrong
 * </Alert>
 * 
 * <Alert variant="success" inverted={false}>
 *   Operation completed successfully
 * </Alert>
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ 
    variant = "info", 
    title, 
    icon, 
    onClose, 
    inverted = true, 
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <div
        ref={ref}
        className={alertVariants({ variant, inverted, className })}
        {...props}
      >
        {/* Header with title and close button */}
        {(title || onClose) && (
          <div className="flex items-start justify-between mb-2">
            {title && (
              <div className="font-bold text-sm uppercase tracking-wide">
                {title}
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-black/10 rounded transition-colors duration-[var(--duration-fast)]"
                aria-label="Close alert"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content with icon */}
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";
