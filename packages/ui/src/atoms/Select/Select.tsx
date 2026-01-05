import { forwardRef } from "react";
import { selectVariants, selectBackgroundImage } from "./Select.variants.js";
import type { SelectProps, SelectGroupProps } from "./Select.types.js";

/**
 * Select component
 * 
 * A styled select dropdown that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Select error={error} fullWidth>
 *   <option value="">Choose an option</option>
 *   <option value="option1">Option 1</option>
 *   <option value="option2">Option 2</option>
 * </Select>
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error, errorId, hintId, className, children, ...props }, ref) {
    // Build aria-describedby from available IDs
    const describedByIds = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <select
        ref={ref}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        className={selectVariants({ error, fullWidth: props.fullWidth, className })}
        style={{
          backgroundImage: selectBackgroundImage,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

/**
 * SelectGroup component
 * 
 * A wrapper component that combines a label, select input, hint text,
 * and error message into a cohesive form field.
 * 
 * @example
 * ```tsx
 * <SelectGroup
 *   label="Country"
 *   hint="Select your country of residence"
 *   error={error}
 *   required
 * >
 *   <Select error={error}>
 *     <option value="">Choose a country</option>
 *     <option value="us">United States</option>
 *     <option value="ca">Canada</option>
 *   </Select>
 * </SelectGroup>
 * ```
 */
export const SelectGroup = ({
  label,
  hint,
  error,
  required,
  className,
  children,
}: SelectGroupProps) => {
  const errorId = error ? `${label?.replace(/\s+/g, "-")}-error` : undefined;
  const hintId = hint ? `${label?.replace(/\s+/g, "-")}-hint` : undefined;

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-[var(--color-error-border)] ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {hint && !error && (
        <p id={hintId} className="text-sm text-[var(--color-text-secondary)]">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-[var(--color-error-border)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
