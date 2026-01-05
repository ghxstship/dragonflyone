import { Button } from "../../atoms/Button/index.js";
import { 
  errorBoundaryVariants,
  errorBoundaryTitleVariants,
  errorBoundaryDescriptionVariants,
  errorBoundaryDetailsVariants 
} from "./ErrorBoundary.variants.js";
import type { ErrorFallbackProps } from "./ErrorBoundary.types.js";

/**
 * ErrorFallback component
 * 
 * Default error display for ErrorBoundary with Bold Contemporary Pop Art Adventure aesthetic.
 * 
 * @example
 * ```tsx
 * <ErrorFallback 
 *   error={new Error('Something went wrong')}
 *   onReset={() => console.log('Reset')}
 * />
 * ```
 */
export function ErrorFallback({ 
  error, 
  onReset, 
  inverted = false 
}: ErrorFallbackProps) {
  return (
    <div className={errorBoundaryVariants({ inverted })}>
      {/* Error Icon */}
      <div className="text-6xl mb-4 animate-shake">
        ⚠️
      </div>

      {/* Error Title */}
      <h2 className={errorBoundaryTitleVariants({ inverted })}>
        Oops! Something went wrong
      </h2>

      {/* Error Description */}
      <p className={errorBoundaryDescriptionVariants({ inverted })}>
        We encountered an unexpected error. This has been logged and our team will investigate.
      </p>

      {/* Error Details (Development Only) */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium mb-2 hover:opacity-80 transition-opacity">
            Error Details (Development Only)
          </summary>
          <div className={errorBoundaryDetailsVariants({ inverted })}>
            <div className="font-bold mb-2">Error Message:</div>
            <div className="mb-4">{error.message}</div>
            
            <div className="font-bold mb-2">Stack Trace:</div>
            <pre className="whitespace-pre-wrap text-xs">
              {error.stack}
            </pre>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button
          onClick={onReset}
          variant="solid"
          className="animate-pop-in"
        >
          Try Again
        </Button>
        
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="animate-pop-in"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}
