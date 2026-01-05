"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { passwordInputVariants, passwordInputButtonVariants } from "./PasswordInput.variants.js";
import type { PasswordInputProps } from "./PasswordInput.types.js";

/**
 * PasswordInput component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Password visibility toggle button
 * - 2px bold borders
 * - Hard offset shadow (subtle)
 * - Focus lift effect with primary border
 * - Clear error state styling
 * 
 * @example
 * ```tsx
 * <PasswordInput
 *   placeholder="Enter password"
 *   error={hasError}
 *   inverted={false}
 * />
 * ```
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ 
    error, 
    fullWidth, 
    inverted = false, 
    className, 
    ...props 
  }, ref) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={clsx("relative", fullWidth ? "w-full" : "w-auto")}>
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={clsx(
            passwordInputVariants({
              error,
              inverted,
              className,
            })
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={clsx(
            passwordInputButtonVariants({
              inverted,
            })
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    );
  }
);

export default PasswordInput;
