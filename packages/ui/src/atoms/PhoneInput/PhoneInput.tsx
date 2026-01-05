"use client";

import { forwardRef, useState, useMemo } from "react";
import clsx from "clsx";
import { phoneInputVariants, phoneInputSelectorVariants, phoneInputDropdownVariants } from "./PhoneInput.variants.js";
import type { PhoneInputProps, CountryCode } from "./PhoneInput.types.js";

// Common country codes with flags
const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
] as const;

/**
 * PhoneInput component - Phone number input with country code selector
 * Bold Contemporary Pop Art Adventure Design System
 * 
 * @example
 * ```tsx
 * <PhoneInput
 *   value="+1234567890"
 *   onChange={(value) => console.log(value)}
 *   error={hasError}
 *   inverted={false}
 * />
 * ```
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      value = "",
      onChange,
      onChangeStructured,
      error,
      errorMessage,
      fullWidth,
      inverted = false,
      defaultCountryCode = "+1",
      className,
      placeholder = "Phone number",
      ...props
    },
    ref
  ) {
    // Parse initial value to extract country code
    const parseValue = (val: string) => {
      for (const country of COUNTRY_CODES) {
        if (val.startsWith(country.code)) {
          return {
            countryCode: country.code,
            phoneNumber: val.slice(country.code.length).trim(),
          };
        }
      }
      return { countryCode: defaultCountryCode, phoneNumber: val };
    };

    const parsed = parseValue(value);
    const [selectedCountryCode, setSelectedCountryCode] = useState(parsed.countryCode);
    const [phoneNumber, setPhoneNumber] = useState(parsed.phoneNumber);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const selectedCountry = useMemo(() => 
      COUNTRY_CODES.find(c => c.code === selectedCountryCode) || COUNTRY_CODES[0],
      [selectedCountryCode]
    );

    const handleCountryChange = (code: string) => {
      setSelectedCountryCode(code);
      setIsDropdownOpen(false);
      const fullNumber = `${code}${phoneNumber}`;
      onChange?.(fullNumber);
      onChangeStructured?.({ countryCode: code, phoneNumber, fullNumber });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newNumber = e.target.value.replace(/[^\d\s\-()]/g, "");
      setPhoneNumber(newNumber);
      const fullNumber = `${selectedCountryCode}${newNumber}`;
      onChange?.(fullNumber);
      onChangeStructured?.({ countryCode: selectedCountryCode, phoneNumber: newNumber, fullNumber });
    };

    return (
      <div className={clsx("relative", fullWidth ? "w-full" : "w-auto", className)}>
        <div className="flex">
          {/* Country Code Selector */}
          <div className="relative">
            <button
              type="button"
              className={phoneInputSelectorVariants({
                error,
                inverted,
              })}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Select country code"
              aria-expanded={isDropdownOpen}
            >
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-mono-sm">{selectedCountry.code}</span>
              <svg
                className={clsx(
                  "size-4 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className={phoneInputDropdownVariants({ inverted })}>
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={`${country.country}-${country.code}`}
                    type="button"
                    className={clsx(
                      "w-full px-3 py-2 flex items-center gap-3 text-left transition-colors",
                      inverted
                        ? "hover:bg-surface-elevated text-text-primary"
                        : "hover:bg-muted text-text-primary",
                      selectedCountryCode === country.code && country.country === selectedCountry.country &&
                        (inverted ? "bg-surface-elevated" : "bg-muted")
                    )}
                    onClick={() => handleCountryChange(country.code)}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span className="text-mono-sm font-medium">{country.code}</span>
                    <span className="text-mono-xs text-text-disabled truncate">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            ref={ref}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            className={phoneInputVariants({
              error,
              inverted,
              className,
            })}
            {...props}
          />
        </div>

        {/* Error Message */}
        {error && errorMessage && (
          <p className={clsx(
            "mt-1 text-mono-xs",
            inverted ? "text-error-400" : "text-error-500"
          )}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

// Validation utilities
export const phoneValidation = {
  /**
   * Validate phone number format (basic validation)
   * Returns true if valid, false otherwise
   */
  isValid: (value: string): boolean => {
    if (!value) return false;
    // Remove formatting characters
    const digitsOnly = value.replace(/[\s\-()]/g, "");
    // Must start with + and have at least 10 digits total
    return /^\+\d{10,15}$/.test(digitsOnly);
  },

  /**
   * Format phone number for display
   */
  format: (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return value;
  },

  /**
   * Get validation error message
   */
  getError: (value: string): string | null => {
    if (!value) return null;
    const digitsOnly = value.replace(/[\s\-()]/g, "");
    if (!/^\+/.test(digitsOnly)) {
      return "Phone number must include country code";
    }
    if (digitsOnly.length < 10) {
      return "Phone number is too short";
    }
    if (digitsOnly.length > 15) {
      return "Phone number is too long";
    }
    return null;
  },
};

// Email validation utilities
export const emailValidation = {
  /**
   * Validate email format
   */
  isValid: (value: string): boolean => {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Get validation error message
   */
  getError: (value: string): string | null => {
    if (!value) return null;
    if (!value.includes("@")) {
      return "Email must contain @";
    }
    if (!emailValidation.isValid(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },
};

export default PhoneInput;
export { COUNTRY_CODES };
