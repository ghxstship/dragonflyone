"use client";

import { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import { maskedInputVariants } from "./MaskedInput.variants.js";
import type { MaskedInputProps, MaskType } from "./MaskedInput.types.js";

// Mask patterns
const MASK_PATTERNS: Record<MaskType, { pattern: string; placeholder: string }> = {
  card: { pattern: "9999 9999 9999 9999", placeholder: "1234 5678 9012 3456" },
  phone: { pattern: "(999) 999-9999", placeholder: "(555) 123-4567" },
  ssn: { pattern: "999-99-9999", placeholder: "123-45-6789" },
  date: { pattern: "99/99/9999", placeholder: "MM/DD/YYYY" },
  currency: { pattern: "", placeholder: "$0.00" }, // Special handling
  custom: { pattern: "", placeholder: "" },
};

/**
 * Apply mask to a value
 */
function applyMask(value: string, pattern: string): string {
  if (!pattern) return value;
  
  const digits = value.replace(/\D/g, "");
  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < pattern.length && digitIndex < digits.length; i++) {
    const char = pattern[i];
    if (char === "9") {
      result += digits[digitIndex];
      digitIndex++;
    } else if (char === "a") {
      // Letter placeholder - skip for now, use digit
      result += digits[digitIndex];
      digitIndex++;
    } else if (char === "*") {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += char;
      // If the next input char matches this separator, skip it
      if (digits[digitIndex] === char) {
        digitIndex++;
      }
    }
  }

  return result;
}

/**
 * Format currency value
 */
function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  
  const cents = parseInt(digits, 10);
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Get raw value (digits only)
 */
function getRawValue(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * MaskedInput component - Input with automatic formatting
 * 
 * Features:
 * - Credit card formatting (4-digit groups)
 * - Phone number formatting
 * - SSN formatting
 * - Date formatting
 * - Currency formatting
 * - Custom mask patterns
 * 
 * @example
 * ```tsx
 * <MaskedInput
 *   maskType="card"
 *   placeholder="Card number"
 *   onChange={(e, rawValue) => console.log(rawValue)}
 * />
 * ```
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  function MaskedInput(
    {
      maskType = "custom",
      customMask,
      showRaw = false,
      onChange,
      inverted = false,
      error = false,
      className,
      value: controlledValue,
      defaultValue,
      placeholder,
      ...props
    },
    ref
  ) {
    const [internalValue, setInternalValue] = useState(
      defaultValue?.toString() || ""
    );

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue.toString() : internalValue;

    const maskPattern = customMask || MASK_PATTERNS[maskType]?.pattern || "";
    const defaultPlaceholder = placeholder || MASK_PATTERNS[maskType]?.placeholder || "";

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let maskedValue: string;
        let rawValue: string;

        if (maskType === "currency") {
          maskedValue = formatCurrency(inputValue);
          rawValue = getRawValue(inputValue);
        } else {
          maskedValue = applyMask(inputValue, maskPattern);
          rawValue = getRawValue(inputValue);
        }

        if (!isControlled) {
          setInternalValue(maskedValue);
        }

        // Create synthetic event with masked value
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: maskedValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange?.(syntheticEvent, rawValue);
      },
      [maskType, maskPattern, isControlled, onChange]
    );

    // Display masked or raw value
    const displayValue = showRaw ? getRawValue(currentValue) : currentValue;

    return (
      <input
        ref={ref}
        type="text"
        inputMode={maskType === "currency" || maskType === "card" || maskType === "phone" || maskType === "ssn" ? "numeric" : "text"}
        autoComplete={maskType === "card" ? "cc-number" : maskType === "phone" ? "tel" : undefined}
        value={displayValue}
        onChange={handleChange}
        placeholder={defaultPlaceholder}
        className={clsx(
          maskedInputVariants({
            inverted,
            error,
            className,
          })
        )}
        {...props}
      />
    );
  }
);

export default MaskedInput;
