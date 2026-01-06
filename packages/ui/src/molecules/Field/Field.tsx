import { forwardRef } from "react";
import { 
  fieldVariants,
  fieldLabelVariants,
  fieldRequiredVariants,
  fieldHintVariants,
  fieldErrorVariants 
} from "./Field.variants.js";
import type { FieldProps } from "./Field.types.js";

/**
 * Field component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Clear visual hierarchy
 * - Proper spacing
 * - Error state styling
 * - Required field indicators
 * - CVA-based variants for consistent theming
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <Field label="Email" required error="Please enter a valid email">
 *   <Input type="email" placeholder="Enter your email" />
 * </Field>
 * 
 * <Field label="Password" hint="Must be at least 8 characters">
 *   <Input type="password" placeholder="Enter your password" />
 * </Field>
 * ```
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(
  function Field({ 
    label, 
    error, 
    hint, 
    required = false, 
    inverted = false, 
    children, 
    className, 
    ...props 
  }, ref) {
    return (
      <div 
        ref={ref} 
        className={fieldVariants({ className })} 
        {...props}
      >
        {/* Label */}
        {label && (
          <label className={fieldLabelVariants({})}>
            {label}
            {required && (
              <span className={fieldRequiredVariants({})}>
                *
              </span>
            )}
          </label>
        )}

        {/* Field Content */}
        {children}

        {/* Hint or Error Message */}
        {hint && !error && (
          <span className={fieldHintVariants({})}>
            {hint}
          </span>
        )}

        {error && (
          <span className={fieldErrorVariants({})}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
