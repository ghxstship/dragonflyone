"use client";

import { forwardRef, useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";
import { 
  authFormFieldVariants,
  authFormFieldLabelVariants,
  authFormFieldInputContainerVariants,
  authFormFieldInputVariants,
  authFormFieldIconVariants,
  authFormFieldHelperVariants 
} from "./AuthFormField.variants.js";
import type { 
  AuthInputProps, 
  AuthPasswordInputProps, 
  AuthFormFieldProps 
} from "./AuthFormField.types.js";

/**
 * AuthInput component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Icon support
 * - Error states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AuthInput
 *   icon={<Mail className="w-4 h-4" />}
 *   placeholder="Enter your email"
 *   error={hasError}
 *   size="md"
 * />
 * ```
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ 
    icon, 
    rightElement, 
    error = false, 
    size = "md", 
    inverted = false,
    className, 
    ...props 
  }, ref) {
    const iconPadding = icon ? "pl-11" : "";
    const rightPadding = rightElement ? "pr-11" : "";

    return (
      <div className={authFormFieldInputContainerVariants({ inverted })}>
        {icon && (
          <div className={authFormFieldIconVariants({ 
            position: "left", 
            error, 
            inverted 
          })}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${authFormFieldInputVariants({ 
            size, 
            error, 
            inverted 
          })} ${iconPadding} ${rightPadding} ${className || ""}`}
          {...props}
        />
        
        {rightElement && (
          <div className={authFormFieldIconVariants({ 
            position: "right", 
            error, 
            inverted 
          })}>
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

/**
 * AuthPasswordInput component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Password visibility toggle
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AuthPasswordInput
 *   icon={<Lock className="w-4 h-4" />}
 *   placeholder="Enter your password"
 *   size="md"
 * />
 * ```
 */
export const AuthPasswordInput = forwardRef<HTMLInputElement, AuthPasswordInputProps>(
  function AuthPasswordInput({ 
    icon, 
    size = "md", 
    inverted = false,
    className, 
    ...props 
  }, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const iconPadding = icon ? "pl-11" : "";

    return (
      <div className={authFormFieldInputContainerVariants({ inverted })}>
        {icon && (
          <div className={authFormFieldIconVariants({ 
            position: "left", 
            error: false, 
            inverted 
          })}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`${authFormFieldInputVariants({ 
            size, 
            error: false, 
            inverted 
          })} ${iconPadding} pr-11 ${className || ""}`}
          {...props}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] ${
            inverted ? "text-text-muted-inverse hover:text-text-inverse" : ""
          }`}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }
);

AuthPasswordInput.displayName = "AuthPasswordInput";

/**
 * AuthFormField component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Complete form field with label and helper text
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Error states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AuthFormField
 *   label="Email Address"
 *   name="email"
 *   type="email"
 *   placeholder="Enter your email"
 *   icon={<Mail className="w-4 h-4" />}
 *   error={emailError}
 *   required
 * />
 * ```
 */
export function AuthFormField({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  error,
  helper,
  required = false,
  size = "md",
  inverted = false,
}: AuthFormFieldProps) {
  const fieldId = useId();

  return (
    <div className={authFormFieldVariants({ inverted })}>
      {/* Label */}
      <label 
        htmlFor={fieldId}
        className={authFormFieldLabelVariants({ error: !!error, inverted })}
      >
        {label}
        {required && (
          <span className="text-error-600 ml-1">*</span>
        )}
      </label>

      {/* Input */}
      {type === "password" ? (
        <AuthPasswordInput
          id={fieldId}
          name={name}
          placeholder={placeholder}
          icon={icon}
          size={size}
          inverted={inverted}
        />
      ) : (
        <AuthInput
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          icon={icon}
          error={!!error}
          size={size}
          inverted={inverted}
        />
      )}

      {/* Helper/Error Text */}
      {(error || helper) && (
        <div className={authFormFieldHelperVariants({ 
          error: !!error, 
          inverted 
        })}>
          {error || helper}
        </div>
      )}
    </div>
  );
}
